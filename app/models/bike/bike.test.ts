import { BikeModel } from "./bike"

test("can be created", () => {
  const instance = BikeModel.create({})

  expect(instance).toBeTruthy()
})
