/* 2026年度・中1。出版社計画に沿う独自問題。教科書本文・問題文の転載なし。 */
(() => {
  'use strict';
  const english = 'https://tb.sanseido-publ.co.jp/07ncpr/images/top/07nc_1_curric.pdf';
  const japanese = 'https://www.mitsumura-tosho.co.jp/download_file/view/28dc859f-f9cf-4e41-8421-6e372f8be976/609';
  const units = {
    'j1-sound': {term:'1',subject:'国語',unit:'言葉1 音声の仕組みや働き',month:'5月',source_url:japanese,locator:'年間指導計画例 PDF p.3',focus:'母音・子音・音声'},
    'j1-organize': {term:'1',subject:'国語',unit:'情報整理のレッスン 比較・分類／情報を整理して説明しよう',month:'6月',source_url:japanese,locator:'年間指導計画例 PDF pp.6–7',focus:'比較・分類・情報・説明・整理・順序'},
    'j1-expression': {term:'1',subject:'国語',unit:'言葉3 さまざまな表現技法',month:'6月',source_url:japanese,locator:'年間指導計画例 PDF p.8',focus:'表現・反復・倒置'},
    'j2-evidence': {term:'2',subject:'国語',unit:'思考のレッスン1 意見と根拠',month:'10月',source_url:japanese,locator:'年間指導計画例 PDF p.16',focus:'意見・根拠・原因・結果・関係'},
    'j2-report': {term:'2',subject:'国語',unit:'根拠を明確にして書こう 資料を引用して報告する',month:'10月',source_url:japanese,locator:'年間指導計画例 PDF pp.16–17',focus:'引用・出典・報告・資料'},
    'j2-listen': {term:'2',subject:'国語',unit:'聞き上手になろう 質問で話を引き出す',month:'10月',source_url:japanese,locator:'年間指導計画例 PDF p.14',focus:'質問・記録'},
    'j3-grammar': {term:'3',subject:'国語',unit:'文法への扉3／文法3 単語の分類',month:'1月',source_url:japanese,locator:'年間指導計画例 PDF p.25',focus:'単語・品詞・活用・体言・用言'},
    'j3-essay': {term:'3',subject:'国語',unit:'構成や描写を工夫して書こう 体験を基に随筆を書く',month:'2月',source_url:japanese,locator:'年間指導計画例 PDF pp.25–26',focus:'描写・体験・随筆・情景・心情'},
    'e1': {term:'1',subject:'英語',unit:'Lesson 1–4／Language Focus 1–2',month:'5〜7月',source_url:english,locator:'PDF p.1',focus:'be動詞・一般動詞の現在形、can、疑問詞'},
    'e2': {term:'2',subject:'英語',unit:'Lesson 5–7／Language Focus 3–5',month:'9〜12月',source_url:english,locator:'PDF p.2 上半分',focus:'三人称単数現在形・現在進行形・一般動詞過去形'},
    'e3': {term:'3',subject:'英語',unit:'Lesson 8–9／Language Focus 6–7',month:'1〜2月',source_url:english,locator:'PDF p.2 下半分',focus:'be動詞過去形・過去進行形・未来表現'},
  };
  window.MAKI_MEI_CURRICULUM = {school_year:2026,grade:1,basis:'publisher_plan',school_pacing_verified:false,units};

  function aligned(q, unitId, status) {
    const u=units[unitId];
    return {...q,term:u.term,unit:u.unit,school_year:2026,grade:1,
      verified:false,school_pacing_verified:false,alignment_basis:'publisher_plan',
      alignment_unit:unitId,source_status:status,source_url:u.source_url,
      source_locator:u.locator,source_note:'出版社の年間指導計画の学習事項との対応を確認。教科書掲載語・学校実施学期の照合済みを意味しない。'};
  }

  // 学習事項・単元名に明示された語のみ。一般的な語という理由では割り当てない。
  const legacyTargets = {
    '比較':'j1-organize','情報':'j1-organize','説明':'j1-organize','表現':'j1-expression',
    '意見':'j2-evidence','結果':'j2-evidence','関係':'j2-evidence','記録':'j2-listen',
  };
  const originalBank=window.MAKI_MEI_BANK||[];
  window.MAKI_MEI_BANK=originalBank.map(q=>{
    const target=q.type==='write'?q.a:q.type==='read'?q.q.match(/「([^」]+)」/)?.[1]:null;
    const unitId=legacyTargets[target];
    return unitId?aligned(q,unitId,'plan_vocabulary'):q;
  });

  // 漢字の語彙は計画内の学習用語。用例・設問は独自作成。
  // [語, 読み, 独自の用例, 単元ID]
  const kanji = [
    ['音声','おんせい','端末に音声を録音する。','j1-sound'],
    ['母音','ぼいん','口の形を変えて母音を発音する。','j1-sound'],
    ['子音','しいん','母音と子音を区別する。','j1-sound'],
    ['比較','ひかく','二つの時刻表を比較する。','j1-organize'],
    ['分類','ぶんるい','拾った葉を形で分類する。','j1-organize'],
    ['情報','じょうほう','バスの運行情報を確かめる。','j1-organize'],
    ['説明','せつめい','道具の使い方を説明する。','j1-organize'],
    ['表現','ひょうげん','喜びを色で表現する。','j1-expression'],
    ['反復','はんぷく','同じ音を反復してリズムを作る。','j1-expression'],
    ['倒置','とうち','語順を変える倒置の効果を考える。','j1-expression'],
    ['意見','いけん','昼休みの過ごし方について意見を述べる。','j2-evidence'],
    ['根拠','こんきょ','調べた数字を根拠に提案する。','j2-evidence'],
    ['原因','げんいん','水が漏れる原因を探す。','j2-evidence'],
    ['結果','けっか','実験の結果をグラフにする。','j2-evidence'],
    ['関係','かんけい','気温と服装の関係を考える。','j2-evidence'],
    ['引用','いんよう','資料を引用した部分を区別する。','j2-report'],
    ['出典','しゅってん','使った図の出典を示す。','j2-report'],
    ['報告','ほうこく','観察したことを班に報告する。','j2-report'],
    ['質問','しつもん','知らない仕組みについて質問する。','j2-listen'],
    ['記録','きろく','聞き取った時刻を記録する。','j2-listen'],
    ['単語','たんご','文を単語に分ける。','j3-grammar'],
    ['品詞','ひんし','辞書で品詞を確認する。','j3-grammar'],
    ['活用','かつよう','動詞の活用を調べる。','j3-grammar'],
    ['体言','たいげん','名詞をまとめて体言と呼ぶ。','j3-grammar'],
    ['用言','ようげん','動詞は用言の一つである。','j3-grammar'],
    ['描写','びょうしゃ','夕方の海を言葉で描写する。','j3-essay'],
    ['体験','たいけん','初めてパンを焼いた体験を書く。','j3-essay'],
    ['随筆','ずいひつ','身近な出来事から随筆を書く。','j3-essay'],
    ['情景','じょうけい','雨上がりの庭の情景を思い浮かべる。','j3-essay'],
    ['心情','しんじょう','その時の自分の心情を振り返る。','j3-essay'],
  ];
  let serial=0;
  function add(type,unitId,q,a,target) {
    const item=aligned({id:`original-2026-${type}-${String(++serial).padStart(3,'0')}`,type,q,a,
      original:true,target:target||a},unitId,'plan_original');
    window.MAKI_MEI_BANK.push(item);
  }
  for(const [word,reading,example,unitId] of kanji)for(const type of ['read','write']){
    const term=units[unitId].term;
    const exists=window.MAKI_MEI_BANK.some(q=>q.term===term&&q.type===type&&
      (type==='write'?q.a===word:q.q.includes(`「${word}」`)));
    if(exists)continue;
    add(type,unitId,type==='read'?`「${word}」の読みをひらがなで書こう。用例：${example}`:
      `「${reading}」を漢字で書こう。用例：${example.replace(word,`［${reading}］`)}`,
      type==='read'?reading:word,word);
  }

  // 単語は文中の指定語・語形を答える。教材本文の翻訳問題ではない。
  const words = {
    e1:[
      ['I ___ Mei.（私はメイです）空欄をbe動詞1語で。','am'],
      ['You ___ my friend.（あなたは私の友達です）空欄をbe動詞1語で。','are'],
      ['I ___ apples.（私はりんごが好きです）「好き」を表す動詞1語で。','like'],
      ['I ___ run fast.（私は速く走れます）「できる」を表す助動詞1語で。','can'],
      ['___ is this box?（この箱は何ですか）「何」を表す疑問詞1語で。','what'],
      ['___ is that singer?（あの歌手は誰ですか）「誰」を表す疑問詞1語で。','who'],
      ['___ is your birthday?（誕生日はいつですか）「いつ」を表す疑問詞1語で。','when'],
      ['___ do you want to go?（どこへ行きたいですか）「どこ」を表す疑問詞1語で。','where'],
      ['My sister is kind. I like ___.（姉は親切です。私は彼女が好きです）「彼女を」を1語で。','her'],
      ['My brother is kind. I like ___.（兄は親切です。私は彼が好きです）「彼を」を1語で。','him'],
    ],
    e2:[
      ['He ___ chess every day.（彼は毎日チェスをします）playを適切な形の1語に。','plays'],
      ['She ___ to school.（彼女は歩いて学校へ行きます）walkを適切な形の1語に。','walks'],
      ['My father ___ dinner.（父は夕食を作ります）cookを適切な形の1語に。','cooks'],
      ['Mei ___ a dog.（メイは犬を飼っています）haveを適切な形の1語に。','has'],
      ['Maki is ___ a book now.（マキは今、本を読んでいます）readを適切な形の1語に。','reading'],
      ['They are ___ now.（彼らは今、泳いでいます）swimを適切な形の1語に。','swimming'],
      ['I ___ the park yesterday.（昨日、その公園を訪れました）visitを過去形1語に。','visited'],
      ['We ___ the room yesterday.（昨日、部屋を掃除しました）cleanを過去形1語に。','cleaned'],
      ['I ___ a bird yesterday.（昨日、鳥を見ました）seeを過去形1語に。','saw'],
      ['We ___ home at five yesterday.（昨日、5時に帰宅しました）goを過去形1語に。','went'],
    ],
    e3:[
      ['I ___ at the library yesterday.（昨日、図書館にいました）amを過去形1語に。','was'],
      ['They ___ at the library yesterday.（彼らは昨日、図書館にいました）areを過去形1語に。','were'],
      ['I was ___ at seven.（7時には勉強していました）studyを適切な形の1語に。','studying'],
      ['We were ___ in the park.（公園を走っていました）runを適切な形の1語に。','running'],
      ['She was ___ a letter.（彼女は手紙を書いていました）writeを適切な形の1語に。','writing'],
      ['He was ___ a cake.（彼はケーキを作っていました）makeを適切な形の1語に。','making'],
      ['I ___ help you tomorrow.（明日、手伝います）空欄を未来の助動詞1語で。','will'],
      ['We are ___ to visit Kyoto.（京都を訪れる予定です）goを適切な形の1語に。','going'],
      ['___ you help me tomorrow?（明日、手伝ってくれますか）willを使う疑問文の最初の1語で。','will'],
      ['Mei and Maki ___ happy.（メイとマキはうれしそうに見えます）lookを適切な形の1語に。','look'],
    ],
  };
  const phrases = {
    e1:[
      ['I ___ a student.（私は学生ではありません）amを使い、空欄を2語で。','am not'],
      ['___ a new student?（あなたは新入生ですか）youを使い、空欄を2語で。','are you'],
      ['I ___ play tennis.（私はテニスをしません）doを使い、空欄を2語で。','do not'],
      ['___ swim well?（あなたは上手に泳げますか）youを使い、空欄を2語で。','can you'],
      ['___ a red bag.（これは赤いかばんです）thisを使い、空欄を2語で。','this is'],
      ['___ a new camera?（これは新しいカメラですか）thisを使い、空欄を2語で。','is this'],
      ['___ this fruit?（この果物は何ですか）whatを使い、空欄を2語で。','what is'],
      ['___ that girl?（あの女の子は誰ですか）whoを使い、空欄を2語で。','who is'],
      ['___ you like?（あなたは何が好きですか）whatを使い、空欄を2語で。','what do'],
      ['___ apples do you have?（りんごをいくつ持っていますか）howを使い、空欄を2語で。','how many'],
    ],
    e2:[
      ['She ___ play chess.（彼女はチェスをしません）doesを使い、空欄を2語で。','does not'],
      ['___ like cats?（彼は猫が好きですか）heを使い、空欄を2語で。','does he'],
      ['Maki ___ a book now.（マキは今、本を読んでいます）readを変化させ、空欄を2語で。','is reading'],
      ['We ___ lunch now.（私たちは今、昼食を食べています）eatを変化させ、空欄を2語で。','are eating'],
      ['___ playing tennis?（あなたはテニスをしていますか）youを使い、空欄を2語で。','are you'],
      ['They ___ in the pool now.（彼らは今、泳いでいます）swimを変化させ、空欄を2語で。','are swimming'],
      ['I ___ last week.（先週、京都を訪れました）visitとKyotoを使い、空欄を2語で。','visited Kyoto'],
      ['I ___ watch TV yesterday.（昨日、テレビを見ませんでした）didを使い、空欄を2語で。','did not'],
      ['___ practice yesterday?（あなたは昨日、練習しましたか）youを使い、空欄を2語で。','did you'],
      ['We ___ after school yesterday.（昨日、放課後にサッカーをしました）playとsoccerを使い、空欄を2語で。','played soccer'],
    ],
    e3:[
      ['I ___ last night.（昨夜は忙しかったです）busyを使い、空欄を2語で。','was busy'],
      ['We ___ yesterday.（私たちは昨日、うれしかったです）happyを使い、空欄を2語で。','were happy'],
      ['Mei ___ a book at eight.（メイは8時に本を読んでいました）readを変化させ、空欄を2語で。','was reading'],
      ['They ___ in the pool then.（彼らはその時、プールで泳いでいました）swimを変化させ、空欄を2語で。','were swimming'],
      ['___ studying at nine?（あなたは9時に勉強していましたか）youを使い、空欄を2語で。','were you'],
      ['I ___ dinner tomorrow.（明日、夕食を作ります）willとcookを使い、空欄を2語で。','will cook'],
      ['It ___ rain tomorrow.（明日は雨が降らないでしょう）willを使い、空欄を2語で。','will not'],
      ['I am ___ visit Nara.（奈良を訪れる予定です）goingを使い、空欄を2語で。','going to'],
      ['___ going to study tonight?（今夜、勉強する予定ですか）youを使い、空欄を2語で。','are you'],
      ['Mei ___ today.（メイは今日はうれしそうです）lookとhappyを使い、空欄を2語で。','looks happy'],
    ],
  };
  for(const [unitId,rows] of Object.entries(words))for(const [q,a] of rows)add('word',unitId,q,a);
  for(const [unitId,rows] of Object.entries(phrases))for(const [q,a] of rows)add('phrase',unitId,q,a);
})();
