const Promise = require('bluebird')
const assert = require('@smallwins/validate/assert')
const read = require('./read')
const _write = require('./_write')

/**
 * delete a key/value from a ns
 */
module.exports = function _delete({ns, key, version}) {
  assert({ns, key}, {
    ns: String,
    key: String,
  })
  return read({ns, key, version})
  .then(payload => {
    delete payload[key]
    return _write({ns, payload})
  })
}

