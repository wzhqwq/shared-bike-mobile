import { ExchangeRecordModel } from "./exchange-record"

test("can be created", () => {
  const instance = ExchangeRecordModel.create({})

  expect(instance).toBeTruthy()
})
