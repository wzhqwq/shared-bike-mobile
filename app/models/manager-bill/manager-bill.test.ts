import { ManagerBillModel } from "./manager-bill"

test("can be created", () => {
  const instance = ManagerBillModel.create({})

  expect(instance).toBeTruthy()
})
