/**
 * @module main
 */

/*
* @adonisjs/framework
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

export type IDirectoriesMap = {
  app: string,
  config: string,
  database: string,
  public: string,
  resources: string,
  views: string,
  tmp: string,
  httpControllers: string,
  wsControllers: string,
  middleware: string,
  models: string,
  [identifier: string]: string,
}
