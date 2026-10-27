/* Operational demo state. No network calls; deliberately separate from the academy DB. */
(function () {
  'use strict';
  var KEY = 'zf.operations.v1', memory, persistent = true;
  function seed() { return {version:1, server:'healthy', ea:'healthy', stale:false, account:0, stress:false, suite:null, patched:false, ticket:false, copyFixed:false, reviews:{}, events:[]}; }
  function valid(d) { return d && d.version === 1 && ['healthy','disconnected'].includes(d.server) && ['healthy','stopped'].includes(d.ea) && typeof d.stale === 'boolean' && typeof d.stress === 'boolean' && Number.isInteger(d.account) && d.account >= 0 && d.account < 3 && typeof d.patched === 'boolean' && typeof d.ticket === 'boolean' && typeof d.copyFixed === 'boolean' && [null,'failed','passed'].includes(d.suite) && d.reviews && typeof d.reviews === 'object' && !Array.isArray(d.reviews) && Array.isArray(d.events); }
  function load() { if (memory) return memory; try { var d=JSON.parse(localStorage.getItem(KEY)); memory=valid(d)?d:seed(); } catch(e) { memory=seed(); persistent=false; } return memory; }
  function save() { try { localStorage.setItem(KEY,JSON.stringify(memory)); } catch(e) { persistent=false; } }
  function log(text) { memory.events.unshift({text:text,at:new Date().toISOString()}); memory.events=memory.events.slice(0,20); }
  function change(action, value) {
    var d=load();
    switch(action) {
      case 'disconnect': d.server='disconnected'; log('London terminal lost its broker connection. Server remains online.'); break;
      case 'stop-ea': d.ea='stopped'; log('Gold Session EA stopped sending its heartbeat.'); break;
      case 'recover': d.server='healthy'; d.ea='healthy'; log('Simulated recovery: broker connected, one EA instance confirmed, heartbeat received.'); break;
      case 'account': if(Number.isInteger(value)&&value>=0&&value<3){d.account=value;d.stress=false;} break;
      case 'stress': if(d.stale)break; d.stress=!d.stress; log(d.stress?'Market-move scenario applied to the selected account.':'Market-move scenario cleared.'); break;
      case 'stale': d.stale=!d.stale; log(d.stale?'Account feed paused. Values are last known snapshots.':'Account snapshot refreshed in the demo.'); break;
      case 'test': d.suite=d.patched?'passed':'failed'; log(d.patched?'EA retest completed: 6 of 6 checks passed.':'EA tests completed: duplicate-order check failed.'); break;
      case 'ticket': d.ticket=true; log('Maintenance ticket EA-104 opened for duplicate orders after reconnect.'); break;
      case 'patch': if(d.ticket){d.patched=true; d.suite=null; log('Demo fix applied: duplicate-order guard. Retest required.');} break;
      case 'copy': d.copyFixed=true; log('Symbol mapping corrected to EURUSD.a; reconciliation rerun. No live orders sent.'); break;
      case 'review': if(value && /^M\d+$/.test(value.id) && typeof value.note==='string' && value.note.trim()){d.reviews[value.id]={note:value.note.trim().slice(0,1000),at:new Date().toISOString()};log('Coach feedback saved to the student record.');} break;
      case 'reset': memory=seed(); break;
      default: return d;
    }
    save(); return memory;
  }
  var accounts=[
    {name:'Primary / USD 50k',id:'ZF-4821',balance:50000,start:50000,floor:45000,limit:2500,closed:-420,open:-680,fees:24,swaps:6,reset:'00:00 UTC',exposure:'EURUSD buy 0.80 · GBPUSD buy 0.40',currency:'Both positions are short USD.'},
    {name:'Evaluation / USD 25k',id:'ZF-7192',balance:25000,start:25000,floor:22500,limit:1250,closed:-480,open:-520,fees:16,swaps:4,reset:'00:00 UTC',exposure:'EURUSD buy 0.30 · USDJPY sell 0.20',currency:'Both positions are short USD.'},
    {name:'Swing / USD 100k',id:'ZF-9306',balance:100000,start:100000,floor:90000,limit:5000,closed:310,open:-940,fees:32,swaps:18,reset:'00:00 UTC',exposure:'XAUUSD buy 0.20',currency:'Gold exposure quoted in USD.'}
  ];
  function risk(i, stressed) { var a=accounts[i], extra=stressed?a.limit*.7:0, pnl=a.closed+a.open-a.fees-a.swaps-extra, loss=Math.max(0,-pnl),equity=a.start+pnl; return {loss:loss,equity:equity,remaining:a.limit-loss,overall:equity-a.floor,used:loss/a.limit*100,extra:extra}; }
  window.ZiraOpsStore={load:load,change:change,accounts:accounts,risk:risk,persistent:function(){load();return persistent;}};
})();


