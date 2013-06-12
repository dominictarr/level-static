
var request = require('request')
var static  = require('../')
var levelup = require('level-test')()
var http = require('http')
var tape = require('tape')
var fs = require('fs')
var db = levelup('level-static-test')
var port = ~~(Math.random()*60000) + 1024
var shasum = require('shasum')

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
        t.equal(body, 'hello\n')
        server.close()
        t.end()
      })
    })
  })

})

tape('large file', function (t) {

  var server = http.createServer(static(db)).listen(port, function () {

    var d3 = '', l = 0
    var put = request.put(url('d3.v2.js'))

    fs.createReadStream(__dirname + '/fixtures/d3.v2.js', 'utf-8')
    .on('data', function (data) {
      d3 += data.toString()
      l += data.length
    })
    .pipe(put)

    put.on('end', function () {
      request(url('d3.v2.js'), function (err, _, body) {
        if(err) throw err
        t.equal(body, d3)
        server.close()
        t.end()
      })
    })
  })
})
