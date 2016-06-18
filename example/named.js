var namedArchives = require('../')
var hyperdrive = require('hyperdrive')
var level = require('level')
var sub = require('subleveldown')

var db = level('/tmp/drive.db')

var named = namedArchives({
  drive: hyperdrive(sub(db, 'drive')),
  db: sub(db, 'archives')
})

var archive = named.createArchive('default')
if (process.argv[2] === 'write') {
  var file = process.argv[3]
  var stream = archive.createFileWriteStream(file)
  process.stdin.pipe(stream)
} else if (process.argv[2] === 'read') {
  var file = process.argv[3]
  var stream = archive.createFileReadStream(file)
  stream.pipe(process.stdout)
} else if (process.argv[2] === 'archives') {
  named.list(function (err, names) {
    names.forEach(function (x) {
      console.log(x.name, x.link)
    })
  })
}
