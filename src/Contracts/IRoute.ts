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

import { IHttpContext } from './IHttpContext'

/**
 * Defining route handler as a Controller.method
 */
export type IControllerBinding = string

/**
 * Defining route handler as a function
 */
export type IRouteCallback = (ctx: IHttpContext) => any | void
export type IRouteHandler = IRouteCallback | IControllerBinding

/**
 * The params where clauses
 */
export type IRoutePatternMatcher = {
  [param: string]: RegExp,
}

/**
 * JSON representation of route. Something can be
 * used to find and execute routes for a given
 * request
 */
export type IRouteJSON = {
  name: string,
  pattern: string,
  methods: string[],
  handler: IRouteHandler,
  patternMatchers: IRoutePatternMatcher,
  domain: string,
}

/**
 * Route looked up during the HTTP request using request
 * URL, method and the host.
 */
export type ILookedupRoute = {
  params: any,
  method: string,
  pattern: string,
  name: string,
  handler: IRouteHandler,
}

/**
 * List of tokens and routes for a given method. The
 * method is always listed under the domain
 */
export type IMethodList = {
  tokens: any[],
  routes: {
    [id: string]: IRouteJSON,
  },
}

/**
 * List of domains with their respective routes
 * and tokens to match URLS nested within
 * HTTP methods
 */
export type IDomainList = {
  [method: string]: IMethodList,
}

/**
 * The route store to store final list of routes and
 * it's tokens
 */
export interface IRouteStore {
  add (id: string, route: IRouteJSON): this
  find (url: string, method: string, domain?: string): ILookedupRoute | null
  make (identifier: string, params: any, domain?: string): string | null
}

/**
 * Route class interface to build routes via fluent
 * API.
 */
export interface IRoute {
  prefix (prefix: string): this
  where (param: string, pattern: string | RegExp): this
  domain (domain: string): this
  as (name: string)
  toJSON (): IRouteJSON
}

/**
 * Route group interface
 */
export interface IRouteGroup {
  prefix (prefix: string): this
  where (param: string, pattern: string | RegExp): this
  domain (domain: string): this
}

/**
 * Route manager works as the public to all routing
 * capabilities
 */
export interface IRouteManager {
  route (pattern: string, methods: string[], handler: IRouteHandler): IRoute
  get (pattern: string, handler: IRouteHandler): IRoute
  post (pattern: string, handler: IRouteHandler): IRoute
  patch (pattern: string, handler: IRouteHandler): IRoute
  put (pattern: string, handler: IRouteHandler): IRoute
  delete (pattern: string, handler: IRouteHandler): IRoute
  any (pattern: string, handler: IRouteHandler): IRoute
  group (callback: () => void): IRouteGroup
  commit (): void
  find (url: string, method: string, domain?: string): ILookedupRoute | null
  make (identifier: string, params: any, domain?: string): string | null
}
