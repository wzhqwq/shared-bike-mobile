import { OtherBillModel } from "./other-bill"

test("can be created", () => {
  const instance = OtherBillModel.create({})

  expect(instance).toBeTruthy()
})
