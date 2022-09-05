import { RideRecordModel } from "./ride-record"

test("can be created", () => {
  const instance = RideRecordModel.create({})

  expect(instance).toBeTruthy()
})
