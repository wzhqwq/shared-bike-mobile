import { PunishRecordModel } from "./punish-record"

test("can be created", () => {
  const instance = PunishRecordModel.create({})

  expect(instance).toBeTruthy()
})
