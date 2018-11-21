/*
 * @adonisjs/framework
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import * as test from 'japa'
import { RouteManager } from '../../src/Route/RouteManager'
import { flatRoutes, makeRoute, routeToStoreRoute } from '../../test-utils'

test.group('Route Manager', () => {
  test('define routes for all verbs in sequence', (assert) => {
    const manager = new RouteManager()

    function getFoo () {}
    function postFoo () {}
    function putFoo () {}
    function patchFoo () {}
    function deleteFoo () {}

    manager.get('/foo', getFoo)
    manager.post('/foo', postFoo)
    manager.put('/foo', putFoo)
    manager.patch('/foo', patchFoo)
    manager.delete('/foo', deleteFoo)

    assert.deepEqual(flatRoutes(manager['_routes']), [
      makeRoute({ pattern: 'foo', handler: getFoo }),
      makeRoute({ pattern: 'foo', handler: postFoo, methods: ['POST'] }),
      makeRoute({ pattern: 'foo', handler: putFoo, methods: ['PUT'] }),
      makeRoute({ pattern: 'foo', handler: patchFoo, methods: ['PATCH'] }),
      makeRoute({ pattern: 'foo', handler: deleteFoo, methods: ['DELETE'] }),
    ])
  })

  test('commit routes with the store', (assert) => {
    const manager = new RouteManager()

    function getApple () {}
    function getFoo () {}
    function postFoo () {}
    function getBlogFoo () {}

    manager.get('/foo', getFoo)
    manager.get('/apple', getApple)
    manager.post('/foo', postFoo)
    manager.get('/foo', getBlogFoo).domain('blog.adonisjs.com')

    manager.commit()

    assert.deepEqual(manager['_store']['_routes'], {
      'root': {
        'GET': {
          tokens: [
            [{
              'old': 'foo',
              'type': 0,
              'val': 'foo',
              'end': '',
              'matcher': null,
              'id': 'foo',
            }],
            [{
              'old': 'apple',
              'type': 0,
              'val': 'apple',
              'end': '',
              'matcher': null,
              'id': 'apple',
            }],
          ],
          routes: {
            'apple': {
              handler: getApple,
              name: 'apple',
              pattern: 'apple',
              method: 'GET',
              domain: 'root',
            },
            'foo': {
              handler: getFoo,
              name: 'foo',
              pattern: 'foo',
              method: 'GET',
              domain: 'root',
            },
          },
        },
        'POST': {
          tokens: [[{
            'old': 'foo',
            'type': 0,
            'val': 'foo',
            'end': '',
            'matcher': null,
            'id': 'foo',
          }]],
          routes: {
            'foo': {
              handler: postFoo,
              name: 'foo',
              pattern: 'foo',
              method: 'POST',
              domain: 'root',
            },
          },
        },
      },
      'blog.adonisjs.com': {
        'GET': {
          tokens: [[{
            'old': 'foo',
            'type': 0,
            'val': 'foo',
            'end': '',
            'matcher': null,
            'id': 'foo',
          }]],
          routes: {
            'foo': {
              handler: getBlogFoo,
              name: 'foo',
              pattern: 'foo',
              method: 'GET',
              domain: 'blog.adonisjs.com',
            },
          },
        },
      },
    })
  })

  test('define routes via route group', (assert) => {
    const manager = new RouteManager()

    function getFoo () {}
    function postFoo () {}
    function putFoo () {}
    function patchFoo () {}
    function deleteFoo () {}

    manager.get('/foo', getFoo)
    manager.post('/foo', postFoo)

    manager.group(() => {
      manager.put('/foo', putFoo)
      manager.patch('/foo', patchFoo)
    }).prefix('/bar')

    manager.delete('/foo', deleteFoo)

    assert.deepEqual(flatRoutes(manager['_routes']), [
      makeRoute({ pattern: 'foo', handler: getFoo }),
      makeRoute({ pattern: 'foo', handler: postFoo, methods: ['POST'] }),
      makeRoute({ pattern: 'bar/foo', handler: putFoo, methods: ['PUT'] }),
      makeRoute({ pattern: 'bar/foo', handler: patchFoo, methods: ['PATCH'] }),
      makeRoute({ pattern: 'foo', handler: deleteFoo, methods: ['DELETE'] }),
    ])
  })

  test('commit grouped routes with the store', (assert) => {
    const manager = new RouteManager()

    function getApple () {}
    function getFoo () {}
    function postFoo () {}
    function getBlogFoo () {}

    manager.get('/foo', getFoo)

    manager.group(() => {
      manager.get('/apple', getApple)
      manager.post('/foo', postFoo)
    }).prefix('/api')

    manager.get('/foo', getBlogFoo).domain('blog.adonisjs.com')

    manager.commit()

    assert.deepEqual(manager['_store']['_routes'], {
      'root': {
        'GET': {
          tokens: [
            [{
              'old': 'foo',
              'type': 0,
              'val': 'foo',
              'end': '',
              'matcher': null,
              'id': 'foo',
            }],
            [
              {
                'old': 'api/apple',
                'type': 0,
                'val': 'api',
                'end': '',
                'matcher': null,
                'id': 'api/apple',
              },
              {
                'old': 'api/apple',
                'type': 0,
                'val': 'apple',
                'end': '',
                'matcher': null,
                'id': 'api/apple',
              },
            ],
          ],
          routes: {
            'api/apple': {
              handler: getApple,
              pattern: 'api/apple',
              name: 'api/apple',
              method: 'GET',
              domain: 'root',
            },
            'foo': {
              handler: getFoo,
              pattern: 'foo',
              name: 'foo',
              method: 'GET',
              domain: 'root',
            },
          },
        },
        'POST': {
          tokens: [
            [
              {
                'old': 'api/foo',
                'type': 0,
                'val': 'api',
                'end': '',
                'matcher': null,
                'id': 'api/foo',
              },
              {
                'old': 'api/foo',
                'type': 0,
                'val': 'foo',
                'end': '',
                'matcher': null,
                'id': 'api/foo',
              },
            ],
          ],
          routes: {
            'api/foo': {
              handler: postFoo,
              pattern: 'api/foo',
              name: 'api/foo',
              method: 'POST',
              domain: 'root',
            },
          },
        },
      },
      'blog.adonisjs.com': {
        'GET': {
          tokens: [[{
            'old': 'foo',
            'type': 0,
            'val': 'foo',
            'end': '',
            'matcher': null,
            'id': 'foo',
          }]],
          routes: {
            'foo': {
              handler: getBlogFoo,
              pattern: 'foo',
              name: 'foo',
              method: 'GET',
              domain: 'blog.adonisjs.com',
            },
          },
        },
      },
    })
  })

  test('find a pre-registered route using url', (assert) => {
    const manager = new RouteManager()

    manager.get('/foo', function getFoo () {}).as('listFoo')
    const route = manager.post('/foo/:id', function postFoo () {}).as('storeFoo')
    manager.commit()

    const expectedRoute = routeToStoreRoute(route.toJSON(), 'POST')
    assert.deepEqual(manager.find('foo/1', 'POST'), Object.assign(expectedRoute, {
      params: { id: '1' },
    }))
  })

  test('make url to a route', (assert) => {
    const manager = new RouteManager()

    manager.get('/foo', function getFoo () {}).as('listFoo')
    manager.post('/foo/:id', function postFoo () {}).as('storeFoo')
    manager.commit()

    assert.equal(manager.make('storeFoo', { id: 1 }), 'foo/1')
  })

  test('always match wildcard route when defined as first route', (assert) => {
    const manager = new RouteManager()

    const route = manager.get('*', function getAll () {})
    manager.get('foo', function getFoo () {})
    manager.commit()

    const expectedRoute = routeToStoreRoute(route.toJSON(), 'GET')
    assert.deepEqual(manager.find('foo', 'GET'), Object.assign(expectedRoute, {
      params: { '*': ['foo'] },
    }))
  })

  test('find explicit route when defined first', (assert) => {
    const manager = new RouteManager()

    const route = manager.get('foo', function getFoo () {})
    manager.get('*', function getAll () {})
    manager.commit()

    const expectedRoute = routeToStoreRoute(route.toJSON(), 'GET')
    assert.deepEqual(manager.find('foo', 'GET'), Object.assign(expectedRoute, { params: {} }))
  })

  test('define wildcard was parameter', (assert) => {
    const manager = new RouteManager()

    const route = manager.get('foo/*', function getAll () {})
    manager.get('foo/bar', function getFoo () {})
    manager.commit()

    const expectedRoute = routeToStoreRoute(route.toJSON(), 'GET')

    assert.deepEqual(manager.find('foo/bar/baz', 'GET'), Object.assign(expectedRoute, {
      params: {
        '*': ['bar', 'baz'],
      },
    }))
  })

  test('define route that responds to all HTTP methods', (assert) => {
    const manager = new RouteManager()

    const route = manager.any('foo', function getAll () {})
    manager.commit()

    const expectedRoute = routeToStoreRoute(route.toJSON(), 'GET')
    assert.deepEqual(manager.find('foo', 'GET'), Object.assign(expectedRoute, { params: {} }))
  })
})
