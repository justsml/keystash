const Promise = require('bluebird')
const assert = require('@smallwins/validate/assert')
const aws = require('aws-sdk')

module.exports = function _writeS3({ns, cipher, payload}) {
  assert({ns, cipher, payload}, {
    ns: String,
    cipher: String,
    payload: String,
  })

  const s3 = Promise.promisifyAll(new aws.S3())
  return s3.putObjectAsync({
    Body: payload,
    Bucket: ns,
    Key: 'archive',
    ContentType: 'text/plain',
    ServerSideEncryption: 'AES256',
    Metadata: {
      cipher: cipher
    }
  })
}
