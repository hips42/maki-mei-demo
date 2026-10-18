const {test,before,after}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
const {chromium}=require('playwright');

// No persistent profile or real hosting origin is used. Each scenario gets its own storage.
const key='\u006d\u0061\u006b\u0069\u002d\u006d\u0065\u0069\u002d\u006c\u0069\u006e\u0065\u002d\u0070\u0072\u0065\u0076\u0069\u0065\u0077\u002d\u0076\u0031';
const history={
  'プレイヤー1':[{date:'2020-01-01',score:70,term:'trial',subject:'read',results:[],time:'2020-01-01T00:00:00Z'}],
  'プレイヤー2':[{date:'2020-01-02',score:80,term:'trial',subject:'word',results:[],time:'2020-01-02T00:00:00Z'}],
};
const allowed=new Set(['/index.html','/extra_questions.js','/curriculum_questions.js','/assets/nekoda-nekoo.png']);
let server,browser,origin;
const errors=[];

before(async()=>{
  server=http.createServer((req,res)=>{
    const pathname=new URL(req.url,'http://localhost').pathname;
    const file=pathname==='/'?'/index.html':pathname;
    if(!allowed.has(file)){res.writeHead(404);res.end();return;}
    res.setHeader('Content-Type',file.endsWith('.js')?'text/javascript; charset=utf-8':file.endsWith('.png')?'image/png':'text/html; charset=utf-8');
    fs.createReadStream(path.join(__dirname,'..',file.slice(1))).pipe(res);
  });
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  origin=`http://127.0.0.1:${server.address().port}`;
  browser=await chromium.launch({channel:process.env.BROWSER_CHANNEL||'chrome',headless:true});
  fs.mkdirSync('test-results',{recursive:true});
  console.log(`Real browser: ${browser.version()}; isolated origin: ${origin}`);
});
after(async()=>{
  await browser?.close();
  if(server)await new Promise(resolve=>server.close(resolve));
});

async function open(width=390){
  const context=await browser.newContext({viewport:{width,height:844},deviceScaleFactor:1});
  await context.addInitScript(({key,history})=>{
    if(localStorage.getItem(key)===null)localStorage.setItem(key,JSON.stringify(history));
  },{key,history});
  const page=await context.newPage();
  page.on('pageerror',e=>errors.push(e.message));
  page.on('requestfailed',r=>errors.push(`${r.url()}: ${r.failure()?.errorText}`));
  await page.goto(origin,{waitUntil:'networkidle'});
  assert.equal(await page.locator('#startBtn').isEnabled(),true);
  return {context,page};
}

async function layout(page){
  const problems=await page.evaluate(()=>{
    const found=[];
    if(document.documentElement.scrollWidth>innerWidth+1)found.push('page horizontal overflow');
    for(const el of document.querySelectorAll('button,select,input,.question,.school,.status,.answerBox,.info')){
      if(!el.getClientRects().length)continue;
      const r=el.getBoundingClientRect();
      if(r.left< -1||r.right>innerWidth+1)found.push(`${el.id||el.className}: outside viewport`);
      if(el.scrollWidth>el.clientWidth+1)found.push(`${el.id||el.className}: clipped content`);
    }
    return found;
  });
  assert.deepEqual(problems,[]);
}

async function answer(page,correct=false){
  // Read the rendered prompt, then locate its production data; do not inject app state.
  const q=await page.evaluate(()=>window.STUDY_BANK.find(q=>q.q===document.getElementById('question').textContent));
  assert.ok(q);
  if(q.type==='write'){
    const box=await page.locator('#pad').boundingBox();
    await page.mouse.move(box.x+35,box.y+35);
    await page.mouse.down();await page.mouse.move(box.x+95,box.y+95,{steps:4});await page.mouse.up();
    await page.locator('#reveal').click();
    assert.equal(await page.locator('#selfCheck').isVisible(),true);
    await page.locator(correct?'#correct':'#incorrect').click();
  }else{
    await page.locator('#typed').fill(correct?q.a:'wrong');
    await page.locator('#readCheck').click();
  }
  assert.equal(await page.locator('#next').isVisible(),true);
  return q;
}

