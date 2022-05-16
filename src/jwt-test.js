const jwt = require('jsonwebtoken')

jwt.sign({ foo: 'bar' }, privateKey, { algorithm: 'RS256' }, function(err, token) {
    console.log(token);
  });