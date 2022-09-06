import { Instance, SnapshotIn, SnapshotOut, types } from "mobx-state-tree"
import { Response } from "../../services/api"
import { BikeBill, BikeBillModel } from "../bike-bill/bike-bill"
import { DepositRecord, DepositRecordModel } from "../deposit-record/deposit-record"
import { DestroyRecord, DestroyRecordModel } from "../destroy-record/destroy-record"
import { ExchangeRecord, ExchangeRecordModel } from "../exchange-record/exchange-record"
import { withEnvironment } from "../extensions/with-environment"
import { MalfunctionRecord, MalfunctionRecordModel } from "../malfunction-record/malfunction-record"
import { ManagerBill, ManagerBillModel } from "../manager-bill/manager-bill"
import { OtherBill, OtherBillModel } from "../other-bill/other-bill"
import { PointRecord, PointRecordModel } from "../point-record/point-record"
import { RechargeRecord, RechargeRecordModel } from "../recharge-record/recharge-record"
import { RepairRecord, RepairRecordModel } from "../repair-record/repair-record"
import { RideRecord, RideRecordModel } from "../ride-record/ride-record"
import { SignUpRequest, SignUpRequestModel } from "../sign-up-request/sign-up-request"
import { SouvenirBill, SouvenirBillModel } from "../souvenir-bill/souvenir-bill"

/**
 * Model description here for TypeScript hints.
 */
