/**
 * @adonisjs/framework
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { join, isAbsolute, extname } from 'path'
import { outputFile, remove } from 'fs-extra'
import * as clearRequire from 'clear-require'
import * as httpMocks from 'node-mocks-http'

import { createServer, IncomingMessage, ServerResponse } from 'http'
import { get, set, pick } from 'lodash'

import { IConfig } from '../src/Contracts/IConfig'
import { IRouteJSON, ILookedupRoute } from '../src/Contracts/IRoute'
import { RouteGroup } from '../src/Route/RouteGroup'
import { RouteManager } from '../src/Route/RouteManager'

export function appRoot () {
  return join(__dirname, './app')
}

/**
 * Creates the env file to be used for testing. Later use `removeFile`
 * to remove it.
 */
export async function createEnvFile (values, filePath = '.env') {
  const contents = Object.keys(values).reduce((result, key) => {
    result += `${key}=${values[key]}\n`
    return result
  }, '')

  filePath = isAbsolute(filePath) ? filePath : join(appRoot(), filePath)
  await outputFile(filePath, contents)
}

/**
 * Remove the given file from the app root.
 */
export async function removeFile (filePath) {
  filePath = isAbsolute(filePath) ? filePath : join(appRoot(), filePath)

  if (['.js', '.ts', '.json'].indexOf(extname(filePath)) > -1) {
    clearRequire(filePath)
  }

  await remove(filePath)
}

/**
 * Removes the app root
 */
export async function removeAppRoot () {
  await remove(this.appRoot())
}

/**
 * Creates a given file in the app root
 */
export async function createFile (filePath, contents) {
  filePath = isAbsolute(filePath) ? filePath : join(appRoot(), filePath)
  await outputFile(filePath, contents)
}

/**
 * Creates an HTTP server
 */
export function httpServer (handler) {
  return createServer(handler)
}

/**
 * Returns a fake instance of config provider for testing
 */
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

/**
 * Makes the JSON for a single route
 */
export function makeRoute (route: Partial<IRouteJSON>): IRouteJSON {
  const finalRoute = Object.assign({
    handler: function handler () {},
    pattern: 'foo/:bar',
    patternMatchers: {},
    domain: 'root',
    methods: ['GET'],
    name: '',
  }, route)

  finalRoute.name = finalRoute.name || finalRoute.pattern
  return finalRoute
}

/**
 * Makes the router instance
 */
export function makeRouter (): RouteManager {
  return new RouteManager()
}

/**
 * Converts route JSON to route store JSON
 */
export function routeToStoreRoute (route, method, params = {}): ILookedupRoute {
  return Object.assign(pick(route, ['name', 'pattern', 'handler']), { method, params })
}

/**
 * Flatten an array of routes, and routes under a group or resource
 */
export function flatRoutes (routes) {
  return routes.reduce((result, route) => {
    if (route instanceof RouteGroup) {
      result = result.concat(route.routes.map((route) => route.toJSON()))
    } else {
      result.push(route.toJSON())
    }
    return result
  }, [])
}

/**
 * Returns fake `req` and `res` objects
 */
export function fakeReqRes (): { req: IncomingMessage, res: ServerResponse } {
  return { req: httpMocks.createRequest(), res: httpMocks.createResponse() }
}
