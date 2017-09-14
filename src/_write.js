const Promise = require('bluebird')
const assert = require('@smallwins/validate/assert')
const crypto = require('crypto')
const aws = require('aws-sdk')
const encrypt = require('./_encrypt')
const write = require('./_write-s3')

module.exports = function _write({payload, ns}) {
  assert({payload, ns}, {
    payload: Object,
    ns: String,
  })
  return encrypt({payload})
  .then(result => {
    return write({
      ns: ns,
      payload: result.encrypted,
      cipher: result.cipher,
    })
  })
}
