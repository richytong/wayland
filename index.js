const _ = require('rubico')
const grpc = require('grpc')
const protoLoader = require('@grpc/proto-loader')
const uuidv4 = require('uuid/v4')

const wayland = {}

const loadProto = _.syncFlow(protoLoader.loadSync, grpc.loadPackageDefinition)

const makeServer = proto => services => {
  const server = new grpc.Server()
  for (k in services) server.addService(proto[k].service, services[k])
  return server
}

wayland.makeApp = _.syncFlow(
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

wayland.makeClient = _.syncFlow(
  x => ({ ...x, proto: loadProto(x.protopath) }),
  x => new x.proto[x.service](
    `${x.host || 'localhost'}:${x.port || 3000}`,
    x.credentials || grpc.credentials.createInsecure(),
  ),
)

module.exports = wayland
