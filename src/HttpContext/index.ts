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

import { Macroable } from 'macroable'
import { ServerResponse, IncomingMessage } from 'http'

import { Request } from '../Request'
import { Response } from '../Response'
import { IConfig } from '../Contracts/IConfig'

import { IHttpContext, IContextHooks, IContextHook } from '../Contracts/IHttpContext'

/**
 * HttpContext holds the information for a given HTTP request and passed around
 * to route controller, middleware and also context hooks.
 *
 * New properties are added to the context instance (aka `ctx`) at runtime using Macros,
 * Getters or via middleware and those properties are documented in the official docs.
 *
 * `HttpContext` offers a neat runtime API to inject stuff into it.
 *
 * ### Macros
 * Macros are functions, that you can attach one time and they will be available to all the
 * instances of the ctx.
 *
 * ```js
 * // provider boot method
 * boot () {
 *   const HttpContext = use('HttpContext')
 *
 *   HttpContext.macro('getTime', function () {
 *     return new Date().getTime()
 *   })
 * }
 * ```
 *
 * Use it as
 *
 * ```js
 * ctx.getTime()
 * ```
 *
 * ### Getters
 * Getters are values which are computed everytime someone access them. Singleton
 * values are cached after first access.
 *
 * ```js
 * // provider boot method
 * boot () {
 *   const HttpContext = use('HttpContext')
 *
 *   HttpContext.getter('id', function () {
 *     return new uuid.v4()
 *   }, true)
 * }
 * ```
 *
 * Returns the same id everytime
 *
 * ```js
 * ctx.id
 * ```
 *
 * ### Hooks
 * Hooks are functions invoked when a new instance of context is created and during
 * ctx tear down. The are subtle differences in hooks and middleware, and you must
 * consult official docs for that.
 *
 * ```js
 * // provider boot method
 * boot () {
 *   const HttpContext = use('HttpContext')
 *
 *   HttpContext.onReady(async function (ctx) => {
 *     ctx.session = new Session()
 *   })
 *
 *   HttpContext.onTearDown(async function (ctx) => {
 *     await ctx.session.commit()
 *   })
 * }
 * ```
 */
export class HttpContext extends Macroable implements IHttpContext {
  protected static _macros = {}
  protected static _getters = {}
  private static _hooks: IContextHooks = { ready: [], tear: [] }

  constructor (public request: Request, public response: Response) {
    super()
  }

  /**
   * Clean macro, getters and hooks. Ideally used when writing
   * tests.
   */
  public static hydrate () {
    super.hydrate()
    this._hooks.ready = []
    this._hooks.tear = []
  }

  /**
   * Add a new onReady hook. Hooks will be executed after
   * time a new instance of this class is created.
   *
   * ```js
   * HttpContext.onReady((ctx) => {
   *   ctx.session = new Session()
   * })
   * ```
   */
  public static onReady (hook: IContextHook): void {
    this._hooks.ready.push(hook)
  }

  /**
   * Add a new onTearDown hook. Hooks will be executed before
   * the context is tear down by the [[Server]] class.
   *
   * ```js
   * HttpContext.onTearDown(async (ctx) => {
   *   ctx.session.commit()
   * })
   * ```
   */
  public static onTearDown (hook: IContextHook): void {
    this._hooks.tear.push(hook)
  }

  /**
   * Returns a new instance of the context by executing all `onReady` hooks.
   */
  public static async newUp (
    req: IncomingMessage,
    res: ServerResponse,
    config: IConfig,
  ): Promise<HttpContext> {
    const request = new Request(req, res, config)
    const response = new Response(request, res, config)
    const ctx = new this(request, response)

    await Promise.all(this._hooks.ready.map((hook) => hook(ctx)))
    return ctx
  }

  /**
   * Tear down the context by calling all onTearDown hooks
   */
  public async tearDown () {
    const hooks = Object.getPrototypeOf(this).constructor._hooks.tear
    await Promise.all(hooks.map((hook) => hook(this)))
  }
}
