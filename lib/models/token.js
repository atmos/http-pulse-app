// HTTP-Pulse a Node App for Monitoring HTTP Servers - Copyright Corey Donohoe <atmos@atmos.org>
var sys       = require("sys"),
    PulseUser = require("./user").PulseUser

function PulseToken(token, db) {
  this.db    = db
  this.token = token
}
exports.PulseToken = PulseToken

PulseToken.prototype.monitors = function(callback) {
  this.user(function(pulseUser) {
    pulseUser.monitors(callback)
  })
}

PulseToken.prototype.createMonitor = function(url, callback) {
  this.user(function(pulseUser) {
    pulseUser.createMonitor(url, function(monitor) {
      callback(monitor)
    })
  })
}

PulseToken.prototype.deleteMonitor = function(id, callback) {
  this.user(function(pulseUser) {
    pulseUser.deleteMonitor(id, function() {
      callback(id)
    })
  })
}

PulseToken.prototype.user = function(callback) {
  var token        = this.token,
      dbConnection = this.db

  this.db.collection('users', function(err, collection) {
    collection.findOne({token: token}, function(err, user) {
      if(user == null) {
        //throw "User Not Found"
      } else {
        var pulseUser = new PulseUser(user.login, dbConnection)
        callback(pulseUser)
      }
    })
  })
}
