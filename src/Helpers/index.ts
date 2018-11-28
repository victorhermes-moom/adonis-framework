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

import { IDirectoriesMap } from '../Contracts/IHelpers'
import { RuntimeException } from '../Exceptions'

/**
 * Helpers module provides some quick methods to create paths to certain directories,
 * make absolute namespaces from relative namespaces and so on.
 */
export class Helpers {
  constructor (public ioc, private _directories: IDirectoriesMap) {}

  /**
   * Makes absolute namespace to a given directory from a relative namespace.
   * The `directoryIdentifier` has to be pre-defined inside the `package.json`
   * file or pre-registered by a provider.
   *
   * Absolute namespaces (starting with /) are returned as it is just by trimming
   * the leading slash.
   *
   * @example
   * ```js
   * Helpers.makeNamespace('httpControllers', 'UserController')
   * // returns: App/Controllers/Http/UserController
   *
   * Helpers.makeNamespace('httpControllers', '/Admin/Controllers/UserController')
   * // returns: Admin/Controllers/UserController
   * ```
   */
  public makeNamespace (directoryIdentifier: string, namespace: string): string {
    if (namespace.startsWith('/')) {
      return namespace.slice(1)
    }

    const directory = this._directories[directoryIdentifier]
    if (!directory) {
      throw new RuntimeException(`Conventional directory for ${directoryIdentifier} is not defined`)
    }

    return `${this.ioc['_autoloadedAliases'][0]}/${directory}/${namespace}`
  }
}
