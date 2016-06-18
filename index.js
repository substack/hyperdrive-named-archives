var deferred = require('hyperdrive-deferred-archive')
var collect = require('collect-stream')
var through = require('through2')
var readonly = require('read-only-stream')
var defaults = require('levelup-defaults')

module.exports = Named

function Named (opts) {
  if (!(this instanceof Named)) return new Named(opts)
  this.drive = opts.drive
  this.db = defaults(opts.db, { valueEncoding: 'binary' })
}

Named.prototype.createArchive = function (name) {
  var self = this
  var archive = deferred()
  self.db.get(name, function (err, link) {
    if (err && !notfound(err)) return archive.emit('error', err)
    if (link) return self.drive.createArchive(link)
    var a = self.drive.createArchive({ live: true })
    self.db.put(name, a.key, function (err) {
      if (err) archive.emit('error', err)
      else archive.setArchive(a)
    })
  })
  return archive
}

Named.prototype.list = function (opts, cb) {
  if (typeof opts === 'function') {
    cb = opts
    opts = {}
  }
  if (!opts) opts = {}
  var stream = this.db.createReadStream(opts)
    .pipe(through.obj(function (row, enc, next) {
      next(null, { name: row.key, link: row.value })
    }))
  if (cb) collect(stream, cb)
  return readonly(stream)
}

function notfound (err) {
  return err && /^notfound/i.test(err)
}
