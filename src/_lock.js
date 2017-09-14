const Promise = require('bluebird')
const locks = require('locks')
// create a singleton lock
module.exports = locks.createReadWriteLock()
