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

export type IAppDirectoriesMap = {
  httpControllers: string,
  wsControllers: string,
  middleware: string,
  models: string,
}

export type IDirectoriesMap = {
  app: IAppDirectoriesMap,
  config: string,
  database: string,
  public: string,
  resources: string,
  views: string,
  tmp: string,
}

export interface IHelpers {
  directories: IDirectoriesMap,
  makePath (...paths: string[]): string
  appRoot (): string
  publicPath (...paths: string[]): string
  configPath (...paths: string[]): string
  resourcesPath (...paths: string[]): string
  migrationsPath (...paths: string[]): string
  seedsPath (...paths: string[]): string
  databasePath (...paths: string[]): string
  viewsPath (...paths: string[]): string
  tmpPath (...paths: string[]): string
  makeNamespace (directoryIdentifier: string, namespace: string): string
}
