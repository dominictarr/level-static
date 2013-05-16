var toPull = require('stream-to-pull-stream')
var pull   = require('pull-stream')
var mime   = require('mime')

function split (url) {
  //it's sometimes easier to match the content as the splitter
  //instead of match the splitter.
  var u = url.split(/((?:\\\/|[^/])+)/).filter(function (e) {
    return e !== '/'
  })
  if(u[u.length - 1] == '')
    u.pop()
  return u
}

function buffer(stream, cb) {

  toPull(stream)
  .pipe(pull.reduce(function (body, chunk) {
    return body + chunk
  }, '', function (err, acc) {
    cb(err, acc)
  }))

}

function isDir(key) {
  return key[key.length - 1] == '/'
}

//ideas for more features
//upload a bundle via a tarball
//just post a tarball... with ?x option.
//would definately be handy for updating your site.
//maybe also a sitemap thing?
//that has all the keys?

module.exports = function (db, opts) {
  opts = opts || {}
  var sep = opts.sep || '\x00'
  return function (req, res, next) {

    var url = isDir(req.url) ? req.url + 'index.html' : req.url
    var key = split(url).join('\x00')

    function respond (err, data) {
      if(err) {
        if(next) return next(err)
        res.setHeader('content-type', 'application/json')
        data = JSON.stringify({
          error: true,
          message: err.message,
          code:err.code
        })
      } else
        res.setHeader('content-type', mime.lookup(url))

      res.setHeader('content-length', data ? data.length : 0)
      res.end(data || '')
    }

   if(req.method === 'GET') {
      req.resume()
      db.get(key, respond)
    } else if (req.method === 'PUT') {
      buffer(req, function (err, value) {
        if(err) return respond(err)
        db.put(key, value, respond)
      })
    } else if (req.method === 'DELETE') {
      req.resume()
      db.del(key, respond)
    } else {
      respond(new Error('method:' + req.method + ' is not supported'))
    }
  }
}

if(!module.parent) {
  var levelup = require('levelup')
  var opts    = require('optimist').argv

  var db = levelup(opts._[0] || '/tmp/level-static')

  require('http')
    .createServer(module.exports(db, opts))
    .listen(opts.port || 8000)
}
