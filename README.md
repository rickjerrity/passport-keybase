[![npm version](https://img.shields.io/npm/v/passport-keybase?style=flat)](https://npmjs.org/package/passport-keybase "View this project on npm")

# Keybase ID Passport Strategy

`passport-keybase` is an authentication strategy for [Passport](http://www.passportjs.org/) that uses the [Keybase ID](https://github.com/rickjerrity/keybase-id) library for user authentication and identification. `passport-keybase` exposes the `KeybaseStrategy` passport strategy for use.

## Installation

### Prerequisites

`passport-keybase` depends on the [Keybase ID](https://github.com/rickjerrity/keybase-id) library, as mentioned before. This package *must* be installed as a dependency in your NodeJS project and configured correctly before you can use `passport-keybase`! Follow the instructions for getting that package installed and running, then proceed with the installation steps below.

### Installing

Once you have the prerequisites met, simply install this package as a dependency in your NodeJS project, alongside `express`, `passport`, and `keybase-id`.

`npm install passport-keybase`

## Usage

### Options

The `KeybaseStrategy` is fairly easy to setup once you have the `keybase-id` package configured properly. `KeybaseStrategy` takes two required parameters, a `keybaseId` which points to an instance of the `keybase-id` library, and a `verify` callback, which is called upon successful user authentication and contains the authenticated user's username and Keybase Score. `KeybaseStrategy` takes several optional parameters as well, including: `passReqToCallback`, which changes the arguments passed to the `verify` callback to include the request object as well, and `signedMessageField`, `verifyTxtField`, and `usernameField`, which determine what field names in the request body to use for the signed message, verify text, and username authentication fields respectively.

### Example

```javascript
const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');

const KeybaseId = require('keybase-id');
const KeybaseStrategy = require('passport-keybase').Strategy;

// initialize the KeybaseId library
const keybaseId = new KeybaseId({
  keybasePath: 'keybase',
  minKbScore: 49,
  twitterApiKey: 'abcd1234key',
  twitterApiSecret: '1234abcdsecret',
});

// set `KeybaseStrategy` options
const keybaseOptions = {
  keybaseId,
  passReqToCallback: false,
  signedMessageField: 'signedMessage',
  verifyTxtField: 'verifyTxt',
  usernameField: 'username',
};

// create `KeybaseStrategy` verify callback
const verifyCallback = (username, score, done) => {
  // use the user's unique Keybase username to look them up in your database, returning a unique user id
  const user = {
    id: 1,
    user: 'lookup-user-using-username',
    username: username,
    score: score,
  };

  done(null, user);
};

// use the `KeybaseStrategy` strategy
passport.use(new KeybaseStrategy(keybaseOptions, verifyCallback));

// setup the express app
const app = express();

// use bodyParse so KeybaseStrategy can parse necessary fields
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// initialize passport
app.use(passport.initialize());

// use the KeybaseStrategy for authenticating an endpoint
app.post('/login', passport.authenticate('keybase', { session: false }), (req, res) => {
  // req.user contains the result you sent back in your verify callback method, `verifyCallback`
  // store the unique user id you looked up and returned in your verify callback, in a JWT token
  const jwtPayload = { id: req.user.id };

  const expires = moment().add(2, 'h');
  const bearerToken = jwt.sign(jwtPayload, jwtOptions.secretOrKey, { expiresIn: '2h' });

  // return the JWT token
  res.json({ bearerToken, expires });
});

// start the server on port 3000
app.listen(3000, () => console.log('App listening on port ' + port));
```

A full, working code example can be found and cloned at [passport-keybase-example](https://github.com/rickjerrity/passport-keybase-example).
