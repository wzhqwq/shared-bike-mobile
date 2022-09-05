import { EntityStoreModel } from "./entity-store"

test("can be created", () => {
  const instance = EntityStoreModel.create({})

  expect(instance).toBeTruthy()
})
