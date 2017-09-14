const Promise = require('bluebird')
const assert = require('@smallwins/validate/assert')
const aws = require('aws-sdk')

/**
 * list all versions for given ns
 */
module.exports = function versions({ns, version}) {
  assert({ns}, {
    ns: String,
    //version: String <-- optional
  })
  const s3 = Promise.promisifyAll(new aws.S3())
  return s3.listObjectVersionsAsync({
    Bucket: params.ns,
    Prefix: 'archive',
  })
  .then(({Versions}) => {
    const ver = v => ({version: v.VersionId, modified: v.LastModified})
    return Versions.map(ver)
  })
}

