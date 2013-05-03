# level-static

use leveldb as a static file store.

``` js
var static  = require('level-static')
var http    = require('http')
var levelup = require('levelup')

var db = levelup('/tmp/level-static')

http.createServer(static(db)).listen(8000)
```

Will serve `index.html` if you give a path that ends in a `/`.

sets mime type and content length.

Of course, can also be used with
[sublevel](https://github.com/dominictarr/level-sublevel)

and as an express middleware.

## License

MIT
