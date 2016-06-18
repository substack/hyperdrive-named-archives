var test = require('tape')
var namedArchives = require('../')
var hyperdrive = require('hyperdrive')
var memdb = require('memdb')
var concat = require('concat-stream')

test('write+read', function (t) {
  t.plan(2)
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
  })
  function fname (x) { return x.name }
})
