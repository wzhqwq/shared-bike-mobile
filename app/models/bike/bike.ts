import { Instance, SnapshotIn, SnapshotOut, types } from "mobx-state-tree"

/**
 * Model description here for TypeScript hints.
 */
export const BikeModel = types
  .model("Bike")
  .props({
    id: types.identifierNumber,
    series_no: types.identifier,
    series_id: types.number,
    p_longitude: types.string,
    p_latitude: types.string,
    status: types.number,
    mileage: types.number,
    health: types.number,
    parking_section_id: types.maybe(types.number),
    parking_point_id: types.maybe(types.number),
    selected: types.optional(types.boolean, false),
    highlighted: types.optional(types.boolean, false),
  })
  .views((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars

export interface Bike extends Instance<typeof BikeModel> {}
export interface BikeSnapshotOut extends SnapshotOut<typeof BikeModel> {}
export interface BikeSnapshotIn extends SnapshotIn<typeof BikeModel> {}
export const createBikeDefaultModel = () => types.optional(BikeModel, {})
