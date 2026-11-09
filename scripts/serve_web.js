const http=require('http'),fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..','web');
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8'};
http.createServer((req,res)=>{const name=req.url==='/'?'index.html':decodeURIComponent(req.url.slice(1));const file=path.join(root,name);if(!file.startsWith(root)||!fs.existsSync(file)){res.writeHead(404);return res.end('Not found')}res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream'});fs.createReadStream(file).pipe(res)}).listen(8765,'127.0.0.1',()=>console.log('GAX100 web http://127.0.0.1:8765'));
