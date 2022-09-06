import { Api } from "../services/api"
import { User, UserModel } from "./user/user"
import * as storage from "../utils/storage"

let ReactotronDev
if (__DEV__) {
  const { Reactotron } = require("../services/reactotron")
  ReactotronDev = Reactotron
}

/**
 * The environment is a place where services and shared dependencies between
 * models live.  They are made available to every model via dependency injection.
 */
export class Environment {
  constructor() {
    // create each service
    if (__DEV__) {
      // dev-only services
      this.reactotron = new ReactotronDev()
    }
    this.api = new Api()
  }

  async setup() {
    // allow each service to setup
    if (__DEV__) {
      await this.reactotron.setup()
    }
    this.api.setup()
    this.localUser = UserModel.create(await storage.load('user') ?? {})
    this.jwt = await storage.load('jwt')
    if (this.jwt) this.api.updateJwt(this.jwt)
  }

  async updateLocalUser(user: User) {
    this.localUser = user
    await storage.save('user', user)
  }

  async updateJwt(jwt: string) {
    this.jwt = jwt
    this.api.updateJwt(jwt)
    await storage.save('jwt', jwt)
  }

  /**
   * Reactotron is only available in dev.
   */
  reactotron: typeof ReactotronDev

  /**
   * Our api.
   */
  api: Api

  localUser: User
  
  jwt: string
}
