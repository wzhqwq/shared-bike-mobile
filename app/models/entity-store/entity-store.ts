import { Instance, SnapshotIn, SnapshotOut, types } from "mobx-state-tree"
import { LatLng } from "react-native-maps"
import { Response } from "../../services/api"
import { DummyBike } from "../../services/bluetooth/bikeCommunication"
import { BikeSeries, BikeSeriesModel } from "../bike-series/bike-series"
import { Bike, BikeModel } from "../bike/bike"
import { Configuration, ConfigurationModel } from "../configuration/configuration"
import { withEnvironment } from "../extensions/with-environment"
import { Malfunction, MalfunctionModel } from "../malfunction/malfunction"
import { ParkingPoint, ParkingPointModel } from "../parking-point/parking-point"
import { Section, SectionModel } from "../section/section"
import { Souvenir, SouvenirModel } from "../souvenir/souvenir"
import { User, UserModel } from "../user/user"

/**
 * Model description here for TypeScript hints.
 */
export const EntityStoreModel = types
  .model("EntityStore")
  .props({
    seriesListVersion: types.optional(types.number, 0),
    souvenirsVersion: types.optional(types.number, 0),
    bikesVersion: types.optional(types.number, 0),
    configsVersion: types.optional(types.number, 0),
    sectionsVersion: types.optional(types.number, 0),
    malfunctionsVersion: types.optional(types.number, 0),
    parkingPointsVersion: types.optional(types.number, 0),
    usersVersion: types.optional(types.number, 0),
    
    seriesList: types.optional(types.array(BikeSeriesModel), []),
    souvenirs: types.optional(types.array(SouvenirModel), []),
    bikes: types.optional(types.array(BikeModel), []),
    configs: types.optional(types.array(ConfigurationModel), []),
    sections: types.optional(types.array(SectionModel), []),
    malfunctions: types.optional(types.array(MalfunctionModel), []),
    parkingPoints: types.optional(types.array(ParkingPointModel), []),
    users: types.optional(types.array(UserModel), []),

    bikeFilter: types.optional(types.enumeration(["danger", "all", "destroyed"]), 'all'),
    userCategory: types.optional(types.enumeration(['customer', 'maintainer', 'manager']), 'manager'),
    sectionIdNow: types.maybe(types.number),
  })
  .extend(withEnvironment)
  .views((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => ({
    setSectionIdNow(id: number) {
      self.sectionIdNow = id
    },
    setBikeFilter(filter: "danger" | "all" | "destroyed") {
      self.bikeFilter = filter
    },
    setUserCategory(category: 'customer' | 'maintainer' | 'manager') {
      self.userCategory = category
    },
    setSeries(list: BikeSeries[]) {
      self.seriesList.replace(list)
      self.seriesListVersion++
    },
    setSouvenirs(list: Souvenir[]) {
      self.souvenirs.replace(list)
      self.souvenirsVersion++
    },
    setBikes(list: Bike[], append = false) {
      if (append) self.bikes.push(...list)
      else self.bikes.replace(list)
      self.bikesVersion++
    },
    setSections(list: Section[]) {
      self.sections.replace(list)
      self.sectionsVersion++
    },
    setMalfunctions(list: Malfunction[]) {
      self.malfunctions.replace(list)
      self.malfunctionsVersion++
    },
    setParkingPoints(list: ParkingPoint[]) {
      self.parkingPoints.replace(list)
      self.parkingPointsVersion++
    },
    setUsers(list: User[], append = false) {
      if (append) self.users.push(...list)
      else self.users.replace(list)
      self.usersVersion++
    },
    setConfigs(list: Configuration[]) {
      self.configs.replace(list)
      self.configsVersion++
    }
  })) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => ({
    async listSeries() {
      const result: Response<BikeSeries[]> = await self.environment.api.get('/shared/series/list')
      if (result.ok) self.setSeries(result.data)
    },
    async listSouvenirs() {
      const result: Response<Souvenir[]> = await self.environment.api.get('/shared/souvenir/list')
      if (result.ok) self.setSouvenirs(result.data)
    },
    async listBikesWithFiltering(filter: "danger" | "all" | "destroyed", append: boolean) {
      if (append && filter !== self.bikeFilter) return
      self.setBikeFilter(filter)
      const lastId = append ? (self.bikes.at(-1)?.id ?? 100000) : 10000
      const result: Response<Bike[]> = filter === "danger" ?
        await self.environment.api.get('/manager/bike/list/danger', { lastId }) :
        filter === "destroyed" ? 
          await self.environment.api.get('/manager/bike/list/destroyed', { lastId }) :
          await self.environment.api.get('/manager/bike/list/all', { lastId })
      if (result.ok) self.setBikes(result.data, append)
    },
    async listBikesInSection() {
      const result: Response<Bike[]> = await self.environment.api.get('/maintainer/bike/list', { section_id: self.sectionIdNow })
      if (result.ok) self.setBikes(result.data)
    },
    async listBikesToMove() {
      const result: Response<{ lacks: number[], solution?: number[] }> = await self.environment.api.get('/maintainer/bike/list_to_move', { section_id: self.sectionIdNow })
      if (result.ok) {
        const { lacks, solution } = result.data
        if (solution) {
          self.bikes.forEach(b => {
            b.setHighlighted(solution.includes(b.id))
          })
        }
        self.parkingPoints.forEach(p => {
          p.setLackOfBike(lacks.includes(p.id))
        })
      }
    },
    async listBikesAround(longitude: string, latitude: string) {
      const result: Response<Bike[]> = await self.environment.api.get('/customer/bike/list', { longitude, latitude })
      if (result.ok) self.setBikes(result.data)
    },
    async fetchConfig() {
      const result: Response<Configuration[]> = await self.environment.api.get('/manager/config/list')
      if (result.ok) self.setConfigs(result.data)
    },
    async listSections() {
      const result: Response<Section[]> = await self.environment.api.get('/shared/section/list')
      if (result.ok) self.setSections(result.data)
    },
    async listMalfunctions() {
      const result: Response<Malfunction[]> = await self.environment.api.get('/shared/malfunction/list')
      if (result.ok) self.setMalfunctions(result.data)
    },
    async listManagingSections() {
      const result: Response<Section[]> = await self.environment.api.get('/maintainer/list_sections')
      if (result.ok) self.setSections(result.data)
    },
    async listParkingPoints() {
      const result: Response<ParkingPoint[]> = await self.environment.api.get('/manager/parking_point/list')
      if (result.ok)  self.setParkingPoints(result.data)
    },
    async listParkingPointsInSection() {
      const result: Response<ParkingPoint[]> = await self.environment.api.get('/maintainer/list_parking_points', { section_id: self.sectionIdNow })
      if (result.ok) self.setParkingPoints(result.data)
    },
    async listParkingPointsAround(longitude: string, latitude: string) {
      const result: Response<ParkingPoint[]> = await self.environment.api.get('/customer/bike/parking_point/list', { longitude, latitude })
      if (result.ok) self.setParkingPoints(result.data)
    },
    async listUsers(category: 'customer' | 'maintainer' | 'manager', append: boolean) {
      if (append && category !== self.userCategory) return
      self.setUserCategory(category)
      const lastId = append ? (self.users.at(-1)?.id ?? 100000) : 100000
      const result: Response<User[]> = category === "customer" ?
        await self.environment.api.get('/manager/user/list/customer', { lastId }) :
        category === "maintainer" ? 
          await self.environment.api.get('/manager/user/list/maintainer', { lastId }) :
          await self.environment.api.get('/manager/user/list/manager', { lastId })
      if (result.ok) self.setUsers(result.data, append)
    },
  })) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => ({
    selectSection(sectionId: number) {
      if (self.sectionIdNow === sectionId) return
      self.setSectionIdNow(sectionId)
      self.listBikesInSection()
      self.listParkingPointsInSection()
    },
  })) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => ({
    async addSeries(series: BikeSeries) {
      const result: Response<null> = await self.environment.api.post('/manager/bike/series/add', series)
      if (result.ok) await self.listSeries()
      return result.ok
    },
    async addSouvenir(souvenir: Souvenir) {
      const result: Response<null> = await self.environment.api.post('/manager/souvenir/add', souvenir)
      if (result.ok) await self.listSouvenirs()
      return result.ok
    },
    async registerBike(seriesId: number, seriesNo: string, pos: LatLng) {
      const dummy = new DummyBike(seriesNo)
      dummy.setPosition(pos)
      let encrypted = dummy.getInfo()

      const registerResult: Response<string> = await self.environment.api.post('/maintainer/bike/register', { series_id: seriesId, encrypted })
      if (!registerResult.ok) return false

      encrypted = dummy.activate(registerResult.data)
      if (!encrypted) return false

      const activateResult: Response<null> = await self.environment.api.post('/maintainer/bike/activate', { encrypted })
      if (activateResult.ok) await self.listBikesInSection()
      return activateResult.ok
    },
    async addSection(section: Section) {
      const result: Response<null> = await self.environment.api.post('/manager/section/add', section)
      if (result.ok) await self.listSections()
      return result.ok
    },
    async addMalfunction(malfunction: Malfunction) {
      const result: Response<null> = await self.environment.api.post('/manager/bike/malfunction/add', malfunction)
      if (result.ok) await self.listMalfunctions()
      return result.ok
    },
    async addParkingPoint(pp: ParkingPoint) {
      const result: Response<null> = await self.environment.api.post('/manager/parking_point/add', pp)
      if (result.ok) await self.listParkingPoints()
      return result.ok
    },
    async modifyConfigs(configs: Configuration[]) {
      const result: Response<null> = await self.environment.api.post('/manager/config/modify', configs)
      if (result.ok) await self.fetchConfig()
      return result.ok
    },
    async removeSection(sectionId: number) {
      const result: Response<null> = await self.environment.api.post('/manager/section/remove', { section_id: sectionId })
      if (result.ok) await self.listSections()
      return result.ok
    },
    async removeSeries(seriesId: number) {
      const result: Response<null> = await self.environment.api.post('/manager/bike/series/remove', { series_id: seriesId })
      if (result.ok) await self.listSeries()
      return result.ok
    },
    async removeParkingPoint(ppId: number) {
      const result: Response<null> = await self.environment.api.post('/manager/parking_point/remove', { pp_id: ppId })
      if (result.ok) await self.listParkingPoints()
      return result.ok
    },
  })) // eslint-disable-line @typescript-eslint/no-unused-vars

export interface EntityStore extends Instance<typeof EntityStoreModel> {}
export interface EntityStoreSnapshotOut extends SnapshotOut<typeof EntityStoreModel> {}
export interface EntityStoreSnapshotIn extends SnapshotIn<typeof EntityStoreModel> {}
export const createEntityStoreDefaultModel = () => types.optional(EntityStoreModel, {})
