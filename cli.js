#!/usr/bin/env node
const chalk = require('chalk')
const prereqFail = p => {
  console.log(chalk.red('Error!') + ' ' + chalk.yellow('Missing env variables:'))
  console.log(chalk.dim(' - ') + chalk.cyan(p))
  process.exit(1)
}

if (!process.env.AWS_PROFILE) {
  prereqFail('AWS_PROFILE')
}

if (!process.env.AWS_REGION) {
  prereqFail('AWS_REGION')
}

// prereq check passed; grab deps
const pad = require('lodash.padstart')
const strftime = require('strftime')
const end = require('lodash.padend')
const secrets = require('.')
const yargs = require('yargs')

// setup the cli args
const argv = require('yargs')
  .usage('Usage: $0 <bucket> [option]')
  .example('$0', 'List all secrets')
  .example('$0 bukkit keyname keyvalue', 'Save a secret')
  .example('$0 bukkit keyname', 'Get a secret')
  .example('$0', 'List all secrets')
  .describe('create', 'Create a keystash bucket')
  .alias('c', 'create')
  .describe('put', 'Encrypt a key/value pair')
  .alias('p', 'put')
  .describe('get', 'Get a value by key')
  .alias('g', 'get')
  .describe('delete', 'Delete a key')
  .alias('d', 'delete')
  .describe('reset', 'Remove all keys in the latest version')
  .describe('rand', 'Generate random data for a key')
  .describe('versions', 'List all versions')
  .alias('v', 'versions')
  .describe('nuke', 'Remove all versions')
  .alias('n', 'nuke')
  .help('h')
  .alias('h', 'help')
  .version()
  .argv

// helper to check for undefined
// @returns {Boolean}
const undef = val=> typeof val === 'undefined'

// if no args given
const blank = argv._.length === 0 &&
  argv.h === false &&
  argv.help === false &&
  undef(argv.create) &&
  undef(argv.put) &&
  undef(argv.get) &&
  undef(argv.delete) &&
  undef(argv.reset) &&
  undef(argv.versions) &&
  undef(argv.nuke)

// read secrets from s3 bucket
const listSecrets = (argv._.length === 1 || argv._.length === 2) &&
  argv.h === false &&
  argv.help === false &&
  undef(argv.create) &&
  undef(argv.put) &&
  undef(argv.get) &&
  undef(argv.delete) &&
  undef(argv.rand) &&
  undef(argv.reset) &&
  undef(argv.versions) &&
  undef(argv.nuke)

// create a bucket for secrets
const createBucket = argv._.length === 1 &&
  argv.h === false &&
  argv.help === false &&
  argv.create &&
  undef(argv.put) &&
  undef(argv.get) &&
  undef(argv.delete) &&
  undef(argv.reset) &&
  undef(argv.versions) &&
  undef(argv.nuke)

// add a secret
const putKey = argv._.length >= 1 &&
  argv.h === false &&
  argv.help === false &&
  undef(argv.create) &&
  argv.put &&
  undef(argv.get) &&
  undef(argv.delete) &&
  undef(argv.reset) &&
  undef(argv.rand) &&
  undef(argv.versions) &&
  undef(argv.nuke)

// support for syntax:
//   keystash BUCKET KEY VAL
if (argv._.length === 3 && undef(argv.put)) {
  putKey = true
  argv.put = argv._[1]
  argv._[1] = argv._[2]
}

// generate a key
const isRand = !!(argv._.length >= 1 &&
  argv.h === false &&
  argv.help === false &&
  argv.rand)

// get a secret
const getKey = argv._.length >= 1 &&
  argv.h === false &&
  argv.help === false &&
  undef(argv.create) &&
  undef(argv.put) &&
  argv.get &&
  undef(argv.delete) &&
  undef(argv.reset) &&
  undef(argv.rand) &&
  undef(argv.versions) &&
  undef(argv.nuke)

// remove a secret
const delKey = argv._.length >= 1 &&
  argv.h === false &&
  argv.help === false &&
  undef(argv.create) &&
  undef(argv.put) &&
  undef(argv.get) &&
  argv.delete &&
  undef(argv.rand) &&
  undef(argv.reset) &&
  undef(argv.versions) &&
  undef(argv.nuke)

// reset all secrets in the latest version
const reset = argv._.length >= 1 &&
  argv.h === false &&
  argv.help === false &&
  undef(argv.create) &&
  undef(argv.put) &&
  undef(argv.get) &&
  undef(argv.delete) &&
  argv.reset &&
  undef(argv.versions) &&
  undef(argv.nuke)

// get all versions
const versions = argv._.length >= 1 &&
  argv.h === false &&
  argv.help === false &&
  undef(argv.create) &&
  undef(argv.put) &&
  undef(argv.get) &&
  undef(argv.delete) &&
  undef(argv.reset) &&
  undef(argv.rand) &&
  argv.versions &&
  undef(argv.nuke)

