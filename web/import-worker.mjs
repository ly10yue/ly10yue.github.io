import {readPackage} from './package.mjs';
self.onmessage=e=>{try{const{raw,audio}=readPackage(new Uint8Array(e.data));self.postMessage({raw,audio:audio.buffer},[audio.buffer]);}catch(error){self.postMessage({error:error.message});}};
