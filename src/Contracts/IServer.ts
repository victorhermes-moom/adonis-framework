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

export interface IRequest {
  handle (req: IncomingMessage, res: ServerResponse): Promise<void>
}
