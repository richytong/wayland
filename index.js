const _ = require('rubico')
const grpc = require('grpc')
const protoLoader = require('@grpc/proto-loader')
const uuidv4 = require('uuid/v4')

const loadProto = _.syncFlow(protoLoader.loadSync, grpc.loadPackageDefinition)

const makeServer = proto => services => {
  const server = new grpc.Server()
  for (const [k, v] of Object.entries(services)) {
    server.addService(proto[k].service, v)
  }
  return server
}

module.exports = _.syncFlow(
  x => ({ ...x, proto: loadProto(x.protopath) }),
  x => ({ ...x, server: makeServer(x.proto)(x.services) }),
  x => ({ ...x,
    start: (y = {}) => {
      const name = y.name || x.name || 'Server'
      const host = y.host || x.host || 'localhost'
      const port = y.port || x.port || 3000
      const credentials = x.credentials || y.credentials || (
        grpc.ServerCredentials.createInsecure()
      )
      const hello = y.hello || x.hello || (() => {
        console.log(`${name} running at ${host}:${port}`)
      })
      hello()
      x.server.bind(`${host}:${port}`, credentials)
      x.server.start()
    },
  }),
)
