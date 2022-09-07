import { Instance, SnapshotIn, SnapshotOut, types } from "mobx-state-tree"
import { Response } from "../../services/api"
import { DummyBike, DummyBikeModel } from "../../services/bluetooth/bikeCommunication"
import { DestroyRecordModel } from "../destroy-record/destroy-record"
import { withEnvironment } from "../extensions/with-environment"

/**
 * Model description here for TypeScript hints.
 */
export const BikeModel = types
  .model("Bike")
  .props({
    id: types.identifierNumber,
    series_no: types.string,
    series_id: types.number,
    p_longitude: types.string,
    p_latitude: types.string,
    status: types.number,
    mileage: types.number,
    health: types.number,
    parking_section_id: types.maybeNull(types.number),
    parking_point_id: types.maybeNull(types.number),
    fail_count: types.number,
    selected: types.optional(types.boolean, false),
    highlighted: types.optional(types.boolean, false),
    dummy: types.maybe(DummyBikeModel)
  })
  .extend(withEnvironment)
  .views((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => ({
    setStatus(status: number) {
      self.status = status
    },
    setHighlighted(b: boolean) {
      self.highlighted = b
    },
    setSelected(b: boolean) {
      self.selected = b
    },
  })) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => ({
    async destroy(reason: string) {
      const record = DestroyRecordModel.create({
        bike_id: self.id,
        reason,
      })
      const result: Response<null> = await self.environment.api.post('/manager/bike/destroy', record)
      if (result.ok) {
        self.setStatus(BIKE_DESTROYED)
      }
      return result.ok
    },
    async startMaintaining() {
      const result: Response<null> = await self.environment.api.post('/maintainer/maintain/start', { bike_id: self.id })
      if (result.ok) {
        self.setStatus(BIKE_UNAVAILABLE)
      }
      return result.ok
    },
    async finishMaintaining(longitude: number, latitude: number) {
      const result: Response<null> = await self.environment.api.post('/maintainer/maintain/finish', { bike_id: self.id, p_longitude: longitude.toFixed(6), p_latitude: latitude.toFixed(6) })
      if (result.ok) {
        self.setStatus(BIKE_AVAILABLE)
      }
      return result.ok
    },
    startCommunication(seriesNo: string) {
      self.dummy = new DummyBike(seriesNo)
    },
    async unlockBike() {
      const encrypted = self.dummy.sendToBike(self.id, 'unlock')
      const identifyResult: Response<null> = await self.environment.api.post('/customer/bike/unlock', { bike_id: self.id, encrypted })
      if (!identifyResult.ok) return false
      
      if (!self.dummy.verifyServer(identifyResult.data)) return false

      const unlockResult: Response<null> = await self.environment.api.post('/customer/bike/update', { bike_id: self.id, encrypted })
      if (unlockResult.ok) {
        self.setStatus(BIKE_OCCUPIED)
      }
      return unlockResult.ok
    },
    async updateBike(longitude: number, latitude: number) {
      self.dummy.setPosition(longitude, latitude)
      const encrypted = self.dummy.sendToBike(self.id, 'update')
      const result: Response<null> = await self.environment.api.post('/customer/bike/update', { bike_id: self.id, encrypted })
      return result.ok
    },
    async lockBike() {
      const encrypted = self.dummy.sendToBike(self.id, 'lock')
      const result: Response<null> = await self.environment.api.post('/customer/bike/update', { bike_id: self.id, encrypted })
      if (result.ok) {
        self.setStatus(BIKE_AVAILABLE)
      }
      return result.ok
    },
  })) // eslint-disable-line @typescript-eslint/no-unused-vars

export const BIKE_AVAILABLE = 0
export const BIKE_OCCUPIED = 1
export const BIKE_UNAVAILABLE = 2
export const BIKE_DESTROYED = 3
export const BIKE_NOT_ACTIVATED = 4

export interface Bike extends Instance<typeof BikeModel> {}
export interface BikeSnapshotOut extends SnapshotOut<typeof BikeModel> {}
export interface BikeSnapshotIn extends SnapshotIn<typeof BikeModel> {}
export const createBikeDefaultModel = () => types.optional(BikeModel, {})
