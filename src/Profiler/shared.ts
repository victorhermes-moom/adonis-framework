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

import { memoize } from 'lodash'

import { IProfilerConfig } from '../Contracts/IProfiler'
import { DummyProfiler } from './DummyProfiler/Profiler'
import { DummyProfilerAction } from './DummyProfiler/Action'

/**
 * Dummy action. We only create a single instance to avoid too many
 * objects for dummy implementations
 */
const dummyAction = new DummyProfilerAction()

/**
 * Dummy profiler. We only create a single instance to avoid too many
 * objects for dummy implementations
 */
const dummyProfiler = new DummyProfiler(dummyAction)

/**
 * Finding if a particular label is enabled or not for profiling
 */
function isEnabled (label: string, config: IProfilerConfig) {
  if (!config.enabled) {
    return false
  }

  /**
   * If white list is empty, then check for blacklist
   */
  if (config.whitelist.length === 0) {
    return config.blacklist.indexOf(label) === -1
  }

  /**
   * Otherwise check for whitelist only. We can check for `whitelist` and
   * `blacklist` both here, but not 100% sure.
   */
  return config.whitelist.indexOf(label) > -1
}

export default {
  isEnabled: memoize(isEnabled),
  dummyProfiler,
  dummyAction,
}
