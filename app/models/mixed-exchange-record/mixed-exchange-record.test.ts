import { MixedExchangeRecordModel } from "./mixed-exchange-record"

test("can be created", () => {
  const instance = MixedExchangeRecordModel.create({})

  expect(instance).toBeTruthy()
})
