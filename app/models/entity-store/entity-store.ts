import { Instance, SnapshotIn, SnapshotOut, types } from "mobx-state-tree"
import { Response } from "../../services/api"
import { BikeSeries, BikeSeriesModel } from "../bike-series/bike-series"
import { Bike, BikeModel } from "../bike/bike"
import { Configuration, ConfigurationModel } from "../configuration/configuration"
import { withEnvironment } from "../extensions/with-environment"
import { ParkingPoint, ParkingPointModel } from "../parking-point/parking-point"
import { Section, SectionModel } from "../section/section"
import { Souvenir, SouvenirModel } from "../souvenir/souvenir"
import { CUSTOMER_USER, UserModel } from "../user/user"

/**
 * Model description here for TypeScript hints.
 */
export const EntityStoreModel = types
  .model("EntityStore")
  .props({
    seriesList: types.optional(types.array(BikeSeriesModel), []),
    souvenirs: types.optional(types.array(SouvenirModel), []),
    bikes: types.optional(types.array(BikeModel), []),
    configs: types.optional(types.array(ConfigurationModel), []),
    sections: types.optional(types.array(SectionModel), []),
    parkingPoints: types.optional(types.array(ParkingPointModel), []),
    users: types.optional(types.array(UserModel), []),

    bikeFilter: types.optional(types.enumeration(["danger", "all", "destroyed"]), 'all'),
    sectionIdNow: types.maybe(types.number),
  })
  .extend(withEnvironment)
  .views((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => ({
    async listSeries() {
      const result: Response<BikeSeries[]> = await self.environment.api.get('/manager/bike/series/list')
      if (result.ok) {
        self.seriesList.replace(result.data)
      }
    },
    async listSouvenirs() {
      const result: Response<Souvenir[]> = await (self.environment.localUser.role === CUSTOMER_USER ?
        self.environment.api.get('/customer/souvenir/items/list') :
        self.environment.api.get('/manager/souvenir/list'))
      if (result.ok) {
        self.souvenirs.replace(result.data)
      }
    },
    async listBikesWithFiltering(filter: "danger" | "all" | "destroyed") {
      const append = filter === self.bikeFilter
      self.bikeFilter = filter
      const lastId = self.bikes.at(-1)?.id ?? 100000
      const result: Response<Bike[]> = filter === "danger" ?
        await self.environment.api.get('/manager/bike/list/danger', { last_id: lastId }) :
        filter === "destroyed" ? 
          await self.environment.api.get('/manager/bike/list/destroyed', { last_id: lastId }) :
          await self.environment.api.get('/manager/bike/list/all', { last_id: lastId })
      if (result.ok) {
        if (append) {
          self.bikes.push(result.data)
        }
        else {
          self.bikes.replace(result.data)
        }
      }
    },
    async listBikesInSection() {
      const result: Response<Bike[]> = await self.environment.api.get('/maintainer/bike/list', { section_id: self.sectionIdNow })
      if (result.ok) {
        self.bikes.replace(result.data)
      }
    },
    async listBikesToMove() {
      const result: Response<{ lacks: number[], solution?: number[] }> = await self.environment.api.get('/maintainer/bike/list_to_move', { section_id: self.sectionIdNow })
      if (result.ok) {
        const { lacks, solution } = result.data
        if (solution) {
          self.bikes.forEach(b => {
            b.highlighted = solution.includes(b.id)
          })
        }
        self.parkingPoints.forEach(p => {
          p.lack_of_bike = lacks.includes(p.id)
        })
      }
    },
    async listBikesAround(longitude: string, latitude: string) {
      const result: Response<Bike[]> = await self.environment.api.get('/customer/bike/list', { longitude, latitude })
      if (result.ok) {
        self.bikes.replace(result.data)
      }
    },
    async fetchConfig() {
      const result: Response<Configuration[]> = await self.environment.api.get('/manager/config/list')
      if (result.ok) {
        self.configs.replace(result.data)
      }
    },
    async listSections() {
      const result: Response<Section[]> = await self.environment.api.get('/manager/section/list')
      if (result.ok) {
        self.sections.replace(result.data)
      }
    },
    async listManagingSections() {
      const result: Response<Configuration[]> = await self.environment.api.get('/maintainer/list_sections')
      if (result.ok) {
        self.configs.replace(result.data)
      }
    },
    async listParkingPoints() {
      const result: Response<Configuration[]> = await self.environment.api.get('/manager/parking_point/list')
      if (result.ok) {
        self.configs.replace(result.data)
      }
    },
    async listParkingPointsInSection() {
      const result: Response<ParkingPoint[]> = await self.environment.api.get('/maintainer/list_parking_points', { section_id: self.sectionIdNow })
      if (result.ok) {
        self.parkingPoints.replace(result.data)
      }
    },
    async listParkingPointsAround(longitude: string, latitude: string) {
      const result: Response<ParkingPoint[]> = await self.environment.api.get('/customer/bike/parking_point/list', { longitude, latitude })
      if (result.ok) {
        self.parkingPoints.replace(result.data)
      }
    },
  })) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => ({
    selectSection(sectionId: number) {
      self.sectionIdNow = sectionId
    },
  })) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => ({
    async addSeries(series: BikeSeries) {
      const result: Response<null> = await self.environment.api.post('/manager/bike/series/add', series)
      if (result.ok) {
        await self.listSeries()
      }
      return result.ok
    },
    async addSouvenir(souvenir: Souvenir) {
      const result: Response<null> = await self.environment.api.post('/manager/souvenir/add', souvenir)
      if (result.ok) {
        await self.listSouvenirs()
      }
      return result.ok
    },
    async registerBike(seriesId: number, encrypted: string) {
      const result: Response<null> = await self.environment.api.post('/maintainer/bike/register', { series_id: seriesId, encrypted })
      return result.ok
    },
    async activateBike(encrypted: string) {
      const result: Response<null> = await self.environment.api.post('/maintainer/bike/activate', { encrypted })
      if (result.ok) {
        await self.listBikesInSection()
      }
      return result.ok
    },
    async addSection(section: Section) {
      const result: Response<null> = await self.environment.api.post('/manager/section/add', section)
      if (result.ok) {
        await self.listSections()
      }
      return result.ok
    },
    async addParkingPoint(pp: ParkingPoint) {
      const result: Response<null> = await self.environment.api.post('/manager/parking_point/add', pp)
      if (result.ok) {
        await self.listParkingPoints()
      }
      return result.ok
    },
    async modifyConfigs(configs: Configuration[]) {
      const result: Response<null> = await self.environment.api.post('/manager/config/modify', configs)
      if (result.ok) {
        await self.fetchConfig()
      }
      return result.ok
    },
  })) // eslint-disable-line @typescript-eslint/no-unused-vars

export interface EntityStore extends Instance<typeof EntityStoreModel> {}
export interface EntityStoreSnapshotOut extends SnapshotOut<typeof EntityStoreModel> {}
export interface EntityStoreSnapshotIn extends SnapshotIn<typeof EntityStoreModel> {}
export const createEntityStoreDefaultModel = () => types.optional(EntityStoreModel, {})