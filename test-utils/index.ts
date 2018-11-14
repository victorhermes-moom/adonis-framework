/**
 * @adonisjs/framework
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { join, isAbsolute } from 'path'
import { outputFile, remove } from 'fs-extra'
import * as clearRequire from 'clear-require'
import * as http from 'http'
import { get, set } from 'lodash'

import { IConfig } from '../src/Contracts/IConfig'
import { IRouteJSON } from '../src/Contracts/IRoute'

export function appRoot () {
  return join(__dirname, './app')
}

export async function createEnvFile (values, filePath = '.env') {
  const contents = Object.keys(values).reduce((result, key) => {
    result += `${key}=${values[key]}\n`
    return result
  }, '')

  filePath = isAbsolute(filePath) ? filePath : join(appRoot(), filePath)
  await outputFile(filePath, contents)
}

export async function removeFile (filePath) {
  filePath = isAbsolute(filePath) ? filePath : join(appRoot(), filePath)

  if (filePath.endsWith('.js') || filePath.endsWith('.ts')) {
    clearRequire(filePath)
  }

  await remove(filePath)
}

export async function removeAppRoot () {
  await remove(this.appRoot())
}

export async function createFile (filePath, contents) {
  filePath = isAbsolute(filePath) ? filePath : join(appRoot(), filePath)
  await outputFile(filePath, contents)
}

export function httpServer (handler) {
  return http.createServer(handler)
}

export function fakeConfig (): IConfig {
  class Config implements IConfig {
    private _configCache = {}

    public get (key, defaultValue) {
      return get(this._configCache, key, defaultValue)
    }

    public set (key, value) {
      set(this._configCache, key, value)
    }
    public sync () {}
    public merge () {}
  }

  return new Config()
}

export function makeRoute (route: Partial<IRouteJSON>): IRouteJSON {
  return Object.assign({
    handler: function handler () {},
    pattern: 'foo/:bar',
    patternMatchers: {},
    domain: 'root',
    methods: ['GET'],
  }, route)
}
