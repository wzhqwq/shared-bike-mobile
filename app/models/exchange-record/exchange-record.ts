import { Instance, SnapshotIn, SnapshotOut, types } from "mobx-state-tree"

/**
 * Model description here for TypeScript hints.
 */
export const ExchangeRecordModel = types
  .model("ExchangeRecord")
  .props({
    id: types.maybe(types.identifierNumber),
    time: types.maybe(types.Date),
    souvenir_id: types.number,
    customer_id: types.maybe(types.number),
    amount: types.number,
    given: types.maybe(types.number),
    given_by: types.maybe(types.number),
  })
  .views((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars

export interface ExchangeRecord extends Instance<typeof ExchangeRecordModel> {}
export interface ExchangeRecordSnapshotOut extends SnapshotOut<typeof ExchangeRecordModel> {}
export interface ExchangeRecordSnapshotIn extends SnapshotIn<typeof ExchangeRecordModel> {}
export const createExchangeRecordDefaultModel = () => types.optional(ExchangeRecordModel, {})
