import { DestroyRecordModel } from "./destroy-record"

test("can be created", () => {
  const instance = DestroyRecordModel.create({})

  expect(instance).toBeTruthy()
})
