const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const html = fs.readFileSync('index.html', 'utf8');
const scripts = [...html.matchAll(/<script(?: src="([^"]+)")?>([\s\S]*?)<\/script>/g)];

function app({curriculum=true}={}) {
  const elements = {};
  function element(id) {
    if (elements[id]) return elements[id];
    const classes = new Set(['play','finish','selfCheck','next'].includes(id) ? ['hidden'] : []);
    const handlers = {};
    return elements[id] = {
      value: ({term:'1',subject:'mixed',player:'マキ'})[id] || '',
      style: {}, textContent:'', disabled:false,
      classList: {add:c=>classes.add(c),remove:c=>classes.delete(c),contains:c=>classes.has(c),toggle(c,on){if(on)classes.add(c);else classes.delete(c);}},
      addEventListener:(name,fn)=>{handlers[name]=fn;},
      click(){if(!this.disabled) handlers.click?.({});},
      focus(){}, getContext:()=>({}),
    };
  }
  const storage = new Map();
  const context = vm.createContext({window:{},document:{getElementById:element},
    localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},
    requestAnimationFrame:()=>{},Intl,Date});
  for(const [,src,inline] of scripts){
    if(!curriculum&&src==='curriculum_questions.js')continue;
    vm.runInContext(src?fs.readFileSync(src,'utf8'):inline,context,{filename:src||'index.html inline'});
  }
  return {context,element,storage,run:code=>vm.runInContext(code,context)};
}

test('all 220 legacy questions remain intact and structurally valid',()=>{
  const baseline = app({curriculum:false}).context.window.MAKI_MEI_BANK;
  const {context} = app();
  const bank = context.window.MAKI_MEI_BANK;
  assert.equal(baseline.length,220);
  assert.equal(new Set(bank.map(q=>q.id)).size,bank.length);
  const counts = {};
  for(const original of baseline){
    const q=bank.find(q=>q.id===original.id);
    for(const key of ['q','a','type','id'])assert.equal(q[key],original[key]);
    counts[q.type]=(counts[q.type]||0)+1;assert.equal(q.verified,false);assert.ok(q.q&&q.a);
  }
  assert.deepEqual(counts,{read:55,write:55,word:60,phrase:50});
});

