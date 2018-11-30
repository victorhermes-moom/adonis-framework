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

/**
 * The subscriber function to listen for profiler logs
 */
export type ISubscriberFn = (log: IProfilerActionPacket | IProfilerRowPacket) => void

/**
 * Action packet to define log for
 * an action
 */
export type IProfilerActionPacket = {
  row_id: string,
  type: 'action',
  action: string,
  timestamp: number,
  duration: [number, number],
  data: any,
}

/**
 * Row packet to define log for a row
 */
export type IProfilerRowPacket = {
  id: string,
  parent_id?: string,
  type: 'row',
  action: string,
  timestamp: number,
  duration: [number, number],
  data: any,
}

/**
 * Config for the profiler inside `config/app.js` file under
 * `profiler` key.
 */
export type IProfilerConfig = {
  enabled: boolean,
  whitelist: string[],
  blacklist: string[],
}

/**
 * Profiler action interface
 */
export interface IProfilerAction {
  end (data?: any): void,
}

/**
 * Profile interface
 */
export interface IProfiler {
  child (action: string, data?: any): IProfiler,
  profile (action: string, data?: any),
  end (data?: any),
}

/**
 * Manager interface
 */
export interface IProfilerManager {
  subscriber: ISubscriberFn,
  config: IProfilerConfig,
  create (action: string, data?: any): IProfiler,
  subscribe (subscriber: ISubscriberFn): void,
}
