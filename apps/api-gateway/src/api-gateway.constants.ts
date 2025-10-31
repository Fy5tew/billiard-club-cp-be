export enum Route {
  USERS = 'users',
  REGISTER = `${Route.USERS}/register`,
  PROFILE = `${Route.USERS}/:id`,
  AUTH = 'auth',
  LOGIN = `${Route.AUTH}/login`,
  REFRESH = `${Route.AUTH}/refresh`,
}
