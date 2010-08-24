// HTTP-Pulse a Node App for Monitoring HTTP Servers - Copyright Corey Donohoe <atmos@atmos.org>
var Auth               = require("auth"),
    Mongo              = require("mongodb"),
    Timer              = require("./workers/timer"),
    PulseUser          = require("./models/user").PulseUser,
    PulseToken         = require("./models/token").PulseToken,
    HttpMonitor        = require("./workers/http").HttpMonitor

var express = require("express"),
    app     = express.createServer()

var config             = { appId:     process.env.GITHUB_CLIENT_ID,
                           appSecret: process.env.GITHUB_SECRET,
                           callback:  process.env.GITHUB_CALLBACK,
                           scope:     "email,offline_access"
                         }

Mongo.connect(process.env.MONGOHQ_URL, function(err, database) {
  var databaseConnection = database

  app.configure(function() {
    app.set("root", __dirname)
    app.set('views', __dirname + '/views')
    app.set('view engine', 'haml')

    app.use(express.logger())
    app.use(express.errorHandler({ showStack: true, dumpExceptions: true }))
    app.use(express.staticProvider({ path: require("path").join(__dirname, "..", "public") }))

    app.use(express.methodOverride())
    app.use(express.bodyDecoder())
    app.use(express.cookieDecoder())
    app.use(express.session({ lifetime: (150).seconds, reapInterval: (10).seconds }))
    app.use(Auth([ Auth.Anonymous(), Auth.Never(), Auth.Github(config) ]))
  })

  app.get("/v1/:token/monitors", function(req, res) {
    var pulseToken = new PulseToken(req.params.token, databaseConnection)

    pulseToken.monitors(function(monitors) {
      res.contentType('application/json')
      res.send(JSON.stringify(monitors))
    })
  })

  app.post("/v1/:token/monitors", function(req, res) {
    var url        = req.body.url,
        pulseToken = new PulseToken(req.params.token, databaseConnection)

    pulseToken.createMonitor(url, function(monitor) { })
    res.contentType('application/json')
    res.send(JSON.stringify({url: url}), 201)
  })

  app.del("/v1/:token/monitors/:id", function(req, res) {
    var pulseToken = new PulseToken(req.params.token, databaseConnection)

    pulseToken.deleteMonitor(req.params.id, function() {
      res.contentType('application/json')
      res.send(JSON.stringify({}), 200)
    })
  })

  app.get("/profile", function(req,res) {
    if(req.isAuthenticated()) {
      res.render("profile.html.haml", {
        locals: {
          user: req.session.auth.user,
          access_token: req.session.access_token,
          user_info: require("sys").inspect(req.session.auth)
        }
      })
    } else {
      res.redirect("/")
    }
  })

  app.get("/", function(req, res) {
    if(req.isAuthenticated()) {
      res.redirect("/profile")
    } else {
      res.render("index.html.haml", { locals: { user: null } })
    }
  })

  app.get ('/auth/github/callback', function(req, res, params) {
    req.authenticate(['github'], function(error, authenticated) {
      res.writeHead(200, {'Content-Type': 'text/html'})
      if( authenticated ) {
        var pulseUser = new PulseUser(req.getAuthDetails().user.login, databaseConnection)
        pulseUser.createUser(req.session.access_token)
        res.writeHead(302, { 'Location': "/profile" });
      }
      else {
        res.writeHead(302, { 'Location': "/" });
      }
      res.end('');
    });
  })

  app.get ('/logout', function(req, res, params) {
    req.logout();
    res.writeHead(303, { 'Location': "/" });
    res.end('');
  })

  Timer.setup()
})

exports.run = function() {
  app.listen(parseInt(process.env.PORT || 9393), null)
}