// remove all versions
const nuke = argv._.length >= 1 &&
  argv.h === false &&
  argv.help === false &&
  undef(argv.create) &&
  undef(argv.put) &&
  undef(argv.get) &&
  undef(argv.delete) &&
  undef(argv.reset) &&
  undef(argv.versions) &&
  argv.nuke

// command not found
const notFound = !nuke &&
    !versions &&
    !reset &&
    !delKey &&
    !putKey &&
    !getKey &&
    !createBucket &&
    !listSecrets &&
    !isRand &&
    !blank

function logError(err) {
  const error = chalk.red('Error!')
  const msg = chalk.yellow(err.message)
  console.error(error, msg)
  process.exit(1)
}

function logMessage(msg) {
  msg = chalk.magenta(msg)
  console.log(msg)
  process.exit(1)
}

function list(ns, title, result) {
  console.log('')
  const head = chalk.dim(ns)
  const title = chalk.dim.cyan(title)
  console.log(' ' + head + ' ' + title)
  console.log(chalk.dim('────────────────────────────────────────────────────────────'))
  if (result) {
    const out = ''
    Object.keys(result).forEach(key=> {
      const keyname = pad(chalk.dim(key), 35)
      const value = end(chalk.cyan(result[key]), 35)
      out += `${keyname} ${value}\n`
    })
    console.log(out)
  }
  process.exit()
}

if (blank) {
  const err = chalk.red('Error!')
  const msg = chalk.yellow(' Missing S3 bucket argument.')
  console.log(err + msg)
  process.exit(1)
}

if (listSecrets) {
  const ns = argv._[0]
  const key = argv._[1]
  secrets.read({
    ns
  })
  .catch({name: 'NoSuchBucket'}, logMessage.bind(null, 'bucket not found'))
  .then(result => {
    if (key) {
      console.log(result[key])
      return result[key]
    }
    return list(ns, 'secrets key', result)
  })
  .catch(logError)
}

if (createBucket) {
  const ns = argv._[0]
  secrets.create({
    ns
  })
  .catch(logError)
  .then(result => {
    const rex = chalk.green('Created')
    const msg = chalk.cyan(` ${ns}`)
    console.log(rex + msg)
    process.exit()
  })
}

if (putKey) {
  const ns = argv._[0]
  const key = argv.put
  const value = argv._[1]
  if (!key || !value) {
    console.log('missing key and/or value')
    process.exit(1)
  }
  secrets.write({
    ns,
    key,
    value,
  })
  .then(result => list(ns, 'put', result))
  .catch(logError)
}

if (isRand) {
  const ns = argv._[0]
  const key = argv.rand
  if (!key) {
    console.log('missing key')
    process.exit(1)
  }
  secrets.rand({ns, key})
  .then(result => list(ns, 'rand', result))
}

if (getKey) {
  const key = argv.get
  secrets.read({
    ns: argv._[0]
  })
  .catch({name: 'NoSuchBucket'}, logMessage.bind(null, 'bucket not found'))
  .catch(logError)
  .then(result => {
    console.log(result[key])
    process.exit()
  })
}

if (delKey) {
  const ns = argv._[0]
  const key = argv.delete
  secrets.delete({
    ns,
    key,
  })
  .then(result => list(ns, 'deleted', result))
  .catch({name: 'NoSuchBucket'}, logMessage.bind(null, 'bucket not found'))
  .catch(logError)
}

if (reset) {
  const ns = argv._[0]
  secrets.reset({
    ns,
  })
  .then(result => list(ns, 'reset', result))
  .catch({name: 'NoSuchBucket'}, logMessage.bind(null, 'bucket not found'))
  .catch(logError)
}

if (versions) {
  const ns = argv._[0]
  const key = argv._[1]
  const version = typeof argv.versions === 'boolean'? false : argv.versions
  if (version && !key) {
    // display one version
    secrets.read({
      ns,
      version,
    })
    .then(result => {
      list(ns, version, result)
      process.exit()
    })
  } else if (version && key) {
    // display one key of a version
    secrets.read({
      ns,
      version,
    })
    .then(result => {
      console.log(result[key])
      process.exit()
    })
    .catch({name: 'NoSuchBucket'}, logMessage.bind(null, 'bucket not found'))
    .catch(logError)

  } else {
    // display all versions
    secrets.versions({ns})
    .then(result => {
      function remap(v) {
        const obj = {}
        const d = strftime('%B %d, %Y %l:%M:%S', v.modified)
        obj[d] = v.version
        return obj
      }
      const versions = result.map(remap).reduce((a,b)=> Object.assign({}, a, b))
      list(ns, 'versions', versions)
    })
    .catch(err => logMessage(err.message))
  }
}

if (nuke) {
  const ns = argv._[0]
  secrets.nuke({
    ns,
  })
  .then(result => {
    list(ns, 'nuked', versions)
    process.exit()
  })
  .catch(err => logMessage(err.message))
}

if (notFound) {
  const err = chalk.red('Error!')
  const msg = chalk.cyan(` Command not found.`)
  console.log(err + msg)
  process.exit(1)
}
