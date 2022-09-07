import { Instance, SnapshotIn, SnapshotOut, types } from "mobx-state-tree"

/**
 * Model description here for TypeScript hints.
 */
export const StatisticModel = types
  .model("Statistic")
  .props({
    income: types.maybeNull(types.number),
    expenditure: types.maybeNull(types.number),
    availableCount: types.number,
    occupiedCount: types.number,
    unavailableCount: types.number,
    destroyedCount: types.number,
  })
  .views((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars

export interface Statistic extends Instance<typeof StatisticModel> {}
export interface StatisticSnapshotOut extends SnapshotOut<typeof StatisticModel> {}
export interface StatisticSnapshotIn extends SnapshotIn<typeof StatisticModel> {}
export const createStatisticDefaultModel = () => types.optional(StatisticModel, {})
