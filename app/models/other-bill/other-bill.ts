import { Instance, SnapshotIn, SnapshotOut, types } from "mobx-state-tree"

/**
 * Model description here for TypeScript hints.
 */
export const OtherBillModel = types
  .model("OtherBill")
  .props({
    id: types.maybe(types.identifierNumber),
    time: types.maybe(types.Date),
    expense: types.string,
    manager_id: types.maybe(types.number),
    reason: types.string,
  })
  .views((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars

export interface OtherBill extends Instance<typeof OtherBillModel> {}
export interface OtherBillSnapshotOut extends SnapshotOut<typeof OtherBillModel> {}
export interface OtherBillSnapshotIn extends SnapshotIn<typeof OtherBillModel> {}
export const createOtherBillDefaultModel = () => types.optional(OtherBillModel, {})
