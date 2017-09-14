const Promise = require('bluebird')
const assert = require('@smallwins/validate/assert')
const aws = require('aws-sdk')
const create = require('./create')
const write = require('./write')

/**
 * reset a ns
 */
module.exports = function _nuke({ns}) {
  assert({ns}, {ns: String})

  const s3 = Promise.promisifyAll(new aws.S3())
  return s3.listObjectVersionsAsync({
    Bucket: ns,
    Prefix: 'archive',
  })
  .then(result => {
    // loop thru versions deleting
    function remap(v) {
      const obj = {
        Key: 'archive'
      }
      obj.VersionId = v.VersionId
      return obj
    }
    return s3.deleteObjectsAsync({
      Bucket: ns,
      Delete: {
        Objects: result.Versions.map(remap)
      }
    })
  })
}

