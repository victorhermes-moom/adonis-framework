/**
 * @module main
 */

/*
* adonis-framework
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

import { RuntimeException } from '@adonisjs/generic-exceptions'

export class MissingEnvFileException extends RuntimeException {
  public static invoke (filePath: string) {
    const message = `The ${filePath} file is missing`
    return new this(message, 500, 'E_MISSING_ENV_FILE')
  }
}

export class MissingAppKey extends RuntimeException {
  public static invoke () {
    const message = 'Make sure to define appKey inside config/app.js file'
    return new this(message, 500, 'E_MISSING_APP_KEY')
  }
}
