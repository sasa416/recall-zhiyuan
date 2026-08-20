// 合并 67 所院校真实数据 → 重建主页 SCHOOL_DB
const fs = require('fs');
const HOME = 'D:/workbody/志愿填报/Recall_主页.html';
let html = fs.readFileSync(HOME, 'utf8');

// 1. 提取原 SCHOOL_DB（保持顺序 + 学校级字段）
const m = html.match(/const SCHOOL_DB = (\[[\s\S]*?\n\]);/);
if (!m) { console.error('未找到 SCHOOL_DB'); process.exit(1); }
const oldDB = eval(m[1]);

// 2. 载入各组 JSON
const groups = ['g0','g1','g2','g3','g4','g5','g6'];
const map = {}; // school -> {.., majors:[]}
for (const g of groups) {
  const f = `D:/workbody/志愿填报/data/schools_${g}.json`;
  if (!fs.existsSync(f)) { console.error('缺文件', f); continue; }
  for (const s of JSON.parse(fs.readFileSync(f, 'utf8'))) map[s.school] = s;
}
// fix 组覆盖
for (const fix of ['g2fix','g4fix']) {
  const f = `D:/workbody/志愿填报/data/schools_${fix}.json`;
  if (!fs.existsSync(f)) continue;
  for (const s of JSON.parse(fs.readFileSync(f, 'utf8'))) map[s.school] = s;
}

// 3. 工具
const int = v => { const n = parseInt(String(v).replace(/[^\d]/g,''), 10); return Number.isFinite(n) ? n : null; };

// 4. 按原顺序重建
const missing = [];
const newDB = oldDB.map(old => {
  const src = map[old.school];
  if (!src) { missing.push(old.school); return old; }
  const seen = new Set();
  const majors = [];
  for (const mj of src.majors || []) {
    const name = String(mj.name || '').trim();
    if (!name) continue;
    const key = name + '|' + (mj.subject || '物理');
    if (seen.has(key)) continue; // 去重
    seen.add(key);
    const score = int(mj.score);
    const rank = int(mj.rank);
    // 旧库里同专业 desc 兜底
    const oldMj = old.majors.find(o => o.name === name);
    let desc = String(mj.desc || '').trim();
    if (!desc && oldMj && oldMj.desc) desc = String(oldMj.desc).trim();
    if (!desc) desc = score ? `2025 广东最低 ${score} 分` + (rank ? ` · 位次 ${rank}` : '') : '';
    const rec = { name, subject: mj.subject === '历史' ? '历史' : '物理' };
    if (score) rec.score = score;
    if (rank) rec.rank = rank;
    if (rec.fee = int(mj.fee)) {} else delete rec.fee;
    if (mj.est) rec.est = true;
    if (desc) rec.desc = desc;
    majors.push(rec);
  }
  // 用物理类专业真实分重算 scoreRange/rankRange
  const phys = majors.filter(x => x.subject === '物理' && x.score);
  const pool = phys.length >= 3 ? phys : majors.filter(x => x.score);
  const scores = pool.map(x => x.score).sort((a,b)=>a-b);
  const ranks = pool.map(x => x.rank).filter(Boolean).sort((a,b)=>a-b);
  const scoreRange = scores.length ? [scores[0], scores[scores.length-1]] : old.scoreRange;
  const rankRange = ranks.length ? [ranks[0], ranks[ranks.length-1]] : old.rankRange;
  return {
    school: old.school, region: old.region, cat: old.cat, level: old.level,
    tier: old.tier, why: old.why, scoreRange, rankRange, majors
  };
});

// 5. 序列化（JSON.stringify 是合法 JS 字面量）
const literal = 'const SCHOOL_DB = ' + JSON.stringify(newDB, null, 2).replace(/\n/g, '\n') + ';\n';
html = html.replace(/const SCHOOL_DB = \[[\s\S]*?\n\];/, literal);

// 6. 扩展 MATH_REQ：新专业名缺失时按关键词补默认档位
const mm = html.match(/const MATH_REQ = (\{[\s\S]*?\n\});/);
const mathReq = eval('(' + mm[1] + ')');
const allNames = new Set();
newDB.forEach(s => s.majors.forEach(x => allNames.add(x.name)));
let added = 0;
const HIGH = /计算机|软件|网络|数据|人工智能|智能|电子|通信|信息工程|集成电路|微电子|电气|自动化|机械|土木|材料|化工|化学工程|环境|交通|车辆|能源|测绘|水利|地质|船舶|航海|轮机|港口|建筑|城乡|风景|安全|测控|仪器|力学|遥感|生物医学|食品|纺织|石油|智能制造|机器人|工程造价|工业工程|数学|物理|统计|金融|经济|临床|口腔|麻醉|影像|检验|预防|中医|针灸|中西医|儿科|药学|制药|药物|生物制药|中药|护理学|刑事|警务|侦查|治安|网络安全|区块链|遥感|集成电路|微电子|大数据|物联网|量子|集成电路/;
const LOW = /新闻|传播|广告|播音|编导|汉语言|汉语|文学|英语|日语|法语|德语|西班牙语|俄语|翻译|历史|哲学|视觉传达|艺术|设计|美术|音乐|舞蹈|雕塑|绘画|书法|表演|动画|戏剧|体育|运动|武术|休闲|社会体育|学前|小学|教育|思政|思想政治|社会|法学|法律|知识产权|监狱|社会工作|市场营销|工商管理|人力资源|电子商务|旅游|行政|公共|审计|会计|财务|护理|农学|园艺|植物|动物|林学|水产|种子|茶学|兽医|园林|草业/;
for (const n of allNames) {
  if (!(n in mathReq)) {
    if (HIGH.test(n)) mathReq[n] = '高';
    else if (LOW.test(n)) mathReq[n] = '低';
    else mathReq[n] = '中';
    added++;
  }
}
const mathLiteral = 'const MATH_REQ = ' + JSON.stringify(mathReq, null, 2).replace(/\n/g, '\n') + ';';
html = html.replace(/const MATH_REQ = \{[\s\S]*?\n\};/, mathLiteral);

fs.writeFileSync(HOME, html, 'utf8');
console.log('OK 学校数:', newDB.length, '| 总专业:', newDB.reduce((a,s)=>a+s.majors.length,0), '| 未匹配学校:', missing.length ? missing.join(',') : '无', '| MATH_REQ 新增:', added);
