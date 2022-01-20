const jwt = require('jsonwebtoken')
const fs = require('fs')
const path = require('path')

function issueJWT(user) {
  const _id = user.id;
  const payload = {
    sub: _id,
    iat: Date.now(),
  }
  const signedToken = jwt.sign(
    payload,
    process.env.PRIV_KEY.replace(/\\n/g, '\n'),
    {
      // expiresIn: 24 * 60 * 60 * 1000,
      algorithm: 'RS256'
    }
  )

  return {
    token: 'Bearer ' + signedToken,
    // expires: expiresIn
  }
}

module.exports.issueJWT = issueJWT