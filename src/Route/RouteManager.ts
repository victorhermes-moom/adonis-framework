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

import { IRouteHandler, IRouteManager } from '../Contracts/IRoute'
import { Route } from './index'
import { RouteStore } from './RouteStore'
import { RouteGroup } from './RouteGroup'

type MixedRoutes = (Route | RouteGroup)[]

/**
 * RouteManager class is exposed via Ioc container binding `Route`, which
 * is used to define HTTP routes.
 */
export class RouteManager implements IRouteManager {
  private _routes: MixedRoutes = []
  private _store: RouteStore = new RouteStore()
  private _activeGroup: RouteGroup | null = null

  /**
   * Recursively registers routes with the route store. If
   * route item is group, then all of the route routes
   * will be registered as well.
   */
  private _registerWithStore (routes: MixedRoutes): void {
    routes.forEach((route) => {
      if (route instanceof RouteGroup) {
        this._registerWithStore(route.routes)
      } else {
        const routeJSON = route.toJSON()
        this._store.add(routeJSON.name, routeJSON)
      }
    })
  }

  /**
   * Define a route with any number of HTTP methods.
   *
   * @example
   * ```js
   * Route.route('about', ['GET', 'POST'], 'UserController.show')
   * ```
   */
  public route (pattern: string, methods: string[], handler: IRouteHandler): Route {
    const route = new Route(pattern, methods, handler)

    if (this._activeGroup) {
      this._activeGroup.routes.push(route)
    } else {
      this._routes.push(route)
    }

    return route
  }

  /**
   * Define a route to handle a URL pattern for GET requests.
   * The pattern cannot have regex, make use of [[Route.where]] method
   * to define regex patterns.
   *
   * @example
   * ```js
   * Route.get('/', 'HomeController.show')
   * ```
   */
  public get (pattern: string, handler: IRouteHandler): Route {
    return this.route(pattern, ['GET'], handler)
  }

  /**
   * Define a route to handle a URL pattern for POST requests.
   * The pattern cannot have regex, make use of [[Route.where]] method
   * to define regex patterns.
   *
   * @example
   * ```js
   * Route.post('users', 'UserController.store')
   * ```
   */
  public post (pattern: string, handler: IRouteHandler): Route {
    return this.route(pattern, ['POST'], handler)
  }

  /**
   * Define a route to handle a URL pattern for PATCH requests.
   * The pattern cannot have regex, make use of [[Route.where]] method
   * to define regex patterns.
   *
   * @example
   * ```js
   * Route.patch('users', 'UserController.update')
   * ```
   */
  public patch (pattern: string, handler: IRouteHandler): Route {
    return this.route(pattern, ['PATCH'], handler)
  }

  /**
   * Define a route to handle a URL pattern for PUT requests.
   * The pattern cannot have regex, make use of [[Route.where]] method
   * to define regex patterns.
   *
   * @example
   * ```js
   * Route.put('users', 'UserController.update')
   * ```
   */
  public put (pattern: string, handler: IRouteHandler): Route {
    return this.route(pattern, ['PUT'], handler)
  }

  /**
   * Define a route to handle a URL pattern for DELETE requests.
   * The pattern cannot have regex, make use of [[Route.where]] method
   * to define regex patterns.
   *
   * @example
   * ```js
   * Route.put('users', 'UserController.delete')
   * ```
   */
  public delete (pattern: string, handler: IRouteHandler): Route {
    return this.route(pattern, ['DELETE'], handler)
  }

  /**
   * Define route that responds to HTTP methods.
   * The pattern cannot have regex, make use of [[Route.where]] method
   * to define regex patterns.
   *
   * @example
   * ```js
   * Route.any('*', 'HomeController.renderVueApp')
   * ```
   */
  public any (pattern: string, handler: IRouteHandler): Route {
    return this.route(pattern, ['*'], handler)
  }

  /**
   * Create an instance of [[RouteGroup]]. All routes created inside the
   * callback function will become part of the route group.
   *
   * @example
   * ```js
   * Route.group(() => {
   *  Route.get('users', 'UserController.show')
   * }).prefix('api/v1')
   * ```
   */
  public group (callback: () => void): RouteGroup {
    const group = new RouteGroup()

    /**
     * Stick group to the class instance, so that all routes
     * inside the callback are part of the group
     */
    this._activeGroup = group

    /**
     * Add group routes here
     */
    callback()

    /**
     * Push the group to the routes array. This is important, to make
     * sure all routes are registered in the right order
     */
    this._routes.push(this._activeGroup)

    /**
     * Set the active group to null, so that all upcoming routes are not
     * part of the group
     */
    this._activeGroup = null

    /**
     * Return group for chainable API
     */
    return group
  }

  /**
   * Commits the routes to the route store. This is the time when
   * we generate tokens from the routes. Later tokens are used
   * to find the correct route for a given URL, METHOD and
   * DOMAIN.
   */
  public commit () {
    this._registerWithStore(this._routes)
    this._routes = []
  }

  /**
  * @see [[RouteStore.find]]
   */
  public find (url: string, method: string, domain?: string) {
    return this._store.find(url, method, domain)
  }

  /**
   * @see [[RouteStore.make]]
   */
  public make (identifier: string, params: any, domain?: string): string | null {
    return this._store.make(identifier, params, domain)
  }
}
