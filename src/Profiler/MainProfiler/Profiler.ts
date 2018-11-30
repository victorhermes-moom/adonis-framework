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
  IProfilerRowPacket,
  IProfilerManager,
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
  private _timestamp = Date.now()
  private _start = process.hrtime()

  constructor (
    private _action: string,
    private _manager: IProfilerManager,
    private _data?: any,
    private _parentId?: string,
  ) {}

  /**
   * Makes the log packet for the row log
   */
  private _makeLogPacket (): IProfilerRowPacket {
    return {
      id: this._id,
      type: 'row',
      action: this._action,
      parent_id: this._parentId,
      timestamp: this._timestamp,
      data: this._data || {},
      duration: process.hrtime(this._start),
    }
  }

  /**
   * Get a new profile action instance. Make sure to call
   * `end` on the action instance for the log to appear.
   */
  public profile (action: string, data?: any) {
    if (shared.isEnabled(action, this._manager.config)) {
      return new ProfilerAction(this._id, action, this._manager.subscriber, data)
    }

    return shared.dummyAction
  }

  /**
   * End the profiler instance by emitting end lop packet. After
   * this all profiling calls will be considered overflows
   */
  public end (data?: any) {
    if (data) {
      this._data = Object.assign({}, this._data, data)
    }

    this._manager.subscriber(this._makeLogPacket())
  }

  /**
   * Get a new child logger. Child logger will emit a new row
   * in the events timeline
   */
  public child (action: string, data?: any): IProfiler {
    if (shared.isEnabled(action, this._manager.config)) {
      return new Profiler(action, this._manager, data, this._id)
    }

    return shared.dummyProfiler
  }
}
