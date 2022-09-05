import { SectionModel } from "./section"

test("can be created", () => {
  const instance = SectionModel.create({})

  expect(instance).toBeTruthy()
})
