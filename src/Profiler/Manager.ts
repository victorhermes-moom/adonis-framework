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
import { ISubscriberFn, IProfiler, IProfilerConfig } from '../Contracts/IProfiler'

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
 * instances.
 */
export class ProfilerManager {
  private _subscriber: ISubscriberFn
  private _config: IProfilerConfig

  constructor (config: IConfig) {
    this._config = config.merge('app.profiler', DEFAULT_CONFIG)
  }

  /**
   * Get a new profiler instance. Each profiler instance logs
   * a new row
   */
  public new (label: string): IProfiler {
    if (shared.isEnabled(label, this._config)) {
      return new Profiler(label, this._subscriber, this._config)
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
    this._subscriber = subscriber
  }
}
