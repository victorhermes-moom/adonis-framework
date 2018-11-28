/**
 * @adonisjs/framework
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import * as test from 'japa'

import { IRouteJSON } from '../../src/Contracts/IRoute'
import { RouteStore } from '../../src/Route/RouteStore'
import { makeRoute, routeToStoreRoute } from '../../test-utils'

test.group('RouteStore | Add', () => {
  test('add new route', (assert) => {
    const store = new RouteStore()

    const route = makeRoute({})
    store.add('foo/:bar', route)

    assert.deepEqual(store['_routes'], {
      root: {
        GET: {
          tokens: [
            [
              { old: 'foo/:bar', type: 0, val: 'foo', end: '', id: 'foo/:bar' },
              { old: 'foo/:bar', type: 1, val: 'bar', end: '', matcher: undefined, id: 'foo/:bar' },
            ],
          ],
          routes: {
            'foo/:bar': route,
          },
        },
      },
    })
  })

  test('raise error when route already exists', (assert) => {
    const store = new RouteStore()

    const route = makeRoute({})
    store.add('foo/:bar', route)

    const fn = () => store.add('foo/:bar', route)
    assert.throw(fn, 'E_DUPLICATE_ROUTE: Duplicate route foo/:bar. Make sure to give routes a unique name or pattern')
  })

  test('define route matchers', (assert) => {
    const store = new RouteStore()

    const route = makeRoute({
      patternMatchers: {
        bar: /[a-z]/,
      },
    })

    store.add('foo/:bar', route)

    assert.deepEqual(store['_routes'], {
      root: {
        GET: {
          tokens: [
            [
              { old: 'foo/:bar', type: 0, val: 'foo', end: '', id: 'foo/:bar' },
              { old: 'foo/:bar', type: 1, val: 'bar', end: '', matcher: /[a-z]/, id: 'foo/:bar' },
            ],
          ],
          routes: {
            'foo/:bar': route,
          },
        },
      },
    })
  })

  test('define route for custom domain', (assert) => {
    const store = new RouteStore()

    const route = makeRoute({
      patternMatchers: {
        bar: /[a-z]/,
      },
      domain: 'blog.adonisjs.com',
    })

    store.add('foo/:bar', route)

    assert.deepEqual(store['_routes'], {
      'blog.adonisjs.com': {
        GET: {
          tokens: [
            [
              { old: 'foo/:bar', type: 0, val: 'foo', end: '', id: 'foo/:bar' },
              { old: 'foo/:bar', type: 1, val: 'bar', end: '', matcher: /[a-z]/, id: 'foo/:bar' },
            ],
          ],
          routes: {
            'foo/:bar': route,
          },
        },
      },
    })
  })

  test('allow duplicate routes across domains', (assert) => {
    const store = new RouteStore()

    const route = makeRoute({})
    store.add('foo/:bar', route)
    store.add('foo/:bar', Object.assign({}, route, { domain: 'blog.adonisjs.com' }))

    assert.deepEqual(store['_routes'], {
      'root': {
        GET: {
          tokens: [
            [
              { old: 'foo/:bar', type: 0, val: 'foo', end: '', id: 'foo/:bar' },
              { old: 'foo/:bar', type: 1, val: 'bar', end: '', matcher: undefined, id: 'foo/:bar' },
            ],
          ],
          routes: {
            'foo/:bar': route,
          },
        },
      },
      'blog.adonisjs.com': {
        GET: {
          tokens: [
            [
              { old: 'foo/:bar', type: 0, val: 'foo', end: '', id: 'foo/:bar' },
              { old: 'foo/:bar', type: 1, val: 'bar', end: '', matcher: undefined, id: 'foo/:bar' },
            ],
          ],
          routes: {
            'foo/:bar': Object.assign(route, { domain: 'blog.adonisjs.com' }),
          },
        },
      },
    })
  })

  test('add route with mulitple methods', (assert) => {
    const store = new RouteStore()

    const route = makeRoute({
      methods: ['GET', 'HEAD'],
    })
    store.add('foo/:bar', route)

    assert.deepEqual(store['_routes'], {
      'root': {
        GET: {
          tokens: [
            [
              { old: 'foo/:bar', type: 0, val: 'foo', end: '', id: 'foo/:bar' },
              { old: 'foo/:bar', type: 1, val: 'bar', end: '', matcher: undefined, id: 'foo/:bar' },
            ],
          ],
          routes: {
            'foo/:bar': route,
          },
        },
        HEAD: {
          tokens: [
            [
              { old: 'foo/:bar', type: 0, val: 'foo', end: '', id: 'foo/:bar' },
              { old: 'foo/:bar', type: 1, val: 'bar', end: '', matcher: undefined, id: 'foo/:bar' },
            ],
          ],
          routes: {
            'foo/:bar': route,
          },
        },
      },
    })
  })
})

test.group('RouteStore | Match', () => {
  test('find route by matching against the url', (assert) => {
    const store = new RouteStore()

    const route = makeRoute({
      patternMatchers: {
        bar: /[a-z]/,
      },
    })

    store.add('foo/:bar', route)

    const matchedRoute = store.find('foo/bar', 'GET')
    assert.deepEqual(matchedRoute, routeToStoreRoute(route, 'GET', { bar: 'bar' }))
  })

  test('find correct route when matcher fails', (assert) => {
    const store = new RouteStore()

    const route = makeRoute({
      patternMatchers: {
        bar: /[a-z]/,
      },
    })
    const route1 = Object.assign(route, { patternMatchers: {}, pattern: 'foo/:id' })

    store.add('foo/:bar', route)
    store.add('foo/:id', route1)

    const matchedRoute = store.find('foo/1', 'GET')
    assert.deepEqual(matchedRoute, routeToStoreRoute(route1, 'GET', { id: '1' }))
  })

  test('find correct route when param is optional', (assert) => {
    const store = new RouteStore()

    const route = makeRoute({
      pattern: 'foo/:bar?',
      patternMatchers: {
        bar: /[a-z]/,
      },
    })

    const route1 = Object.assign(route, { patternMatchers: {}, pattern: 'foo/:id?' })

    store.add('foo/:bar', route)
    store.add('foo/:id', route1)

    const matchedRoute = store.find('foo', 'GET')
    assert.deepEqual(matchedRoute, routeToStoreRoute(route1, 'GET'))
  })

  test('return null when method mis-match', (assert) => {
    const store = new RouteStore()

    const route = makeRoute({})
    store.add('foo/:bar', route)

    const matchedRoute = store.find('foo/1', 'HEAD')
    assert.isNull(matchedRoute)
  })

  test('return null when domain mis-match', (assert) => {
    const store = new RouteStore()

    const route = makeRoute({})
    store.add('foo/:bar', route)

    const matchedRoute = store.find('foo/1', 'GET', 'blog.adonisjs.com')
    assert.isNull(matchedRoute)
  })

  test('match real world routes', (assert) => {
    const store = new RouteStore()

    const routes = [
      {
        pattern: 'posts',
        patternMatchers: {},
      },
      {
        pattern: 'posts/:id',
        patternMatchers: {
          id: /[0-9]+/,
        },
      },
      {
        pattern: 'posts/create',
        patternMatchers: {},
      },
      {
        pattern: 'posts/:slug',
        patternMatchers: {
          id: /[a-z]+/,
        },
      },
      {
        pattern: 'posts/:id/comments',
        patternMatchers: {
          id: /[0-9]+/,
        },
      },
    ].map((route: IRouteJSON) => makeRoute(route))

    const matches = [
      {
        url: '/posts',
        matchIndex: 0,
        params: {},
      },
      {
        url: '/posts/create',
        matchIndex: 2,
        params: {},
      },
      {
        url: '/posts/10',
        matchIndex: 1,
        params: {
          id: '10',
        },
      },
      {
        url: '/posts/hello',
        matchIndex: 3,
        params: {
          slug: 'hello',
        },
      },
      {
        url: '/posts/1/comments',
        matchIndex: 4,
        params: {
          id: '1',
        },
      },
      {
        url: '/posts/hello/comments',
        matchIndex: -1,
      },
    ]

    assert.plan(matches.length)

    routes.forEach((route) => (store.add(route.pattern, route)))

    matches.forEach(({ url, matchIndex }) => {
      const match = store.find(url, 'GET')!
      if (matchIndex > -1) {
        assert.deepEqual(match, routeToStoreRoute(routes[matchIndex], 'GET', match.params))
      } else {
        assert.isNull(match)
      }
    })
  })
})

test.group('RouteStore | Make', () => {
  test('make path to static url', (assert) => {
    const store = new RouteStore()

    const route = makeRoute({ pattern: 'about' })
    store.add('about', route)

    assert.equal(store.make('about', {}), 'about')
  })

  test('make path for a specific domain', (assert) => {
    const store = new RouteStore()

    const route = makeRoute({ pattern: 'about' })
    const route1 = makeRoute({ pattern: 'about', domain: 'blog.adonisjs.com' })
    store.add('about', route)
    store.add('about', route1)

    assert.equal(store.make('about', {}, 'blog.adonisjs.com'), '//blog.adonisjs.com/about')
  })

  test('make path to a route with params', (assert) => {
    const store = new RouteStore()

    const route = makeRoute({ pattern: 'user/:id' })
    store.add('getUser', route)

    assert.equal(store.make('user/:id', { id: 1 }), 'user/1')
  })

  test('make path to a route with multiple params', (assert) => {
    const store = new RouteStore()

    const route = makeRoute({ pattern: 'user/:id/:name' })
    store.add('getUser', route)

    assert.equal(store.make('user/:id/:name', { id: 1, name: 'virk' }), 'user/1/virk')
  })

  test('raise error when param is not defined', (assert) => {
    const store = new RouteStore()

    const route = makeRoute({ pattern: 'user/:id/:name' })
    store.add('getUser', route)

    const fn = () => store.make('user/:id/:name', { id: 1 })
    assert.throw(fn, 'E_MISSING_URL_PARAM: name param is required to make url for user/:id/:name route')
  })

  test('work fine when missing param value is optional', (assert) => {
    const store = new RouteStore()

    const route = makeRoute({ pattern: 'user/:id/:name?' })
    store.add('getUser', route)

    assert.equal(store.make('user/:id/:name?', { id: 1 }), 'user/1')
  })

  test('throw error when missing incremental optional param', (assert) => {
    const store = new RouteStore()

    const route = makeRoute({ pattern: 'user/:id?/:name?' })
    store.add('getUser', route)

    const fn = () => store.make('user/:id?/:name?', { name: 'virk' })
    assert.throw(fn, 'E_CANNOT_JUMP_PARAM: id param is required to make url for user/:id?/:name? route')
  })

  test('return null when route not found', (assert) => {
    const store = new RouteStore()

    const route = makeRoute({ pattern: 'user/:id' })
    store.add('getUser', route)

    assert.isNull(store.make('user', {}))
  })
})
