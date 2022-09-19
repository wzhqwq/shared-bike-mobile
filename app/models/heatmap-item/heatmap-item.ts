import { Instance, SnapshotIn, SnapshotOut, types } from "mobx-state-tree"

/**
 * Model description here for TypeScript hints.
 */
export const HeatmapItemModel = types
  .model("HeatmapItem")
  .props({
    data: types.string,
    count: types.number,
  })
  .views((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars

export interface HeatmapItem extends Instance<typeof HeatmapItemModel> {}
export interface HeatmapItemSnapshotOut extends SnapshotOut<typeof HeatmapItemModel> {}
export interface HeatmapItemSnapshotIn extends SnapshotIn<typeof HeatmapItemModel> {}
export const createHeatmapItemDefaultModel = () => types.optional(HeatmapItemModel, {})
