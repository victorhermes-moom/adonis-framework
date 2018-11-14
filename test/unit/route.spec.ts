/*
* adonis-framework
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
    const route = new Route('/', ['GET'], function handler () {
    })
  })
})
