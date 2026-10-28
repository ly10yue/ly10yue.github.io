let dbPromise;
function db(){return dbPromise??=new Promise((resolve,reject)=>{let r=indexedDB.open('musound-web-012',1);r.onupgradeneeded=()=>r.result.createObjectStore('songs',{keyPath:'id'});r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);r.onblocked=()=>reject(new Error('请关闭其他试玩页面后重试'));});}
async function transaction(mode,operation){let d=await db();return new Promise((resolve,reject)=>{const tx=d.transaction('songs',mode),r=operation(tx.objectStore('songs'));tx.oncomplete=()=>resolve(r.result);tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error||new Error('存储失败'));});}
export const savedSongs=()=>transaction('readonly',s=>s.getAll());
export const saveSong=song=>transaction('readwrite',s=>s.put(song));
export const deleteSong=id=>transaction('readwrite',s=>s.delete(id));
export function settings(){try{return JSON.parse(localStorage.getItem('musound-settings')||'{}');}catch{return{};}}
export function saveSettings(value){try{localStorage.setItem('musound-settings',JSON.stringify(value));}catch{}}
export function best(id,value){try{let k='musound-best-'+id,old=+localStorage.getItem(k)||0;if(value!==undefined&&value>old)localStorage.setItem(k,String(value));return Math.max(old,value||0);}catch{return value||0;}}
