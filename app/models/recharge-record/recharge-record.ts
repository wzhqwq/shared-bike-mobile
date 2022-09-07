import { Instance, SnapshotIn, SnapshotOut, types } from "mobx-state-tree"

/**
 * Model description here for TypeScript hints.
 */
export const RechargeRecordModel = types
  .model("RechargeRecord")
  .props({
    id: types.optional(types.identifierNumber, -1),
    time: types.maybe(types.Date),
    customer_id: types.maybe(types.number),
    amount: types.string,
  })
  .views((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars

export interface RechargeRecord extends Instance<typeof RechargeRecordModel> {}
export interface RechargeRecordSnapshotOut extends SnapshotOut<typeof RechargeRecordModel> {}
export interface RechargeRecordSnapshotIn extends SnapshotIn<typeof RechargeRecordModel> {}
export const createRechargeRecordDefaultModel = () => types.optional(RechargeRecordModel, {})
