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

export class HttpContext extends Macroable implements IHttpContext {
  protected static _macros = {}
  protected static _getters = {}
  private static _hooks: IContextHooks = { ready: [], tear: [] }

  constructor (public request: Request, public response: Response) {
    super()
  }

  public static hydrate () {
    super.hydrate()
    this._hooks.ready = []
    this._hooks.tear = []
  }

  /**
   * Add a new onReady hook. Hooks will be executed after
   * time a new instance of this class is created
   */
  public static onReady (hook: IContextHook): void {
    this._hooks.ready.push(hook)
  }

  /**
   * Add a new onTearDown hook. Hooks will be executed before
   * the context is tear down by the [[Server]] class.
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

  public async tearDown () {
    const hooks = Object.getPrototypeOf(this).constructor._hooks.tear
    await Promise.all(hooks.map((hook) => hook(this)))
  }
}
