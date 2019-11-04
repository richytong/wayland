# wayland
Wayland the Smith is a legendary master blacksmith, described by Jessie Weston as "the weird and malicious craftsman, Weyland"

wayland the module creates protobuf apps and client libraries with gRPC

# Usage
```javascript
const wayland = require('wayland')

const app = wayland.makeApp({
  host: 'localhost',
  port: 3000,
  protopath: 'hello.proto',
  services: {
    HelloService: {
      greet: (_, cb) => cb(null, { text: 'hello' })
    },
  },
})

app.start() // > Server running at localhost:3000
// or overwite the host, port, or app name
app.start({
  name: 'welund',
  host: '127.0.0.1',
  port: 3001,
}) // > welund running at 127.0.0.1:3001

const client = wayland.makeClient({
  host: 'localhost',
  port: 3000,
  protopath: 'hello.proto',
  service: 'HelloService',
})

client.greet({}, (err, greeting) => {
  // => ({ text: 'hello' })
})
```
