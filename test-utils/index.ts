/*
* adonis-framework
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

import { join, isAbsolute } from 'path'
import { outputFile, remove } from 'fs-extra'

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
  await remove(filePath)
}

export async function removeAppRoot () {
  await remove(this.appRoot())
}
