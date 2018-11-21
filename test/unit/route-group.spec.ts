/*
 * @adonisjs/framework
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import * as test from 'japa'
import { RouteGroup } from '../../src/Route/RouteGroup'
import { Route } from '../../src/Route'
import { makeRoute } from '../../test-utils'

test.group('Route Group', () => {
  test('prefix routes inside a group', (assert) => {
    const group = new RouteGroup()
    function getFoo () {}

    group.routes.push(new Route('/', ['GET'], getFoo))
    group.prefix('/foo')

    assert.deepEqual(group.routes[0].toJSON(), makeRoute({
      pattern: 'foo',
      handler: getFoo,
    }))
  })

  test('define route params regex', (assert) => {
    const group = new RouteGroup()
    function getFoo () {}

    group.routes.push(new Route('/:id', ['GET'], getFoo))
    group.where('id', '[a-z]')

    assert.deepEqual(group.routes[0].toJSON(), makeRoute({
      pattern: ':id',
      handler: getFoo,
      patternMatchers: {
        id: /[a-z]/,
      },
    }))
  })

  test('define route domain', (assert) => {
    const group = new RouteGroup()
    function getFoo () {}

    group.routes.push(new Route('/:id', ['GET'], getFoo))
    group.domain('foo.com')

    assert.deepEqual(group.routes[0].toJSON(), makeRoute({
      pattern: ':id',
      handler: getFoo,
      domain: 'foo.com',
    }))
  })
})
