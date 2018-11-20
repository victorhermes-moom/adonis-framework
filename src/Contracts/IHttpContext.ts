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

import { ServerResponse, IncomingMessage } from 'http'
import { IRequest } from './IRequest'
import { IResponse } from './IResponse'
import { IConfig } from './IConfig'

export interface IHttpContextConstructor {
  new (request: IRequest, response: IResponse)
  onReady (hook: IContextHook): void
  onTearDown (hook: IContextHook): void
  newup (req: IncomingMessage, res: ServerResponse, config: IConfig): Promise<IHttpContext>
}

export interface IHttpContext {
  request: IRequest,
  response: IResponse,
}

export type IContextHook = (ctx: IHttpContext) => void

export type IContextHooks = {
  ready: IContextHook[],
  tear: IContextHook[],
}
