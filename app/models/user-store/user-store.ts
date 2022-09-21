import { Instance, SnapshotIn, SnapshotOut, types } from "mobx-state-tree"
import global from "../../global"
import { Response } from "../../services/api"
import { Bike, BikeModel } from "../bike/bike"
import { withEnvironment } from "../extensions/with-environment"
import { HealthDecrease, HealthDecreaseModel } from "../health-decrease/health-decrease"
import { HeatmapItem, HeatmapItemModel } from "../heatmap-item/heatmap-item"
import { Maintainer, MaintainerModel } from "../maintainer/maintainer"
import { MalfunctionRecord } from "../malfunction-record/malfunction-record"
import { Manager } from "../manager/manager"
import { SignUpRequestModel } from "../sign-up-request/sign-up-request"
import { Statistic, StatisticModel } from "../statistic/statistic"
import { CUSTOMER_USER, MAINTAINER_USER, MANAGER_USER, UNLINKED_USER, User, UserModel } from "../user/user"

/**
 * Model description here for TypeScript hints.
 */
export const UserStoreModel = types
  .model("UserStore")
  .props({
    me: types.maybe(UserModel),
    bikeNow: types.maybe(BikeModel),
    sectionIdNow: types.maybe(types.number),
    statistic: types.maybe(StatisticModel),
    maintainersVersion: types.optional(types.number, 0),
    repairGraphVersion: types.optional(types.number, 0),
    decreasesVersion: types.optional(types.number, 0),
    maintainers: types.optional(types.array(MaintainerModel), []),
    repairGraph: types.optional(types.array(HeatmapItemModel), []),
    decreases: types.optional(types.array(HealthDecreaseModel), []),
    pointsAcquired: types.maybe(types.number),
  })
  .extend(withEnvironment)
  .views((self) => ({
    unregistered: () => self.me?.role > UNLINKED_USER
  })) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => ({
    updateMe(me: User) {
      self.me = me
    },
    setBikeNow(bike: Bike) {
      self.bikeNow = bike
    },
    setStatistics(o: Statistic) {
      self.statistic = o
    },
    setSectionIdNow(id: number) {
      self.sectionIdNow = id
    },
    setRepairGraph(g: HeatmapItem[]) {
      self.repairGraphVersion++
      self.repairGraph.replace(g)
    },
    setMaintainers(m: Maintainer[]) {
      self.maintainersVersion++
      self.maintainers.replace(m)
    },
    setDecreases(d: HealthDecrease[]) {
      self.decreasesVersion++
      self.decreases.replace(d)
    },
    setPoints(p: number | undefined) {
      self.pointsAcquired = p
    }
  })) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => ({
    async fetch() {
      const result: Response<User> = await self.environment.api.get('/auth/me')
      if (result.ok) {
        self.updateMe(result.data)
        self.environment.updateLocalUser(result.data)
      }
      return result.ok
    },
    async signUp(nickname: string, password: string) {
      const result: Response<string> = await self.environment.api.post('/auth/sign_up', { nickname, password })
      if (result.ok) {
        await self.environment.updateJwt(result.data)
      }
      return result.ok
    },
    async signIn(nickname: string, password: string) {
      const result: Response<string> = await self.environment.api.post('/auth/sign_in', { nickname, password })
      if (result.ok) {
        await self.environment.updateJwt(result.data)
      }
      return result.ok
    },
    async logOut() {
      self.updateMe(undefined)
      await self.environment.removeUser()
    },
    async registerAsCustomer() {
      const result: Response<string> = await self.environment.api.post('/auth/register_as_customer', undefined)
      if (result.ok) {
        await self.environment.updateJwt(result.data)
      }
      return result.ok
    },
    async registerAs(type: number, name: string, phone: string) {
      const record = SignUpRequestModel.create({ type, name, phone, id: -1 })
      const result: Response<null> = await self.environment.api.post('/auth/request_to_be', record)
      if (result.ok) {
        global.toast.show("请等待管理员同意请求")
      }
    },
    async changePassword(password: string, oldPassword: string) {
      const result: Response<null> = await self.environment.api.post('/auth/edit_password', { password, old_password: oldPassword })
      return result.ok
    },
    async changeProfile(nickname: string, name?: string, phone?: string) {
      const result: Response<User> = await self.environment.api.post('/auth/edit_profile', { nickname, name, phone })
      if (result.ok) {
        self.me.updateNickname(result.data.nickname)
        if (self.me.role === MAINTAINER_USER || self.me.role === MANAGER_USER) {
          const local = self.me.extended as (Maintainer | Manager)
          const remote = result.data.extended as (Maintainer | Manager)
          local.updateName(remote.name)
          local.updatePhone(remote.phone)
        }
      }
      return result.ok
    },
    async findBike(seriesNo: string) {
      const result: Response<Bike> = self.me.role === CUSTOMER_USER ?
        await self.environment.api.get('/customer/bike/find', { series_no: seriesNo }) :
        await self.environment.api.get('/maintainer/bike/find', { series_no: seriesNo })

      if (result.ok) {
        if (!result.data) {
          global.toast.show('没有找到单车', { type: 'danger' })
          return false
        }
        self.setBikeNow(result.data)
      }
      return result.ok
    },
    async listMaintainersInSection(sectionId: number) {
      self.setSectionIdNow(sectionId)
      const result: Response<Maintainer[]> = await self.environment.api.get('/manager/section/maintainer/list', { section_id: sectionId })
      if (result.ok) self.setMaintainers(result.data)
      return result.ok
    },
    async getStatistics() {
      const bikeResult: Response<any> = await self.environment.api.get('/manager/bike/statistics')
      if (!bikeResult.ok) return false
      const billResult: Response<any> = await self.environment.api.get('/manager/property/master/statistics')
      if (!billResult.ok) return false
      self.setStatistics({ ...bikeResult.data, ...billResult.data })
      return true
    },
    async getRepairGraph() {
      const result: Response<HeatmapItem[]> = await self.environment.api.get('/maintainer/repair/graph', undefined)
      if (result.ok) {
        self.setRepairGraph(result.data)
      }
    },
    async getDecreases(bikeId: number) {
      const result: Response<HealthDecrease[]> = await self.environment.api.get('/maintainer/malfunction/list_decreases', { bike_id: bikeId })
      if (result.ok) {
        self.setDecreases(result.data)
      }
    },
  })) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => ({
    async checkRole() {
      const result: Response<string> = await self.environment.api.post('/auth/check_role', undefined)
      if (result.ok) {
        await self.environment.updateJwt(result.data)
        await self.fetch()
      }
      return result.ok
    },
    async grantSectionTo(sectionId: number, maintainerId: number) {
      const result: Response<null> = await self.environment.api.post('/manager/section/maintainer/grant', { section_id: sectionId, maintainer_id: maintainerId })
      if (result.ok) await self.listMaintainersInSection(self.sectionIdNow)
      return result.ok
    },
    async revokeSectionFrom(sectionId: number, maintainerId: number) {
      const result: Response<null> = await self.environment.api.post('/manager/section/maintainer/revoke', { section_id: sectionId, maintainer_id: maintainerId })
      if (result.ok) await self.listMaintainersInSection(self.sectionIdNow)
      return result.ok
    },
    async report(records: MalfunctionRecord[]) {
      self.setPoints(undefined)
      const result: Response<number> = await self.environment.api.post('/customer/bike/report', records)
      self.setPoints(result.data)
      return result.ok
    }
  })) // eslint-disable-line @typescript-eslint/no-unused-vars

export interface UserStore extends Instance<typeof UserStoreModel> {}
export interface UserStoreSnapshotOut extends SnapshotOut<typeof UserStoreModel> {}
export interface UserStoreSnapshotIn extends SnapshotIn<typeof UserStoreModel> {}
export const createUserStoreDefaultModel = () => types.optional(UserStoreModel, {})
