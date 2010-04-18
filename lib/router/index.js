var createServer = require("http").createServer,
	readFile = require("fs").readFile,
	sys = require("sys"),
	url = require("url"),
	mime = require("./mime");

var router = exports;
var NOT_FOUND = "Not Found\n";

function notFound(req, res) {
	res.sendHeader(404, [
		["Content-Type", "text/plain"],
		["Content-Length", NOT_FOUND.length]
	]);
	res.write(NOT_FOUND);
	res.end();
}

router.createServer = function() {
	var getMap = {};
	
	server = createServer(function(req, res) {
		  if (req.method === "GET" || req.method === "HEAD") {
			    var handler = getMap[url.parse(req.url).pathname] || notFound;

			    res.simpleText = function (code, body) {
			      res.sendHeader(code, [ ["Content-Type", "text/plain"]
			                           , ["Content-Length", body.length]
			                           ]);
			      res.write(body);
			      res.end();
			    };

			    res.simpleJSON = function (code, obj) {
			      var body = JSON.stringify(obj);
			      res.sendHeader(code, [ ["Content-Type", "text/json"]
			                           , ["Content-Length", body.length]
			                           ]);
			      res.write(body);
			      res.end();
			    };

			    handler(req, res);
			  }
	});
	
	return {
		listen: function(port, host) {
			server.listen(port, host);
			sys.puts("Server at http://" + (host || "127.0.0.1") + ":" + port.toString() + "/");
		},
		get: function(path, handler) {
			getMap[path] = handler;
		}
	};
};

function extname (path) {
  var index = path.lastIndexOf(".");
  return index < 0 ? "" : path.substring(index);
}

router.staticHandler = function (filename) {
  var body, headers;
  var content_type = mime.lookupExtension(extname(filename));
  var encoding = (content_type.slice(0,4) === "text" ? "utf8" : "binary");

  function loadResponseData(callback) {
    if (body && headers) {
      callback();
      return;
    }

    sys.puts("loading " + filename + "...");
    readFile(filename, encoding, function (err, data) {
      if (err) {
        sys.puts("Error loading " + filename);
      } else {
        body = data;
        headers = [ [ "Content-Type"   , content_type ]
                  , [ "Content-Length" , body.length ]
                  ];
          headers.push(["Cache-Control", "public"]);
         
        sys.puts("static file " + filename + " loaded");
        callback();
      }
    });
  }

  return function (req, res) {
    loadResponseData(function () {
      res.sendHeader(200, headers);
      res.write(body, encoding);
      res.end();
    });
  };
};
