import {unzipSync} from './vendor/fflate.mjs';
import {parseChart} from './engine.mjs';
export const MAX_PACKAGE=64*1024*1024,MAX_CHART=4*1024*1024;
// Inspect central-directory sizes before inflating any entry. No external URLs or paths.
export function inspectZip(bytes){
 if(bytes.length>MAX_PACKAGE)throw new Error('试玩版支持不超过 64 MB 的谱面包');
 let v=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength),end=-1;
 for(let i=bytes.length-22;i>=Math.max(0,bytes.length-65557);i--)if(v.getUint32(i,true)===0x06054b50&&i+22+v.getUint16(i+20,true)===bytes.length){end=i;break;}
 if(end<0)throw new Error('不是完整的 .interval / ZIP 谱面包');
 let count=v.getUint16(end+10,true),p=v.getUint32(end+16,true),size=v.getUint32(end+12,true),names=new Set(),total=0,entries=[];
 if(v.getUint16(end+4,true)||v.getUint16(end+6,true)||v.getUint16(end+8,true)!==count||count<1||count>64||p+size!==end)throw new Error('不支持分卷、ZIP64 或过多文件的谱面包');
 for(let i=0;i<count;i++){
  if(p+46>end||v.getUint32(p,true)!==0x02014b50)throw new Error('ZIP 目录损坏');
  let flags=v.getUint16(p+8,true),method=v.getUint16(p+10,true),compressed=v.getUint32(p+20,true),length=v.getUint32(p+24,true),n=v.getUint16(p+28,true),extra=v.getUint16(p+30,true),comment=v.getUint16(p+32,true),local=v.getUint32(p+42,true);
  if(p+46+n+extra+comment>end||local+30>p||flags&1||![0,8].includes(method))throw new Error('不支持加密或此种 ZIP 压缩');
  let name=new TextDecoder().decode(bytes.subarray(p+46,p+46+n));
  if(!/^[A-Za-z0-9_.-]+$/.test(name)||name==='.'||name==='..'||names.has(name))throw new Error('包内文件名无效、包含目录或重复');
  if(v.getUint32(local,true)!==0x04034b50)throw new Error('ZIP 文件头损坏');
  let ln=v.getUint16(local+26,true),le=v.getUint16(local+28,true),localName=new TextDecoder().decode(bytes.subarray(local+30,local+30+ln));
  if(localName!==name||v.getUint16(local+8,true)!==method||local+30+ln+le+compressed>v.getUint32(end+16,true)||v.getUint16(local+6,true)&1)throw new Error('ZIP 文件头与目录不一致');
  total+=length;if(total>MAX_PACKAGE||(name==='chart.json'&&length>MAX_CHART))throw new Error('解压后的谱面超过大小限制');
  names.add(name);entries.push({name,size:length});p+=46+n+extra+comment;
 }
 if(p!==end||!names.has('chart.json'))throw new Error('谱面包根目录缺少 chart.json');return entries;
}
export function readPackage(bytes){
 const entries=inspectZip(bytes),expected=new Map(entries.map(e=>[e.name,e.size]));
 const only=name=>unzipSync(bytes,{filter:e=>e.name===name&&e.originalSize===expected.get(name)})[name];
 const jsonBytes=only('chart.json');if(!jsonBytes||jsonBytes.length!==expected.get('chart.json'))throw new Error('谱面文件损坏');
 let raw;try{raw=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(jsonBytes));}catch{throw new Error('chart.json 不是有效的 UTF-8 JSON');}
 const chart=parseChart(raw);if(!expected.has(chart.audio))throw new Error('谱面包中缺少歌曲：'+chart.audio);
 const audio=only(chart.audio);if(!audio||audio.length!==expected.get(chart.audio))throw new Error('歌曲文件损坏');
 return{raw,chart,audio};
}
