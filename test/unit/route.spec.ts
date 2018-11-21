/**
 * @adonisjs/framework
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import * as test from 'japa'
import { Route } from '../../src/Route'
import { makeRoute } from '../../test-utils'

test.group('Route', () => {
  test('create a new route', (assert) => {
    function handler () {}
    const route = new Route('/', ['GET'], handler)

    assert.deepEqual(route.toJSON(), makeRoute({ handler: handler, pattern: '/' }))
  })

  test('prefix route', (assert) => {
    function handler () {}
    const route = new Route('/posts', ['GET'], handler)
    route.prefix('/api/v1')

    assert.deepEqual(route.toJSON(), makeRoute({ handler: handler, pattern: 'api/v1/posts' }))
  })

  test('define route domain', (assert) => {
    function handler () {}
    const route = new Route('/posts', ['GET'], handler)
    route.domain('blog.adonisjs.com')

    assert.deepEqual(route.toJSON(), makeRoute({
      handler: handler,
      pattern: 'posts',
      domain: 'blog.adonisjs.com',
    }))
  })

  test('define route name', (assert) => {
    function handler () {}
    const route = new Route('/posts', ['GET'], handler)
    route.as('listPosts').prefix('api')

    assert.deepEqual(route.toJSON(), makeRoute({
      handler: handler,
      pattern: 'api/posts',
      name: 'listPosts',
    }))
  })

  test('define route param patterns', (assert) => {
    function handler () {}
    const route = new Route('/posts/:id', ['GET'], handler)
    route.where('id', '^[a-z]+$')

    assert.deepEqual(route.toJSON(), makeRoute({
      handler: handler,
      pattern: 'posts/:id',
      patternMatchers: {
        id: /^[a-z]+$/,
      },
    }))
  })

  test('define route param patterns as regex', (assert) => {
    function handler () {}
    const route = new Route('/posts/:id', ['GET'], handler)
    route.where('id', /^[a-z]+$/)

    assert.deepEqual(route.toJSON(), makeRoute({
      handler: handler,
      pattern: 'posts/:id',
      patternMatchers: {
        id: /^[a-z]+$/,
      },
    }))
  })
})
