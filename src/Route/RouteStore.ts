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

import {
  IRouteJSON,
  IDomainList,
  IRouteStore,
  IMethodList,
  IStoreRoute,
  ILookedupRoute,
} from '../Contracts/IRoute'

import { InvalidRouteException, IncompleteParamsException } from '../Exceptions'

/**
 * Route store contains the final list of routes and their pattern tokens. The list
 * is not subject for updations or deletions, since it will mess up the order
 * of routes in which they have been defined by the end user.
 *
 * The list structure has to be in the same order as the routes are defined in the
 * user file.
 */
export class RouteStore implements IRouteStore {
  private _routes: { [domain: string]: IDomainList } = {}
  private _flatRoutesList: IStoreRoute[] = []

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
   * Find route with the URL, method and optional domain
   */
  private _find (url: string, method: string, domain?: string) {
    const methodList = this._getMethodsList(domain || 'root', method)
    const matched = match(url, methodList.tokens)

    if (!matched.length) {
      return null
    }

    return { methodList, matched }
  }

  /**
   * Add a new route to the routes store. The id is used to map route
   * pattern tokens with the route defination and duplicate ids
   * for a single domain are not allowed.
   */
  public add (id: string, route: IRouteJSON): this {
    route.methods.forEach((method) => {
      const methodList = this._getMethodsList(route.domain, method)

      /**
       * Route with given id already exists for the given domain and
       * method
       */
      if (methodList.routes[id]) {
        throw InvalidRouteException.duplicateName(id)
      }

      /**
       * The tokens are used to match route parameters against the complete
       * URL
       */
      const tokens = parse(route.pattern, route.patternMatchers).map((token) => {
        token.id = id
        return token
      })
      methodList.tokens.push(tokens)

      /**
       * A trimmed copy of the route, we need this to make the URL to a
       * route and also return when the route is lookedup by the
       * URL
       */
      const storeRoute = {
        handler: route.handler,
        name: route.name,
        domain: route.domain,
        pattern: route.pattern,
        method: method,
      }

      methodList.routes[id] = storeRoute

      /**
       * Push to flat list for making URLS to pre-registered
       * routes. Since URL's are created incrementally, we
       * cannot the nested to find the nearest route.
       */
      this._flatRoutesList.push(storeRoute)
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
  public find (url: string, method: string, domain?: string): ILookedupRoute {
    const match = this._find(url, method, domain) || this._find(url, '*', domain)

    if (!match) {
      return null
    }

    const route = match.methodList.routes[match.matched[0].id]
    const params = exec(url, match.matched)

    return Object.assign({}, route, { params, method })
  }

  /**
   * Make URL to a prefedined route. You can search for the route using one
   * of the following values.
   *
   * 1. Route pattern
   * 2. Route name (defined using [[Route.as]])
   * 3. Route handler ( Using controller name.method )
   *
   * `null` will be returned when unable to find the Route. If domain is defined,
   * then it will be prepended to the final URL forming a
   * [protocol relative URL](https://en.wikipedia.org/wiki/Wikipedia:Protocol-relative_URL)
   *
   * **NOTE:**
   *
   * This method will raise exceptions in one of the following situations.
   *
   * 1. If one of the required param is `undefined`, `null` or `empty`.
   * 2. If sequential params are missing. Even if they are optional. For example:
   *
   * ```js
   * /post/:id?/:slug?
   * ```
   *
   * If you pass value for `slug`, but not for the `id`, then an exception will be raised,
   * since it impossible to create the correct URL when value for `index 0` is missing and
   * value for `index 1` is provided.
   */
  public make (identifier: string, params: any, domain?: string): string | null {
    const route = this._flatRoutesList.find((route) => {
      const firstMatch = [route.name, route.pattern, route.handler].indexOf(identifier) > -1
      if (!firstMatch) {
        return false
      }
      return !domain || route.domain === domain
    })

    /**
     * Return null when unable to find the route
     */
    if (!route) {
      return null
    }

    let missedBlock = ''
    let url = route.pattern

    /**
     * Process all param blocks, if route.pattern has them
     */
    if (route.pattern.indexOf(':') > -1) {
      url = route.pattern.split('/').reduce((blocks: string[], block) => {
        if (missedBlock) {
          throw IncompleteParamsException.jumpParam(missedBlock, route.pattern)
        }

        const param = block.startsWith(':')
        if (!param) {
          blocks.push(block)
          return blocks
        }

        const optional = block.endsWith('?')

        /**
         * Get param name, case sensitive
         */
        const name = optional ? block.slice(1).slice(0, -1) : block.slice(1)

        /**
         * If param value is missing and neither an optional, then it's impossible
         * to make the route, so raise the exception
         */
        if (params[name]) {
          blocks.push(params[name])
        } else if (!optional) {
          throw IncompleteParamsException.missingParam(name, route.pattern)
        } else {
          missedBlock = name
        }

        return blocks
      }, []).join('/')
    }

    return domain ? `//${domain}/${url}` : url
  }
}
