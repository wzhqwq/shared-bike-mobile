import { Instance, SnapshotIn, SnapshotOut, types } from "mobx-state-tree"
import { BASE_URL } from "../../services/api/api-config"
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
  .views((self) => ({
    get image_url() {
      if (!self.image_key) return giftIcon
      return BASE_URL + '/image/show?key=' + self.image_key
    }
  })) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars

export interface Souvenir extends Instance<typeof SouvenirModel> {}
export interface SouvenirSnapshotOut extends SnapshotOut<typeof SouvenirModel> {}
export interface SouvenirSnapshotIn extends SnapshotIn<typeof SouvenirModel> {}
export const createSouvenirDefaultModel = () => types.optional(SouvenirModel, {})
