const util = require('util');
const passport = require('passport-strategy');

const KeybaseId = require('keybase-id');

function KeybaseStrategy(options, verify) {
  passport.Strategy.call(this);
  this.name = 'keybase';

  this.options = options || {};
  this._keybaseId = this.options.keybaseId;
  this._passReqToCallback = options.passReqToCallback;

  this._signedMessageField = options.signedMessageField || 'signedMessage';
  this._verifyTxtField = options.verifyTxtField || 'verifyTxt';
  this._usernameField = options.usernameField || 'username';

  this._verify = verify;

  if (!this._keybaseId) {
    throw new TypeError('A valid KeybaseId class instance must be passed in the options.');
  }

  if (!this._verify) {
    throw new TypeError('KeybaseStrategy requires a verify callback.');
  }
}

util.inherits(KeybaseStrategy, passport.Strategy);

KeybaseStrategy.prototype.authenticate = function (req) {
  let signedMessage, verifyTxt, username;

  if (req.body) {
    signedMessage = req.body[this._signedMessageField];
    verifyTxt = req.body[this._verifyTxtField];
    username = req.body[this._usernameField];

    if (!signedMessage) {
      return this.fail('No signedMessage argument in request body.');
    }

    if (!verifyTxt) {
      return this.fail('No verifyTxt argument in request body.');
    }

    if (!username) {
      return this.fail('No username argument in request body.');
    }
  } else {
    return this.fail('No request body.');
  }

  this._keybaseId
    .verifyUserMessage(signedMessage, verifyTxt, username)
    .then((authenticated) => {
      if (authenticated) {
        this._keybaseId
          .scoreUser(username, true)
          .then((score) => {
            if (score.total >= this._keybaseId.minKbScore) {
              const verified = (err, user, info) => {
                if (err) {
                  return this.error(err);
                } else if (!user) {
                  return this.fail(info);
                } else {
                  return this.success(user, info);
                }
              };

              try {
                if (this._passReqToCallback) {
                  this._verify(req, username, score, verified);
                } else {
                  this._verify(username, score, verified);
                }
              } catch (ex) {
                this.error(ex);
              }
            } else {
              this.fail(`${username} failed identity with a score of ${score.total} (${score.identity})`);
            }
          })
          .catch((err) => {
            this.error(`Failed to score user ${username}. Error: ${err.toString()}`);
          });
      } else {
        this.fail(`${username} failed message verification.`);
      }
    })
    .catch((err) => {
      this.error(`Error verifying user message for user ${username}. ${err.toString()}`);
    });
};

module.exports = KeybaseStrategy;
