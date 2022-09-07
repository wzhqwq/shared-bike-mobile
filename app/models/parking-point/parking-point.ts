import { Instance, SnapshotIn, SnapshotOut, types } from "mobx-state-tree"

/**
 * Model description here for TypeScript hints.
 */
export const ParkingPointModel = types
  .model("ParkingPoint")
  .props({
    id: types.optional(types.identifierNumber, -1),
    p_longitude: types.string,
    p_latitude: types.string,
    bikes_count: types.maybe(types.number),
    minimum_count: types.optional(types.number, 0),
    section_id: types.maybe(types.number),
    lack_of_bike: types.optional(types.boolean, false),
  })
  .views((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => ({
    setLackOfBike(b: boolean) {
      self.lack_of_bike = b
    }
  })) // eslint-disable-line @typescript-eslint/no-unused-vars

export interface ParkingPoint extends Instance<typeof ParkingPointModel> {}
export interface ParkingPointSnapshotOut extends SnapshotOut<typeof ParkingPointModel> {}
export interface ParkingPointSnapshotIn extends SnapshotIn<typeof ParkingPointModel> {}
export const createParkingPointDefaultModel = () => types.optional(ParkingPointModel, {})
