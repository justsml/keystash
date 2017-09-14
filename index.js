const create = require('./src/create')
const del = require('./src/delete')
const nuke = require('./src/nuke')
const rand = require('./src/rand')
const read = require('./src/read')
const reset = require('./src/reset')
const versions = require('./src/versions')
const write = require('./src/write')

if (!process.env.AWS_PROFILE) {
  throw ReferenceError('missing process.env.AWS_PROFILE')
}

if (!process.env.AWS_REGION) {
  throw ReferenceError('missing process.env.AWS_REGION')
}

module.exports = {
  create,
  delete: del,
  nuke,
  rand,
  read,
  reset,
  versions,
  write,
}
