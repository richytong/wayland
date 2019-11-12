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

const sanitizeProtoDef = _.sflow(_.split('_'), _.get(1), _.toLowerCase)

const fieldToDocType = _.sflow(
  x => ({
    type: sanitizeProtoDef(x.type),
    label: sanitizeProtoDef(x.label),
  }),
  x => x.label === 'repeated' ? [x.type] : x.type,
)

const protoToDoc = proto => {
  console.log(proto)
  const doc = { services: {}, messages: {} }
  const messageRefs = []
  for (const n in proto) {
    console.log('n', n, Object.keys(proto[n]))
    if (proto[n].service) {
      doc.services[n] = true
    }
    if (proto[n].type) {
      doc.messages[n] = {}
      for (const field of proto[n].type.field) {
        if (sanitizeProtoDef(field.type) === 'message') {
          messageRefs.push([n, field])
        } else {
          doc.messages[n][field.name] = fieldToDocType(field)
        }
      }
      for (const type of proto[n].type.nestedType) {
        doc.messages[n][type.name] = {}
        for (const field of type.field) {
          if (sanitizeProtoDef(field.type) === 'message') {
            messageRefs.push([n, field])
          } else {
            doc.messages[n][type.name][field.name] = fieldToDocType(field)
          }
        }
      }
      // console.log('field', proto[n].type.field)
      // console.log('nested type', proto[n].type.nestedType)
      // console.log('enum type', proto[n].type.enumType)
    }
  }
  for (const [n, field] of messageRefs) {
    const msg = { ...doc.messages[field.typeName], __ref: field.typeName }
    doc.messages[n][field.name] = (
      sanitizeProtoDef(field.label) === 'repeated' ? [msg] : msg
    )
  }
  return doc
}

wayland.makeApp = _.sflow(
  _.pick(['protopath', 'services', 'host', 'port']),
  x => ({ ...x, proto: loadProto(x.protopath) }),
  x => ({ ...x,
    server: _.sflow(_.pick(['proto', 'services']), makeServer)(x),
    doc: _.sflow(_.get('proto'), protoToDoc)(x),
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
