/* Static bilingual public site. Private workspace files are never loaded. */
const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];
const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const language = /(?:^|[?&])lang=en(?:&|$)/.test(location.search||'')?'en':'zh';
const english = language==='en';
const t = (key,values={}) => {
  let value=PUBLIC_DATA.i18n.ui[language][key];
  if(typeof value!=='string')throw Error('Missing translation: '+key);
  if(english&&values.count===1)value=value.replace(' entries',' entry').replace(' publication records',' publication record').replace(' granted patent records',' granted patent record');
  return value.replace(/\{(\w+)\}/g,(_,name)=>String(values[name]??''));
};
const tr = (key,values) => escapeHTML(t(key,values));
const external = (url, label, cls = '') => /^https:\/\//.test(url) ? `<a href="${escapeHTML(url)}" target="_blank" rel="noopener noreferrer" class="${cls}">${escapeHTML(label)}</a>` : '';
const state = {expressionSearch:'',academicTab:'论文',paperSearch:''};
const publicProfile = english?PUBLIC_DATA.profile.translations.en:PUBLIC_DATA.profile;
const experiences = publicProfile.experiences;
const educationRows = english?publicProfile.education:[['北京大学','博士 · 计算量子力学研究','2001 — 2006'],['南开大学','本科 · 信息科学与技术','1997 — 2001']];
const education = `<div class="education">${educationRows.map(([name,degree,dates])=>`<div class="education-item"><h3>${escapeHTML(name)}</h3><p>${escapeHTML(degree)}</p><span class="year">${escapeHTML(dates)}</span></div>`).join('')}</div>`;
function syncChrome(){
  if(document.documentElement)document.documentElement.lang=english?'en':'zh-CN';
  $$('[data-i18n]').forEach(e=>{e.textContent=t(e.dataset.i18n);});
  $$('[data-i18n-aria]').forEach(e=>e.setAttribute('aria-label',t(e.dataset.i18nAria)));
  $$('[data-i18n-meta]').forEach(e=>e.setAttribute('content',t(e.dataset.i18nMeta)));
  $$('[data-language-switch]').forEach(e=>{
    e.textContent=english?'中文':'EN';
    e.setAttribute('href','?lang='+(english?'zh':'en')+(location.hash||'#home'));
    e.setAttribute('lang',english?'zh-CN':'en');
    e.setAttribute('aria-label',english?'切换到中文版':'Switch to English');
  });
}
function homePage(){
  return `<div class="container fade-in">
    <section class="hero" aria-labelledby="hero-name">
      <div class="hero-copy">
        <p class="eyebrow">${tr('heroEyebrow')}</p>
        <h1 id="hero-name">${escapeHTML(publicProfile.name)}</h1>
        <p class="english-name">${escapeHTML(english?publicProfile.secondaryName:PUBLIC_DATA.profile.englishName)}</p>
        <p class="current-role">${escapeHTML(publicProfile.currentRole.organization)} · ${escapeHTML(publicProfile.currentRole.title)}</p>
        <p class="profile-links"><a class="profile-github" href="${escapeHTML(PUBLIC_DATA.profile.publicLinks.github)}" target="_blank" rel="noopener noreferrer" aria-label="${tr('githubProfile')}">GitHub · jiaxz</a></p>
        <p class="hero-statement">${tr('heroLine1')}<br>${tr('heroLine2')}</p>
        <div class="hero-links"><a class="text-link primary" href="#home/introduction">${tr('introduction')}</a><a class="text-link secondary" href="#home/experience">${tr('experienceLink')}</a></div>
      </div>
      <figure class="portrait-wrap"><img class="portrait" src="assets/jiaxing-zhang.webp" width="1500" height="1000" alt="${tr('portraitAlt')}" fetchpriority="high"><figcaption class="portrait-caption">JIAXING ZHANG · 张家兴</figcaption></figure>
    </section>
    <section class="biography-section" id="introduction" aria-label="${tr('introduction')}">${publicProfile.biography.split(/\n\s*\n/).map(p=>`<p class="biography-paragraph">${escapeHTML(p)}</p>`).join('')}</section>
    <section class="section"><div class="section-top"><h2 class="section-title"><span class="eyebrow">${tr('interestsEyebrow')}</span>${tr('interestsTitle')}</h2><p class="section-intro">${tr('interestsLine1')}<br>${tr('interestsLine2')}</p></div><div class="research-themes">${[1,2,3].map(n=>`<article class="theme"><span class="theme-number">0${n}</span><h3>${tr('theme'+n+'Title')}</h3><p>${tr('theme'+n+'Text')}</p><small>${tr('theme'+n+'Sub')}</small></article>`).join('')}</div></section>
    <section class="section" id="experience"><div class="section-top"><h2 class="section-title"><span class="eyebrow">${tr('experienceEyebrow')}</span>${tr('experienceTitle')}</h2><p class="section-intro">${tr('experienceLine1')}<br>${tr('experienceLine2')}</p></div><div class="experience-layout">${education}<div><div class="timeline">${experiences.map(([date,title,desc])=>`<div class="timeline-row"><time>${escapeHTML(date)}</time><div><h3>${escapeHTML(title)}</h3><p>${escapeHTML(desc)}</p></div></div>`).join('')}</div></div></div></section>
  </div>`;
}
function buttonGroup(values,current,action){return `<div class="filter-tabs" role="group" aria-label="${tr('resultType')}">${values.map(v=>`<button type="button" data-filter="${action}" data-value="${v}" aria-pressed="${v===current}">${escapeHTML(v==='论文'?t('papers'):v==='授权专利'?t('grantedPatents'):v)}</button>`).join('')}</div>`;}
function compactLink(url,label,fullLabel=label,cls='compact-resource'){
  return /^https:\/\//.test(url)?`<a href="${escapeHTML(url)}" target="_blank" rel="noopener noreferrer" class="${cls}" title="${escapeHTML(fullLabel)}" aria-label="${escapeHTML(fullLabel)}">${escapeHTML(label)}</a>`:'';
}
function compactRow({key,date,dateDetail,title,originalTitle,url,meta,resources=[]}){
  return `<li class="compact-row" role="listitem" ${key} data-date="${escapeHTML(date)}" data-original-title="${escapeHTML(originalTitle||title)}"><time class="compact-date" ${/^\d{4}(?:-\d{2}){0,2}$/.test(date)?`datetime="${date}"`:''} title="${escapeHTML(dateDetail||date)}">${escapeHTML(date)}</time><h2 class="compact-title" title="${escapeHTML(title)}">${compactLink(url,title,title,'compact-title-link')||escapeHTML(title)}</h2><div class="compact-details"><span class="compact-meta" title="${escapeHTML(meta)}">${escapeHTML(meta)}</span><span class="compact-resources">${resources.map(l=>compactLink(l.url,l.label,l.fullLabel)).join('')}</span></div></li>`;
}
function localized(record){return english&&record.translations?.en?record.translations.en:record;}
function expressionResourceLabel(link){
  if(/音频|播客/.test(link.label))return t('audio');
  if(/课程视频页|视频课程页/.test(link.label))return t('course');
  if(/视频|录像|回放/.test(link.label)){
    if(/节选/.test(link.label))return t('videoClip');
    if(/^https:\/\/www\.bilibili\.com\//.test(link.url))return t('bilibili');
    if(/^https:\/\/www\.youtube\.com\//.test(link.url))return 'YouTube';
    if(/^https:\/\/www\.ted\.com\//.test(link.url))return 'TED';
  }
  if(/视频|录像|回放/.test(link.label))return t('video');
  if(/全文|实录|问答|专访/.test(link.label))return t('fullText');
  if(/摘要|观点/.test(link.label))return t('summary');
  if(/公众号/.test(link.label))return t('wechat');
  return t('content');
}
function expressionsPage(){
  return `<div class="container expressions-page fade-in"><header class="page-heading"><p class="eyebrow">${tr('perspectivesEyebrow')}</p><h1>${tr('perspectives')}</h1><p>${tr('perspectivesDescription')}</p></header><div class="filter-bar expression-toolbar"><span class="chronology-label">${tr('newest')}</span><label class="search-wrap"><span aria-hidden="true">⌕</span><span class="sr-only">${tr('expressionSearch')}</span><input id="expression-search" class="search-input" placeholder="${tr('expressionPlaceholder')}" value="${escapeHTML(state.expressionSearch)}" type="search"></label></div><div class="list-summary"><span id="expression-summary" role="status" aria-live="polite"></span></div><ul class="compact-list" id="expression-results" aria-label="${tr('expressionList')}"></ul><details class="archive-policy"><summary>${tr('aboutArchive')}</summary><p>${tr('archiveDescription')}</p></details></div>`;
}
function drawExpressions(){
  const query=state.expressionSearch.trim().toLowerCase();
  const filtered=PUBLIC_DATA.expressions.filter(x=>!query||[x.title,x.event,x.type,x.stage,x.date,x.translations?.en.title,x.translations?.en.event,x.translations?.en.type].join(' ').toLowerCase().includes(query));
  $('#expression-summary').textContent=t('expressionCount',{count:filtered.length});
  $('#expression-results').innerHTML=filtered.length?filtered.map(x=>{
    const display=localized(x);
    const type=display.type.replace(/[（(][^）)]*(?:未披露|未公开|未全公开)[^）)]*[）)]/g,'');
    const displayDate=x.dateLabel==='日期未公开'?t('past'):x.dateLabel;
    let detail=x.dateDetail&&!/未|不明|不详|待核/.test(x.dateDetail)?x.dateDetail:/上传/.test(x.dateDetail)?t('videoUploaded'):/发布/.test(x.dateDetail)?t('published'):'';
    if(english){detail=/录制/.test(x.dateDetail)?'Recorded'+(x.dateDetail.match(/\d{2}-\d{2}(?=\s*发布)/)?'; published '+x.dateDetail.match(/\d{2}-\d{2}(?=\s*发布)/)[0]:''):/上传/.test(x.dateDetail)?t('videoUploaded'):/发布/.test(x.dateDetail)?t('published'):'';}
    const resources=[...x.contentLinks.map(l=>({url:l.url,label:expressionResourceLabel(l),fullLabel:display.title+' · '+(english?expressionResourceLabel(l):l.label.replace(/\s*↗/g,''))})),...x.evidenceLinks.filter(l=>!x.contentLinks.some(c=>c.url===l.url)).slice(0,1).map(l=>({url:l.url,label:t('source'),fullLabel:display.title+' · '+(english?t('source'):l.label)}))];
    return compactRow({key:`data-expression-id="${x.id}"`,date:displayDate,dateDetail:displayDate+(detail?' · '+detail:''),title:display.title,originalTitle:x.title,url:(x.contentLinks[0]||x.evidenceLinks[0])?.url,meta:display.event+' · '+type,resources});
  }).join(''):`<li class="empty-state">${tr('noExpressions')}<button id="reset-expressions" type="button">${tr('clearSearch')}</button></li>`;
}
function academicPage(){return `<div class="container fade-in"><header class="page-heading"><div class="academic-intro"><div><p class="eyebrow">${tr('publicationsEyebrow')}</p><h1>${tr('publications')}</h1><p>${tr('publicationsDescription')}</p></div>${external('https://scholar.google.com/citations?user=ozXuhOUAAAAJ&hl=en','Google Scholar','text-link')}</div></header><div class="filter-bar">${buttonGroup(['论文','授权专利'],state.academicTab,'academic')}<label class="search-wrap"><span aria-hidden="true">⌕</span><span class="sr-only">${tr('academicSearch')}</span><input id="paper-search" class="search-input" type="search" value="${escapeHTML(state.paperSearch)}" placeholder="${tr('academicPlaceholder')}"></label></div><p id="academic-summary" class="publication-count" role="status" aria-live="polite" style="margin-top:20px"></p><ul class="compact-list" id="academic-results" aria-label="${tr('academicList')}"></ul><p id="academic-note" class="page-bottom-note"></p></div>`;}
function drawAcademic(){
  const patents=state.academicTab==='授权专利';const query=state.paperSearch.trim().toLowerCase();
  const source=patents?PUBLIC_DATA.grantedPatents:PUBLIC_DATA.papers;
  const rows=source.filter(x=>!query||[x.title,x.authors,x.date,x.venue,x.topic,x.id,x.applicationNumber,x.recordId,x.description,x.translations?.en.title,x.translations?.en.venue].join(' ').toLowerCase().includes(query));
  $('#academic-summary').textContent=patents?t('grantCount',{count:rows.length})+t(query?'searchResults':'byGrantDate'):t('paperCount',{count:rows.length});
  $('#academic-results').innerHTML=rows.length?rows.map(x=>{
    const display=localized(x);
    const date=patents?(x.grantDate||t('past')):x.date;
    const title=display.title.replace(/[{}]/g,'');
    const resources=patents?x.grants.map(l=>({url:l.url,label:l.label,fullLabel:title+' · '+t('grantDocument')+' '+l.label})):[];
    return compactRow({key:`data-academic-id="${escapeHTML(patents?x.recordId:x.id)}"`,date,dateDetail:patents?t('grantDate')+' '+date:date,title,originalTitle:x.title,url:x.url,meta:display.venue,resources});
  }).join(''):`<li class="empty-state">${tr('noResults')}</li>`;
  $('#academic-note').textContent=t(patents?'patentNote':'paperNote');
}
let currentPage='';
function render(){
  syncChrome();
  const [requested,anchor]=(location.hash.slice(1)||'home').split('/');
  const page=['home','perspectives','publications'].includes(requested)?requested:'home';
  const changed=page!==currentPage||page==='publications';
  if(changed){
    if(page==='publications'){state.academicTab='论文';state.paperSearch='';}
    currentPage=page;$('#main').innerHTML=({home:homePage,perspectives:expressionsPage,publications:academicPage})[page]();
    if(page==='perspectives')drawExpressions();if(page==='publications')drawAcademic();
    $$('[data-nav]').forEach(a=>{if(a.dataset.nav===page)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
    document.title=page==='home'?t('siteTitle'):t(page)+' · '+t('siteTitle');
    window.scrollTo({top:0,behavior:'instant'});
  }
  if(anchor)requestAnimationFrame(()=>document.getElementById(anchor)?.scrollIntoView({behavior:'auto'}));
  else if(!changed)window.scrollTo({top:0,behavior:'auto'});
}
document.addEventListener('click',event=>{
  if(event.target.closest('a[href="#main"]')){event.preventDefault();$('#main').focus();$('#main').scrollIntoView({behavior:'auto'});return;}
  const filter=event.target.closest('[data-filter]');
  if(filter){const type=filter.dataset.filter,value=filter.dataset.value;
    if(type==='academic'){state.academicTab=value;state.paperSearch='';$('#paper-search').value='';$$('[data-filter="academic"]').forEach(b=>b.setAttribute('aria-pressed',b===filter));drawAcademic();}
  }
  if(event.target.id==='reset-expressions'){state.expressionSearch='';currentPage='';render();}
  const route=event.target.closest('a[href^="#"]');if(route&&route.hash===location.hash&&route.hash!=='#main'){event.preventDefault();render();}
});
document.addEventListener('input',event=>{if(event.target.id==='expression-search'){state.expressionSearch=event.target.value;drawExpressions();}if(event.target.id==='paper-search'){state.paperSearch=event.target.value;drawAcademic();}});
window.addEventListener('hashchange',render);
window.addEventListener('pageshow',event=>{if(event.persisted)render();});
render();

