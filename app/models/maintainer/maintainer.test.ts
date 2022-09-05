import { MaintainerModel } from "./maintainer"

test("can be created", () => {
  const instance = MaintainerModel.create({})

  expect(instance).toBeTruthy()
})
