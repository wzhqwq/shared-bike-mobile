import { Instance, SnapshotIn, SnapshotOut, types } from "mobx-state-tree"
import { Response } from "../../services/api"
import { BikeBill, BikeBillModel } from "../bike-bill/bike-bill"
import { withEnvironment } from "../extensions/with-environment"
import { OtherBill, OtherBillModel } from "../other-bill/other-bill"
import { RideRecord, RideRecordModel } from "../ride-record/ride-record"
import { SouvenirBill, SouvenirBillModel } from "../souvenir-bill/souvenir-bill"


const detailType = types.maybe(types.union({
  dispatcher: o => {
    if (typeof o.series_id === 'number') return BikeBillModel
    if (typeof o.souvenir_id === 'number') return SouvenirBillModel
    if (typeof o.reason === 'string') return OtherBillModel
    return RideRecordModel
  }
}, BikeBillModel, SouvenirBillModel, OtherBillModel, RideRecordModel))
/**
 * Model description here for TypeScript hints.
 */
export const ManagerBillModel = types
  .model("ManagerBill")
  .props({
    id: types.maybe(types.identifierNumber),
    time: types.maybe(types.Date),
    type: types.number,
    record_id: types.number,
    user_id: types.number,
    change: types.string,
    details: detailType,
  })
  .extend(withEnvironment)
  .views((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => ({
    async getDetails() {
      const result: Response<BikeBill | SouvenirBill | OtherBill | RideRecord> = await self.environment.api.get('/manager/property/master/detail', { record_id: self.record_id, type: self.type })
      if (result.ok) {
        switch (self.type) {
          case MASTER_BILL_FROM_RIDING:
            self.details = result.data as RideRecord
            break
          case MASTER_BILL_FROM_BIKE:
            self.details = result.data as BikeBill
            break
          case MASTER_BILL_FROM_SOUVENIR:
            self.details = result.data as SouvenirBill
            break
          case MASTER_BILL_FROM_OTHER:
            self.details = result.data as OtherBill
            break
        }
      }
      return result.ok
    }
  })) // eslint-disable-line @typescript-eslint/no-unused-vars

export const MASTER_BILL_FROM_RIDING = 0
export const MASTER_BILL_FROM_BIKE = 1
export const MASTER_BILL_FROM_SOUVENIR = 2
export const MASTER_BILL_FROM_OTHER = 3

export interface ManagerBill extends Instance<typeof ManagerBillModel> {}
export interface ManagerBillSnapshotOut extends SnapshotOut<typeof ManagerBillModel> {}
export interface ManagerBillSnapshotIn extends SnapshotIn<typeof ManagerBillModel> {}
export const createManagerBillDefaultModel = () => types.optional(ManagerBillModel, {})
