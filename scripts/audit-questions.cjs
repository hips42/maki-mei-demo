// Read-only inventory by default. --write refreshes the two documented JSON files.
const fs = require('node:fs');
const vm = require('node:vm');
const context = vm.createContext({window:{}});
const html = fs.readFileSync('index.html','utf8');
vm.runInContext([...html.matchAll(/<script>([\s\S]*?)<\/script>/g)][0][1],context);
vm.runInContext(fs.readFileSync('extra_questions.js','utf8'),context);
const legacy = JSON.parse(JSON.stringify(context.window.STUDY_BANK));
vm.runInContext(fs.readFileSync('curriculum_questions.js','utf8'),context);
const bank = context.window.STUDY_BANK;
const counts = {};
for(const q of bank) counts[q.type]=(counts[q.type]||0)+1;
const legacyById = new Map(legacy.map(q=>[q.id,q]));
const byTerm = {};
for(const term of ['1','2','3']){
  byTerm[term]={};
  for(const type of ['read','write','word','phrase'])byTerm[term][type]=bank.filter(q=>q.term===term&&q.type===type&&q.alignment_basis==='publisher_plan').length;
  byTerm[term].mixed=byTerm[term].read+byTerm[term].write;
}
const audit = {
  school_year:2026,grade:1,school:'一般向け',basis:'publisher_plan',school_pacing_verified:false,
  total:bank.length, counts,
  textbook_verified:bank.filter(q=>q.verified===true).length,
  legacy_total:legacy.length,
  legacy_classified:bank.filter(q=>legacyById.has(q.id)&&q.alignment_basis==='publisher_plan').length,
  legacy_unclassified:bank.filter(q=>legacyById.has(q.id)&&q.term==='trial').length,
  added:bank.length-legacy.length,by_term:byTerm,
  units:context.window.STUDY_CURRICULUM.units,
  questions:bank.map(q=>({...q,subject:['read','write'].includes(q.type)?'国語':'英語',
    origin:legacyById.has(q.id)?'legacy':'original_2026',
    previous_term:legacyById.get(q.id)?.term||null,
    classification_status:q.alignment_basis==='publisher_plan'?q.source_status:'unverified',
    classification_reason:q.alignment_basis==='publisher_plan'?
      (legacyById.has(q.id)?'出題語が指定単元の学習用語に明示される。教材の新出漢字一覧との照合ではない。':'出版社計画で明示された学習事項に沿い独自作成。掲載語・教材本文の再現ではない。'):
      '今回確認した資料では出題語・表現と月別単元の明確な対応を確認できず、分類を見送った。',
    missing_evidence:['教科書掲載語の個別照合','学校の実際の進度']}))
};
if(process.argv.includes('--write')){
  fs.writeFileSync('question-audit.json',JSON.stringify(audit,null,2)+'\n');
  fs.writeFileSync('docs/classification-results.json',JSON.stringify(audit,null,2)+'\n');
  console.log(JSON.stringify({...audit,questions:undefined,units:undefined},null,2));
}else console.log(JSON.stringify(audit,null,2));
