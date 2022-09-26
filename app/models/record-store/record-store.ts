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
    rideRecordsVersion: types.optional(types.number, 0),
    repairRecordsVersion: types.optional(types.number, 0),
    rechargeRecordsVersion: types.optional(types.number, 0),
    exchangeRecordsVersion: types.optional(types.number, 0),
    destroyRecordsVersion: types.optional(types.number, 0),
    bikeBillsVersion: types.optional(types.number, 0),
    souvenirBillsVersion: types.optional(types.number, 0),
    otherBillsVersion: types.optional(types.number, 0),
    depositRecordsVersion: types.optional(types.number, 0),
    pointRecordsVersion: types.optional(types.number, 0),
    masterBillsVersion: types.optional(types.number, 0),
    signUpRequestsVersion: types.optional(types.number, 0),
    malfunctionRecordsVersion: types.optional(types.number, 0),
    
    rideRecords: types.optional(types.array(RideRecordModel), []),
    repairRecords: types.optional(types.array(RepairRecordModel), []),
    rechargeRecords: types.optional(types.array(RechargeRecordModel), []),
    exchangeRecords: types.optional(types.array(ExchangeRecordModel), []),
    destroyRecords: types.optional(types.array(DestroyRecordModel), []),
    bikeBills: types.optional(types.array(BikeBillModel), []),
    souvenirBills: types.optional(types.array(SouvenirBillModel), []),
    otherBills: types.optional(types.array(OtherBillModel), []),
    depositRecords: types.optional(types.array(DepositRecordModel), []),
    pointRecords: types.optional(types.array(PointRecordModel), []),
    masterBills: types.optional(types.array(ManagerBillModel), []),
    signUpRequests: types.optional(types.array(SignUpRequestModel), []),
    malfunctionRecords: types.optional(types.array(MalfunctionRecordModel), []),
  })
  .views((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => ({
    async setRideRecords(data: RideRecord[], append: boolean) {
      if (append)
        self.rideRecords.push(...data)
      else
        self.rideRecords.replace(data)
      self.rideRecordsVersion++
    },
    async setRepairRecords(data: RepairRecord[], append: boolean) {
      if (append)
        self.repairRecords.push(...data)
      else
        self.repairRecords.replace(data)
      self.repairRecordsVersion++
    },
    async setRechargeRecords(data: RechargeRecord[], append: boolean) {
      if (append)
        self.rechargeRecords.push(...data)
      else
        self.rechargeRecords.replace(data)
      self.rechargeRecordsVersion++
    },
    async setExchangeRecords(data: ExchangeRecord[], append: boolean) {
      if (append)
        self.exchangeRecords.push(...data)
      else
        self.exchangeRecords.replace(data)
      self.exchangeRecordsVersion++
    },
    async setDestroyRecords(data: DestroyRecord[], append: boolean) {
      if (append)
        self.destroyRecords.push(...data)
      else
        self.destroyRecords.replace(data)
      self.destroyRecordsVersion++
    },
    async setBikeBills(data: BikeBill[], append: boolean) {
      if (append)
        self.bikeBills.push(...data)
      else
        self.bikeBills.replace(data)
      self.bikeBillsVersion++
    },
    async setSouvenirBills(data: SouvenirBill[], append: boolean) {
      if (append)
        self.souvenirBills.push(...data)
      else
        self.souvenirBills.replace(data)
      self.souvenirBillsVersion++
    },
    async setOtherBills(data: OtherBill[], append: boolean) {
      if (append)
        self.otherBills.push(...data)
      else
        self.otherBills.replace(data)
      self.otherBillsVersion++
    },
    async setMasterBills(data: ManagerBill[], append: boolean) {
      if (append)
        self.masterBills.push(...data)
      else
        self.masterBills.replace(data)
      self.masterBillsVersion++
    },
    async setDepositRecords(data: DepositRecord[], append: boolean) {
      if (append)
        self.depositRecords.push(...data)
      else
        self.depositRecords.replace(data)
      self.depositRecordsVersion++
    },
    async setPointRecords(data: PointRecord[], append: boolean) {
      if (append)
        self.pointRecords.push(...data)
      else
        self.pointRecords.replace(data)
      self.pointRecordsVersion++
    },
    async setSignUpRequests(data: SignUpRequest[], append: boolean) {
      if (append)
        self.signUpRequests.push(...data)
      else
        self.signUpRequests.replace(data)
      self.signUpRequestsVersion++
    },
    async setMalfunctionRecords(data: MalfunctionRecord[]) {
      self.malfunctionRecords.replace(data)
      self.malfunctionRecordsVersion++
    },
  })) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => ({
    async listMyRideRecords(append = true) {
      const lastId = append ? self.rideRecords.at(-1)?.id ?? 100000 : 100000
      const result: Response<RideRecord[]> = await self.environment.api.get('/customer/bike/record/list/ride', { lastId })
      if (result.ok) self.setRideRecords(result.data, append)
    },
    async listMyRepairRecords(append = true) {
      const lastId = append ? self.repairRecords.at(-1)?.id ?? 100000 : 100000
      const result: Response<RepairRecord[]> = await self.environment.api.get('/maintainer/repair/list', { lastId })
      if (result.ok) self.setRepairRecords(result.data, append)
    },
    async listMyRechargeRecords(append = true) {
      const lastId = append ? self.rechargeRecords.at(-1)?.id ?? 100000 : 100000
      const result: Response<RechargeRecord[]> = await self.environment.api.get('/customer/property/list/recharge', { lastId })
      if (result.ok) self.setRechargeRecords(result.data, append)
    },
    async listMyExchangeRecords(append = true) {
      const lastId = append ? self.exchangeRecords.at(-1)?.id ?? 100000 : 100000
      const result: Response<ExchangeRecord[]> = await self.environment.api.get('/customer/souvenir/exchanged/list', { lastId })
      if (result.ok) self.setExchangeRecords(result.data, append)
    },
    async listUserExchangeRecords(customerId: number, append = true) {
      const lastId = append ? self.exchangeRecords.at(-1)?.id ?? 100000 : 100000
      const result: Response<ExchangeRecord[]> = await self.environment.api.get('/manager/souvenir/exchanges/list', { customer_id: customerId, lastId })
      if (result.ok) self.setExchangeRecords(result.data, append)
    },
    async listDestroyRecords(append = true) {
      const lastId = append ? self.destroyRecords.at(-1)?.id ?? 100000 : 100000
      const result: Response<DestroyRecord[]> = await self.environment.api.get('/manager/bike/list/destroyed', { lastId })
      if (result.ok) self.setDestroyRecords(result.data, append)
    },
    async listBikeBills(append = true) {
      const lastId = append ? self.bikeBills.at(-1)?.id ?? 100000 : 100000
      const result: Response<BikeBill[]> = await self.environment.api.get('/manager/property/separated/list/bike', { lastId })
      if (result.ok) self.setBikeBills(result.data, append)
    },
    async listSouvenirBills(append = true) {
      const lastId = append ? self.souvenirBills.at(-1)?.id ?? 100000 : 100000
      const result: Response<SouvenirBill[]> = await self.environment.api.get('/manager/property/separated/list/souvenir', { lastId })
      if (result.ok) self.setSouvenirBills(result.data, append)
    },
    async listOtherBills(append = true) {
      const lastId = append ? self.otherBills.at(-1)?.id ?? 100000 : 100000
      const result: Response<OtherBill[]> = await self.environment.api.get('/manager/property/separated/list/other', { lastId })
      if (result.ok) self.setOtherBills(result.data, append)
    },
    async listMasterBills(append = true) {
      const lastId = append ? self.masterBills.at(-1)?.id ?? 100000 : 100000
      const result: Response<ManagerBill[]> = await self.environment.api.get('/manager/property/master/list', { lastId })
      if (result.ok) self.setMasterBills(result.data, append)
    },
    async listMyDepositRecords(append = true) {
      const lastId = append ? self.depositRecords.at(-1)?.id ?? 100000 : 100000
      const result: Response<DepositRecord[]> = await self.environment.api.get('/customer/property/list/deposit', { lastId })
      if (result.ok) self.setDepositRecords(result.data, append)
    },
    async listMyPointRecords(append = true) {
      const lastId = append ? self.pointRecords.at(-1)?.id ?? 100000 : 100000
      const result: Response<PointRecord[]> = await self.environment.api.get('/customer/property/list/points', { lastId })
      if (result.ok) self.setPointRecords(result.data, append)
    },
    async listSignUpRequests(append = true) {
      const lastId = append ? self.signUpRequests.at(-1)?.id ?? 100000 : 100000
      const result: Response<SignUpRequest[]> = await self.environment.api.get('/manager/user/request/list', { lastId })
      if (result.ok) self.setSignUpRequests(result.data, append)
    },
    async showMyMalfunctionRecords(rideId: number) {
      const result: Response<MalfunctionRecord[]> = await self.environment.api.get('/customer/bike/record/list/malfunction', { ride_id: rideId })
      if (result.ok) self.setMalfunctionRecords(result.data)
    },
    async showMalfunctionRecords(bikeId: number, malfunctionId: number) {
      const result: Response<MalfunctionRecord[]> = await self.environment.api.get('/maintainer/malfunction/list', { bike_id: bikeId, malfunction_id: malfunctionId })
      if (result.ok) self.setMalfunctionRecords(result.data)
    },
  })) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => ({
    async repair(record: RepairRecord) {
      const result: Response<number[]> = await self.environment.api.post('/maintainer/malfunction/handle', record)
      if (result.ok) {
        self.malfunctionRecords.forEach(r => {
          if (result.data.includes(r.id)) r.setStatus(record.conclusion + 1)
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
        await self.listBikeBills()
      }
      return result.ok
    },
    async purchaseSouvenir(record: SouvenirBill) {
      const result: Response<null> = await self.environment.api.post('/manager/property/separated/add/souvenir', record)
      if (result.ok) {
        await self.listSouvenirBills()
      }
      return result.ok
    },
    async recordOtherBills(record: OtherBill) {
      const result: Response<null> = await self.environment.api.post('/manager/property/separated/add/other', record)
      if (result.ok) {
        await self.listOtherBills()
      }
      return result.ok
    },
  })) // eslint-disable-line @typescript-eslint/no-unused-vars

export interface RecordStore extends Instance<typeof RecordStoreModel> {}
export interface RecordStoreSnapshotOut extends SnapshotOut<typeof RecordStoreModel> {}
export interface RecordStoreSnapshotIn extends SnapshotIn<typeof RecordStoreModel> {}
export const createRecordStoreDefaultModel = () => types.optional(RecordStoreModel, {})
