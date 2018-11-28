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

import { merge } from 'lodash'
import { IIoC } from '@adonisjs/fold/build/src/Contracts'
import { IIgnitor, IPreloadHook } from '../Contracts/IIgnitor'
import { IDirectoriesMap } from '../Contracts/IHelpers'

const DEFAULT_DIRECTORIES: IDirectoriesMap = {
  config: 'config',
  public: 'public',
  resources: 'resources',
  views: 'resources/views',
  database: 'database',
  tmp: 'tmp',
  app: {
    httpControllers: 'Controllers/Http',
    wsControllers: 'Controllers/Ws',
    middleware: 'Middleware',
    models: 'Models',
    listeners: 'Listeners',
  },
}

export class Ignitor implements IIgnitor {
  public directories: IDirectoriesMap = merge({}, DEFAULT_DIRECTORIES)
  public isAceCommand: boolean = false
  public isHttpServer: boolean = false
  public usingTypescript: boolean = false

  private _preloads: { filePath: string, optional: boolean }[] = []
  private _preloadHooks: { [filePath: string]: IPreloadHook[] } = {}

  constructor (private _appRoot: string, private _ioc: IIoC) {
    console.log(this._appRoot)
    console.log(this._ioc)
  }

  /**
   * Add a new directory to the list of app directories. App directories
   * are autoloaded under `App` namespace by default
   */
  public addAppDirectory (identifier: string, directory: string): void {
    this.directories.app[identifier] = directory
  }

  /**
   * Add a new directory to the list of top level directories. The directory
   * will be resolved from the app root.
   */
  public addTopLevelDirectory (identifier: string, directory: string): void {
    this.directories[identifier] = directory
  }

  /**
   * Add a new file to the list of preloaded files. Preloaded files are loaded
   * synchronously after the providers have been booted.
   */
  public preload (filePath: string, optional: boolean): void {
    this._preloads.push({ filePath, optional })
  }

  /**
   * Execute a callback after a file has been preloaded.
   */
  public onPreload (filePath: string, callback: IPreloadHook): void {
    this._preloadHooks[filePath] = this._preloadHooks[filePath] || []
    this._preloadHooks[filePath].push(callback)
  }
}
