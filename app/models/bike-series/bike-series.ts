import { Instance, SnapshotIn, SnapshotOut, types } from "mobx-state-tree"

/**
 * Model description here for TypeScript hints.
 */
export const BikeSeriesModel = types
  .model("BikeSeries")
  .props({
    id: types.identifierNumber,
    name: types.string,
    mileage_limit: types.number,
    rent: types.string,
    amount: types.maybe(types.number),

  })
  .views((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars

export interface BikeSeries extends Instance<typeof BikeSeriesModel> {}
export interface BikeSeriesSnapshotOut extends SnapshotOut<typeof BikeSeriesModel> {}
export interface BikeSeriesSnapshotIn extends SnapshotIn<typeof BikeSeriesModel> {}
export const createBikeSeriesDefaultModel = () => types.optional(BikeSeriesModel, {})
