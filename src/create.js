const Promise = require('bluebird')
const aws = require('aws-sdk')
const assert = require('@smallwins/validate/assert')
const createKey = require('./_create-kms-key')

/**
 * create a versioned s3 bucket and master kms key named alias/arc
 */
module.exports = function create({ns}) {
  const s3 = Promise.promisifyAll(new aws.S3())
  assert({ns}, {ns: String})

  return Promise.all([
    createKeyAsync(),
    s3.createBucketAsync({
      Bucket: ns,
      ACL: 'private',
    }),
  ])
  .then(() => s3.putBucketVersioningAsync({
    Bucket: ns,
    VersioningConfiguration: {
      MFADelete: 'Disabled',
      Status: 'Enabled',
    }
  }))
}
