const Promise = require('bluebird')
const assert = require('@smallwins/validate/assert')
const aws = require('aws-sdk')
const read = require('./read')
const _write = require('./_write')

/**
 * write a random value to a key
 */
module.exports = function write({ns, key, version}) {
  assert({key}, {
    key: String,
  })

  const kms = Promise.promisifyAll(new aws.KMS())
  return read({ns, key, version})
  .then(secrets => {
    return kms.generateRandomAsync({NumberOfBytes: 18})
    .then(result => {
      secrets[key] = result.Plaintext.toString('base64')
      return secrets
    })
  })
  .then(payload => {
    return _write({ns, payload})
  })
}

