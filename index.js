const _ = require('rubico')
const grpc = require('grpc')
const protoLoader = require('@grpc/proto-loader')

const wayland = {}

const loadProto = _.sflow(protoLoader.loadSync, grpc.loadPackageDefinition)

const makeServer = ({ proto, services }) => {
  const server = new grpc.Server()
  for (k in services) server.addService(
    _.lookup(proto)(`${k}.service`),
    _.lookup(services)(k),
  )
  return server
}

wayland.makeApp = _.sflow(
  _.pick(['protopath', 'services', 'host', 'port', 'name']),
  x => ({ ...x, proto: loadProto(x.protopath) }),
  x => ({ ...x,
    server: _.sflow(_.pick(['proto', 'services']), makeServer)(x),
  }),
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

wayland.makeClient = _.sflow(
  x => ({ ...x, proto: loadProto(x.protopath) }),
  x => new x.proto[x.service](
    `${x.host || 'localhost'}:${x.port || 3000}`,
    x.credentials || grpc.credentials.createInsecure(),
  ),
)

module.exports = wayland
