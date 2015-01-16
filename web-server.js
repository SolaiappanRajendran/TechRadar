#!/usr/bin/env node

var util = require('util'),
    http = require('http'),
    fs = require('fs'),
    url = require('url'),
    events = require('events');

var DEFAULT_PORT = 9200;

var latencyTest = false;
//In secs.. will be used when latency per endpoint is not specified in rest-mappings and latencyTest is true
var defaultMaxLatency = 1;

function main(argv) {
    new HttpServer({
        'GET': createServlet(StaticServlet),
        'POST': createServlet(StaticServlet),
        'PUT': createServlet(StaticServlet),
        'HEAD': createServlet(StaticServlet)
    }).start(Number(argv[2]) || DEFAULT_PORT);
}

function escapeHtml(value) {
    return value.toString().
        replace('<', '&lt;').
        replace('>', '&gt;').
        replace('"', '&quot;');
}

function createServlet(Class) {
    var servlet = new Class();
    return servlet.handleRequest.bind(servlet);
}

/**
 * An Http server implementation that uses a map of methods to decide
 * action routing.
 *
 * @param {Object} Map of method => Handler function
 */
function HttpServer(handlers) {
    this.handlers = handlers;
    this.server = http.createServer(this.handleRequest_.bind(this));
}

HttpServer.prototype.start = function (port) {
    this.port = port;
    this.server.listen(port);
    util.puts('Http Server running at http://localhost:' + port + '/');
    util.puts('Latency Test: ' + latencyTest + ', default maxLatency(secs): ' + defaultMaxLatency);
};

HttpServer.prototype.parseUrl_ = function (urlString) {
    var parsed = url.parse(urlString);
    parsed.pathname = url.resolve('/', parsed.pathname);
    return url.parse(url.format(parsed), true);
};

HttpServer.prototype.handleRequest_ = function (req, res) {
    var logEntry = req.method + ' ' + req.url;
    // Commenting out user-agent header spam/logging so console just shows RESTful logging
    // if (req.headers['user-agent']) {
    //   logEntry += ' ' + req.headers['user-agent'];
    // }
    // Commenting out each request spam/logging so console just shows RESTful logging
    //util.puts(logEntry);
    req.url = this.parseUrl_(req.url);
    if (req.url.pathname.indexOf("/shutdown-server") == 0) {
        util.puts('Initiating Server Shutdown ...');
        res.writeHead(200, {
            'Content-Type': 'text/html'
        });
        res.write('<!doctype html>\n');
        res.write('<title>Server Shutdown Initiated</title>\n');
        res.write('<h1>Shutting Down Now ...</h1>');
        res.end();
        this.server.close();
    } else {
        var handler = this.handlers[req.method];
        if (!handler) {
            res.writeHead(501);
            res.end();
        } else {
            handler.call(this, req, res);
        }
    }
};

/**
 * Handles static content.
 */
function StaticServlet() {
}

StaticServlet.MimeMap = {
    'txt': 'text/plain',
    'html': 'text/html',
    'css': 'text/css',
    'xml': 'application/xml',
    'json': 'application/json',
    'js': 'application/javascript',
    'jsonp': 'application/javascript',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'gif': 'image/gif',
    'png': 'image/png',
    'svg': 'image/svg+xml'
};

StaticServlet.prototype.handleRequest = function (req, res) {
    var self = this;
    var path = ('./' + req.url.pathname).replace('//', '/').replace(/%(..)/g, function (match, hex) {
        return String.fromCharCode(parseInt(hex, 16));
    });
    var responseCode = 200;
    fs.stat(path, function (err, stat) {
        if (err) {
//      util.log(err);
            return self.sendMissing_(req, res, path);
        }
        if (stat.isDirectory())
            return self.sendDirectory_(req, res, path);
        return self.sendFile_(req, res, path, responseCode);
    });
}

StaticServlet.prototype.sendError_ = function (req, res, error) {
    res.writeHead(500, {
        'Content-Type': 'text/html'
    });
    res.write('<!doctype html>\n');
    res.write('<title>Internal Server Error</title>\n');
    res.write('<h1>Internal Server Error</h1>');
    res.write('<pre>' + escapeHtml(util.inspect(error)) + '</pre>');
    util.puts('500 Internal Server Error');
    util.puts(util.inspect(error));
};

