/**
 * @module http
 */

/**
 * @adonisjs/framework
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { parse, match, exec } from 'matchit'
import { IRouteJSON, IDomainList, IRouteStore, IMethodList } from '../Contracts/IRoute'
import { InvalidRoute } from '../Exceptions'

/**
 * Route store contains the final list of routes and their pattern tokens. The list
 * is not subject to updation and deletion, since it will mess up the order
 * of routes in which they have been defined by the end user.
 *
 * The list structure has to be in the same order as the routes are defined in the
 * user file.
 */
export class RouteStore implements IRouteStore {
  private _routes: { [domain: string]: IDomainList } = {}

  /**
   * Returns the routes and tokens for a given domain.
   */
  private _getDomainList (domain: string): IDomainList {
    if (!this._routes[domain]) {
      this._routes[domain] = {}
    }

    return this._routes[domain]
  }

  /**
   * Returns a list of routes/tokens for a given method and a
   * domain.
   * NOTE: The method will be casted to an uppercase.
   */
  private _getMethodsList (domain: string, method: string): IMethodList {
    method = method.toUpperCase()

    const domainList = this._getDomainList(domain)
    if (!domainList[method]) {
      domainList[method] = { routes: {}, tokens: [] }
    }
    return domainList[method]
  }

  /**
   * Add a new route to the routes store. The id is used to map route
   * pattern tokens with the route defination and duplicate ids
   * are not allowed.
   */
  public add (id: string, route: IRouteJSON): this {
    route.methods.forEach((method) => {
      const methodList = this._getMethodsList(route.domain, method)

      /**
       * Route with given id already exists for the given domain and
       * method
       */
      if (methodList.routes[id]) {
        throw InvalidRoute.duplicateName(id)
      }

      const tokens = parse(route.pattern, route.patternMatchers).map((token) => {
        token.id = id
        return token
      })

      methodList.tokens.push(tokens)
      methodList.routes[id] = route
    })

    return this
  }

  /**
   * Find the route defination using the url and the optional domain. If domain
   * is not present, then only `root` level routes are searched.
   *
   * @example
   * ```js
   * store.find('posts/1')
   *
   * // specify domain
   * store.find('posts/1', 'blog.adonisjs.com')
   * ```
   */
  public find (url: string, method: string, domain?: string): IRouteJSON & { params: any } | null {
    const methodList = this._getMethodsList(domain || 'root', method)
    const matched = match(url, methodList.tokens)

    if (!matched.length) {
      return null
    }

    const route = methodList.routes[matched[0].id]
    const params = exec(url, matched)
    return Object.assign({}, route, { params })
  }
}
