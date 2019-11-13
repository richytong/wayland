const _ = require('rubico')
const path = require('path')
const assert = require('assert')
const wayland = require('..')

describe('make-proto-app', () => {
  before(async () => {
    try {
    const app = wayland.makeApp({
      host: 'localhost',
      port: 3000,
      protopath: path.resolve(__dirname, 'hello.proto'),
      services: {
        HelloService: {
          greet: (_, cb) => cb(null, { text: 'hello' })
        },
      },
    })
    app.start()
    } catch (e) {
      console.error(e)
    }
  })

  after(process.exit)

  it('makes a protobuf app', (done) => {
    const client = wayland.makeClient({
      host: 'localhost',
      port: 3000,
      protopath: path.resolve(__dirname, 'hello.proto'),
      service: 'HelloService',
    })
    client.greet({}, (err, greeting) => {
      assert.ifError(err)
      assert.strictEqual(greeting.text, 'hello')
      done()
    })
  })
})
