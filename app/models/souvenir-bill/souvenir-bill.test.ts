import { SouvenirBillModel } from "./souvenir-bill"

test("can be created", () => {
  const instance = SouvenirBillModel.create({})

  expect(instance).toBeTruthy()
})
