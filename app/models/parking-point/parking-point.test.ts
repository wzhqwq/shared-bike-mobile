import { ParkingPointModel } from "./parking-point"

test("can be created", () => {
  const instance = ParkingPointModel.create({})

  expect(instance).toBeTruthy()
})
