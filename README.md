# Twitter Bot

A Twitter bot for updating Twitter accounts periodically.

## Install

* `yarn`

## Run

* `yarn start {CONSUMER_KEY} {CONSUMER_SECRET} {ACCESS_KEY} {ACCESS_SECRET} {TWEETS_URL?}`

The `TWEETS_URL` argument is optional. If provided, the JSON of tweets will be
fetched from the provided URL. This allows you to manage your tweets from a
GitHub repository, for example. If the `TWEETS_URL` argument is not provided,
the JSON of tweets will be loaded from the `/tweets/` directory. This allows
you to mount your tweets via a Docker volume and update them without having to
manipulate your Twitter Bot container.

## Sponsor 💗

If you are a fan of this project, you may
[become a sponsor](https://github.com/sponsors/CharlesStover)
via GitHub's Sponsors Program.
