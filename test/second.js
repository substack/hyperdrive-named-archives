var test = require('tape')
var namedArchives = require('../')
var hyperdrive = require('hyperdrive')
var memdb = require('memdb')
var concat = require('concat-stream')

test('second load', function (t) {
  t.plan(3)
  var named = namedArchives({
    drive: hyperdrive(memdb()),
    db: memdb()
  })
  var archive = named.createArchive('hello')
  var stream = archive.createFileWriteStream('hello.txt')
  stream.end('whatever')
  stream.once('finish', function () {
    archive.createFileReadStream('hello.txt')
      .pipe(concat({ encoding: 'string' }, function (body) {
        t.equal(body, 'whatever')
      }))
  })
  named.list(function (err, names) {
    t.deepEqual(names.map(fname), ['hello'])
    var a = named.createArchive('hello')
    a.createFileReadStream('hello.txt')
      .pipe(concat({ encoding: 'string' }, function (body) {
        t.equal(body, 'whatever')
      }))
  })
  function fname (x) { return x.name }
})
