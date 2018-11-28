/**
 * @module main
 */

/**
 * @adonisjs/framework
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { RuntimeException } from '@adonisjs/generic-exceptions'

/**
 * Exception is raised when `appKey` is missing inside the config file
 */
export class MissingAppKeyException extends RuntimeException {
  public static invoke () {
    const message = 'Make sure to define appKey inside config/app.js file'
    return new this(message, 500, 'E_MISSING_APP_KEY')
  }
}

/**
 * Exception is raised when route properties are considered invalid when
 * trying to tokenize them.
 */
export class InvalidRouteException extends RuntimeException {
  /**
   * Another route with the same name exists in the same domain
   * routes
   */
  public static duplicateName (name) {
    const message = `Duplicate route ${name}. Make sure to give routes a unique name or pattern`
    return new this(message, 500, 'E_DUPLICATE_ROUTE')
  }
}

/**
 * IncompleteParamsException is raised when attempt to make the URL for
 * a route fails due to bad or incomplete params.
 */
export class IncompleteParamsException extends RuntimeException {
  /**
   * A required param is missing when making URL for a route
   */
  public static missingParam (name, pattern) {
    return new this(`${name} param is required to make url for ${pattern} route`, 500, 'E_MISSING_URL_PARAM')
  }

  /**
   * Sequential params are missing when making URL for a route
   */
  public static jumpParam (name, pattern) {
    return new this(`${name} param is required to make url for ${pattern} route`, 500, 'E_CANNOT_JUMP_PARAM')
  }
}

/**
 * Exception raised when certain required files are missing
 */
export class MissingFileException extends RuntimeException {
  /**
   * Raised when package.json file is missing in the project
   * root
   */
  public static missingPackageFile () {
    const message = 'AdonisJs projects must have a package.json file app root'
    return new this(message, 500, 'E_MISSING_PACKAGE_FILE')
  }

  /**
   * Raised when `.env` file is missing
   */
  public static missingEnvFile (filePath: string) {
    const message = `The ${filePath} file is missing`
    return new this(message, 500, 'E_MISSING_ENV_FILE')
  }
}

export { RuntimeException }
