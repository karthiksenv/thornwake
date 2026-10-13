import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
const files=[];
function scan(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,e.name);if(e.isDirectory())scan(p);else{const data=fs.readFileSync(p);files.push({file:p.replaceAll('\\','/'),bytes:data.length,gzipBytes:zlib.gzipSync(data).length});}}}
scan('dist');const total=files.reduce((s,f)=>s+f.bytes,0),transfer=files.reduce((s,f)=>s+f.gzipBytes,0);
fs.mkdirSync('output',{recursive:true});fs.writeFileSync('output/build-report.json',JSON.stringify({totalBytes:total,gzipBytes:transfer,budgetBytes:2000000,files},null,2));
console.log(`Complete game: ${(total/1000).toFixed(1)} KB; gzip estimate ${(transfer/1000).toFixed(1)} KB; 2 MB budget.`);
if(total>2000000)throw new Error('The complete game exceeds its download budget');
