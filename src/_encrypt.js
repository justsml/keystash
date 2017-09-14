const Promise = require('bluebird')
const assert = require('@smallwins/validate/assert')
const crypto = require('crypto')
const aws = require('aws-sdk')

/**
 * encrypts a javscript object payload
 */
module.exports = function _encrypt({payload, ns}) {
  assert({payload, ns}, {
    payload: Object,
    ns: String,
  })
  const kms = Promise.promisifyAll(new aws.KMS())
  return kms.generateDataKeyAsync({
    KeyId: 'alias/arc',
    KeySpec: 'AES_256'
  })
  .then(result => {
    const {CiphertextBlob, Plaintext, KeyId} = result
    const cipher = crypto.createCipher('aes-256-ctr', Plaintext.toString())
    const text = JSON.stringify(payload)
    const encrypted = cipher.update(text, 'utf8', 'hex') + cipher.final('hex')
    return {encrypted, cipher: CiphertextBlob.toString('base64')}
  })
}

