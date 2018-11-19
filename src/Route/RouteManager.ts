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

/**
 * Route manager offers a public interface to create individual routes,
 * group them or define them as restful resources.
 */
export class RouteManager implements IRouteManager {
  private _routes: Route[] = []
  private _store: RouteStore = new RouteStore()

  /**
   * Define a route to handle any number of verbs
   */
  public route (pattern: string, methods: string[], handler: IRouteHandler): Route {
    const route = new Route(pattern, methods, handler)
    this._routes.push(route)

    return route
  }

  /**
   * Define a route to handle a URL pattern for GET requests.
   * The pattern cannot have regex, make use of `where` method
   * to define regex patterns.
   */
  public get (pattern: string, handler: IRouteHandler): Route {
    return this.route(pattern, ['GET'], handler)
  }

  /**
   * Define a route to handle a URL pattern for POST requests.
   * The pattern cannot have regex, make use of `where` method
   * to define regex patterns.
   */
  public post (pattern: string, handler: IRouteHandler): Route {
    return this.route(pattern, ['POST'], handler)
  }

  /**
   * Define a route to handle a URL pattern for PATCH requests.
   * The pattern cannot have regex, make use of `where` method
   * to define regex patterns.
   */
  public patch (pattern: string, handler: IRouteHandler): Route {
    return this.route(pattern, ['PATCH'], handler)
  }

  /**
   * Define a route to handle a URL pattern for PUT requests.
   * The pattern cannot have regex, make use of `where` method
   * to define regex patterns.
   */
  public put (pattern: string, handler: IRouteHandler): Route {
    return this.route(pattern, ['PUT'], handler)
  }

  /**
   * Define a route to handle a URL pattern for DELETE requests.
   * The pattern cannot have regex, make use of `where` method
   * to define regex patterns.
   */
  public delete (pattern: string, handler: IRouteHandler): Route {
    return this.route(pattern, ['DELETE'], handler)
  }

  /**
   * Commits the routes to the route store. This is the time when
   * we generate tokens from the route, which are used to find
   * the correct route for a given URL, METHOD and DOMAIN.
   */
  public commit () {
    this._routes.forEach((route) => {
      const routeJSON = route.toJSON()
      this._store.add(routeJSON.name, routeJSON)
    })
  }
}
