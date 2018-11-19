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
import { flatRoutes } from '../../test-utils'

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
      {
        pattern: 'foo',
        patternMatchers: {},
        handler: getFoo,
        methods: ['GET'],
        domain: 'root',
        name: 'foo',
      },
      {
        pattern: 'foo',
        patternMatchers: {},
        handler: postFoo,
        methods: ['POST'],
        domain: 'root',
        name: 'foo',
      },
      {
        pattern: 'foo',
        patternMatchers: {},
        handler: putFoo,
        methods: ['PUT'],
        domain: 'root',
        name: 'foo',
      },
      {
        pattern: 'foo',
        patternMatchers: {},
        handler: patchFoo,
        methods: ['PATCH'],
        domain: 'root',
        name: 'foo',
      },
      {
        pattern: 'foo',
        patternMatchers: {},
        handler: deleteFoo,
        methods: ['DELETE'],
        domain: 'root',
        name: 'foo',
      },
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
            },
            'foo': {
              handler: getFoo,
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
      {
        pattern: 'foo',
        patternMatchers: {},
        handler: getFoo,
        methods: ['GET'],
        domain: 'root',
        name: 'foo',
      },
      {
        pattern: 'foo',
        patternMatchers: {},
        handler: postFoo,
        methods: ['POST'],
        domain: 'root',
        name: 'foo',
      },
      {
        pattern: 'bar/foo',
        patternMatchers: {},
        handler: putFoo,
        methods: ['PUT'],
        domain: 'root',
        name: 'bar/foo',
      },
      {
        pattern: 'bar/foo',
        patternMatchers: {},
        handler: patchFoo,
        methods: ['PATCH'],
        domain: 'root',
        name: 'bar/foo',
      },
      {
        pattern: 'foo',
        patternMatchers: {},
        handler: deleteFoo,
        methods: ['DELETE'],
        domain: 'root',
        name: 'foo',
      },
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
            },
            'foo': {
              handler: getFoo,
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
            },
          },
        },
      },
    })
  })
})
