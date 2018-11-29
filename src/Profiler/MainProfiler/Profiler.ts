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

import * as uniqid from 'uniqid'

import { ProfilerAction } from './Action'
import shared from '../shared'

import {
  IProfiler,
  ISubscriberFn,
  IProfilerRowPacket,
  IProfilerConfig,
} from '../../Contracts/IProfiler'

/**
 * Profiler class is to create new profile rows and then profile
 * actions inside the scope of the profile row. The concept of
 * rows enables us to create an events timeline.
 *
 * Each row will emit `start` and `end` events with `process.hrtime`. If
 * call to `end` is missing, then it will be considered as a malformed
 * entry and all profiling after the `end` time will be considered
 * as overflows.
 *
 * Each row has a unique `uid`, which is also unique in distributed environment.
 */
export class Profiler implements IProfiler {
  private _id = uniqid()

  constructor (
    private _label: string,
    private _subscriber: ISubscriberFn,
    private _config: IProfilerConfig,
    private _parentId?: string,
  ) {
    this._subscriber(this._makeLogPacket('start'))
  }

  /**
   * Makes the log packet for the row log
   */
  private _makeLogPacket (phase): IProfilerRowPacket {
    return {
      id: this._id,
      type: 'row',
      label: this._label,
      parent_id: this._parentId,
      phase: phase,
      time: process.hrtime(),
    }
  }

  /**
   * Get a new profile action instance. Make sure to call
   * `end` on the action instance for the log to appear.
   */
  public profile (label: string, data?: any) {
    if (shared.isEnabled(label, this._config)) {
      return new ProfilerAction(this._id, label, this._subscriber, data)
    }

    return shared.dummyAction
  }

  /**
   * End the profiler instance by emitting end lop packet. After
   * this all profiling calls will be considered overflows
   */
  public end () {
    this._subscriber(this._makeLogPacket('end'))
  }

  /**
   * Get a new child logger. Child logger will emit a new row
   * in the events timeline
   */
  public child (label: string): IProfiler {
    if (shared.isEnabled(label, this._config)) {
      return new Profiler(label, this._subscriber, this._config, this._id)
    }

    return shared.dummyProfiler
  }
}
