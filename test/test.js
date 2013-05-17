
var request = require('request')
var static  = require('../')
var levelup = require('levelup')
var http = require('http')
var tape = require('tape')

var db = levelup('/tmp/level-static-test')
var port = ~~(Math.random()*60000) + 1024

function url() {
  return 'http://localhost:'+port+'/'+[].slice.call(arguments).join('/')
}

tape('simple test', function (t) {

  var server = http.createServer(static(db)).listen(port, function () {

    var put = request.put(url('foo'))
    put.write('hello\n')
    put.end()
    put.on('end', function () {
      request(url('foo'), function (err, _, body) {
        console.log(err, body)
        t.equal('hello\n', body)
        server.close()
        t.end()
      })
    })
  })

})

