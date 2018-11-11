/*
* adonis-framework
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

import * as test from 'japa'
import * as encryptorCreator from 'simple-encryptor'

import { Encryption } from '../../src/Encryption'
import { fakeConfig } from '../../test-utils/index'

test.group('Encryption', () => {
  test('raise error if appKey is missing', (assert) => {
    const fn = () => new Encryption(fakeConfig())
    assert.throw(fn, 'E_MISSING_APP_KEY: Make sure to define appKey inside config/app.js file')
  })

  test('raise error if appKey is smaller than 16 chars', (assert) => {
    const config = fakeConfig()
    config.set('app.appKey', '123456789')

    const encryption = new Encryption(config)
    const fn = () => encryption.encrypt('foo')
    assert.throw(fn, 'key must be at least 16 characters long')
  })

  test('encrypt value', (assert) => {
    const config = fakeConfig()
    config.set('app.appKey', 'sixteendigitlong')
    const simpleEncryptor = (encryptorCreator as any)({
      key: 'sixteendigitlong',
      hmac: false,
    })

    const encryption = new Encryption(config)
    assert.equal(simpleEncryptor.decrypt(encryption.encrypt('hello world')), 'hello world')
  })

  test('encrypt value with hmac', (assert) => {
    const config = fakeConfig()
    config.set('app.appKey', 'sixteendigitlong')
    const simpleEncryptor = (encryptorCreator as any)({
      key: 'sixteendigitlong',
      hmac: true,
    })

    const encryption = new Encryption(config)
    assert.equal(simpleEncryptor.decrypt(encryption.encrypt('hello world', true)), 'hello world')
  })

  test('decrypted previously encrypted value', (assert) => {
    const config = fakeConfig()
    config.set('app.appKey', 'sixteendigitlong')
    const simpleEncryptor = (encryptorCreator as any)({
      key: 'sixteendigitlong',
      hmac: false,
    })

    const encryption = new Encryption(config)
    assert.equal(encryption.decrypt(simpleEncryptor.encrypt('hello')), 'hello')
  })

  test('re-use encryptor instances', (assert) => {
    const config = fakeConfig()
    config.set('app.appKey', 'sixteendigitlong')

    const encryption = new Encryption(config)
    assert.deepEqual(encryption['_getEncryptor'](false), encryption['_getEncryptor'](false))
  })

  test('decrypted previously encrypted value with hmac', (assert) => {
    const config = fakeConfig()
    config.set('app.appKey', 'sixteendigitlong')
    const simpleEncryptor = (encryptorCreator as any)({
      key: 'sixteendigitlong',
      hmac: true,
    })

    const encryption = new Encryption(config)
    assert.equal(encryption.decrypt(simpleEncryptor.encrypt('hello'), true), 'hello')
  })

  test('return null when unable to decrypt', (assert) => {
    const config = fakeConfig()
    config.set('app.appKey', 'sixteendigitlong')
    const simpleEncryptor = (encryptorCreator as any)({
      key: 'sixteendigitlong',
      hmac: true,
    })

    const encryption = new Encryption(config)
    assert.isNull(encryption.decrypt(simpleEncryptor.encrypt('hello')))
  })

  test('return original data type after decryption', (assert) => {
    const config = fakeConfig()
    config.set('app.appKey', 'sixteendigitlong')
    const simpleEncryptor = (encryptorCreator as any)({
      key: 'sixteendigitlong',
      hmac: false,
    })

    const encryption = new Encryption(config)
    assert.deepEqual(encryption.decrypt(simpleEncryptor.encrypt({ age: 22 })), {
      age: 22,
    })
  })

  test('base64 encode string', (assert) => {
    const config = fakeConfig()
    config.set('app.appKey', 'sixteendigitlong')

    const encryption = new Encryption(config)
    assert.equal(encryption.base64Encode('hello world'), Buffer.from('hello world').toString('base64'))
  })

  test('base64 decode buffer', (assert) => {
    const config = fakeConfig()
    config.set('app.appKey', 'sixteendigitlong')

    const encryption = new Encryption(config)
    assert.equal(encryption.base64Decode(Buffer.from('hello world')), 'hello world')
  })

  test('base64 decode string', (assert) => {
    const config = fakeConfig()
    config.set('app.appKey', 'sixteendigitlong')

    const encryption = new Encryption(config)
    assert.equal(encryption.base64Decode(Buffer.from('hello world').toString('base64')), 'hello world')
  })
})
