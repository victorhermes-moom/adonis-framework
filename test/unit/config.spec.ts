/*
* adonis-framework
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

import * as test from 'japa'
import { join } from 'path'

import { Config } from '../../src/Config'
import { appRoot, removeAppRoot, createFile, removeFile } from '../../test-utils'

test.group('Config', (group) => {
  group.after(async () => {
    await removeAppRoot()
  })

  test('load .js config files from the app root', async (assert) => {
    /**
     * Setup
     */
    await createFile('config/app.js', `module.exports = {
      logger: {
        driver: 'file'
      }
    }`)

    const config = new Config(join(appRoot(), 'config'), ['js'])
    assert.deepEqual(config['_configCache'], {
      app: {
        logger: {
          driver: 'file',
        },
      },
    })

    /**
     * Cleanup
     */
    await removeFile('config/app.js')
  })

  test('load .ts config files from the app root', async (assert) => {
    /**
     * Setup
     */
    await createFile('config/app.ts', `export = {
      logger: {
        driver: 'file'
      }
    }`)

    const config = new Config(join(appRoot(), 'config'), ['js', 'ts'])
    assert.deepEqual(config['_configCache'], {
      app: {
        logger: {
          driver: 'file',
        },
      },
    })

    /**
     * Cleanup
     */
    await removeFile('config/app.ts')
  })

  test('do not raise errors when config files are missing', async (assert) => {
    const config = new Config(join(appRoot(), 'config'), ['js', 'ts'])
    assert.deepEqual(config['_configCache'], {})
  })

  test('merge config with given defaults', async (assert) => {
    /**
     * Setup
     */
    await createFile('config/app.js', `module.exports = {
      logger: {
        driver: 'file'
      }
    }`)

    const config = new Config(join(appRoot(), 'config'), ['js'])
    assert.deepEqual(config.merge('app.logger', { filePath: 'foo' }), {
      driver: 'file',
      filePath: 'foo',
    })

    /**
     * Cleanup
     */
    await removeFile('config/app.js')
  })

  test('define merge config customizer', async (assert) => {
    /**
     * Setup
     */
    await createFile('config/app.js', `module.exports = {
      logger: {
        driver: 'file'
      }
    }`)

    const config = new Config(join(appRoot(), 'config'), ['js'])
    assert.deepEqual(config.merge('app.logger', { filePath: 'foo' }, (_objValue, _srcValue, key) => {
      if (key === 'driver') {
        return 'memory'
      }
    }), {
      driver: 'memory',
      filePath: 'foo',
    })

    /**
     * Cleanup
     */
    await removeFile('config/app.js')
  })

  test('update in-memory config value', async (assert) => {
    /**
     * Setup
     */
    await createFile('config/app.js', `module.exports = {
      logger: {
        driver: 'file'
      }
    }`)

    const config = new Config(join(appRoot(), 'config'), ['js'])
    config.set('app.logger', { driver: 'memory' })
    assert.deepEqual(config.get('app.logger'), { driver: 'memory' })

    /**
     * Cleanup
     */
    await removeFile('config/app.js')
  })

  test('raise error when config file has syntax errors', async (assert) => {
    /**
     * Setup
     */
    await createFile('config/app.js', `module.exports = {
      logger: {
        driver: 'file
      }
    }`)

    const config = () => new Config(join(appRoot(), 'config'), ['js'])
    assert.throw(config, 'Invalid or unexpected token')

    /**
     * Cleanup
     */
    await removeFile('config/app.js')
  })
})
