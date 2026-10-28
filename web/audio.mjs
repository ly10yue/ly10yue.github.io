export class AudioPlayer{
 constructor(){this.ctx=null;this.source=null;this.buffer=null;this.epoch=0;this.anchor=0;this.position=0;this.running=false;this.hits={};this.hitSources=new Set();this.volume=1;}
 async unlock(){if(!this.ctx){const Context=window.AudioContext||window.webkitAudioContext;if(!Context)throw new Error('此浏览器不支持 Web Audio，请用 Safari 打开');this.ctx=new Context({latencyHint:'interactive'});this.musicGain=this.ctx.createGain();this.musicGain.gain.value=.8;this.musicGain.connect(this.ctx.destination);this.hitGain=this.ctx.createGain();this.hitGain.connect(this.ctx.destination);}await this.ctx.resume();if(this.ctx.state!=='running')throw new Error('声音未启动，请再次点击播放，并检查 Safari 的声音设置');}
 async decode(bytes,forceFallback=false){
  if(!forceFallback)try{return await this.ctx.decodeAudioData(bytes.slice(0));}catch{}
  const b=new Uint8Array(bytes);if(new TextDecoder().decode(b.subarray(0,4))!=='OggS')throw new Error('浏览器无法解码歌曲，请用制谱器重新导出 Ogg 谱面包');
  const Decoder=window['ogg-vorbis-decoder']?.OggVorbisDecoderWebWorker;if(!Decoder)throw new Error('Ogg 解码组件未加载，请联网刷新后重试');
  const decoder=new Decoder();try{await decoder.ready;let data=await decoder.decodeFile(b);if(!data.samplesDecoded||data.errors?.length||data.channelData.length>2||data.samplesDecoded/data.sampleRate>602)throw new Error('Ogg 歌曲损坏、不是 Vorbis，或超过 10 分钟/双声道限制');let buffer=this.ctx.createBuffer(data.channelData.length,data.samplesDecoded,data.sampleRate);data.channelData.forEach((channel,i)=>buffer.copyToChannel(channel,i));this.usedFallback=true;return buffer;}finally{await decoder.free();}
 }
 async load(bytes,forceFallback=false){this.stop();this.buffer=null;this.usedFallback=false;const b=await this.decode(bytes,forceFallback);if(b.duration>602||b.numberOfChannels>2)throw new Error('试玩版支持最长 10 分钟的单声道/双声道歌曲');this.buffer=b;this.position=0;}
 async loadHits(){await Promise.all(['tap','hold'].map(async k=>{if(this.hits[k])return;const r=await fetch('assets/'+k+'.wav');if(!r.ok)throw new Error('打击音加载失败');this.hits[k]=await this.ctx.decodeAudioData(await r.arrayBuffer());}));}
 start(position=0,delay=0){this.stop();this.position=position;const source=this.ctx.createBufferSource();source.buffer=this.buffer;source.connect(this.musicGain);this.epoch=this.ctx.currentTime+delay;this.anchor=this.epoch-position;source.start(this.epoch,Math.max(0,position));this.source=source;this.running=true;}
 now(){return this.running?Math.max(this.position,this.ctx.currentTime-this.anchor):this.position;}
 pause(){const t=this.now();this.stop();this.position=t;return t;}
 stop(){if(this.source){this.source.onended=null;try{this.source.stop();}catch{}this.source.disconnect();this.source=null;}this.running=false;for(let s of this.hitSources){try{s.stop();}catch{}s.disconnect();}this.hitSources.clear();}
 hit(hold,at){if(!this.volume||!this.hits[hold?'hold':'tap'])return;let s=this.ctx.createBufferSource();s.buffer=this.hits[hold?'hold':'tap'];s.connect(this.hitGain);this.hitGain.gain.value=this.volume;this.hitSources.add(s);s.onended=()=>{this.hitSources.delete(s);s.disconnect();};s.start(at===undefined?this.ctx.currentTime:Math.max(this.ctx.currentTime,at));}
}
