import { Instance, SnapshotIn, SnapshotOut, types } from "mobx-state-tree"

/**
 * Model description here for TypeScript hints.
 */
export const BikeBillModel = types
  .model("BikeBill")
  .props({
    id: types.maybe(types.identifierNumber),
    time: types.maybe(types.Date),
    expense: types.string,
    manager_id: types.maybe(types.number),
    series_id: types.number,
    amount: types.number,
  })
  .views((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars

export interface BikeBill extends Instance<typeof BikeBillModel> {}
export interface BikeBillSnapshotOut extends SnapshotOut<typeof BikeBillModel> {}
export interface BikeBillSnapshotIn extends SnapshotIn<typeof BikeBillModel> {}
export const createBikeBillDefaultModel = () => types.optional(BikeBillModel, {})
