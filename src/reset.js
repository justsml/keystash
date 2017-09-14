const Promise = require('bluebird')
const assert = require('@smallwins/validate/assert')
const write = require('./_write')

/**
 * reset a ns
 */
module.exports = function _reset({ns}) {
  assert({ns}, {
    ns: String,
  })
  return write({ns, payload: {}})
}

