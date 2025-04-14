import http from 'http';

http.createServer((req, res) => {
  res.writeHead(301, { "Location": "https://" + req.headers.host + req.url });
  res.end();
}).listen(80, () => {
  console.log('HTTP редирект запущен на порту 80');
});
