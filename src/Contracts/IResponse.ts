/**
 * @module http
 */

/*
 * @adonisjs/framework
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { ServerResponse } from 'http'
import { IRequest } from './IRequest'

export type ICastableHeader = string | number | boolean | string[] | number[] | boolean[]

export type IResponseContentType =
  'text/html' |
  'text/plain' |
  'application/octet-stream' |
  'application/json' |
  'unknown' |
  'null'

export type IReadableStream = NodeJS.ReadStream | NodeJS.ReadWriteStream | NodeJS.ReadableStream

export interface IResponse {
  implicitEnd: boolean
  hasLazyBody: boolean
  finished: boolean
  headersSent: boolean
  isPending: boolean
  request: IRequest
  response: ServerResponse
  getHeader (key: string): string | string[] | number | undefined
  header (key: string, value: ICastableHeader): this
  append (key: string, value: ICastableHeader): this
  safeHeader (key: string, value: ICastableHeader): this
  removeHeader (key: string): this
  status (code: number): this
  type (type: string, charset?: string): this
  vary (field: string): this
  setEtag (body: any, weak?: boolean): this

  buildResponseBody (body: any): { body: any, type: IResponseContentType, originalType?: string }
  send (body: any, generateEtag?: boolean): void
  json (body: any, generateEtag?: boolean): void
  jsonp (body: any, callbackName?: string, generateEtag?: boolean): void

  stream (stream: IReadableStream, raiseErrors?: boolean): Promise<Error | void>
  download (filePath: string, generateEtag?: boolean, raiseErrors?: boolean): Promise<Error | void>
  attachment (
    filePath: string,
    name?: string,
    disposition?: string,
    generateEtag?: boolean,
    raiseErrors?: boolean,
  ): Promise<Error | void>

  location (url: string): this
  redirect (url: string, reflectQueryParams?: boolean, statusCode?: number): void

  finish (): void
}
