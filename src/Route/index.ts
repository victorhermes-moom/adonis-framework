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

import { IRouteHandler, IRouteJSON, IRoutePatternMatcher, IRoute } from '../Contracts/IRoute'

/**
 * The Route class is used to construct route using the fluent chainable API. The
 * Route class is returned when you invoke one of the route methods on [[RouteManager]]
 *
 * The following example will return an instance of this class.
 *
 * ```js
 * Route.get('/', () => {
 * })
 * ```
 */
export class Route implements IRoute {
  private _domain: string = 'root'
  private _patternMatchers: IRoutePatternMatcher = {}
  private _name: string = ''

  constructor (
    private _pattern: string,
    private _methods: string[],
    private _handler: IRouteHandler,
  ) {
    this._pattern = this._dropSlashes(this._pattern)
  }

  /**
   * Drop starting and ending slashes from a string
   */
  private _dropSlashes (value: string): string {
    return value !== '/' ? value.replace(/^\/|\/$/, '') : '/'
  }

  /**
   * Give route a unique name. It can be used later to lookup the
   * route with it's name.
   */
  public as (name: string): this {
    this._name = name
    return this
  }

  /**
   * Prefix the route with a pattern. The value will be directly
   * prepended to the route pattern.
   *
   * Ideally you will define a `prefix` on the [[RouteGroup]]
   *
   * @example
   * ```js
   * route.prefix('api/v1')
   * ```
   */
  public prefix (prefix: string): this {
    if (this._pattern === '/') {
      this._pattern = this._dropSlashes(prefix)
    } else {
      this._pattern = `${this._dropSlashes(prefix)}/${this._pattern}`
    }

    return this
  }

  /**
   * Map route to a given domain. The domain itself can be a pattern
   * using the route style params.
   *
   * @example
   * ```js
   * route.domain('blog.adonisjs.com')
   *
   * // or
   * route.domain(':user.adonisjs.com')
   * ```
   */
  public domain (domain: string): this {
    this._domain = domain
    return this
  }

  /**
   * Define route params regex to test the url before calling it
   * a route match. If the regex fails, the route will be
   * skipped.
   *
   * @example
   * ```js
   * Route
   *  .get('/user/:id', 'UserController.show')
   *  .where('id', '^[0-9]+')
   *
   * Route
   *  .get('/user/:username', 'UserController.show')
   *  .where('username', '^[a-z]+')
   * ```
   *
   * In `UserController.show`
   *
   * ```js
   * async show ({ params }) {
   *  if (params.id) {
   *    // find by id
   *  } else if (params.username) {
   *    // find by username
   *  }
   * }
   * ```
   */
  public where (key: string, pattern: string | RegExp): this {
    this._patternMatchers[key] = typeof (pattern) === 'string' ? new RegExp(pattern) : pattern
    return this
  }

  /**
   * Return JSON representation of the route. The return value is stored
   * in memory to look routes for a given request and route instance
   * is garbage collected.
   */
  public toJSON (): IRouteJSON {
    return {
      name: this._name || this._pattern,
      methods: this._methods,
      pattern: this._pattern,
      patternMatchers: this._patternMatchers,
      domain: this._domain,
      handler: this._handler,
    }
  }
}
