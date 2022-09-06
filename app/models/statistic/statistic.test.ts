import { StatisticModel } from "./statistic"

test("can be created", () => {
  const instance = StatisticModel.create({})

  expect(instance).toBeTruthy()
})
