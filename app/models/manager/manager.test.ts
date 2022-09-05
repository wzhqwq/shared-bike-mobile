import { ManagerModel } from "./manager"

test("can be created", () => {
  const instance = ManagerModel.create({})

  expect(instance).toBeTruthy()
})
