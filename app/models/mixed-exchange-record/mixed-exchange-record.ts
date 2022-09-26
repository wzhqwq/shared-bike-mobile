import { Instance, SnapshotIn, SnapshotOut, types } from "mobx-state-tree"
import { ExchangeRecordModel } from "../exchange-record/exchange-record"
import { SouvenirModel } from "../souvenir/souvenir"

/**
 * Model description here for TypeScript hints.
 */
export const MixedExchangeRecordModel = types
  .model("MixedExchangeRecord")
  .props({
    record: types.map(ExchangeRecordModel),
    souvenir: types.map(SouvenirModel),
  })
  .views((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars

export interface MixedExchangeRecord extends Instance<typeof MixedExchangeRecordModel> {}
export interface MixedExchangeRecordSnapshotOut extends SnapshotOut<typeof MixedExchangeRecordModel> {}
export interface MixedExchangeRecordSnapshotIn extends SnapshotIn<typeof MixedExchangeRecordModel> {}
export const createMixedExchangeRecordDefaultModel = () => types.optional(MixedExchangeRecordModel, {})
