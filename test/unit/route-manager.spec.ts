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

    assert.deepEqual(manager['_routes'].map((route) => route.toJSON()), [
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
              pattern: 'apple',
              patternMatchers: {},
              handler: getApple,
              methods: ['GET'],
              domain: 'root',
              name: 'apple',
            },
            'foo': {
              pattern: 'foo',
              patternMatchers: {},
              handler: getFoo,
              methods: ['GET'],
              domain: 'root',
              name: 'foo',
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
              pattern: 'foo',
              patternMatchers: {},
              handler: postFoo,
              methods: ['POST'],
              domain: 'root',
              name: 'foo',
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
              pattern: 'foo',
              patternMatchers: {},
              handler: getBlogFoo,
              methods: ['GET'],
              domain: 'blog.adonisjs.com',
              name: 'foo',
            },
          },
        },
      },
    })
  })
})
