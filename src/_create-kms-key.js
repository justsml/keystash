const Promise = require('bluebird')
const aws = require('aws-sdk')

/**
 * creates a kms master key alias/arc
 */
module.exports = function _createKey() {
  const kms = Promise.promisifyAll(new aws.KMS())
  return kms.listAliasesAsync({})
  .filter(a => a.AliasName === 'alias/arc')
  .then(hasArc => {
    if (hasArc) {
      return
    }
    return kms.createKeyAsync({
      Tags: [{
        TagKey: 'CreatedBy',
        TagValue: 'JSF Architect'
      }]
    })
    .then(key => kms.createAliasAsync({
      AliasName: 'alias/arc',
      TargetKeyId: key.KeyMetadata.KeyId,
    }))
  })
}
