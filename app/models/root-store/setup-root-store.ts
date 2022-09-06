import { RootStoreModel } from "./root-store"
import { Environment } from "../environment"

/**
 * Setup the environment that all the models will be sharing.
 *
 * The environment includes other functions that will be picked from some
 * of the models that get created later. This is how we loosly couple things
 * like events between models.
 */
export async function createEnvironment() {
  const env = new Environment()
  await env.setup()
  return env
}

/**
 * Setup the root state.
 */
export async function setupRootStore() {
  const env = await createEnvironment()
  const data = {}
  const rootStore = RootStoreModel.create(data, env)

  if (__DEV__) {
    env.reactotron.setRootStore(rootStore, data)
  }

  return rootStore
}
