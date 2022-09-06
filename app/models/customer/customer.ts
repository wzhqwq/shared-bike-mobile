import { Instance, SnapshotIn, SnapshotOut, types } from "mobx-state-tree"
import moment from "moment"
import { withEnvironment } from "../extensions/with-environment"

/**
 * Model description here for TypeScript hints.
 */
export const CustomerModel = types
  .model("Customer")
  .props({
    user_id: types.maybe(types.identifierNumber),
    points: types.number,
    deposit: types.string,
    ban_time: types.maybeNull(types.Date),
  })
  .extend(withEnvironment)
  .views((self) => ({
    banTimeHuman: () => {
      if (!self.ban_time || self.ban_time < new Date()) return null
      return moment(self.ban_time).fromNow() + '解封'
    }
  })) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => ({
    async liftTheBan() {
      const result = await self.environment.api.post('/manager/user/lift_the_ban', { customer_id: self.user_id })
      if (result.ok) {
        self.ban_time = null
      }
      return result.ok
    },
  })) // eslint-disable-line @typescript-eslint/no-unused-vars

export interface Customer extends Instance<typeof CustomerModel> {}
export interface CustomerSnapshotOut extends SnapshotOut<typeof CustomerModel> {}
export interface CustomerSnapshotIn extends SnapshotIn<typeof CustomerModel> {}
export const createCustomerDefaultModel = () => types.optional(CustomerModel, {})
