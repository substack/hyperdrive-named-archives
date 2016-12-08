# hyperdrive-named-archives

create hyperdrive archives that store and load link keys from names

# example

``` js
var namedArchives = requre('hyperdrive-named-archives')
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
}
```

# api

``` js
var namedArchives = require('hyperdrive-named-archives')
```

## var named = namedArchives(opts)

Create a new named archive instance `named` from:

* `opts.drive` - a hyperdrive instance
* `opts.db` - a leveldb instance to store archive links

## var archive = named.createArchive(name, opts)

Create an archive from a string `name`. The first time `name` is used, the
archive link will be saved so that subsequent calls to `createArchive()` under
the same name will use the same stored archive link.

`opts` are passed to the underlying `drive.createArchive(opts)` method.

## named.getLink(name, cb)

Get the archive link for `name` as `cb(err, link)`. `name` is a string and
`link` is a buffer from the underlying `archive.key`.

## var stream = named.list(opts, cb)

Return a readable object `stream` with stored `name` and `link` properties for
each stored link.

# install

```
npm install hyperdrive-named-archives
```

# license

BSD
