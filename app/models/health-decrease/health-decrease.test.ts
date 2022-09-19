import { HealthDecreaseModel } from "./health-decrease"

test("can be created", () => {
  const instance = HealthDecreaseModel.create({})

  expect(instance).toBeTruthy()
})
