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

export interface IEncryption {
  encrypt (value: any, hmac?: boolean): string
  decrypt (encryptedValue: string, hmac?: boolean): any
  base64Encode (value: string): string
  base64Decode (value: string | Buffer): string
}
