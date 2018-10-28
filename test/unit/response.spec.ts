/*
* adonis-framework
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

import * as test from 'japa'
import * as supertest from 'supertest'
import { join } from 'path'
import { createReadStream, stat } from 'fs-extra'
import * as etag from 'etag'

import { Response } from '../../src/Response'
import { Request } from '../../src/Request'
import {
  httpServer,
  fakeConfig,
  createFile,
  appRoot,
  removeFile,
  removeAppRoot,
} from '../../test-utils/index'

test.group('Response', (group) => {
  group.after(async () => {
    await removeAppRoot()
  })

  test('set http response headers', async () => {
    const server = httpServer((req, res) => {
      const config = fakeConfig()
      const request = new Request(req, res, config)
      const response = new Response(request, res, config)

      response.header('status', 200)
      response.header('content-type', 'application/json')
      res.end()
    })

    await supertest(server).get('/').expect(200).expect('Content-Type', 'application/json')
  })

  test('get recently set headers', async (assert) => {
    const server = httpServer((req, res) => {
      const config = fakeConfig()
      const request = new Request(req, res, config)
      const response = new Response(request, res, config)

      response.header('status', 200)
      response.header('content-type', 'application/json')
      res.end(JSON.stringify({ contentType: response.getHeader('Content-Type') }))
    })

    const { body } = await supertest(server).get('/').expect(200).expect('Content-Type', 'application/json')
    assert.deepEqual(body, {
      contentType: 'application/json',
    })
  })

  test('append header to existing header', async (assert) => {
    const server = httpServer((req, res) => {
      const config = fakeConfig()
      const request = new Request(req, res, config)
      const response = new Response(request, res, config)

      response.header('set-cookie', 'username=virk')
      response.append('set-cookie', 'age=22')
      res.end()
    })

    const { headers } = await supertest(server).get('/')
    assert.deepEqual(headers['set-cookie'], ['username=virk', 'age=22'])
  })

  test('do not set header when value is non-existy', async (assert) => {
    const server = httpServer((req, res) => {
      const config = fakeConfig()
      const request = new Request(req, res, config)
      const response = new Response(request, res, config)

      response.header('set-cookie', '')
      res.end()
    })

    const { headers } = await supertest(server).get('/')
    assert.isUndefined(headers['set-cookie'])
  })

  test('do not set header when already exists', async () => {
    const server = httpServer((req, res) => {
      const config = fakeConfig()
      const request = new Request(req, res, config)
      const response = new Response(request, res, config)

      response.header('content-type', 'application/json')
      response.safeHeader('content-type', 'text/html')
      res.end()
    })

    await supertest(server).get('/').expect('content-type', 'application/json')
  })

  test('remove existing response header', async (assert) => {
    const server = httpServer((req, res) => {
      const config = fakeConfig()
      const request = new Request(req, res, config)
      const response = new Response(request, res, config)

      response.header('content-type', 'application/json')
      response.removeHeader('content-type')
      res.end()
    })

    const { headers } = await supertest(server).get('/')
    assert.notProperty(headers, 'content-type')
  })

  test('set HTTP status', async () => {
    const server = httpServer((req, res) => {
      const config = fakeConfig()
      const request = new Request(req, res, config)
      const response = new Response(request, res, config)

      response.status(201)
      res.end()
    })

    await supertest(server).get('/').expect(201)
  })

  test('parse buffer and return correct response header', async () => {
    const server = httpServer((req, res) => {
      const config = fakeConfig()
      const request = new Request(req, res, config)
      const response = new Response(request, res, config)
      const { type, body } = response.buildResponseBody(Buffer.from('hello'))
      response.header('content-type', type)
      res.write(body)
      res.end()
    })

    await supertest(server).get('/').expect('content-type', 'application/octet-stream')
  })

  test('parse string and return correct response header', async (assert) => {
    const server = httpServer((req, res) => {
      const config = fakeConfig()
      const request = new Request(req, res, config)
      const response = new Response(request, res, config)
      const { type, body } = response.buildResponseBody('hello')
      response.header('content-type', type)
      res.write(body)
      res.end()
    })

    const { text } = await supertest(server).get('/').expect('content-type', 'text/plain')
    assert.equal(text, 'hello')
  })

  test('parse HTML string and return correct response header', async (assert) => {
    const server = httpServer((req, res) => {
      const config = fakeConfig()
      const request = new Request(req, res, config)
      const response = new Response(request, res, config)
      const { type, body } = response.buildResponseBody('<p> hello </p>')
      response.header('content-type', type)
      res.write(body)
      res.end()
    })

    const { text } = await supertest(server).get('/').expect('content-type', 'text/html')
    assert.equal(text, '<p> hello </p>')
  })

  test('parse array and set correct response type', async (assert) => {
    const server = httpServer((req, res) => {
      const config = fakeConfig()
      const request = new Request(req, res, config)
      const response = new Response(request, res, config)
      const { type, body } = response.buildResponseBody([1, 2])
      response.header('content-type', type)
      res.write(body)
      res.end()
    })

    const { body } = await supertest(server).get('/').expect('content-type', 'application/json')
    assert.deepEqual(body, [1, 2])
  })

  test('parse object and set correct response type', async (assert) => {
    const server = httpServer((req, res) => {
      const config = fakeConfig()
      const request = new Request(req, res, config)
      const response = new Response(request, res, config)
      const { type, body } = response.buildResponseBody({ username: 'virk' })
      response.header('content-type', type)
      res.write(body)
      res.end()
    })

    const { body } = await supertest(server).get('/').expect('content-type', 'application/json')
    assert.deepEqual(body, { username: 'virk' })
  })

  test('return content type as null for empty string', async (assert) => {
    const server = httpServer((req, res) => {
      const config = fakeConfig()
      const request = new Request(req, res, config)
      const response = new Response(request, res, config)
      const { type } = response.buildResponseBody('')
      res.write(type)
      res.end()
    })

    const { text } = await supertest(server).get('/')
    assert.deepEqual(text, 'null')
  })

  test('return content type as null for null', async (assert) => {
    const server = httpServer((req, res) => {
      const config = fakeConfig()
      const request = new Request(req, res, config)
      const response = new Response(request, res, config)
      const { type } = response.buildResponseBody(null)
      res.write(type)
      res.end()
    })

    const { text } = await supertest(server).get('/')
    assert.deepEqual(text, 'null')
  })

  test('do not write send body and headers unless finish is called explicitly', async (assert) => {
    const server = httpServer((req, res) => {
      const config = fakeConfig()
      const request = new Request(req, res, config)
      const response = new Response(request, res, config)
      response.send({ username: 'virk' })
      res.write('hello')
      res.end()
    })

    const { text } = await supertest(server).get('/')
    assert.equal(text, 'hello')
  })

  test('write send body and headers when finish is called explicitly', async (assert) => {
    const server = httpServer((req, res) => {
      const config = fakeConfig()
      const request = new Request(req, res, config)
      const response = new Response(request, res, config)
      response.send({ username: 'virk' })
      response.finish()
    })

    const { body } = await supertest(server)
      .get('/')
      .expect('content-type', 'application/json; charset=utf-8')
      .expect('content-length', '19')

    assert.deepEqual(body, { username: 'virk' })
  })

  test('write send body when implicit end is off', async (assert) => {
    const server = httpServer((req, res) => {
      const config = fakeConfig()
      const request = new Request(req, res, config)
      const response = new Response(request, res, config)
      response.implicitEnd = false
      response.send({ username: 'virk' })
    })

    const { body } = await supertest(server)
      .get('/')
      .expect('content-type', 'application/json; charset=utf-8')
      .expect('content-length', '19')

    assert.deepEqual(body, { username: 'virk' })
  })

  test('do not write response twice if finish is called twice', async (assert) => {
    const server = httpServer((req, res) => {
      const config = fakeConfig()
      const request = new Request(req, res, config)
      const response = new Response(request, res, config)
      response.json({ username: 'virk' })
      response.finish()
      response.finish()
    })

    const { body } = await supertest(server)
      .get('/')
      .expect('content-type', 'application/json; charset=utf-8')
      .expect('content-length', '19')

    assert.deepEqual(body, { username: 'virk' })
  })

  test('hasLazyBody must true after send has been called', async (assert) => {
    const server = httpServer((req, res) => {
      const config = fakeConfig()
      const request = new Request(req, res, config)
      const response = new Response(request, res, config)
      response.json({ username: 'virk' })
      res.end(String(response.hasLazyBody))
    })

    const { text } = await supertest(server).get('/')
    assert.equal(text, 'true')
  })

  test('write jsonp response', async (assert) => {
    const server = httpServer((req, res) => {
      const config = fakeConfig()
      const request = new Request(req, res, config)
      const response = new Response(request, res, config)
      response.jsonp({ username: 'virk' })
      response.finish()
    })

    const { text } = await supertest(server).get('/')

    const body = { username: 'virk' }
    assert.equal(text, `/**/ typeof callback === 'function' && callback(${JSON.stringify(body)});`)
  })

  test('write jsonp response immediately when implicitEnd is false', async (assert) => {
    const server = httpServer((req, res) => {
      const config = fakeConfig()
      const request = new Request(req, res, config)
      const response = new Response(request, res, config)
      response.implicitEnd = false
      response.jsonp({ username: 'virk' })
    })

    const { text } = await supertest(server).get('/')

    const body = { username: 'virk' }
    assert.equal(text, `/**/ typeof callback === 'function' && callback(${JSON.stringify(body)});`)
  })

  test('use request input as callback name', async (assert) => {
    const server = httpServer((req, res) => {
      const config = fakeConfig()
      const request = new Request(req, res, config)
      const response = new Response(request, res, config)
      response.jsonp({ username: 'virk' })
      response.finish()
    })

    const { text } = await supertest(server).get('/?callback=cb')

    const body = { username: 'virk' }
    assert.equal(text, `/**/ typeof cb === 'function' && cb(${JSON.stringify(body)});`)
  })

  test('use explicit value as callback name', async (assert) => {
    const server = httpServer((req, res) => {
      const config = fakeConfig()
      const request = new Request(req, res, config)
      const response = new Response(request, res, config)
      response.jsonp({ username: 'virk' }, 'fn')
      response.finish()
    })

    const { text } = await supertest(server).get('/?callback=cb')

    const body = { username: 'virk' }
    assert.equal(text, `/**/ typeof fn === 'function' && fn(${JSON.stringify(body)});`)
  })

  test('use config value when explicit value is not defined and their is no query string', async (assert) => {
    const server = httpServer((req, res) => {
      const config = fakeConfig()
      config.set('app.http.jsonpCallback', 'cb')
      const request = new Request(req, res, config)
      const response = new Response(request, res, config)
      response.jsonp({ username: 'virk' })
      response.finish()
    })

    const { text } = await supertest(server).get('/')

    const body = { username: 'virk' }
    assert.equal(text, `/**/ typeof cb === 'function' && cb(${JSON.stringify(body)});`)
  })

  test('stream response', async (assert) => {
    /**
     * Setup
     */
    await createFile('hello.txt', 'hello world')

    const server = httpServer((req, res) => {
      const config = fakeConfig()
      config.set('app.http.jsonpCallback', 'cb')
      const request = new Request(req, res, config)
      const response = new Response(request, res, config)
      response.stream(createReadStream(join(appRoot(), 'hello.txt')), true)
    })

    const { text } = await supertest(server).get('/')
    assert.equal(text, 'hello world')

    /**
     * Cleanup
     */
    await removeFile('hello.txt')
  })

  test('should not hit the maxListeners when making more than 10 calls', async () => {
    /**
     * Setup
     */
    await createFile('hello.txt', 'hello world')

    const server = httpServer((req, res) => {
      const config = fakeConfig()
      config.set('app.http.jsonpCallback', 'cb')
      const request = new Request(req, res, config)
      const response = new Response(request, res, config)
      response.stream(createReadStream(join(appRoot(), 'hello.txt')), true)
    })

    const requests = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13].map(() => supertest(server).get('/').expect(200))
    await Promise.all(requests)

    await removeFile('hello.txt')
  })

  test('should not hit the maxListeners when making more than 10 calls with errors', async () => {
    const server = httpServer((req, res) => {
      const config = fakeConfig()
      config.set('app.http.jsonpCallback', 'cb')
      const request = new Request(req, res, config)
      const response = new Response(request, res, config)
      response
        .stream(createReadStream(join(appRoot(), 'hello.txt')), true)
        .catch((error) => {
          res.end(error.message)
        })
    })

    const requests = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13].map(() => supertest(server).get('/'))
    await Promise.all(requests)
  })

  test('raise error when stream raises one', async (assert) => {
    const server = httpServer((req, res) => {
      const config = fakeConfig()
      config.set('app.http.jsonpCallback', 'cb')
      const request = new Request(req, res, config)
      const response = new Response(request, res, config)
      response
        .stream(createReadStream(join(appRoot(), 'hello.txt')), true)
        .catch((error) => {
          res.end(error.code)
        })
    })

    const { text } = await supertest(server).get('/')
    assert.equal(text, 'ENOENT')
  })

  test('send stream errors vs raising them', async (assert) => {
    const server = httpServer((req, res) => {
      const config = fakeConfig()
      config.set('app.http.jsonpCallback', 'cb')
      const request = new Request(req, res, config)
      const response = new Response(request, res, config)
      response.stream(createReadStream(join(appRoot(), 'hello.txt')))
    })

    const { text } = await supertest(server).get('/')
    assert.equal(text, 'File not found')
  })

  test('download file with correct content type', async (assert) => {
    // Setup
    await createFile('hello.html', '<p> hello world </p>')

    const server = httpServer((req, res) => {
      const config = fakeConfig()
      config.set('app.http.jsonpCallback', 'cb')
      const request = new Request(req, res, config)
      const response = new Response(request, res, config)
      response.download(join(appRoot(), 'hello.html'))
    })

    const { text } = await supertest(server)
      .get('/')
      .expect('Content-type', 'text/html; charset=utf-8')
      .expect('Content-length', '20')

    assert.equal(text, '<p> hello world </p>')

    // Cleanup
    await removeFile('hello.html')
  })

  test('write errors as response when downloading folder', async (assert) => {
    const server = httpServer((req, res) => {
      const config = fakeConfig()
      config.set('app.http.jsonpCallback', 'cb')
      const request = new Request(req, res, config)
      const response = new Response(request, res, config)
      response.download(join(appRoot()))
    })

    const { text } = await supertest(server).get('/').expect(404)
    assert.equal(text, 'Cannot process file')
  })

  test('write errors as response when file is missing', async (assert) => {
    const server = httpServer((req, res) => {
      const config = fakeConfig()
      config.set('app.http.jsonpCallback', 'cb')
      const request = new Request(req, res, config)
      const response = new Response(request, res, config)
      response.download(join(appRoot(), 'hello.html'))
    })

    const { text } = await supertest(server).get('/').expect(404)
    assert.equal(text, 'Cannot process file')
  })

  test('do not stream file on HEAD calls', async (assert) => {
    // Setup
    await createFile('hello.html', '<p> hello world </p>')

    const server = httpServer((req, res) => {
      const config = fakeConfig()
      config.set('app.http.jsonpCallback', 'cb')
      const request = new Request(req, res, config)
      const response = new Response(request, res, config)
      response.download(join(appRoot(), 'hello.html'))
    })

    const { text } = await supertest(server).head('/').expect(200)
    assert.isUndefined(text)

    // Cleanup
    await removeFile('hello.html')
  })

  test('do not stream file when cache is fresh', async (assert) => {
    // Setup
    await createFile('hello.html', '<p> hello world </p>')

    const server = httpServer((req, res) => {
      const config = fakeConfig()
      config.set('app.http.jsonpCallback', 'cb')
      const request = new Request(req, res, config)
      const response = new Response(request, res, config)
      response.download(join(appRoot(), 'hello.html'), true)
    })

    const stats = await stat(join(appRoot(), 'hello.html'))

    const { text } = await supertest(server)
      .get('/')
      .set('if-none-match', etag(stats, { weak: true }))
      .expect(304)

    assert.equal(text, '')

    // Cleanup
    await removeFile('hello.html')
  })

  test('set HTTP status to 304 when cache is fresh and request is HEAD', async (assert) => {
    // Setup
    await createFile('hello.html', '<p> hello world </p>')

    const server = httpServer((req, res) => {
      const config = fakeConfig()
      config.set('app.http.jsonpCallback', 'cb')
      const request = new Request(req, res, config)
      const response = new Response(request, res, config)
      response.download(join(appRoot(), 'hello.html'), true)
    })

    const stats = await stat(join(appRoot(), 'hello.html'))

    const { text } = await supertest(server)
      .head('/')
      .set('if-none-match', etag(stats, { weak: true }))
      .expect(304)

    assert.isUndefined(text)

    // Cleanup
    await removeFile('hello.html')
  })

  test('download file with correct content disposition', async (assert) => {
    // Setup
    await createFile('hello.html', '<p> hello world </p>')

    const server = httpServer((req, res) => {
      const config = fakeConfig()
      config.set('app.http.jsonpCallback', 'cb')
      const request = new Request(req, res, config)
      const response = new Response(request, res, config)
      response.attachment(join(appRoot(), 'hello.html'))
    })

    const { text } = await supertest(server)
      .get('/')
      .expect('Content-type', 'text/html; charset=utf-8')
      .expect('Content-length', '20')
      .expect('Content-Disposition', 'attachment; filename="hello.html"')

    assert.equal(text, '<p> hello world </p>')

    // Cleanup
    await removeFile('hello.html')
  })

  test('download file with custom file name', async (assert) => {
    // Setup
    await createFile('hello.html', '<p> hello world </p>')

    const server = httpServer((req, res) => {
      const config = fakeConfig()
      config.set('app.http.jsonpCallback', 'cb')
      const request = new Request(req, res, config)
      const response = new Response(request, res, config)
      response.attachment(join(appRoot(), 'hello.html'), 'ooo.html')
    })

    const { text } = await supertest(server)
      .get('/')
      .expect('Content-type', 'text/html; charset=utf-8')
      .expect('Content-length', '20')
      .expect('Content-Disposition', 'attachment; filename="ooo.html"')

    assert.equal(text, '<p> hello world </p>')

    // Cleanup
    await removeFile('hello.html')
  })

  test('download file with custom disposition', async (assert) => {
    // Setup
    await createFile('hello.html', '<p> hello world </p>')

    const server = httpServer((req, res) => {
      const config = fakeConfig()
      config.set('app.http.jsonpCallback', 'cb')
      const request = new Request(req, res, config)
      const response = new Response(request, res, config)
      response.attachment(join(appRoot(), 'hello.html'), 'ooo.html', 'inline')
    })

    const { text } = await supertest(server)
      .get('/')
      .expect('Content-type', 'text/html; charset=utf-8')
      .expect('Content-length', '20')
      .expect('Content-Disposition', 'inline; filename="ooo.html"')

    assert.equal(text, '<p> hello world </p>')

    // Cleanup
    await removeFile('hello.html')
  })

  test('redirect to given url', async (assert) => {
    const server = httpServer((req, res) => {
      const config = fakeConfig()
      config.set('app.http.jsonpCallback', 'cb')
      const request = new Request(req, res, config)
      const response = new Response(request, res, config)
      response.redirect('/foo')
    })

    const { headers } = await supertest(server).get('/').redirects(1)
    assert.equal(headers.location, '/foo')
  })

  test('redirect to given url with query string', async (assert) => {
    const server = httpServer((req, res) => {
      const config = fakeConfig()
      config.set('app.http.jsonpCallback', 'cb')
      const request = new Request(req, res, config)
      const response = new Response(request, res, config)
      response.redirect('/foo', true)
    })

    const { headers } = await supertest(server).get('/?username=virk').redirects(1)
    assert.equal(headers.location, '/foo?username=virk')
  })

  test('redirect to given url and set custom statusCode', async () => {
    const server = httpServer((req, res) => {
      const config = fakeConfig()
      config.set('app.http.jsonpCallback', 'cb')
      const request = new Request(req, res, config)
      const response = new Response(request, res, config)
      response.redirect('/foo', false, 301)
    })

    await supertest(server).get('/').redirects(1).expect(301)
  })

  test('add multiple vary fields', async () => {
    const server = httpServer((req, res) => {
      const config = fakeConfig()
      const request = new Request(req, res, config)
      const response = new Response(request, res, config)
      response.vary('Origin')
      response.vary('Set-Cookie')
      res.end()
    })

    await supertest(server).get('/').expect('Vary', 'Origin, Set-Cookie')
  })

  test('set status code to 204 when body is empty', async () => {
    const server = httpServer((req, res) => {
      const config = fakeConfig()
      const request = new Request(req, res, config)
      const response = new Response(request, res, config)
      response.send('')
      response.finish()
    })

    await supertest(server).get('/').expect(204)
  })

  test('remove previously set content headers when status code is 304', async (assert) => {
    const server = httpServer((req, res) => {
      const config = fakeConfig()
      const request = new Request(req, res, config)
      const response = new Response(request, res, config)
      response.header('Content-type', 'application/json')
      response.status(204)
      response.send({ username: 'virk' })
      response.finish()
    })

    const { headers } = await supertest(server).get('/').expect(204)
    assert.isUndefined(headers['content-type'])
  })

  test('generate etag when set to true', async () => {
    const server = httpServer((req, res) => {
      const config = fakeConfig()
      config.set('app.http.etag', true)
      const request = new Request(req, res, config)
      const response = new Response(request, res, config)
      response.send({ username: 'virk' })
      response.finish()
    })

    const responseEtag = etag(JSON.stringify({ username: 'virk' }))
    await supertest(server).get('/').expect('Etag', responseEtag)
  })

  test('convert number to string when sending as response', async (assert) => {
    const server = httpServer((req, res) => {
      const config = fakeConfig()
      config.set('app.http.etag', true)
      const request = new Request(req, res, config)
      const response = new Response(request, res, config)
      response.send(22)
      response.finish()
    })

    const { text } = await supertest(server).get('/')
    assert.equal(text, '22')
  })

  test('convert boolean to string when sending as response', async (assert) => {
    const server = httpServer((req, res) => {
      const config = fakeConfig()
      config.set('app.http.etag', true)
      const request = new Request(req, res, config)
      const response = new Response(request, res, config)
      response.send(true)
      response.finish()
    })

    const { text } = await supertest(server).get('/')
    assert.equal(text, 'true')
  })

  test('raise error when return type is not valid', async (assert) => {
    const server = httpServer((req, res) => {
      const config = fakeConfig()
      config.set('app.http.etag', true)
      const request = new Request(req, res, config)
      const response = new Response(request, res, config)
      response.send(function foo () {})
      try {
        response.finish()
      } catch (error) {
        res.write(error.message)
        res.end()
      }
    })

    const { text } = await supertest(server).get('/')
    assert.equal(text, 'Cannot send function as HTTP response')
  })

  test('convert serializable objects to JSON representation', async (assert) => {
    class User {
      public toJSON () {
        return {
          username: 'virk'
        }
      }
    }

    const server = httpServer((req, res) => {
      const config = fakeConfig()
      config.set('app.http.etag', true)
      const request = new Request(req, res, config)
      const response = new Response(request, res, config)
      response.send(new User())
      response.finish()
    })

    const { body } = await supertest(server).get('/')
    assert.deepEqual(body, { username: 'virk' })
  })

  test('send response as 200 when request method is HEAD and cache is not fresh', async (assert) => {
    // Setup
    await createFile('hello.html', '<p> hello world </p>')

    const server = httpServer((req, res) => {
      const config = fakeConfig()
      config.set('app.http.jsonpCallback', 'cb')
      const request = new Request(req, res, config)
      const response = new Response(request, res, config)
      response.download(join(appRoot(), 'hello.html'), true)
    })

    const { text } = await supertest(server)
      .head('/')
      .set('if-none-match', 'hello')
      .expect(200)

    assert.isUndefined(text)

    // Cleanup
    await removeFile('hello.html')
  })

  test('stream the file when request method is GET and cache is not fresh', async (assert) => {
    // Setup
    await createFile('hello.html', '<p> hello world </p>')

    const server = httpServer((req, res) => {
      const config = fakeConfig()
      config.set('app.http.jsonpCallback', 'cb')
      const request = new Request(req, res, config)
      const response = new Response(request, res, config)
      response.download(join(appRoot(), 'hello.html'), true)
    })

    const { text } = await supertest(server)
      .get('/')
      .set('if-none-match', 'hello')
      .expect(200)

    assert.equal(text, '<p> hello world </p>')

    // Cleanup
    await removeFile('hello.html')
  })
})
