/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

// Inport required modules
const http = require('http');
const url = require('url');
const qs = require('querystring');

// Define URIs for supported HTTP methods (get, post)
let routes = {
  'GET': {
    '/': (request, response) => {
    // HTTP get function for default path
    let method = request.method;
    let baseURI = url.parse(request.url, true);
    console.log(baseURI);
    let headers = request.headers;
    let userAgent = headers['user-agent'];
    console.log('Request headers: ' + headers);
    
    response.writeHead(200, {'Content-Type': 'text/html'});
    response.end('<h1>Hello, World!</h1>' + 
      '<p>method - ' + method + '</p>' +
      '<p>url - ' + baseURI + '</p>' +
      '<p>headers - ' + headers + '</p>' +
      '<p>User Agent - ' + userAgent + '</p>');        
    },
    
    '/about': (request, response) => {
      // HTTP get function for /about path
      response.writeHead(200, {'Content-Type': 'text/html'});
      response.end('<h1>This is the about page</h1>');
    },
    
    '/api/getInfo': (request, response) => {
      // HTTP get function for /api/getInfo path
      response.writeHead(200, {'Content-Type': 'application/json'});
      response.end(JSON.stringify(request.queryParams));
    }
  },
  
  'POST': {
    '/api/login': (request, response) => {
      // HTTP post function for /api/login path
      let body = '';
      request.on('data', data => {
        body += data;
        console.log(body.length);
        if (body.length > 2097152) {
          // Uploaded file greater than max file length, log error
          response.writeHead(413, {'Content-Type': 'text/html'});
          response.end('<h3>Error: file being uploaded exceeds 2MB limit</h3>', () => {
            request.connection.destroy();
          });
        }
      });
      request.on('end', () => {
        let params = qs.parse(body);
        console.log('Username: ' + params['username']);
        console.log('Password: ' + params['password']);
        response.end();
      });
    }
  },
  
  'NA': (request, response) => {
    // Invalid HTTP method, log error
    console.log('Content not found');
    response.writeHead(404);
    response.end('Content not found');
  }
};

// Define router for input HTTP requests
function router(request, response) {
  let baseURI = url.parse(request.url, true);
  console.log("method: " + request.method);
  console.log("pathname: " + baseURI.pathname);
  
  // Retrieve function (resolve route) for request with specified method
  // and pathname
  let resolveRoute = routes[request.method][baseURI.pathname];
  if (undefined != resolveRoute) {
    // Then invoke function, including query parameters
    request.queryParams = baseURI.query;
    resolveRoute(request, response);
  } else {
    routes['NA'];
  }
}

// Start HTTP server
http.createServer(router).listen(8081, () => {
  console.log('Server running at http://localhost:8081/');
});

