import { Instance, SnapshotIn, SnapshotOut, types } from "mobx-state-tree"
import { Response } from "../../services/api"
import { withEnvironment } from "../extensions/with-environment"

/**
 * Model description here for TypeScript hints.
 */
export const MalfunctionModel = types
  .model("Malfunction")
  .props({
    id: types.identifierNumber,
    part_name: types.string,
    damage_degree: types.number,
  })
  .extend(withEnvironment)
  .views((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => ({
    updatePartName(partName: string) {
      self.part_name = partName
    }
  })) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => ({
    async modifyPartName(partName: string) {
      const result: Response<null> = await self.environment.api.post('/manager/bike/malfunction/modify', { malfunction_id: self.id, part_name: partName })
      if (result.ok) self.updatePartName(partName)
      return result.ok
    }
  })) // eslint-disable-line @typescript-eslint/no-unused-vars

export interface Malfunction extends Instance<typeof MalfunctionModel> {}
export interface MalfunctionSnapshotOut extends SnapshotOut<typeof MalfunctionModel> {}
export interface MalfunctionSnapshotIn extends SnapshotIn<typeof MalfunctionModel> {}
export const createMalfunctionDefaultModel = () => types.optional(MalfunctionModel, {})
