import { RepairRecordModel } from "./repair-record"

test("can be created", () => {
  const instance = RepairRecordModel.create({})

  expect(instance).toBeTruthy()
})
