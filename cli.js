var static = require('./')

var levelup = require('levelup')
var opts    = require('optimist').argv

var db = levelup(opts._[0] || '/tmp/level-static')

require('http')
  .createServer(static(db, opts))
  .listen(opts.port || 8000)

