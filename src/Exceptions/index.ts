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
 * Missing is raised when `.env` file is missing from the user defined
 * or default location.
 */
export class MissingEnvFileException extends RuntimeException {
  public static invoke (filePath: string) {
    const message = `The ${filePath} file is missing`
    return new this(message, 500, 'E_MISSING_ENV_FILE')
  }
}

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