test('only three terms exist and first term is selected in HTML',()=>{
  const select=html.match(/<select id="term"[^>]*>([\s\S]*?)<\/select>/)[1];
  assert.deepEqual([...select.matchAll(/<option value="([^"]+)"[^>]*>([^<]+)<\/option>/g)].map(m=>[m[1],m[2]]),[['1','1学期'],['2','2学期'],['3','3学期']]);
  assert.match(html,/<option value="1" selected>/);
});

test('all real term/subject combinations exclude unverified questions and cannot start',()=>{
  const a=app({curriculum:false});
  for(const term of ['trial','1','2','3','invalid'])for(const subject of ['mixed','read','write','word','phrase']){
    a.element('term').value=term;a.element('subject').value=subject;
    a.run('updateAvailability()');assert.equal(a.run('selectedPool().length'),0);
    assert.match(a.element('availability').textContent,/準備中.*0問/);
    assert.equal(a.element('startBtn').disabled,true);
    a.run("$('startBtn').disabled=false");a.element('startBtn').click();
    assert.equal(a.run('questions.length'),0);
  }
  assert.equal(a.storage.size,0);
});

// Synthetic fixtures verify future classified data without relabeling production questions.
function fixtures(a,type='read',count=10){
  a.context.window.MAKI_MEI_BANK=[];
  for(const term of ['1','2','3','trial'])for(const verified of [true,false])for(let i=0;i<count;i++)
    {
      const unitId=(['read','write'].includes(type)?{1:'j1-sound',2:'j2-evidence',3:'j3-grammar'}:{1:'e1',2:'e2',3:'e3'})[term];
      const unit=a.context.window.MAKI_MEI_CURRICULUM.units[unitId];
      a.context.window.MAKI_MEI_BANK.push({id:`${term}-${verified}-${i}`,term,verified:false,type,q:'テスト',a:'正解',
        school_year:2026,grade:1,alignment_unit:unitId,alignment_basis:'publisher_plan',
        source_status:verified?'plan_original':'unverified',source_url:unit?.source_url,source_locator:unit?.locator});
    }
  a.element('subject').value=type;
}

test('strict term and subject filtering, including mixed kanji',()=>{
  const a=app();fixtures(a);
  a.context.window.MAKI_MEI_BANK.push({...a.context.window.MAKI_MEI_BANK[0],id:'write',type:'write',q:'書く',a:'書'});
  for(const term of ['1','2','3']){
    a.element('term').value=term;
    const pool=a.run('selectedPool()');assert.equal(pool.length,10);
    assert.ok(pool.every(q=>q.term===term&&q.source_status==='plan_original'&&q.type==='read'));
  }
  a.element('term').value='1';a.element('subject').value='mixed';assert.equal(a.run('selectedPool().length'),11);
  a.element('subject').value='word';assert.equal(a.run('selectedPool().length'),0);
});

test('nine confirmed questions cannot start; ten can',()=>{
  const a=app();fixtures(a,'read',9);a.run('updateAvailability()');assert.equal(a.element('startBtn').disabled,true);
  fixtures(a);a.run('updateAvailability()');assert.equal(a.element('startBtn').disabled,false);
});

for(const type of ['read','write','word','phrase'])test(`${type}: wrong answers proceed through question 10 and save once at end`,()=>{
  const a=app();fixtures(a,type);a.run('updateAvailability()');a.element('startBtn').click();
  for(let i=0;i<10;i++){
    assert.equal(a.element('step').textContent,`第${i+1}問 / 10問`);
    assert.equal(a.storage.size,0);
    if(type==='write'){a.run('hasInk=true');a.element('reveal').click();a.element('incorrect').click();}
    else {a.element('typed').value='wrong';a.element('readCheck').click();}
    a.run('finishAnswer(false)'); // Duplicate events must not add extra answers.
    assert.equal(a.run('answerLog.length'),i+1);
    a.element('next').click();
  }
  assert.equal(a.element('finalScore').textContent,'0点');
  const saved=JSON.parse(a.storage.get('maki-mei-line-preview-v1'))['マキ'];
  assert.equal(saved.length,1);assert.equal(saved[0].results.length,10);
  assert.equal(saved[0].term,'1');assert.equal(saved[0].subject,type);
  assert.equal(a.run("stats('マキ').remaining"),2);
});

test('existing history survives and 100 points still clears the day',()=>{
  const a=app();fixtures(a);
  a.storage.set('maki-mei-line-preview-v1',JSON.stringify({'メイ':[{date:'2020-01-01',score:50,term:'trial',results:[]}]}));
  a.run('loadProgress();updateAvailability()');a.element('startBtn').click();
  for(let i=0;i<10;i++){a.element('typed').value='正解';a.element('readCheck').click();a.element('next').click();}
  const saved=JSON.parse(a.storage.get('maki-mei-line-preview-v1'));
  assert.equal(saved['メイ'][0].score,50);assert.equal(saved['マキ'][0].score,100);
  a.element('retry').click();assert.equal(a.element('startBtn').disabled,true);
});

test('production data: each term and subject starts with ten scoped questions and scores 50',()=>{
  for(const term of ['1','2','3'])for(const subject of ['mixed','read','write','word','phrase']){
    const a=app();a.element('term').value=term;a.element('subject').value=subject;
    a.run('updateAvailability()');assert.equal(a.element('startBtn').disabled,false);
    const pool=a.run('selectedPool()');assert.ok(pool.length>=10);
    assert.ok(pool.every(q=>q.term===term&&q.verified===false&&q.alignment_basis==='publisher_plan'));
    a.element('startBtn').click();assert.equal(a.run('questions.length'),10);
    assert.equal(new Set(a.run('questions.map(q=>q.id)')).size,10);
    for(let i=0;i<10;i++){
      assert.equal(a.element('step').textContent,`第${i+1}問 / 10問`);
      assert.equal(a.storage.size,0);
      const q=a.run('questions[index]');
      if(q.type==='write'){
        a.run('hasInk=true');a.element('reveal').click();a.element(i%2?'incorrect':'correct').click();
      }else {a.element('typed').value=i%2?'wrong':q.a;a.element('readCheck').click();}
      assert.ok(a.element('finish').classList.contains('hidden'));
      a.element('next').click();
    }
    assert.equal(a.element('finalScore').textContent,'50点');
    a.element('next').click(); // A second result click must not save another run.
    const runs=JSON.parse(a.storage.get('maki-mei-line-preview-v1'))['マキ'];
    assert.equal(runs.length,1);assert.equal(runs[0].results.length,10);
    assert.equal(runs[0].term,term);assert.equal(runs[0].subject,subject);
  }
});

test('production data: third completed run exhausts daily allowance across terms and subjects',()=>{
  const a=app();
  for(let attempt=1;attempt<=3;attempt++){
    a.element('term').value=String(attempt);a.element('subject').value=['read','word','phrase'][attempt-1];
    a.run('updateAvailability()');assert.equal(a.element('startBtn').disabled,false);
    a.element('startBtn').click();
    for(let i=0;i<10;i++){a.element('typed').value='wrong';a.element('readCheck').click();a.element('next').click();}
    assert.equal(a.run("stats('マキ').remaining"),3-attempt);
    a.element('retry').click();
  }
  assert.equal(a.element('startBtn').disabled,true);
  assert.match(a.element('availability').textContent,/3回を使い切った/);
  a.element('term').value='1';a.element('subject').value='mixed';a.run('updateAvailability()');
  assert.equal(a.element('startBtn').disabled,true);
  a.element('startBtn').disabled=false;a.element('startBtn').click();
  assert.ok(a.element('play').classList.contains('hidden'));
  assert.equal(a.run("stats('マキ').runs.length"),3);
  a.element('player').value='メイ';a.run('loadProgress()');
  assert.equal(a.element('startBtn').disabled,false);
  assert.equal(a.run("stats('メイ').remaining"),3);
});

test('unclassified, wrong year, mismatched unit and forged verified flags never enter pool',()=>{
  const a=app();a.element('subject').value='read';
  const q=a.run('selectedPool()[0]');
  const variants=[{...q,id:'wrong-year',school_year:2025},{...q,id:'wrong-grade',grade:2},
    {...q,id:'wrong-unit',alignment_unit:'j3-grammar'},{...q,id:'no-unit',alignment_unit:'unknown'},
    {...q,id:'bad-url',source_url:'https://example.com'},
    {...q,id:'unverified',source_status:'unverified'},
    {...q,id:'flag-only',alignment_basis:undefined,verified:true}];
  a.context.window.MAKI_MEI_BANK=variants;
  assert.equal(a.run('selectedPool().length'),0);
  a.run('updateAvailability()');assert.equal(a.element('startBtn').disabled,true);
});

test('classification evidence and documentation stay consistent',()=>{
  const a=app(), bank=a.context.window.MAKI_MEI_BANK;
  const audit=JSON.parse(fs.readFileSync('docs/classification-results.json','utf8'));
  assert.equal(audit.total,bank.length);assert.equal(audit.legacy_total,220);
  assert.equal(audit.legacy_classified,16);assert.equal(audit.legacy_unclassified,204);
  assert.equal(audit.added,104);assert.equal(audit.textbook_verified,0);
  for(const q of bank){
    const documented=audit.questions.find(row=>row.id===q.id);
    for(const key of Object.keys(q))assert.deepEqual(documented[key],JSON.parse(JSON.stringify(q[key])));
    if(q.term==='trial')continue;
    const unit=a.context.window.MAKI_MEI_CURRICULUM.units[q.alignment_unit];
    assert.equal(q.term,unit.term);assert.ok(q.source_url&&q.source_locator);
    assert.equal(q.school_pacing_verified,false);
    if(q.original&&q.type==='phrase')assert.equal(q.a.split(' ').length,2);
  }
  assert.match(html,/出版社の年間指導計画を参考（学校の実際の進度は未確認）/);
});

test('past runs do not consume today allowance and current JST date is used for saving',()=>{
  const a=app();
  a.storage.set('maki-mei-line-preview-v1',JSON.stringify({'マキ':Array.from({length:3},()=>({date:'2020-01-01',score:0,term:'trial',results:[]}))}));
  a.run('loadProgress()');assert.equal(a.run("stats('マキ').remaining"),3);
  a.element('subject').value='word';a.run('updateAvailability()');a.element('startBtn').click();
  for(let i=0;i<10;i++){a.element('typed').value='wrong';a.element('readCheck').click();a.element('next').click();}
  const runs=JSON.parse(a.storage.get('maki-mei-line-preview-v1'))['マキ'];
  assert.equal(runs.length,4);assert.equal(runs[3].date,a.run('todayJst()'));
  assert.equal(a.run("stats('マキ').remaining"),2);
});
