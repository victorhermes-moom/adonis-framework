/*
* adonis-framework
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

import * as test from 'japa'
import { Env } from '../../src/Env'
import { appRoot, createEnvFile, removeFile, removeAppRoot } from '../../test-utils'
import { join } from 'path'

test.group('Env', (group) => {
  group.after(async () => {
    await removeAppRoot()
  })

  test('load .env file from the project root and raise exception when missing', (assert) => {
    const env = () => new Env(appRoot())
    assert.throw(env, 'E_MISSING_ENV_FILE: The .env file is missing')
  })

  test('do not raise exception when ENV_SILENT is true', (assert) => {
    process.env.ENV_SILENT = 'true'
    const env = () => new Env(appRoot())
    assert.doesNotThrow(env)

    delete process.env.ENV_SILENT
  })

  test('parse .env file and set values inside process.env', async (assert) => {
    /**
     * Setup
     */
    await createEnvFile({ username: 'virk' }, '.env')

    const env = new Env(appRoot())
    assert.equal(env.get('username'), 'virk')

    /**
     * Cleanup
     */
    await removeFile('.env')
    delete process.env.username
  })

  test('do not overwrite existing process.env values', async (assert) => {
    /**
     * Setup
     */
    process.env.username = 'virk'
    await createEnvFile({ username: 'nikk' }, '.env')

    const env = new Env(appRoot())
    assert.equal(env.get('username'), 'virk')

    /**
     * Cleanup
     */
    await removeFile('.env')
    delete process.env.username
  })

  test('cast string true to boolean true', async (assert) => {
    /**
     * Setup
     */
    process.env.loadDb = 'true'
    process.env.ENV_SILENT = 'true'

    const env = new Env(appRoot())
    assert.isTrue(env.get('loadDb'))

    /**
     * Cleanup
     */
    delete process.env.loadDb
    delete process.env.ENV_SILENT
  })

  test('cast null string to null', async (assert) => {
    /**
     * Setup
     */
    process.env.loadDb = 'null'
    process.env.ENV_SILENT = 'true'

    const env = new Env(appRoot())
    assert.isNull(env.get('loadDb'))

    /**
     * Cleanup
     */
    delete process.env.loadDb
    delete process.env.ENV_SILENT
  })

  test('return undefined when value is missing', async (assert) => {
    /**
     * Setup
     */
    process.env.ENV_SILENT = 'true'

    const env = new Env(appRoot())
    assert.isUndefined(env.get('loadDb'))

    /**
     * Cleanup
     */
    delete process.env.ENV_SILENT
  })

  test('raise error when using getOrFail and value is undefined', async (assert) => {
    /**
     * Setup
     */
    process.env.ENV_SILENT = 'true'

    const env = new Env(appRoot())
    const fn = () => env.getOrFail('loadDb')
    assert.throw(fn, 'E_MISSING_ENV_KEY: Make sure to define environment variable loadDb.')

    /**
     * Cleanup
     */
    delete process.env.ENV_SILENT
  })

  test('raise error when using getOrFail and value is not existy', async (assert) => {
    /**
     * Setup
     */
    process.env.loadDb = 'null'
    process.env.ENV_SILENT = 'true'

    const env = new Env(appRoot())
    const fn = () => env.getOrFail('loadDb')
    assert.throw(fn, 'E_MISSING_ENV_KEY: Make sure to define environment variable loadDb.')

    /**
     * Cleanup
     */
    delete process.env.loadDb
    delete process.env.ENV_SILENT
  })

  test('do not raise error when using getOrFail and value is false', async (assert) => {
    /**
     * Setup
     */
    process.env.loadDb = 'false'
    process.env.ENV_SILENT = 'true'

    const env = new Env(appRoot())
    assert.isFalse(env.getOrFail('loadDb'))

    /**
     * Cleanup
     */
    delete process.env.loadDb
    delete process.env.ENV_SILENT
  })

  test('load .env file from a different location', async (assert) => {
    /**
     * Setup
     */
    await createEnvFile({ username: 'virk' }, '.secrets')
    process.env.ENV_PATH = '.secrets'

    const env = new Env(appRoot())
    assert.equal(env.getOrFail('username'), 'virk')

    /**
     * Cleanup
     */
    delete process.env.username
    delete process.env.ENV_PATH
    await removeFile('.secrets')
  })

  test('load .env file from a different absolute location', async (assert) => {
    /**
     * Setup
     */
    const secretsFile = join(__dirname, '.secrets')
    await createEnvFile({ username: 'nikk' }, secretsFile)
    process.env.ENV_PATH = secretsFile

    const env = new Env(appRoot())
    assert.equal(env.getOrFail('username'), 'nikk')

    /**
     * Cleanup
     */
    delete process.env.username
    delete process.env.ENV_PATH
    await removeFile(secretsFile)
  })

  test('load .env.testing file and overwrite existing .env variables', async (assert) => {
    /**
     * Setup
     */
    await createEnvFile({ username: 'nikk' }, '.env')
    await createEnvFile({ username: 'virk' }, '.env.testing')
    process.env.NODE_ENV = 'testing'

    const env = new Env(appRoot())
    assert.equal(env.getOrFail('username'), 'virk')

    /**
     * Cleanup
     */
    delete process.env.username
    delete process.env.NODE_ENV
    await removeFile('.env')
    await removeFile('.env.testing')
  })

  test('update value inside process.env', async (assert) => {
    /**
     * Setup
     */
    await createEnvFile({ loadDb: true }, '.env')

    const env = new Env(appRoot())
    env.set('loadDb', 'false')
    assert.isFalse(env.get('loadDb'))

    /**
     * Cleanup
     */
    delete process.env.loadDb
    await removeFile('.env')
  })
})
