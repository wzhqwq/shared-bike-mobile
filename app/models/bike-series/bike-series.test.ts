import { BikeSeriesModel } from "./bike-series"

test("can be created", () => {
  const instance = BikeSeriesModel.create({})

  expect(instance).toBeTruthy()
})
