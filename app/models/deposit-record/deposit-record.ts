import { Instance, SnapshotIn, SnapshotOut, types } from "mobx-state-tree"

/**
 * Model description here for TypeScript hints.
 */
export const DepositRecordModel = types
  .model("DepositRecord")
  .props({
    id: types.optional(types.identifierNumber, -1),
    time: types.maybe(types.Date),
    type: types.number,
    record_id: types.number,
    customer_id: types.number,
    change: types.string,
  })
  .views((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars

export interface DepositRecord extends Instance<typeof DepositRecordModel> {}
export interface DepositRecordSnapshotOut extends SnapshotOut<typeof DepositRecordModel> {}
export interface DepositRecordSnapshotIn extends SnapshotIn<typeof DepositRecordModel> {}
export const createDepositRecordDefaultModel = () => types.optional(DepositRecordModel, {})
