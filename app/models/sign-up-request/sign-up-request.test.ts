import { SignUpRequestModel } from "./sign-up-request"

test("can be created", () => {
  const instance = SignUpRequestModel.create({})

  expect(instance).toBeTruthy()
})
