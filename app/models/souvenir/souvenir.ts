import { Instance, SnapshotIn, SnapshotOut, types } from "mobx-state-tree"
import { ImageURISource } from "react-native"
import { Response } from "../../services/api"
import { BASE_URL } from "../../services/api/api-config"
import { withEnvironment } from "../extensions/with-environment"
const giftIcon = require('./gift.png')

/**
 * Model description here for TypeScript hints.
 */
export const SouvenirModel = types
  .model("Souvenir")
  .props({
    id: types.identifierNumber,
    name: types.string,
    image_key: types.maybeNull(types.string),
    price: types.number,
    total_amount: types.number,
  })
  .extend(withEnvironment)
  .views((self) => ({
    get image_url(): ImageURISource {
      if (!self.image_key) return giftIcon
      return { uri: BASE_URL + '/image/show?key=' + self.image_key }
    }
  })) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => ({
    update(s: Souvenir) {
      self.image_key = s.image_key
      self.name = s.name
      self.price = s.price
    }
  })) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => ({
    async modify(name: string, price: number, imageKey: string) {
      const s = SouvenirModel.create({ name, price, image_key: imageKey })
      const result: Response<null> = await self.environment.api.post('/manager/souvenir/modify', s)
      if (result.ok) self.update(s)
      return result.ok
    },
  })) // eslint-disable-line @typescript-eslint/no-unused-vars

export interface Souvenir extends Instance<typeof SouvenirModel> {}
export interface SouvenirSnapshotOut extends SnapshotOut<typeof SouvenirModel> {}
export interface SouvenirSnapshotIn extends SnapshotIn<typeof SouvenirModel> {}
export const createSouvenirDefaultModel = () => types.optional(SouvenirModel, {})
