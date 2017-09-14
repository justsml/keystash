const Promise = require('bluebird')
const assert = require('@smallwins/validate/assert')
const crypto = require('crypto')
const aws = require('aws-sdk')

module.exports = function _decrypt({encrypted, cipher}) {
  assert({encrypted, cipher}, {
    encrypted: String,
    cipher: Buffer,
  })

  const kms = Promise.promisifyAll(new aws.KMS())
  return kms.decryptAsync({
    CiphertextBlob: cipher
  })
  .then(result => {
    const key = result.Plaintext.toString()
    const decipher = crypto.createDecipher('aes-256-ctr', key)
    const result = decipher.update(encrypted, 'hex', 'utf8') + decipher.final('utf8')
    return JSON.parse(result)
  })
}
