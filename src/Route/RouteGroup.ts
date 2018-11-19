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
 * Route group applies properties to all the routes
 * inside a single group.
 *
 * It's the simplest way to group functionality
 */
export class RouteGroup implements IRouteGroup {
  public routes: Route[] = []

  /**
   * Prefix the route with a pattern. The value will be directly
   * appended to the route pattern.
   *
   * Ideally you will define a `prefix` on the [[RouteGroup]]
   */
  public prefix (prefix: string): this {
    this.routes.forEach((route) => route.prefix(prefix))
    return this
  }

  /**
   * Map route to a given domain. The domain itself can be a pattern
   * using the route style params.
   */
  public domain (domain: string): this {
    this.routes.forEach((route) => route.domain(domain))
    return this
  }

  /**
   * Define route params regex to test the url before calling it
   * a route match. If the regex fails, the route will be
   * skipped
   */
  public where (key: string, pattern: string | RegExp): this {
    this.routes.forEach((route) => route.where(key, pattern))
    return this
  }
}
