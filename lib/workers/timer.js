// HTTP-Pulse a Node App for Monitoring HTTP Servers - Copyright Corey Donohoe <atmos@atmos.org>
var sys          = require("sys"),
    Mongo        = require("mongodb"),
    HttpMonitor  = require("./http").HttpMonitor

var pollFrequency = 60

function runWorkers() {
  Mongo.connect(process.env.MONGOHQ_URL, function(err, database) {
    database.collection('monitors', function(err, collection) {
      var lastInterval = new Date((new Date().getTime() - pollFrequency * 1000))
      collection.find({lastChecked: {'$lt': lastInterval} }, function(err, cursor) {
        cursor.each(function(err, monitor) {
          if(monitor != null) {
            var httpMonitor = new HttpMonitor(monitor.login, monitor.url)
            httpMonitor.poll()
          }
        })
      })
    })
  })
  setTimeout(function () {
    runWorkers()
  }, 30000)
}

exports.setup = runWorkers
