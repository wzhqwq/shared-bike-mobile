import { Instance, SnapshotIn, SnapshotOut, types } from "mobx-state-tree"
import { withEnvironment } from "../extensions/with-environment"

/**
 * Model description here for TypeScript hints.
 */
export const BikeSeriesModel = types
  .model("BikeSeries")
  .props({
    id: types.identifierNumber,
    name: types.string,
    mileage_limit: types.number,
    rent: types.string,
    amount: types.maybe(types.number),
  })
  .extend(withEnvironment)
  .views((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => ({
    updateSelf(name: string, mileageLimit: number, rent: string) {
      self.name = name
      self.mileage_limit = mileageLimit
      self.rent = rent
    }
  })) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => ({
    async modify(name: string, mileageLimit: number, rent: string) {
      const series = BikeSeriesModel.create({ name, rent, mileage_limit: mileageLimit, id: -1 })
      const result = await self.environment.api.post('/manager/bike/series/modify', series)
      if (result.ok) self.updateSelf(name, mileageLimit, rent)
      return result.ok
    }
  })) // eslint-disable-line @typescript-eslint/no-unused-vars

export interface BikeSeries extends Instance<typeof BikeSeriesModel> {}
export interface BikeSeriesSnapshotOut extends SnapshotOut<typeof BikeSeriesModel> {}
export interface BikeSeriesSnapshotIn extends SnapshotIn<typeof BikeSeriesModel> {}
export const createBikeSeriesDefaultModel = () => types.optional(BikeSeriesModel, {})
