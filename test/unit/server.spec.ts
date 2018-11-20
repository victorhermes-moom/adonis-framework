/*
 * @adonisjs/framework
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import * as test from 'japa'
import * as supertest from 'supertest'
import { createServer } from 'http'

import { AdonisServer } from '../../src/Server'
import { makeRouter, fakeConfig } from '../../test-utils'

test.group('Adonis Server', () => {
  test('handle http requests on http server', async (assert) => {
    const router = makeRouter()

    router.get('/', ({ response }) => {
      response.send('handled')
      response.finish()
    })

    router.commit()

    const adonisServer = new AdonisServer(fakeConfig(), router)
    const server = createServer(adonisServer.handle.bind(adonisServer))

    const { text } = await supertest(server).get('/')
    assert.equal(text, 'handled')
  })
})
