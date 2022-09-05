import { SouvenirModel } from "./souvenir"

test("can be created", () => {
  const instance = SouvenirModel.create({})

  expect(instance).toBeTruthy()
})
