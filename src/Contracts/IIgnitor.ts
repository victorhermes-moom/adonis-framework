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

import { IDirectoriesMap } from './IHelpers'

export type IPreloadHook = () => void

export interface IIgnitor {
  isAceCommand: boolean,
  isHttpServer: boolean,
  usingTypescript: boolean,
  directories: IDirectoriesMap,
  addAppDirectory (identifier: string, relativePath: string): void
  addTopLevelDirectory (identifier: string, relativePath: string): void
  preload (filePath: string, optional: boolean): void
  onPreload (filePath: string, callback: IPreloadHook): void
}
