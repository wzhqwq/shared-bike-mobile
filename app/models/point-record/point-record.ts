import { Instance, SnapshotIn, SnapshotOut, types } from "mobx-state-tree"

/**
 * Model description here for TypeScript hints.
 */
export const PointRecordModel = types
  .model("PointRecord")
  .props({
    id: types.maybe(types.identifierNumber),
    time: types.maybe(types.Date),
    type: types.number,
    record_id: types.number,
    customer_id: types.number,
    change: types.number,
  })
  .views((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars

export interface PointRecord extends Instance<typeof PointRecordModel> {}
export interface PointRecordSnapshotOut extends SnapshotOut<typeof PointRecordModel> {}
export interface PointRecordSnapshotIn extends SnapshotIn<typeof PointRecordModel> {}
export const createPointRecordDefaultModel = () => types.optional(PointRecordModel, {})
