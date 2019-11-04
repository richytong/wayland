const _ = require('rubico')
const grpc = require('grpc')
const protoLoader = require('@grpc/proto-loader')
const uuidv4 = require('uuid/v4')

const loadProto = _.syncFlow(protoLoader.loadSync, grpc.loadPackageDefinition)

const makeClient = _.syncFlow(
  x => ({ ...x, proto: loadProto(x.protopath) }),
  x => new x.proto[x.service](
    `${x.host || 'localhost'}:${x.port || 3000}`,
    x.credentials || grpc.credentials.createInsecure(),
  ),
)

module.exports = makeClient
