// HTTP-Pulse a Node App for Monitoring HTTP - Copyright Corey Donohoe <atmos@atmos.org>

// add the vendored express to the require path
require.paths.unshift("vendor/connect/lib")
require.paths.unshift("vendor/connect-auth/lib")
require.paths.unshift("vendor/express/lib")
require.paths.unshift("vendor/haml.js/lib")
require.paths.unshift("vendor/node-oauth/lib")
require.paths.unshift("vendor/node-mongodb-native/lib")

//require the actual express app
var app = require("./lib/app")

app.run()
