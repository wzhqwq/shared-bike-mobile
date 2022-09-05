import { MalfunctionModel } from "./malfunction"

test("can be created", () => {
  const instance = MalfunctionModel.create({})

  expect(instance).toBeTruthy()
})
