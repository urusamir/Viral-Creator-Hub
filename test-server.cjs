const http = require('http');
http.get('http://localhost:5000', (res) => {
  console.log(`Server is running, status: ${res.statusCode}`);
}).on('error', (e) => {
  console.error(`Error: ${e.message}`);
});
