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

import shared from './shared'
import { Profiler } from './MainProfiler/Profiler'
import { IConfig } from '../Contracts/IConfig'
import {
  ISubscriberFn,
  IProfiler,
  IProfilerConfig,
  IProfilerManager,
} from '../Contracts/IProfiler'

/**
 * Default config to use when original is missing or
 * incomplete
 */
const DEFAULT_CONFIG = {
  enabled: true,
  whitelist: [],
  blacklist: [],
}

/**
 * Profile manager serves as the public interface to create new profiler
 * instances to profile code with timings.
 */
export class ProfilerManager implements IProfilerManager {
  public subscriber: ISubscriberFn
  public config: IProfilerConfig

  constructor (config: IConfig) {
    this.config = config.merge('app.profiler', DEFAULT_CONFIG)
  }

  /**
   * Get a new profiler instance. Each profiler instance logs
   * a new row
   */
  public create (label: string, data?: any): IProfiler {
    if (shared.isEnabled(label, this.config)) {
      return new Profiler(label, this, data)
    }

    return shared.dummyProfiler
  }

  /**
   * Attach a new subscriber to listen for events. Note: Only
   * one subscriber can be attached and multiple calls to
   * this method will result in removing the old
   * subscriber
   */
  public subscribe (subscriber: ISubscriberFn): void {
    this.subscriber = subscriber
  }
}
