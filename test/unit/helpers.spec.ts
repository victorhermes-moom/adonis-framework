/*
* @adonisjs/framework
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

import * as test from 'japa'
import { join } from 'path'
import { Ioc } from '@adonisjs/fold'

import { Helpers } from '../../src/Helpers'
import { appRoot } from '../../test-utils'

const DIRECTORIES = {
  httpControllers: 'Controllers/Http',
}

test.group('Helpers', () => {
  test('make namespace to a conventional directory', (assert) => {
    const ioc = new Ioc()
    ioc.autoload(join(appRoot(), 'app'), 'App')
    const helpers = new Helpers(ioc, DIRECTORIES)
    assert.equal(helpers.makeNamespace('httpControllers', 'Foo'), 'App/Controllers/Http/Foo')
  })

  test('do not prepend directory path when is an absolute namespace', (assert) => {
    const ioc = new Ioc()
    ioc.autoload(join(appRoot(), 'app'), 'App')
    const helpers = new Helpers(ioc, DIRECTORIES)
    assert.equal(helpers.makeNamespace('httpControllers', '/App/Foo'), 'App/Foo')
  })

  test('raise error when directory is not pre-defined', (assert) => {
    const ioc = new Ioc()
    ioc.autoload(join(appRoot(), 'app'), 'App')
    const helpers = new Helpers(ioc, {})

    const fn = () => helpers.makeNamespace('httpControllers', 'Foo')
    assert.throw(fn, 'Conventional directory for httpControllers is not defined')
  })
})
