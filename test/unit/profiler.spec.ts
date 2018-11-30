/*
* @adonisjs/framework
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

import * as test from 'japa'
import { memoize } from 'lodash'

import { ProfilerManager } from '../../src/Profiler/Manager'
import { fakeConfig } from '../../test-utils'
import { IProfilerRowPacket } from '../../src/Contracts/IProfiler'
import shared from '../../src/Profiler/shared'

test.group('Profiler | Config', (group) => {
  group.afterEach(() => {
    shared.isEnabled.cache = new memoize.Cache()
  })

  test('return false from isEnabled when enabled inside config is set to false', (assert) => {
    const config = fakeConfig()
    config.set('app.profiler', {
      enabled: false,
    })

    assert.isFalse(shared.isEnabled('http request', config.get('app.profiler')))
  })

  test('return true from isEnabled when whitelist is an empty array', (assert) => {
    const config = fakeConfig()
    config.set('app.profiler', {
      enabled: true,
      whitelist: [],
      blacklist: [],
    })

    assert.isTrue(shared.isEnabled('http request', config.get('app.profiler')))
  })

  test('return false when whitelist is an empty array but blacklist has the label', (assert) => {
    const config = fakeConfig()
    config.set('app.profiler', {
      enabled: true,
      whitelist: [],
      blacklist: ['http request'],
    })

    assert.isFalse(shared.isEnabled('http request', config.get('app.profiler')))
  })

  test('return false when whitelist doesn\'t have the label', (assert) => {
    const config = fakeConfig()
    config.set('app.profiler', {
      enabled: true,
      whitelist: ['foo'],
      blacklist: [],
    })

    assert.isFalse(shared.isEnabled('http request', config.get('app.profiler')))
  })

  test('return true when whitelist has the label', (assert) => {
    const config = fakeConfig()
    config.set('app.profiler', {
      enabled: true,
      whitelist: ['http request'],
      blacklist: [],
    })

    assert.isTrue(shared.isEnabled('http request', config.get('app.profiler')))
  })

  test('return true if it\'s in whitelist and black list both', (assert) => {
    const config = fakeConfig()
    config.set('app.profiler', {
      enabled: true,
      whitelist: ['http request'],
      blacklist: ['http request'],
    })

    assert.isTrue(shared.isEnabled('http request', config.get('app.profiler')))
  })
})

test.group('Profiler | profile', (group) => {
  group.afterEach(() => {
    shared.isEnabled.cache = new memoize.Cache()
  })

  test('log new row when new profiler is created', (assert) => {
    assert.plan(5)

    const config = fakeConfig()
    config.set('app.profiler', { whitelist: ['http request'] })

    const profiler = new ProfilerManager(config)

    profiler.subscribe((log: IProfilerRowPacket) => {
      assert.equal(log.label, 'http request')
      assert.equal(log.type, 'row')
      assert.isUndefined(log.parent_id)
      assert.isDefined(log.id)
      assert.equal(log.type, 'row')
    })

    profiler.create('http request').end()
  })

  test('profile actions inside a row', (assert) => {
    const stack: any[] = []

    const config = fakeConfig()
    config.set('app.profiler', { whitelist: ['http request', 'find route'] })

    const profileManager = new ProfilerManager(config)
    profileManager.subscribe((log) => (stack.push(log)))

    const profiler = profileManager.create('http request')
    const action = profiler.profile('find route')
    action.end()
    profiler.end()

    assert.lengthOf(stack, 2)
    assert.equal(stack[0].row_id, stack[1].id)
    assert.equal(stack[0].type, 'action')

    assert.equal(stack[1].type, 'row')
  })

  test('do not profile when label is blacklisted', (assert) => {
    const stack: any[] = []

    const config = fakeConfig()
    config.set('app.profiler', {
      whitelist: ['http request'],
      blacklist: ['find route'],
    })

    const profileManager = new ProfilerManager(config)
    profileManager.subscribe((log) => (stack.push(log)))

    const profiler = profileManager.create('http request')
    const action = profiler.profile('find route')
    action.end()
    profiler.end()

    assert.lengthOf(stack, 1)
    assert.equal(stack[0].type, 'row')
  })

  test('do not log when parent is blacklisted, even if childs are not', (assert) => {
    const stack: any[] = []

    const config = fakeConfig()
    config.set('app.profiler', {
      whitelist: [],
      blacklist: ['http request'],
    })

    const profileManager = new ProfilerManager(config)
    profileManager.subscribe((log) => (stack.push(log)))

    const profiler = profileManager.create('http request')
    const action = profiler.profile('find route')

    action.end()
    profiler.end()

    assert.lengthOf(stack, 0)
  })

  test('log actions with data', (assert) => {
    const stack: any[] = []

    const config = fakeConfig()
    config.set('app.profiler', {
      whitelist: [],
      blacklist: [],
    })

    const profileManager = new ProfilerManager(config)
    profileManager.subscribe((log) => (stack.push(log)))

    const profiler = profileManager.create('http request')
    const action = profiler.profile('find route', { url: '/foo' })

    action.end()
    profiler.end()

    assert.deepEqual(stack[0].data, { url: '/foo' })
  })

  test('merge ending data', (assert) => {
    const stack: any[] = []

    const config = fakeConfig()
    config.set('app.profiler', {
      whitelist: [],
      blacklist: [],
    })

    const profileManager = new ProfilerManager(config)
    profileManager.subscribe((log) => (stack.push(log)))

    const profiler = profileManager.create('http request')
    const action = profiler.profile('find route', { url: '/foo' })

    action.end({ method: 'GET' })
    profiler.end()

    assert.deepEqual(stack[0].data, { url: '/foo', method: 'GET' })
  })

  test('log row with data', (assert) => {
    const stack: any[] = []

    const config = fakeConfig()
    config.set('app.profiler', {
      whitelist: [],
      blacklist: [],
    })

    const profileManager = new ProfilerManager(config)
    profileManager.subscribe((log) => (stack.push(log)))

    const profiler = profileManager.create('http request', { url: '/foo' })
    profiler.end()
    assert.deepEqual(stack[0].data, { url: '/foo' })
  })

  test('merge row data with end data', (assert) => {
    const stack: any[] = []

    const config = fakeConfig()
    config.set('app.profiler', {
      whitelist: [],
      blacklist: [],
    })

    const profileManager = new ProfilerManager(config)
    profileManager.subscribe((log) => (stack.push(log)))

    const profiler = profileManager.create('http request', { url: '/foo' })
    profiler.end({ statusCode: 200 })
    assert.deepEqual(stack[0].data, { url: '/foo', statusCode: 200 })
  })

  test('merge row data with end data when initial data is undefined', (assert) => {
    const stack: any[] = []

    const config = fakeConfig()
    config.set('app.profiler', {
      whitelist: [],
      blacklist: [],
    })

    const profileManager = new ProfilerManager(config)
    profileManager.subscribe((log) => (stack.push(log)))

    const profiler = profileManager.create('http request')
    profiler.end({ statusCode: 200 })
    assert.deepEqual(stack[0].data, { statusCode: 200 })
  })

  test('create child profiler with data', (assert) => {
    const stack: any[] = []

    const config = fakeConfig()
    config.set('app.profiler', {
      whitelist: [],
      blacklist: [],
    })

    const profileManager = new ProfilerManager(config)
    profileManager.subscribe((log) => (stack.push(log)))

    const profiler = profileManager.create('http request')
    const child = profiler.child('controller', { handler: 'AuthController.handle' })
    child.end()
    profiler.end()

    assert.deepEqual(stack[0].data, { handler: 'AuthController.handle' })
  })

  test('create child profiler', (assert) => {
    const stack: any[] = []

    const config = fakeConfig()
    config.set('app.profiler', {
      whitelist: [],
      blacklist: [],
    })

    const profileManager = new ProfilerManager(config)
    profileManager.subscribe((log) => (stack.push(log)))

    const profiler = profileManager.create('http request')
    const child = profiler.child('controller')

    child.end()
    profiler.end()

    assert.lengthOf(stack, 2)
    assert.equal(stack[0].type, 'row')
    assert.equal(stack[0].parent_id, stack[1].id)

    assert.equal(stack[1].type, 'row')
    assert.isUndefined(stack[1].parent_id)
  })

  test('do not create child profiler when is black listed', (assert) => {
    const stack: any[] = []

    const config = fakeConfig()
    config.set('app.profiler', {
      whitelist: [],
      blacklist: ['controller'],
    })

    const profileManager = new ProfilerManager(config)
    profileManager.subscribe((log) => (stack.push(log)))

    const profiler = profileManager.create('http request')
    const child = profiler.child('controller')
    const user = child.profile('fetch:user')

    user.end()
    child.end()
    profiler.end()

    assert.lengthOf(stack, 1)
    assert.equal(stack[0].type, 'row')
    assert.isUndefined(stack[0].parent_id)
  })

  test('do not create child profiler when is top level profiler is blacklisted', (assert) => {
    const stack: any[] = []

    const config = fakeConfig()
    config.set('app.profiler', {
      whitelist: [],
      blacklist: ['http request'],
    })

    const profileManager = new ProfilerManager(config)
    profileManager.subscribe((log) => (stack.push(log)))

    const profiler = profileManager.create('http request')
    const child = profiler.child('controller')
    const user = child.profile('fetch:user')

    user.end()
    child.end()
    profiler.end()

    assert.lengthOf(stack, 0)
  })
})
