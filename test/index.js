const path = require('path')
const assert = require('assert')
const makeProtoApp = require('..')
const makeProtoClient = require('../makeProtoClient')

describe('make-proto-app', () => {
  before(async () => {
    makeProtoApp({
      host: 'localhost',
      port: 3000,
      protopath: path.resolve(__dirname, 'hello.proto'),
      services: {
        HelloService: {
          greet: (_, cb) => cb(null, { text: 'hello' })
        },
      },
    }).start()
  })

  after(process.exit)

  it('makes a protobuf app', (done) => {
    const client = makeProtoClient({
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
