export enum Route {
  USERS = 'users',
  REGISTER = `${Route.USERS}/register`,
  PROFILE = `${Route.USERS}/:id`,
}