StaticServlet.prototype.sendMissing_ = function (req, res, path) {
    path = path.substring(1);
    res.writeHead(404, {
        'Content-Type': 'text/html'
    });
    res.write('<!doctype html>\n');
    res.write('<title>404 Not Found</title>\n');
    res.write('<h1>Not Found</h1>');
    res.write(
            '<p>The requested URL ' +
            escapeHtml(path) +
            ' was not found on this server.</p>'
    );
    res.end();
    util.puts('404 Not Found: ' + path);
};

StaticServlet.prototype.sendForbidden_ = function (req, res, path) {
    path = path.substring(1);
    res.writeHead(403, {
        'Content-Type': 'text/html'
    });
    res.write('<!doctype html>\n');
    res.write('<title>403 Forbidden</title>\n');
    res.write('<h1>Forbidden</h1>');
    res.write(
            '<p>You do not have permission to access ' +
            escapeHtml(path) + ' on this server.</p>'
    );
    res.end();
    util.puts('403 Forbidden: ' + path);
};

StaticServlet.prototype.sendRedirect_ = function (req, res, redirectUrl) {
    res.writeHead(301, {
        'Content-Type': 'text/html',
        'Location': redirectUrl
    });
    res.write('<!doctype html>\n');
    res.write('<title>301 Moved Permanently</title>\n');
    res.write('<h1>Moved Permanently</h1>');
    res.write(
            '<p>The document has moved <a href="' +
            redirectUrl +
            '">here</a>.</p>'
    );
    res.end();
    util.puts('301 Moved Permanently: ' + redirectUrl);
};

StaticServlet.prototype.sendFile_ = function (req, res, path, responseCode) {
    var self = this;
    var file = fs.createReadStream(path);
    res.writeHead(responseCode, {
        'Content-Type': StaticServlet.
            MimeMap[path.split('.').pop()] || 'text/plain',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        Expires: '0'
    });
    if (req.method === 'HEAD') {
        res.end();
    } else {
        file.on('data', res.write.bind(res));
        file.on('close', function () {
            res.end();
        });
        file.on('error', function (error) {
            self.sendError_(req, res, error);
        });
    }
};

StaticServlet.prototype.sendDirectory_ = function (req, res, path) {
    var self = this;
    if (path.match(/[^\/]$/)) {
        req.url.pathname += '/';
        var redirectUrl = url.format(url.parse(url.format(req.url)));
        return self.sendRedirect_(req, res, redirectUrl);
    }
    fs.readdir(path, function (err, files) {
        if (err)
            return self.sendError_(req, res, error);

        if (!files.length)
            return self.writeDirectoryIndex_(req, res, path, []);

        var remaining = files.length;
        files.forEach(function (fileName, index) {
            fs.stat(path + '/' + fileName, function (err, stat) {
                if (err)
                    return self.sendError_(req, res, err);
                if (stat.isDirectory()) {
                    files[index] = fileName + '/';
                }
                if (!(--remaining))
                    return self.writeDirectoryIndex_(req, res, path, files);
            });
        });
    });
};

StaticServlet.prototype.writeDirectoryIndex_ = function (req, res, path, files) {
    path = path.substring(1);
    res.writeHead(200, {
        'Content-Type': 'text/html'
    });
    if (req.method === 'HEAD') {
        res.end();
        return;
    }
    res.write('<!doctype html>\n');
    res.write('<title>' + escapeHtml(path) + '</title>\n');
    res.write('<style>\n');
    res.write('  ol { list-style-type: none; font-size: 1.2em; }\n');
    res.write('</style>\n');
    res.write('<h1>Directory: ' + escapeHtml(path) + '</h1>');
    res.write('<ol>');
    files.forEach(function (fileName) {
        if (fileName.charAt(0) !== '.') {
            res.write('<li><a href="' +
                escapeHtml(fileName) + '">' +
                escapeHtml(fileName) + '</a></li>');
        }
    });
    res.write('</ol>');
    res.end();
};

// Must be last,
main(process.argv);
