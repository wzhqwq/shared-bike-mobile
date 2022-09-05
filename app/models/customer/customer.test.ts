import { CustomerModel } from "./customer"

test("can be created", () => {
  const instance = CustomerModel.create({})

  expect(instance).toBeTruthy()
})
