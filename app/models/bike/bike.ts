import { Instance, SnapshotIn, SnapshotOut, types } from "mobx-state-tree"
import { LatLng } from "react-native-maps"
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
  .views((self) => ({
    get coordinate(): LatLng {
      return { latitude: parseFloat(self.p_latitude), longitude: parseFloat(self.p_longitude) }
    },
  })) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => ({
    setStatus(status: number) {
      self.status = status
    },
    setPos(longitude: number, latitude: number) {
      self.p_latitude = latitude.toFixed(6)
      self.p_longitude = longitude.toFixed(6)
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
    async finishMaintaining(pos: LatLng) {
      const result: Response<null> = await self.environment.api.post('/maintainer/maintain/finish', { bike_id: self.id, p_longitude: pos.longitude.toFixed(6), p_latitude: pos.latitude.toFixed(6) })
      if (result.ok) {
        self.setStatus(BIKE_AVAILABLE)
        self.setPos(pos.longitude, pos.latitude)
      }
      return result.ok
    },
    startCommunication() {
      self.dummy = new DummyBike(self.series_no)
    },
    async unlockBike(pos: LatLng) {
      let encrypted = self.dummy.sendToBike(self.id, 'unlock')
      const identifyResult: Response<null> = await self.environment.api.post('/customer/bike/unlock', { bike_id: self.id, encrypted })
      if (!identifyResult.ok) return false
      
      if (!self.dummy.verifyServer(identifyResult.data)) return false

      self.dummy.setPosition(pos)
      encrypted = self.dummy.sendToBike(self.id, 'update')

      const unlockResult: Response<null> = await self.environment.api.post('/customer/bike/update', { bike_id: self.id, encrypted })
      if (unlockResult.ok) {
        self.setStatus(BIKE_OCCUPIED)
      }
      return unlockResult.ok
    },
    async updateBike(pos: LatLng) {
      self.dummy.setPosition(pos)
      const encrypted = self.dummy.sendToBike(self.id, 'update')
      const result: Response<string> = await self.environment.api.post('/customer/bike/update', { bike_id: self.id, encrypted })
      if (result.ok) {
        return result.data.split(',')
      }
      return null
    },
    async lockBike() {
      const encrypted = self.dummy.sendToBike(self.id, 'lock')
      const result: Response<string> = await self.environment.api.post('/customer/bike/update', { bike_id: self.id, encrypted })
      if (result.ok) {
        self.setStatus(BIKE_AVAILABLE)
        return result.data.split(',')
      }
      return null
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
