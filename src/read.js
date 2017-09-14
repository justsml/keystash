const Promise = require('bluebird')
const assert = require('@smallwins/validate/assert')
const aws = require('aws-sdk')
const write = require('./_write')
const _decrypt = require('./_decrypt')

module.exports = function read({ns, version}) {
  assert({ns}, {
    ns: String,
    //version: String <-- optional param
  })

  // query params for the archive
  const query = {
    Bucket: ns,
    Key: 'archive',
  }

  // optional version param
  if (version) {
    query.VersionId = version
  }

  const s3 = Promise.promisifyAll(new aws.S3())
  return s3.getObjectAsync(query)
  .then(result => {
    return _decrypt({
      encrypted: result.Body.toString(),
      cipher: Buffer.from(result.Metadata.cipher, 'base64')
    })
  })
  .catch(err => {
    return write({
      ns,
      payload: {},
    })
  })
}

