// HTTP-Pulse a Node App for Monitoring HTTP - Copyright Corey Donohoe <atmos@atmos.org>

// add the vendored express to the require path
require.paths.unshift("vendor/express/lib")
require.paths.unshift("vendor/node-oauth/lib")
require.paths.unshift("vendor/node-mongodb-native/lib")

// require express and its plugins
require("express")
require("express/plugins")

// handle oauth related setup bullshit
require.paths.unshift("vendor/express-auth/lib")
Object.merge(global, require('express/plugins/auth'))

//require the actual express app
require ("./lib/app")
