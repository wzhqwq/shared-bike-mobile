import { Instance, SnapshotIn, SnapshotOut, types } from "mobx-state-tree"

/**
 * Model description here for TypeScript hints.
 */
export const SectionModel = types
  .model("Section")
  .props({
    id: types.optional(types.identifierNumber, -1),
    tr_longitude: types.string,
    tr_latitude: types.string,
    bl_longitude: types.string,
    bl_latitude: types.string,
    name: types.string,
  })
  .views((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars

export interface Section extends Instance<typeof SectionModel> {}
export interface SectionSnapshotOut extends SnapshotOut<typeof SectionModel> {}
export interface SectionSnapshotIn extends SnapshotIn<typeof SectionModel> {}
export const createSectionDefaultModel = () => types.optional(SectionModel, {})
