const Promise = require('bluebird')
const assert = require('@smallwins/validate/assert')
const crypto = require('crypto')
const aws = require('aws-sdk')
const encrypt = require('./_encrypt')
const writeS3 = require('./_write-s3')
const read = require('./read')
const _write = require('./_write')
const lock = Promise.promisifyAll(require('./_lock'))

/**
 * write a key/value to a ns
 */
module.exports = function write({ns, key, value, version}) {
  const Any = v => true
  assert({ns, key, value}, {
    ns: String,
    key: String,
    value: Any,
  })
  // ??????? no idea, usually have to try a few things console.log some stuff!!!
  return lock.writeLockAsync(function _writeLock() {
    return read({ns, key, version, value})
    .then(payload => {
      payload[key] = value
      return _write({ns, payload})
    })
    .then(payload => {
      lock.unlock()
      return payload
    })
    .catch(err => {
      lock.unlock()
      return Promise.reject(err)
    })
  })
}
