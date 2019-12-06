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

module.exports = _.sflow(
  _.pick(['protopath', 'services', 'host', 'port', 'name']),
  x => ({ ...x,
    name: x.name || 'server',
    host: x.host || 'localhost',
    port: x.port || 3000,
    credentials: grpc.ServerCredentials.createInsecure(),
  }),
  x => ({ ...x, proto: loadProto(x.protopath) }),
  x => ({ ...x,
    server: _.sflow(_.pick(['proto', 'services']), makeServer)(x),
  }),
  x => ({ ...x,
    start: _.sflow(
      y => ({ ...x, ...y }),
      ({ name, host, port, credentials }) => {
        console.log(`${name} running at ${host}:${port}`)
        x.server.bind(`${host}:${port}`, credentials)
        x.server.start()
      },
    ),
    makeClient: _.sflow(
      y => ({ ...x, ...y, }),
      ({ service, host, port,
        clientCredentials = grpc.credentials.createInsecure(),
      } = {}) => new x.proto[service](`${host}:${port}`, clientCredentials),
    ),
  }),
)
