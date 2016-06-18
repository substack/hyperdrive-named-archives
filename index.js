var deferred = require('hyperdrive-deferred-archive')
var collect = require('collect-stream')
var through = require('through2')
var defaults = require('levelup-defaults')
var duplexify = require('duplexify')
var inherits = require('inherits')
var EventEmitter = require('events').EventEmitter
var has = require('has')

module.exports = Named
inherits(Named, EventEmitter)

function Named (opts) {
  if (!(this instanceof Named)) return new Named(opts)
  this.drive = opts.drive
  this.db = defaults(opts.db, { valueEncoding: 'binary' })
  this._pending = 0
  this._archives = {}
}

Named.prototype.createArchive = function (name) {
  var self = this
  var archive = deferred()
  if (has(self._archives, name)) return self._archives[name]
  self._archives[name] = archive
  self._pending++
  self.db.get(name, function (err, link) {
    if (err && !notfound(err)) {
      if (--self._pending === 0) done()
      return archive.emit('error', err)
    }
    var a = self.drive.createArchive(link, { live: true })
    if (link) {
      if (--self._pending === 0) done()
      return archive.setArchive(a)
    }
    self.db.put(name, a.key, function (err) {
      if (err) archive.emit('error', err)
      else archive.setArchive(a)
      if (--self._pending === 0) done()
    })
  })
  return archive
  function done () { self.emit('_ready') }
}

Named.prototype.list = function (opts, cb) {
  var self = this
  var d = duplexify()
  if (self._pending > 0) {
    self.once('_ready', function () {
      d.setReadable(self.list(opts, cb))
    })
    return d
  }
  if (typeof opts === 'function') {
    cb = opts
    opts = {}
  }
  if (!opts) opts = {}
  var r = self.db.createReadStream(opts)
  r.on('error', d.emit.bind(d, 'error'))
  var stream = through.obj(function (row, enc, next) {
    next(null, { name: row.key, link: row.value })
  })
  r.pipe(stream)
  if (cb) collect(stream, cb)
  d.setReadable(stream)
  return d
}

function notfound (err) {
  return err && /^notfound/i.test(err)
}
