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

test.group('Route', () => {
  test('create a new route', (assert) => {
    function handler () {}
    const route = new Route('/', ['GET'], handler)

    assert.deepEqual(route.toJSON(), {
      pattern: '/',
      methods: ['GET'],
      handler: handler,
      name: '/',
      patternMatchers: {},
      domain: 'root',
    })
  })

  test('prefix route', (assert) => {
    function handler () {}
    const route = new Route('/posts', ['GET'], handler)
    route.prefix('/api/v1')

    assert.deepEqual(route.toJSON(), {
      pattern: 'api/v1/posts',
      methods: ['GET'],
      handler: handler,
      name: 'api/v1/posts',
      patternMatchers: {},
      domain: 'root',
    })
  })

  test('define route domain', (assert) => {
    function handler () {}
    const route = new Route('/posts', ['GET'], handler)
    route.domain('blog.adonisjs.com')

    assert.deepEqual(route.toJSON(), {
      pattern: 'posts',
      methods: ['GET'],
      handler: handler,
      name: 'posts',
      patternMatchers: {},
      domain: 'blog.adonisjs.com',
    })
  })

  test('define route name', (assert) => {
    function handler () {}
    const route = new Route('/posts', ['GET'], handler)
    route.as('listPosts').prefix('api')

    assert.deepEqual(route.toJSON(), {
      pattern: 'api/posts',
      methods: ['GET'],
      handler: handler,
      name: 'listPosts',
      patternMatchers: {},
      domain: 'root',
    })
  })

  test('define route param patterns', (assert) => {
    function handler () {}
    const route = new Route('/posts/:id', ['GET'], handler)
    route.where('id', '^[a-z]+$')

    assert.deepEqual(route.toJSON(), {
      pattern: 'posts/:id',
      methods: ['GET'],
      handler: handler,
      name: 'posts/:id',
      patternMatchers: {
        id: /^[a-z]+$/,
      },
      domain: 'root',
    })
  })
})
