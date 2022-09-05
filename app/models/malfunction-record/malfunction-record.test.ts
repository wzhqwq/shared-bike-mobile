import { MalfunctionRecordModel } from "./malfunction-record"

test("can be created", () => {
  const instance = MalfunctionRecordModel.create({})

  expect(instance).toBeTruthy()
})
