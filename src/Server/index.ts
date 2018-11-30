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

import { IncomingMessage, ServerResponse } from 'http'

import { HttpException } from '../Exceptions'
import { IConfig } from '../Contracts/IConfig'
import { HttpContext } from '../HttpContext'
import { IRouteManager, ILookedupRoute } from '../Contracts/IRoute'

export class Server {
  constructor (
    private _helpers,
    private _config: IConfig,
    private _router: IRouteManager,
  ) {}

  private async _invokeHandler (route: ILookedupRoute, ctx: HttpContext) {
    if (typeof (route.handler) === 'function') {
      const returnValue = await route.handler(ctx)
      if (!ctx.response.hasLazyBody && returnValue) {
        ctx.response.send(returnValue)
      }
      ctx.response.finish()
    }
  }

  private async _handleRequest (req: IncomingMessage, res: ServerResponse) {
    const ctx = await HttpContext.newUp(req, res, this._config)

    const hostname = ctx.request.hostname() || undefined
    const url = ctx.request.url()

    const route = this._router.find(url, ctx.request.method(), hostname)
    if (!route) {
      throw HttpException.routeNotFound(url)
    }

    await this._invokeHandler(route, ctx)
  }

  public async handle (req: IncomingMessage, res: ServerResponse) {
    try {
      await this._handleRequest(req, res)
    } catch (error) {
    }
  }
}
