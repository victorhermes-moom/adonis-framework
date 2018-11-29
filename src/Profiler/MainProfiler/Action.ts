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

import {
  ISubscriberFn,
  IProfilerAction,
  IProfilerActionPacket,
} from '../../Contracts/IProfiler'

/**
 * Profiler action is used to profile an action and compute
 * time taken to perform such an action. It makes use of
 * `process.hrtime()` which results in nanoseconds and
 * handles clock drifts.
 *
 * Random data can be associated with each profiling entry
 */
export class ProfilerAction implements IProfilerAction {
  private _start = process.hrtime()

  constructor (
    private _parentId: string,
    private _label: string,
    private _subscriber: ISubscriberFn,
    private _data?: any,
  ) {}

  /**
   * Make packet for the action
   */
  private _makePacket (): IProfilerActionPacket {
    return {
      parent_id: this._parentId,
      type: 'action',
      label: this._label,
      start: this._start,
      end: process.hrtime(),
      data: this._data || {},
    }
  }

  /**
   * End profiling
   */
  public end (data?: any) {
    if (data) {
      this._data = Object.assign({}, this._data, data)
    }
    this._subscriber(this._makePacket())
  }
}
