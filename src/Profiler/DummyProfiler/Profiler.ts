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

import { IProfiler } from '../../Contracts/IProfiler'

/**
 * Dummy profiler to provide consistent profiling interface
 * but does nothing in the end
 */
export class DummyProfiler implements IProfiler {
  constructor (private _action) {
  }

  public profile () {
    return this._action
  }

  public end () {
  }

  public child (): IProfiler {
    return this
  }
}
