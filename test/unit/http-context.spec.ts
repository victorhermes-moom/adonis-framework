/*
* @adonisjs/framework
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

import * as test from 'japa'
import { HttpContext } from '../../src/HttpContext'
import { fakeConfig, fakeReqRes } from '../../test-utils'

test.group('Http Context', (group) => {
  group.beforeEach(() => {
    HttpContext.hydrate()
  })

  test('add macros to the context', async (assert) => {
    HttpContext.macro('auth', () => {
      return 'this is auth'
    })

    const { req, res } = fakeReqRes()
    const ctx = await HttpContext.newUp(req, res, fakeConfig())
    assert.equal((ctx as any).auth(), 'this is auth')
  })

  test('execute on ready hooks in parallel', async (assert) => {
    assert.plan(2)

    HttpContext.onReady(() => {
      assert.isTrue(true)
    })

    HttpContext.onReady(() => {
      assert.isTrue(true)
    })

    const { req, res } = fakeReqRes()
    await HttpContext.newUp(req, res, fakeConfig())
  })

  test('execute tear down hooks in parallel', async (assert) => {
    assert.plan(2)

    HttpContext.onTearDown(() => {
      assert.isTrue(true)
    })

    HttpContext.onTearDown(() => {
      assert.isTrue(true)
    })

    const { req, res } = fakeReqRes()
    const ctx = await HttpContext.newUp(req, res, fakeConfig())
    await ctx.tearDown()
  })
})
