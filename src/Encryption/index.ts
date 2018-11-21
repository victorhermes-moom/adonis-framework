/**
 * @module main
 */

/**
 * @adonisjs/framework
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import * as encryptorCreator from 'simple-encryptor'
import { IConfig } from '../Contracts/IConfig'
import { IEncryption } from '../Contracts/IEncryption'
import { MissingAppKeyException } from '../Exceptions'

/**
 * Encryption module is used to safely encrypt and decrypt values using the crypto module
 * along with `AES-256` cipher.
 *
 * The encryption is done using the `appKey` defined inside `config/app.js` file.
 * An exception will be raised when `appKey` is missing.
 *
 * This module exposes 2 interfaces to encrypt/encode values.
 *
 * 1. Crypto (encrypt/decrypt)
 * 2. Base64 (base64Encode/base64Decode)
 */
export class Encryption implements IEncryption {
  private _encryptors = {
    withHmac: null,
    withoutHmac: null,
  }

  constructor (private _config: IConfig) {
    if (!this._config.get('app.appKey')) {
      throw MissingAppKeyException.invoke()
    }
  }

  /**
   * Creates/caches an encryptor instance to encrypt values
   * with or without hmac.
   */
  private _getEncryptor (withHmac: boolean): any {
    const key = withHmac ? 'withHmac' : 'withoutHmac'

    /**
     * Return if already exists
     */
    if (this._encryptors[key]) {
      return this._encryptors[key]!
    }

    /**
     * Create and cache a new encryptor
     */
    this._encryptors[key] = (encryptorCreator as any)({
      key: this._config.get('app.appKey'),
      hmac: withHmac,
      debug: false,
    })

    return this._encryptors[key]!
  }

  /**
   * Encrypt value using `AES-256` cipher. Optionally, you can generate
   * the `HMAC`, which is appended to the output. The `HMAC` will
   * increase the output size by 64 bytes and will be verified first
   * during `decrypt`.
   *
   * NOTE: This method returns a different output even if the input is same. Consider
   * using [[base64Encode]] if you strive for identical output.
   *
   * @example
   * ```js
   * const encrypted = Encryption.encrypt('hello world')
   * Encryption.decrypt(encrypted) // 'hello world'
   *
   * // with HMAC
   * const encrypted = Encryption.encrypt('hello world', true)
   * Encryption.decrypt(encrypted, true) // 'hello world'
   * ```
   */
  public encrypt (value: any, hmac: boolean = false): string {
    const encryptor = this._getEncryptor(hmac)
    return encryptor.encrypt(value)
  }

  /**
   * Decrypt previously encrypted value to it's original value. If
   * `HMAC` was generated during [[encrypt]], then make sure to
   * pass 2nd argument as true.
   *
   * If unable to decrypt, then `null` will be returned.
   */
  public decrypt (encrypted: string, hmac: boolean = false): any {
    const encryptor = this._getEncryptor(hmac)
    return encryptor.decrypt(encrypted)
  }

  /**
   * Base64 encode a string value
   */
  public base64Encode (value: string): string {
    return Buffer.from(value).toString('base64')
  }

  /**
   * Base64 decode a previously encode string or buffer
   */
  public base64Decode (value: string | Buffer): string {
    if (Buffer.isBuffer(value)) {
      return value.toString('utf8')
    }

    return Buffer.from(value, 'base64').toString('utf8')
  }
}
