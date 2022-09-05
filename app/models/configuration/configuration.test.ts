import { ConfigurationModel } from "./configuration"

test("can be created", () => {
  const instance = ConfigurationModel.create({})

  expect(instance).toBeTruthy()
})
