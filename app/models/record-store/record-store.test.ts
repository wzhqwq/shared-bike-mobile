import { RecordStoreModel } from "./record-store"

test("can be created", () => {
  const instance = RecordStoreModel.create({})

  expect(instance).toBeTruthy()
})
