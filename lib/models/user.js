// HTTP-Pulse a Node App for Monitoring HTTP Servers - Copyright Corey Donohoe <atmos@atmos.org>
var sys      = require("sys"),
    ObjectID = require('mongodb/bson/bson').ObjectID

function PulseUser(login, db) {
  this.db    = db
  this.login = login
}
exports.PulseUser = PulseUser

PulseUser.prototype.monitors = function(callback) {
  var login = this.login

  this.db.collection('monitors', function(err, collection) {
    collection.find({login: login}, function(err, cursor) {
      cursor.toArray(function(err, monitors) {
        callback(monitors)
      })
    })
  })
}

PulseUser.prototype.createMonitor = function(url, callback) {
  var monitor = {
    url        : url,
    login      : this.login,
    lastUp     : new Date(0),
    httpStatus : 503,
    lastChecked: new Date(0)
  }

  this.db.collection('monitors', function(err, collection) {
    collection.insert([monitor], function(err, docs) {
      callback(monitor)
    })
  })
}

PulseUser.prototype.deleteMonitor = function(id, callback) {
  var login = this.login

  this.db.collection('monitors', function(err, collection) {
    collection.remove({_id: new ObjectID(id)}, function(err, docs) {
      callback(id)
    })
  })
}

PulseUser.prototype.createUser = function(token) {
  var newUser = {login: this.login, token: token}

  this.db.collection('users', function(err, collection) {
    collection.findOne({login: newUser.login}, function(err, user) {
      if(user == null)
        collection.insert([newUser], function(err, docs) { })
    })
  })
}
