import { Instance, SnapshotIn, SnapshotOut, types } from "mobx-state-tree"

/**
 * Model description here for TypeScript hints.
 */
export const RideRecordModel = types
  .model("RideRecord")
  .props({
    id: types.identifierNumber,
    bike_id: types.number,
    customer_id: types.number,
    mileage: types.number,
    start_time: types.Date,
    end_time: types.Date,
    charge: types.string,
    points_acquired: types.maybeNull(types.number),
  })
  .views((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars

export interface RideRecord extends Instance<typeof RideRecordModel> {}
export interface RideRecordSnapshotOut extends SnapshotOut<typeof RideRecordModel> {}
export interface RideRecordSnapshotIn extends SnapshotIn<typeof RideRecordModel> {}
export const createRideRecordDefaultModel = () => types.optional(RideRecordModel, {})
