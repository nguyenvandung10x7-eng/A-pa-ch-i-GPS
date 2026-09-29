/** Entry-local Web Audio owner. Foundation's noAudio setting is unchanged.
 * Completion comes only from a real AudioBufferSourceNode ended event. */
export class BlackoutAudio {
  private context:AudioContext|null=null;
  private buffer:AudioBuffer|null=null;
  private source:AudioBufferSourceNode|null=null;
  private alive=true; private token=0; private startedAt=0; private wantsPlay=false;
  private paused=false; private abort:AbortController|null=null;
  state='idle';error='';playCount=0;endCount=0;duration=0;
  constructor(private url:string,private log:(type:string,data:Record<string,unknown>)=>void,private ended:()=>void,private failed:(message:string)=>void){}
  /** Call synchronously from Start/retry user gesture, before awaiting fetch. */
  unlock():void {
    if(!this.alive)return;
    this.context??=new AudioContext();
    if(!this.paused)void this.context.resume().then(()=>{
      if(!this.alive)return;
      if(this.paused){void this.context?.suspend();return;}
      if(this.context?.state!=='running'){this.failure('Audio unlock denied');return;}
      this.log('audio_unlocked',{});this.maybePlay();
    }).catch(e=>this.failure(String(e)));
    if(!this.buffer&&!this.abort)this.load();
  }
  private load():void {
    const context=this.context;if(!context)return;
    const abort=new AbortController();this.abort=abort;this.state='loading';
    void fetch(this.url,{signal:abort.signal}).then(r=>{if(!r.ok)throw Error('Blackout HTTP '+r.status);return r.arrayBuffer();})
      .then(b=>context.decodeAudioData(b)).then(buffer=>{
        if(!this.alive||this.abort!==abort)return;
        this.abort=null;
        if(Math.abs(buffer.duration-3)>1/24000)throw Error('Blackout must decode to 3 seconds');
        this.buffer=buffer;this.duration=buffer.duration;this.state='ready';this.log('audio_ready',{duration:this.duration});this.maybePlay();
      }).catch(e=>{if(this.alive&&!abort.signal.aborted){this.abort=null;this.failure(String(e));}});
  }
  play():void {if(!this.alive)return;this.wantsPlay=true;this.maybePlay();}
  private maybePlay():void {
    const context=this.context;
    if(!this.alive||!this.wantsPlay||this.paused||this.source||!this.buffer||!context)return;
    if(context.state!=='running'){this.failure('Audio suspended: use Retry audio');return;}
    const source=context.createBufferSource(), token=++this.token;
    source.buffer=this.buffer;source.connect(context.destination);this.source=source;this.startedAt=context.currentTime;
    source.onended=()=>{
      if(!this.alive||this.token!==token||this.source!==source)return;
      source.onended=null;source.disconnect();this.source=null;this.wantsPlay=false;this.endCount++;this.state='ended';
      this.log('audio_native_ended',{duration:this.duration});
      if(!this.paused)this.ended();
    };
    source.start();this.playCount++;this.state='playing';this.log('audio_play',{token});
  }
  pause(value:boolean):void {
    if(!this.alive)return;this.paused=value;
    const context=this.context;
    if(value){if(context)void context.suspend().catch(e=>this.failure(String(e)));return;}
    if(context)void context.resume().then(()=>{
      if(!this.alive||this.paused)return;
      if(context.state!=='running'){this.failure('Audio resume denied');return;}
      if(this.state==='ended')this.ended();else this.maybePlay();
    }).catch(e=>this.failure(String(e)));
  }
  retry():void {if(!this.alive)return;this.stopSource();this.error='';this.state=this.buffer?'ready':'idle';this.unlock();}
  private failure(message:string):void {if(!this.alive)return;this.error=message;this.state='error';this.stopSource();this.log('audio_error',{message});this.failed(message);}
  private stopSource():void {this.token++;if(this.source){this.source.onended=null;this.source.stop();this.source.disconnect();this.source=null;}this.wantsPlay=false;}
  dispose():void {
    if(!this.alive)return;this.alive=false;this.abort?.abort();this.abort=null;this.stopSource();this.buffer=null;
    const context=this.context;this.context=null;if(context&&context.state!=='closed')void context.close();this.state='disposed';
  }
  inspect(){return {state:this.state,error:this.error,duration:this.duration,paused:this.paused,playCount:this.playCount,endCount:this.endCount,
    currentTime:this.source&&this.context?Math.min(this.duration,this.context.currentTime-this.startedAt):this.state==='ended'?this.duration:0,
    owned:{contexts:this.context?1:0,sources:this.source?1:0,endedCallbacks:this.source?1:0,loads:this.abort?1:0}};}
}
