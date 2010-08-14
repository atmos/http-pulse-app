// HTTP-Pulse a Node App for Monitoring HTTP Servers - Copyright Corey Donohoe <atmos@atmos.org>
var Mongo              = require("mongodb"),
    Timer              = require("./workers/timer"),
    PulseUser          = require("./models/user").PulseUser,
    PulseToken         = require("./models/token").PulseToken,
    HttpMonitor        = require("./workers/http").HttpMonitor,
    StrategyDefinition = require("express/plugins/strategyDefinition").StrategyDefinition

var config             = { appId:     process.env.GITHUB_CLIENT_ID,
                           appSecret: process.env.GITHUB_SECRET,
                           callback:  process.env.GITHUB_CALLBACK,
                           scope:     "email,offline_access"
                         }

var anonStrategy       = new StrategyDefinition(Anonymous),
    githubStrategy     = new StrategyDefinition(Github, config)

Mongo.connect(process.env.MONGOHQ_URL, function(err, database) {
  var databaseConnection = database

  configure(function() {
    set("root", __dirname)

    use(Logger)
    use(Cookie)
    use(Static, { path: require("path").join(__dirname, "..", "public") })
    use(Session, { lifetime: (150).seconds, reapInterval: (10).seconds })
    use(Auth, { strategies: { "anon": anonStrategy, "github": githubStrategy } })
    enable("show exceptions")
  })

  get("/v1/:token/monitors", function(token) {
    var express    = this,
        pulseToken = new PulseToken(token, databaseConnection)

    pulseToken.monitors(function(monitors) {
      express.contentType('application/json')
      express.respond(200, JSON.stringify(monitors), 'utf8')
    })
  })

  post("/v1/:token/monitors", function(token) {
    var express    = this,
        pulseToken = new PulseToken(token, databaseConnection)

    pulseToken.createMonitor(express.param('url'), function(monitor) {
      express.contentType('application/json')
      express.respond(201, JSON.stringify(monitor), 'utf8')
    })
  })

  destroy("/v1/:token/monitors/:id", function(token,id) {
    var express    = this,
        pulseToken = new PulseToken(token, databaseConnection)

    pulseToken.deleteMonitor(express.param('id'), function() {
      express.contentType('application/json')
      express.respond(200, JSON.stringify({}), 'utf8')
    })
  })

  get("/profile", function() {
    if(this.isAuthenticated()) {
      this.render("profile.html.haml", {
        locals: {
          user: this.session.auth.user,
          access_token: this.session.access_token,
          user_info: require("sys").inspect(this.session.auth)
        }
      })
    } else {
      this.redirect("/")
    }
  })

  get("/", function() {
    if(this.isAuthenticated()) {
      this.redirect("/profile")
    } else {
      this.render("index.html.haml", { locals: { user: null } })
    }
  })

  get("/auth/github/callback", function() {
    var express = this

    this.authenticate(["github"], function(error, authenticated) {
      if(authenticated) {
        var pulseUser = new PulseUser(express.session.auth.user.login, databaseConnection)
        pulseUser.createUser(express.session.access_token)
        express.redirect("/profile")
      } else {
        express.redirect("/")
      }
    })
  })

  get("/logout", function() {
    this.logout()
    this.redirect("/")
  })

  Timer.setup()
  run(parseInt(process.env.PORT || 9393), null)
})
