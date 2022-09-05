import { PointRecordModel } from "./point-record"

test("can be created", () => {
  const instance = PointRecordModel.create({})

  expect(instance).toBeTruthy()
})
