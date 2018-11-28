/*
* @adonisjs/framework
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

import * as test from 'japa'
import { Ioc } from '@adonisjs/fold'

import { Ignitor } from '../../src/Ignitor'
import { appRoot, getDefaultDirectories } from '../../test-utils'

test.group('Ignitor', () => {
  test('add app directory to directories map', (assert) => {
    const ioc = new Ioc()
    const ignitor = new Ignitor(appRoot(), ioc)
    ignitor.addAppDirectory('validators', 'Validators')

    assert.deepEqual(ignitor.directories, getDefaultDirectories({
      app: {
        validators: 'Validators',
      },
    }))
  })

  test('add top level directory to directories map', (assert) => {
    const ioc = new Ioc()
    const ignitor = new Ignitor(appRoot(), ioc)
    ignitor.addTopLevelDirectory('tmp', 'storage')

    assert.deepEqual(ignitor.directories, getDefaultDirectories({
      tmp: 'storage',
    }))
  })

  test('add a file to be preloaded', (assert) => {
    const ioc = new Ioc()
    const ignitor = new Ignitor(appRoot(), ioc)
    ignitor.preload('start/routes.js', false)

    assert.deepEqual(ignitor['_preloads'], [{ filePath: 'start/routes.js', optional: false }])
  })

  test('define callback for a file to be preloaded', (assert) => {
    const ioc = new Ioc()
    const ignitor = new Ignitor(appRoot(), ioc)
    const callback = function cb () {}

    ignitor.onPreload('start/routes.js', callback)

    assert.deepEqual(ignitor['_preloadHooks'], {
      'start/routes.js': [callback],
    })
  })
})
