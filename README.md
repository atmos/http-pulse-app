http-pulse
==========

This is a simple HTTP monitoring service built on [heroku's][heroku] experimental [node.js][node] support.  Authentication is based on [github oauth][ghoauth].

Running
=======

You need a few config variables set in your heroku environment, you'll need similar environmental variables set to run this locally.

    % heroku config:add GITHUB_CALLBACK="http://http-pulse.atmos.org/auth/github/callback"
    % heroku config:add GITHUB_CLIENT_ID="<your github client id>"
    % heroku config:add GITHUB_SECRET="<your github secret>"
    % heroku config:add EXPRESS_ENV="production"
    % heroku addons:add mongohq:free
    % git push heroku master

You should be able to visit your site and login via github.

Endpoints
=========

To list your monitors

    % curl -vv http://http-pulse.atmos.org/v1/<your token>/monitors

To create a monitor

    % curl -vv -X POST -d "url=http://www.atmos.org" http://http-pulse.atmos.org/v1/<your token>/monitors

To delete a monitor

    % curl -vv -X DELETE http://http-pulse.atmos.org/v1/<your token>/monitors/<object id from list>

Why?
====

I wanted to learn how to use mongodb and simple workers on [heroku][heroku].  The is what I came up with.

[heroku]: http://heroku.com
[node]: http://nodejs.org
[ghoauth]: http://gist.github.com/419219