export const RecordStoreModel = types
  .model("RecordStore")
  .extend(withEnvironment)
  .props({
    // customer
    rideRecords: types.optional(types.array(RideRecordModel), []),
    // maintainer
    repairRecords: types.optional(types.array(RepairRecordModel), []),
    // customer
    rechargeRecords: types.optional(types.array(RechargeRecordModel), []),
    // customer, manager
    exchangeRecords: types.optional(types.array(ExchangeRecordModel), []),
    // manager
    destroyRecords: types.optional(types.array(DestroyRecordModel), []),
    // manager
    bikeBills: types.optional(types.array(BikeBillModel), []),
    // manager
    souvenirBills: types.optional(types.array(SouvenirBillModel), []),
    // manager
    otherBills: types.optional(types.array(OtherBillModel), []),
    // customer
    depositRecords: types.optional(types.array(DepositRecordModel), []),
    // customer
    pointRecords: types.optional(types.array(PointRecordModel), []),
    // manager
    masterBills: types.optional(types.array(ManagerBillModel), []),
    // manager
    signUpRequests: types.optional(types.array(SignUpRequestModel), []),
    // customer, maintainer
    malfunctionRecords: types.optional(types.array(MalfunctionRecordModel), []),
  })
  .views((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => ({
    async listMyRideRecords() {
      const lastId = self.rideRecords.at(-1)?.id ?? 100000
      const result: Response<RideRecord[]> = await self.environment.api.get('/customer/bike/record/list/ride', { last_id: lastId })
      if (result.ok) {
        self.rideRecords.push(...result.data)
      }
    },
    async listMyRepairRecords() {
      const lastId = self.repairRecords.at(-1)?.id ?? 100000
      const result: Response<RepairRecord[]> = await self.environment.api.get('/maintainer/repair/list', { last_id: lastId })
      if (result.ok) {
        self.repairRecords.push(...result.data)
      }
    },
    async listMyRechargeRecords() {
      const lastId = self.rechargeRecords.at(-1)?.id ?? 100000
      const result: Response<RechargeRecord[]> = await self.environment.api.get('/customer/property/list/recharge', { last_id: lastId })
      if (result.ok) {
        self.rechargeRecords.push(...result.data)
      }
    },
    async listMyExchangeRecords() {
      const lastId = self.exchangeRecords.at(-1)?.id ?? 100000
      const result: Response<ExchangeRecord[]> = await self.environment.api.get('/customer/souvenir/exchanged/list', { last_id: lastId })
      if (result.ok) {
        self.exchangeRecords.push(...result.data)
      }
    },
    async listUserExchangeRecords(customerId: number) {
      const result: Response<ExchangeRecord[]> = await self.environment.api.get('/manager/souvenir/exchanges/list', { customer_id: customerId })
      if (result.ok) {
        self.exchangeRecords.push(...result.data)
      }
    },
    async listDestroyRecords() {
      const lastId = self.destroyRecords.at(-1)?.id ?? 100000
      const result: Response<DestroyRecord[]> = await self.environment.api.get('/manager/bike/list/destroyed', { last_id: lastId })
      if (result.ok) {
        self.destroyRecords.push(...result.data)
      }
    },
    async listBikeBill() {
      const lastId = self.bikeBills.at(-1)?.id ?? 100000
      const result: Response<BikeBill[]> = await self.environment.api.get('/manager/property/separated/list/bike', { last_id: lastId })
      if (result.ok) {
        self.bikeBills.push(...result.data)
      }
    },
    async listSouvenirBill() {
      const lastId = self.souvenirBills.at(-1)?.id ?? 100000
      const result: Response<SouvenirBill[]> = await self.environment.api.get('/manager/property/separated/list/souvenir', { last_id: lastId })
      if (result.ok) {
        self.souvenirBills.push(...result.data)
      }
    },
    async listOtherBill() {
      const lastId = self.otherBills.at(-1)?.id ?? 100000
      const result: Response<OtherBill[]> = await self.environment.api.get('/manager/property/separated/list/other', { last_id: lastId })
      if (result.ok) {
        self.otherBills.push(...result.data)
      }
    },
    async listMasterBill() {
      const lastId = self.masterBills.at(-1)?.id ?? 100000
      const result: Response<ManagerBill[]> = await self.environment.api.get('/manager/property/master/list', { last_id: lastId })
      if (result.ok) {
        self.masterBills.push(...result.data)
      }
    },
    async listMyDepositRecords() {
      const lastId = self.depositRecords.at(-1)?.id ?? 100000
      const result: Response<DepositRecord[]> = await self.environment.api.get('/customer/property/list/deposit', { last_id: lastId })
      if (result.ok) {
        self.depositRecords.push(...result.data)
      }
    },
    async listMyPointRecords() {
      const lastId = self.pointRecords.at(-1)?.id ?? 100000
      const result: Response<PointRecord[]> = await self.environment.api.get('/customer/property/list/points', { last_id: lastId })
      if (result.ok) {
        self.pointRecords.push(...result.data)
      }
    },
    async listSignUpRequests() {
      const lastId = self.signUpRequests.at(-1)?.id ?? 100000
      const result: Response<SignUpRequest[]> = await self.environment.api.get('/manager/user/request/list', { last_id: lastId })
      if (result.ok) {
        self.signUpRequests.push(...result.data)
      }
    },
    async showMyMalfunctionRecords(rideId: number) {
      const result: Response<MalfunctionRecord[]> = await self.environment.api.get('/customer/bike/record/list/malfunction', { ride_id: rideId })
      if (result.ok) {
        self.malfunctionRecords.replace(result.data)
      }
    },
    async showMalfunctionRecords(bikeId: number) {
      const lastId = self.malfunctionRecords.at(-1)?.id ?? 100000
      const result: Response<MalfunctionRecord[]> = await self.environment.api.get('/maintainer/malfunction/list', { bike_id: bikeId, last_id: lastId })
      if (result.ok) {
        self.malfunctionRecords.replace(result.data)
      }
    },
  })) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => ({
    async repair(record: RepairRecord) {
      const result: Response<number[]> = await self.environment.api.post('/maintainer/malfunction/handle', record)
      if (result.ok) {
        self.malfunctionRecords.forEach(r => {
          if (result.data.includes(r.id)) r.status = record.conclusion + 1
        })
      }
      return result.ok
    },
    async recharge(record: RechargeRecord) {
      const result: Response<null> = await self.environment.api.post('/customer/property/recharge', record)
      if (result.ok) {
        await self.listMyRechargeRecords()
      }
      return result.ok
    },
    async exchange(record: ExchangeRecord) {
      const result: Response<null> = await self.environment.api.post('/customer/souvenir/exchange', record)
      return result.ok
    },
    async destroy(record: DestroyRecord) {
      const result: Response<null> = await self.environment.api.post('/manager/bike/destroy', record)
      return result.ok
    },
    async purchaseBike(record: BikeBill) {
      const result: Response<null> = await self.environment.api.post('/manager/property/separated/add/bike', record)
      if (result.ok) {
        await self.listBikeBill()
      }
      return result.ok
    },
    async purchaseSouvenir(record: SouvenirBill) {
      const result: Response<null> = await self.environment.api.post('/manager/property/separated/add/souvenir', record)
      if (result.ok) {
        await self.listSouvenirBill()
      }
      return result.ok
    },
    async recordOtherBill(record: OtherBill) {
      const result: Response<null> = await self.environment.api.post('/manager/property/separated/add/other', record)
      if (result.ok) {
        await self.listOtherBill()
      }
      return result.ok
    },
    async report(records: MalfunctionRecord[]) {
      const result: Response<number> = await self.environment.api.post('/customer/bike/report', records)
      return result.ok
    }
  })) // eslint-disable-line @typescript-eslint/no-unused-vars

export interface RecordStore extends Instance<typeof RecordStoreModel> {}
export interface RecordStoreSnapshotOut extends SnapshotOut<typeof RecordStoreModel> {}
export interface RecordStoreSnapshotIn extends SnapshotIn<typeof RecordStoreModel> {}
export const createRecordStoreDefaultModel = () => types.optional(RecordStoreModel, {})
