/**
 * @module http
 */

/*
 * @adonisjs/framework
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Route } from '../Route'
import { IRouteGroup } from '../Contracts/IRoute'

/**
 * Route group allows grouping of routes together and then
 * apply settings on them in bulk. The get the instance of
 * this class by calling [[RouteManager.group]] method.
 */
export class RouteGroup implements IRouteGroup {
  public routes: Route[] = []

  /**
   * Prefix all the routes in the group.
   * @see [[Route.prefix]]
   */
  public prefix (prefix: string): this {
    this.routes.forEach((route) => route.prefix(prefix))
    return this
  }

  /**
   * Prefix a string to the name of all the routes.
   * @see [[Route.prefixName]]
   */
  public prefixName (name: string): this {
    this.routes.forEach((route) => route.prefixName(name))
    return this
  }

  /**
   * Define domain all the routes in the group.
   * @see [[Route.domain]]
   */
  public domain (domain: string): this {
    this.routes.forEach((route) => route.domain(domain))
    return this
  }

  /**
   * Define params regex to all routes in the group.
   * @see [[Route.where]]
   */
  public where (key: string, pattern: string | RegExp): this {
    this.routes.forEach((route) => route.where(key, pattern))
    return this
  }
}