test('only three terms exist, first term is default, mobile and desktop layout',async()=>{
  for(const width of [320,375,390,1280]){
    const {context,page}=await open(width);
    try{
      assert.equal(await page.locator('#term').inputValue(),'1');
      assert.deepEqual(await page.locator('#term option').evaluateAll(options=>options.map(o=>({value:o.value,text:o.textContent}))),[
        {value:'1',text:'1学期'},{value:'2',text:'2学期'},{value:'3',text:'3学期'},
      ]);
      for(const term of ['1','2','3']){
        await page.locator('#term').selectOption(term);
        assert.equal(await page.locator('#term').inputValue(),term);
        await layout(page);
      }
      await page.screenshot({path:`test-results/start-${width}.png`,fullPage:true});
    }finally{await context.close();}
  }
});

test('all 15 term/subject choices finish 10 questions with real inputs, scoring and records', {timeout:240000},async()=>{
  for(const term of ['1','2','3'])for(const subject of ['mixed','read','write','word','phrase']){
    const {context,page}=await open(320);
    try{
      await page.locator('#term').selectOption(term);
      await page.locator('#subject').selectOption(subject);
      await page.locator('#startBtn').click();
      const ids=new Set();
      for(let i=0;i<10;i++){
        assert.equal(await page.locator('#step').textContent(),`第${i+1}問 / 10問`);
        assert.equal(await page.locator('#finish').isVisible(),false);
        const before=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),key);
        assert.deepEqual(before,history); // Save only when the tenth answer is completed.
        const q=await answer(page,subject==='word'&&i%2===0);
        assert.equal(q.term,term);
        assert.ok(subject==='mixed'?['read','write'].includes(q.type):q.type===subject);
        assert.equal(q.alignment_basis,'publisher_plan');ids.add(q.id);
        await layout(page);
        if(i===0&&term==='3')await page.screenshot({path:`test-results/play-${subject}-320.png`,fullPage:true});
        await page.locator('#next').click();
      }
      assert.equal(ids.size,10);
      assert.equal(await page.locator('#finish').isVisible(),true);
      assert.equal(await page.locator('#finalScore').textContent(),subject==='word'?'50点':'0点');
      assert.match(await page.locator('#saveNotice').textContent(),/保存した/);
      await layout(page);
      if(term==='3'&&subject==='phrase')await page.screenshot({path:'test-results/result-320.png',fullPage:true});
      const saved=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),key);
      assert.deepEqual(saved['プレイヤー2'],history['プレイヤー2']);assert.deepEqual(saved['プレイヤー1'][0],history['プレイヤー1'][0]);
      assert.equal(saved['プレイヤー1'].length,2);
      assert.equal(saved['プレイヤー1'][1].results.length,10);
      assert.equal(saved['プレイヤー1'][1].term,term);assert.equal(saved['プレイヤー1'][1].subject,subject);
      await page.locator('#retry').click();
      assert.match(await page.locator('#progressBoard').textContent(),/プレイヤー1：記録2回/);
      assert.match(await page.locator('#progressBoard').textContent(),/プレイヤー2：記録1回/);
      assert.match(await page.locator('#ruleBoard').textContent(),/1\/3回/);
      await page.reload();
      assert.deepEqual(await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),key),saved);
      await layout(page);
    }finally{await context.close();}
  }
});

test('daily limit blocks fourth run across terms; perfect score clears day', {timeout:120000},async()=>{
  const {context,page}=await open();
  try{
    for(const term of ['1','2','3']){
      await page.locator('#term').selectOption(term);await page.locator('#subject').selectOption('word');
      await page.locator('#startBtn').click();
      for(let i=0;i<10;i++){await answer(page,false);await page.locator('#next').click();}
      await page.locator('#retry').click();
    }
    assert.equal(await page.locator('#startBtn').isDisabled(),true);
    assert.match(await page.locator('#availability').textContent(),/3回を使い切った/);
    await page.locator('#term').selectOption('1');await page.locator('#subject').selectOption('phrase');
    assert.equal(await page.locator('#startBtn').isDisabled(),true);
    await page.locator('#player').selectOption('プレイヤー2');
    assert.equal(await page.locator('#startBtn').isEnabled(),true);
    await page.locator('#startBtn').click();
    for(let i=0;i<10;i++){await answer(page,true);await page.locator('#next').click();}
    assert.equal(await page.locator('#finalScore').textContent(),'100点');
    await page.locator('#retry').click();
    assert.equal(await page.locator('#startBtn').isDisabled(),true);
    assert.match(await page.locator('#availability').textContent(),/達成済み/);
  }finally{await context.close();}
  assert.deepEqual(errors,[],'No JavaScript errors or failed resource requests');
});
