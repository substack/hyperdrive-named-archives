var namedArchives = requre('../')
var hyperdrive = require('hyperdrive')
var level = require('level')
var sub = require('subleveldown')

var db = level('/tmp/drive.db')

var createArchive = namedArchives({
  drive: hyperdrive(sub(db, 'drive')),
  db: sub(db, 'archives')
})

var archive = createArchive('default')
if (process.argv[2] === 'write') {
  var file = process.argv[3]
  var stream = archive.createFileWriteStream(file)
  process.stdin.pipe(stream)
} else if (process.argv[2] === 'read') {
  var file = process.argv[3]
  var stream = archive.createFileReadStream(file)
  stream.pipe(process.stdout)
}
