const Strategy = require('../lib/strategy');
const KeybaseId = require('../../keybase-id/lib');

let keybaseId, keybaseOptions, verifyCallback, request, strategy;

beforeEach(() => {
  keybaseId = new KeybaseId({
    keybasePath: 'keybase',
    minKbScore: 0,
    twitterApiKey: 'abcd1234_Test_Twitter_Api_Key',
    twitterApiSecret: '1234abcd_Test_Twitter_Api_Secret',
  });

  keybaseOptions = {
    keybaseId,
    passReqToCallback: false,
    signedMessageField: 'signedMessage',
    verifyTxtField: 'verifyTxt',
    usernameField: 'username',
  };

  verifyCallback = (username, score, done) => {
    const user = {
      id: 1,
      user: 'lookup-user-using-username',
      username: username,
      score: score,
    };

    done(null, user);
  };

  request = {
    body: {
      signedMessage: 'BEGIN KEYBASE SALTPACK SIGNED MESSAGE. TEST MESSAGE. END KEYBASE SALTPACK SIGNED MESSAGE.',
      verifyTxt: 'abcd1234_Test_Verify_Text',
      username: 'Test_Username',
    },
  };

  strategy = new Strategy(keybaseOptions, verifyCallback);
});

describe('Strategy', () => {
  describe('instance', () => {
    test('should be named keybase', () => {
      expect(strategy.name).toEqual('keybase');
    });

    test('should throw if constructed without a verify callback', () => {
      expect(() => {
        new Strategy(keybaseOptions);
      }).toThrow(TypeError);

      expect(() => {
        new Strategy(keybaseOptions);
      }).toThrow('verify callback');
    });

    test('should throw if constructed without a KeybaseId option', () => {
      keybaseOptions.keybaseId = undefined;

      expect(() => {
        new Strategy(keybaseOptions);
      }).toThrow(TypeError);

      expect(() => {
        new Strategy(keybaseOptions);
      }).toThrow('KeybaseId class instance');
    });
  });

  describe('authenticate', () => {
    test('should fail if called with no request body', () => {
      strategy.fail = (challenge) => {
        expect(challenge).toEqual('No request body.');
      };

      request.body = undefined;

      strategy.authenticate(request);
    });

    test('should fail if called with no signedMessage argument in request body', () => {
      strategy.fail = (challenge) => {
        expect(challenge).toEqual('No signedMessage argument in request body.');
      };

      request.body.signedMessage = undefined;

      strategy.authenticate(request);
    });

    test('should fail if called with no verifyTxt argument in request body', () => {
      strategy.fail = (challenge) => {
        expect(challenge).toEqual('No verifyTxt argument in request body.');
      };

      request.body.verifyTxt = undefined;

      strategy.authenticate(request);
    });

    test('should fail if called with no username argument in request body', () => {
      strategy.fail = (challenge) => {
        expect(challenge).toEqual('No username argument in request body.');
      };

      request.body.username = undefined;

      strategy.authenticate(request);
    });
  });
});
