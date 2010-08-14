// HTTP-Pulse a Node App for Monitoring HTTP Servers - Copyright Corey Donohoe <atmos@atmos.org>
var sys    = require("sys"),
    url    = require("url"),
    http   = require("http"),
    Mongo  = require("mongodb")

function HttpMonitor(login, requestUrl) {
  this.uri        = url.parse(requestUrl)
  this.login      = login
  this.client     = http.createClient(this.uri.port||80, this.uri.hostname)
  this.requestUrl = requestUrl
}

exports.HttpMonitor = HttpMonitor

HttpMonitor.prototype.poll = function() {
  var requestUrl   = this.requestUrl,
      requestLogin = this.login

  var request = this.client.request("GET", this.uri.pathname || "/", {"host": this.uri.hostname})
  request.on("response", function (response) {
    Mongo.connect(process.env.MONGOHQ_URL, function(err, database) {
      database.collection('monitors', function(err, collection) {
        var compositeKey = { login: requestLogin, url: requestUrl }
        var newValues    = { lastChecked: new Date(), httpStatus: response.statusCode }

        if(response.statusCode == 200)
          newValues.lastUp = new Date()

        collection.update(compositeKey, {"$set": newValues}, function(err, result) { })
      })
    })
  })
  request.end()
}
