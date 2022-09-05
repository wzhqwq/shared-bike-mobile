import { RechargeRecordModel } from "./recharge-record"

test("can be created", () => {
  const instance = RechargeRecordModel.create({})

  expect(instance).toBeTruthy()
})
