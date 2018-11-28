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
import { appRoot, getDefaultDirectories } from '../../test-utils'

test.group('Helpers', () => {
  test('make namespace to a conventional directory', (assert) => {
    const ioc = new Ioc()
    ioc.autoload(join(appRoot(), 'app'), 'App')
    const helpers = new Helpers(appRoot(), ioc, getDefaultDirectories({}))
    assert.equal(helpers.makeNamespace('httpControllers', 'Foo'), 'App/Controllers/Http/Foo')
  })

  test('do not prepend directory path when is an absolute namespace', (assert) => {
    const ioc = new Ioc()
    ioc.autoload(join(appRoot(), 'app'), 'App')
    const helpers = new Helpers(appRoot(), ioc, getDefaultDirectories({}))
    assert.equal(helpers.makeNamespace('httpControllers', '/App/Foo'), 'App/Foo')
  })

  test('raise error when directory is not pre-defined', (assert) => {
    const ioc = new Ioc()
    ioc.autoload(join(appRoot(), 'app'), 'App')
    const helpers = new Helpers(appRoot(), ioc, getDefaultDirectories({}))

    const fn = () => helpers.makeNamespace('validators', 'Foo')
    assert.throw(fn, 'Conventional directory for validators is not defined')
  })

  test('make paths to top level directories', (assert) => {
    const ioc = new Ioc()
    ioc.autoload(join(appRoot(), 'app'), 'App')
    const helpers = new Helpers(appRoot(), ioc, getDefaultDirectories({}))

    assert.equal(helpers.appRoot(), appRoot())
    assert.equal(helpers.configPath(), join(appRoot(), 'config'))
    assert.equal(helpers.publicPath(), join(appRoot(), 'public'))
    assert.equal(helpers.databasePath(), join(appRoot(), 'database'))
    assert.equal(helpers.migrationsPath(), join(appRoot(), 'database', 'migrations'))
    assert.equal(helpers.seedsPath(), join(appRoot(), 'database', 'seeds'))
    assert.equal(helpers.tmpPath(), join(appRoot(), 'tmp'))
    assert.equal(
      helpers.viewsPath('partials/header.edge'),
      join(appRoot(), 'resources', 'views', 'partials', 'header.edge'),
    )
  })
})
