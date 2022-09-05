import { BikeBillModel } from "./bike-bill"

test("can be created", () => {
  const instance = BikeBillModel.create({})

  expect(instance).toBeTruthy()
})
