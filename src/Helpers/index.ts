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

import { join } from 'path'

import { IIoC } from '@adonisjs/fold/build/src/Contracts'
import { IDirectoriesMap } from '../Contracts/IHelpers'
import { RuntimeException } from '../Exceptions'

/**
 * Helpers module provides some quick methods to create paths to certain directories,
 * make absolute namespaces from relative namespaces and so on.
 */
export class Helpers {
  constructor (
    private _appRoot: string,
    private _ioc: IIoC,
    public directories: IDirectoriesMap,
  ) {}

  /**
   * Make path to a given directory by providing a base path
   */
  private _makePath (basePath: string, ...paths: string[]): string {
    return paths && paths.length ? join(basePath, ...paths) : basePath
  }

  /**
   * Returns absolute path to the AdonisJs application root. Optionally
   * relative paths can be passed to make path to a file.
   *
   * ```js
   * Helpers.appRoot()
   *
   * // to a file
   * Helpers.appRoot('start/routes.js')
   * ```
   */
  public appRoot (...paths: string[]): string {
    return this._makePath(this._appRoot, ...paths)
  }

  /**
   * Returns absolute path to the AdonisJs public directory. Optionally
   * relative paths can be passed to make path to a file.
   *
   * ```js
   * Helpers.publicPath()
   *
   * // to a file
   * Helpers.publicPath('style.css')
   * ```
   */
  public publicPath (...paths: string[]): string {
    return this._makePath(this._appRoot, this.directories.public, ...paths)
  }

  /**
   * Returns absolute path to the AdonisJs config directory. Optionally
   * relative paths can be passed to make path to a file.
   *
   * ```js
   * Helpers.configPath()
   *
   * // to a file
   * Helpers.configPath('database.js')
   * ```
   */
  public configPath (...paths: string[]): string {
    return this._makePath(this._appRoot, this.directories.config, ...paths)
  }

  /**
   * Returns absolute path to the AdonisJs resources directory. Optionally
   * relative paths can be passed to make path to a file.
   *
   * ```js
   * Helpers.resourcesPath()
   *
   * // to a file
   * Helpers.resourcesPath('sass/style.scss')
   * ```
   */
  public resourcesPath (...paths: string[]): string {
    return this._makePath(this._appRoot, this.directories.resources, ...paths)
  }

  /**
   * Returns absolute path to the AdonisJs database migrations
   * directory. Optionally relative paths can be passed to
   * make path to a file.
   *
   * ```js
   * Helpers.migrationsPath()
   *
   * // to a file
   * Helpers.migrationsPath('some-file.js')
   * ```
   */
  public migrationsPath (...paths: string[]): string {
    return this.databasePath('migrations', ...paths)
  }

  /**
   * Returns absolute path to the AdonisJs database seeds
   * directory. Optionally relative paths can be passed to
   * make path to a file.
   *
   * ```js
   * Helpers.seedsPath()
   *
   * // to a file
   * Helpers.seedsPath('DatabaseSeeder.js')
   * ```
   */
  public seedsPath (...paths: string[]): string {
    return this.databasePath('seeds', ...paths)
  }

  /**
   * Returns absolute path to the AdonisJs database directory.
   * Optionally relative paths can be passed to make path to
   * a file.
   *
   * ```js
   * Helpers.databasePath()
   *
   * // to a file
   * Helpers.databasePath('seeds', 'DatabaseSeeder.js')
   * ```
   */
  public databasePath (...paths: string[]): string {
    return this._makePath(this._appRoot, this.directories.database, ...paths)
  }

  /**
   * Returns absolute path to the AdonisJs views directory.
   * Optionally relative paths can be passed to make path
   * to a file.
   *
   * ```js
   * Helpers.viewsPath()
   *
   * // to a file
   * Helpers.viewsPath('partials/header.edge')
   * ```
   */
  public viewsPath (...paths: string[]): string {
    return this._makePath(this._appRoot, this.directories.views, ...paths)
  }

  /**
   * Returns absolute path to the AdonisJs tmp directory.
   * Optionally relative paths can be passed to make path
   * to a file.
   *
   * ```js
   * Helpers.tmpPath()
   *
   * // to a file
   * Helpers.tmpPath('logs/adonisjs.log')
   * ```
   */
  public tmpPath (...paths: string[]): string {
    return this._makePath(this._appRoot, this.directories.tmp, ...paths)
  }

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

    const directory = this.directories[directoryIdentifier]
    if (!directory) {
      throw new RuntimeException(`Conventional directory for ${directoryIdentifier} is not defined`)
    }

    return `${this._ioc.autoloadedAliases[0]}/${directory}/${namespace}`
  }
}
