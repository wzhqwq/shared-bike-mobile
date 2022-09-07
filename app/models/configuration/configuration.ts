import { Instance, SnapshotIn, SnapshotOut, types } from "mobx-state-tree"

/**
 * Model description here for TypeScript hints.
 */
export const ConfigurationModel = types
  .model("Configuration")
  .props({
    id: types.identifierNumber,
    key: types.maybe(types.string),
    value: types.number,
    is_float: types.maybe(types.number),
  })
  .views((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars

export interface Configuration extends Instance<typeof ConfigurationModel> {}
export interface ConfigurationSnapshotOut extends SnapshotOut<typeof ConfigurationModel> {}
export interface ConfigurationSnapshotIn extends SnapshotIn<typeof ConfigurationModel> {}
export const createConfigurationDefaultModel = () => types.optional(ConfigurationModel, {})
