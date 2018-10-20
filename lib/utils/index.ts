/*
* adonis-framework
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

export function trySync<T> (fn, args): [NodeJS.ErrnoException | null, T] {
  let error: NodeJS.ErrnoException | null = null
  let result: any = ''

  try {
    result = fn(...args)
  } catch (e) {
    error = e
  }

  return [error, result as T]
}
