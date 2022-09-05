import { DepositRecordModel } from "./deposit-record"

test("can be created", () => {
  const instance = DepositRecordModel.create({})

  expect(instance).toBeTruthy()
})
