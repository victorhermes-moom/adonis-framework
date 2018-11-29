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

import { IProfilerAction } from '../../Contracts/IProfiler'

/**
 * Dummpy profiler action
 */
export class DummyProfilerAction implements IProfilerAction {
  public end () {}
}
