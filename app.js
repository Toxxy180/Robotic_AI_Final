(() => {
  'use strict';
  const data = window.COURSE_DATA || [];
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const escapeHTML = (value) => String(value).replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const paths = {
    book:'M4 4h6a3 3 0 0 1 3 3v14a4 4 0 0 0-4-3H3V4h1Zm9 3a3 3 0 0 1 3-3h5v14h-5a3 3 0 0 0-3 3',
    robot:'M8 6V4h8v2M6 7h12v10H6zM3 10v4m18-4v4M9 11h.01M15 11h.01M9 15h6M9 17v3m6-3v3',
    factory:'M3 21V10l6 3V7l6 4V3h4l2 18H3Zm4-4h1m4 0h1m4 0h1',
    health:'M12 21S3 16 3 9a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 7-9 12-9 12Zm0-13v7m-3-3h6',
    leaf:'M20 3C9 2 3 8 5 15s16 5 15-12ZM3 21 15 9m-6 6v-5m0 5h5',
    school:'m2 9 10-5 10 5-10 5L2 9Zm4 3v6c4 3 8 3 12 0v-6m4-3v8',
    car:'M5 6h14l2 7v6h-3v-2H6v2H3v-6l2-7Zm-2 7h18M7 13h.01M17 13h.01M6 9h12',
    scale:'M12 3v18M6 21h12M3 7h18M6 7l-4 7h8L6 7Zm12 0-4 7h8l-4-7Z',
    globe:'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM3 12h18M12 3c5 5 5 13 0 18-5-5-5-13 0-18Z',
    search:'m21 21-5-5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z',
    print:'M6 9V3h12v6M6 17H3V9h18v8h-3M6 14h12v7H6v-7Zm12-2h.01',
    copy:'M9 8h12v13H9V8ZM5 17H3V3h12v2',
    check:'m4 12 5 5L20 6',
    circle:'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
    arrow:'M4 12h16m-6-6 6 6-6 6',
    up:'M12 20V4m-6 6 6-6 6 6',
    chevron:'m9 5 7 7-7 7',
    menu:'M3 6h18M3 12h18M3 18h18',
    close:'m6 6 12 12M18 6 6 18',
    reset:'M3 9a9 9 0 1 1 1 9M3 3v6h6',
    chip:'M6 6h12v12H6V6Zm3 3h6v6H9V9ZM9 2v4m6-4v4m-6 12v4m6-4v4M2 9h4m-4 6h4m12-6h4m-4 6h4',
  };
  const icon = (name) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${paths[name] || paths.book}"/></svg>`;
  function fillIcons(root = document) { $$('[data-icon]', root).forEach(el => el.innerHTML = icon(el.dataset.icon)); }
  const categories = [
    ['all','ทั้งหมด 25 ข้อ','book'],['foundations','พื้นฐานหุ่นยนต์','robot'],['industry','อุตสาหกรรม','factory'],['health','การแพทย์','health'],['agriculture','เกษตรอัจฉริยะ','leaf'],['learning','การเรียนรู้','school'],['mobility','ยานยนต์','car'],['ethics','จริยธรรม','scale'],['future','อนาคต','globe']
  ];
  let category = 'all';
  let read = new Set();
  try { const stored = JSON.parse(localStorage.getItem('rai-read-v1') || '[]'); if (Array.isArray(stored)) read = new Set(stored.filter(x => Number.isInteger(x) && x >= 1 && x <= 25)); } catch {}
  $('#categories').innerHTML = categories.map(([id,label,glyph]) => `<button type="button" class="category-button${id === 'all' ? ' active' : ''}" data-category="${id}" aria-pressed="${id === 'all'}">${icon(glyph)}<span>${label}</span>${id === 'all' ? '' : `<span class="category-number">${data.filter(q => q.category === id).length}</span>`}</button>`).join('');
  const visuals = {robot:'หุ่นยนต์สามมิติ',sense:'สำรวจวงจร Sense–Think–Act',vacuum:'สำรวจส่วนประกอบหุ่นยนต์ดูดฝุ่น',arms:'เปรียบเทียบแขนกลสองประเภท',sae:'สำรวจระดับความอัตโนมัติ SAE',learning:'เปรียบเทียบรูปแบบการเรียนรู้'};
  $('#question-list').innerHTML = data.map(q => `<article id="q${q.id}" class="question ${q.visual ? '' : 'no-visual'}" data-question="${q.id}" aria-labelledby="title-${q.id}">
    <div class="question-layout"><div class="question-main">
      <div class="question-header"><a class="question-number" href="#q${q.id}" aria-label="ลิงก์ไปข้อ ${q.id}">${String(q.id).padStart(2,'0')}</a><h3 id="title-${q.id}">${escapeHTML(q.title)}</h3></div>
      <div class="text-block question-block"><span class="block-label">โจทย์</span><p>${escapeHTML(q.question)}</p></div>
      <div class="text-block answer-block"><span class="block-label">คำตอบ</span><div>${q.answer.map(line => `<p>${escapeHTML(line)}</p>`).join('')}</div></div>
      <div class="question-actions"><button class="button button-outline copy-button" data-id="${q.id}">${icon('copy')}<span>คัดลอกคำตอบ</span></button><button class="button read-button" data-id="${q.id}" aria-pressed="false">${icon('circle')}<span>อ่านแล้ว</span></button></div>
      ${q.sources?.length ? `<details class="sources"><summary>${icon('chevron')} แหล่งอ้างอิง ${q.sources.length} แห่ง</summary><ul>${q.sources.map(s => `<li><a href="${escapeHTML(s.url)}" target="_blank" rel="noopener noreferrer">${escapeHTML(s.title)}</a></li>`).join('')}</ul></details>` : ''}
    </div>${q.visual ? `<div class="question-visual"><div class="visual-mount" data-visual="${q.visual}" role="group" aria-label="${visuals[q.visual]}"><div class="visual-loading"><span class="loading-orbit"></span></div></div><p class="visual-note">${q.visual==='learning'?'เลือกแท็บเพื่อเปรียบเทียบวิธีเรียนรู้แต่ละประเภท':'ลากเพื่อหมุน · ภาพจำลองเพื่อการเรียนรู้ ไม่ใช่อุปกรณ์จริงตามสัดส่วน'}</p></div>` : ''}</div>
    ${q.id === 3 ? `<div class="timeline" aria-label="เส้นเวลาหุ่นยนต์"><div class="timeline-stop"><strong>1961</strong><span>Unimate · โรงงาน</span></div><div class="timeline-stop"><strong>1966–1972</strong><span>Shakey · วางแผน</span></div><div class="timeline-stop"><strong>1997</strong><span>Sojourner · ดาวอังคาร</span></div><div class="timeline-stop"><strong>2000</strong><span>ASIMO · เดินสองขา</span></div></div>` : ''}
  </article>`).join('');
  fillIcons();
  function toast(message) { const el = $('#toast'); el.textContent = message; el.classList.add('show'); clearTimeout(toast.timer); toast.timer = setTimeout(() => el.classList.remove('show'),2400); }
  function updateProgress() {
    $('#read-count').textContent = read.size;
    $('#progress-fill').style.width = `${read.size / 25 * 100}%`;
    $('.progress-track').setAttribute('aria-valuenow',read.size);
    $$('.read-button').forEach(button => { const yes = read.has(Number(button.dataset.id)); button.setAttribute('aria-pressed',yes); button.innerHTML = `${icon(yes ? 'check' : 'circle')}<span>อ่านแล้ว</span>`; button.closest('.question').classList.toggle('is-read',yes); });
  }
  function saveProgress() { try { localStorage.setItem('rai-read-v1',JSON.stringify([...read])); } catch { toast('บันทึกได้เฉพาะการเปิดหน้านี้ เบราว์เซอร์ปิดการจัดเก็บข้อมูล'); } updateProgress(); }
  updateProgress();
  const mobileNav = matchMedia('(max-width:720px)');
  function setMenu(open) { const sidebar=$('#sidebar');const focusWasInside=sidebar.contains(document.activeElement);sidebar.classList.toggle('open',open);sidebar.inert=mobileNav.matches&&!open;$('#nav-backdrop').hidden = !open; $('.menu-button').setAttribute('aria-expanded',open); if(open) $('#search').focus();else if(mobileNav.matches&&focusWasInside)$('.menu-button').focus(); }
  mobileNav.addEventListener('change',()=>setMenu(false));setMenu(false);
  $('.menu-button').addEventListener('click',()=>setMenu(!$('#sidebar').classList.contains('open')));
  $('.close-nav').addEventListener('click',()=>setMenu(false)); $('#nav-backdrop').addEventListener('click',()=>setMenu(false));
  document.addEventListener('keydown',e=>{if(e.key==='Escape')setMenu(false)});
  function filter() {
    const query = $('#search').value.trim().toLocaleLowerCase('th');
    let matches = 0;
    data.forEach(q => { const text = `${q.id} ${q.title} ${q.question} ${q.answer.join(' ')} ${q.keywords}`.toLocaleLowerCase('th'); const show = (category === 'all' || q.category === category) && (!query || text.includes(query)); $(`#q${q.id}`).hidden = !show; if(show) matches++; });
    $('#hero').hidden = category !== 'all' || !!query;
    $('#section-title').textContent = query ? 'ผลการค้นหา' : category === 'all' ? 'บทเรียนทั้งหมด' : categories.find(c=>c[0] === category)[1];
    $('#filter-summary').hidden = !query;
    $('#filter-summary').textContent = query ? `คำค้น “${$('#search').value.trim()}”${category !== 'all' ? ` · ${categories.find(c=>c[0] === category)[1]}` : ''}` : '';
    $('#result-count').textContent = matches === 25 ? '01 — 25' : `${matches} จาก 25 ข้อ`;
    $('#empty-state').hidden = matches !== 0;
    $$('.category-button').forEach(button => { const active = button.dataset.category === category; button.classList.toggle('active',active); button.setAttribute('aria-pressed',active); });
  }
  $('#search').addEventListener('input',filter);
  $('#categories').addEventListener('click',e=>{const b=e.target.closest('[data-category]');if(!b)return;category=b.dataset.category;filter();setMenu(false);$('#lessons').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});});
  function resetFilter(){category='all';$('#search').value='';filter();setMenu(false)}
  $('#clear-search').addEventListener('click',resetFilter);
  $$('.brand,.topbar-title').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();resetFilter();window.scrollTo({top:0,behavior:'smooth'})}));
  $('#reset-progress').addEventListener('click',()=>{read.clear();saveProgress();toast('ล้างสถานะอ่านแล้วครบทุกข้อ')});
  $('#question-list').addEventListener('click',async e=>{
    const button = e.target.closest('.copy-button,.read-button'); if(!button)return;
    const id = Number(button.dataset.id);
    if(button.classList.contains('read-button')) { read.has(id) ? read.delete(id) : read.add(id); saveProgress(); return; }
    const q = data.find(q=>q.id===id); const text = q.answer.join('\n');
    try {
      if(navigator.clipboard?.writeText) await navigator.clipboard.writeText(text);
      else {const area=document.createElement('textarea');area.value=text;area.style.cssText='position:fixed;left:-9999px';document.body.appendChild(area);area.select();const ok=document.execCommand('copy');area.remove();if(!ok)throw new Error('copy unavailable')}
      toast(`คัดลอกคำตอบข้อ ${id} แล้ว`);
    } catch {toast('คัดลอกอัตโนมัติไม่ได้ กรุณาเลือกข้อความคำตอบแล้วคัดลอก')}
  });
  $('#print').addEventListener('click',()=>window.print());
  window.addEventListener('hashchange',()=>{const target = location.hash.match(/^#q(\d+)$/);if(target){resetFilter();requestAnimationFrame(()=>$(`#q${target[1]}`)?.scrollIntoView())}});
  if(location.hash.match(/^#q\d+$/))requestAnimationFrame(()=>$(`${location.hash}`)?.scrollIntoView());
  const learningModes=[
    {label:'Supervised',out:'สุก / ดิบ',text:'<strong>เรียนจากตัวอย่างพร้อมคำตอบ</strong><br>ภาพผลไม้ + ป้ายกำกับ → เรียนรู้ → จำแนกผลใหม่'},
    {label:'Unsupervised',out:'กลุ่ม A<br>กลุ่ม B',text:'<strong>ค้นหารูปแบบโดยไม่มีป้ายกำกับ</strong><br>ข้อมูลเซนเซอร์ → ค้นหาความคล้ายกัน → จัดกลุ่ม'},
    {label:'Reinforcement',out:'รางวัล<br>+1',text:'<strong>เรียนจากการกระทำและผลตอบแทน</strong><br>ลองหยิบวัตถุ → ได้รางวัลเมื่อสำเร็จ → ปรับวิธีหยิบ'}
  ];
  function mountLearning(el){el.innerHTML=`<div class="learning-demo"><div class="learning-tabs" role="tablist" aria-label="ประเภทการเรียนรู้">${learningModes.map((m,i)=>`<button role="tab" class="learning-tab${i===0?' active':''}" data-mode="${i}" aria-selected="${i===0}">${m.label}</button>`).join('')}</div><div class="learning-scene"><div class="learning-dataset" aria-hidden="true">${'<span class="data-dot"></span>'.repeat(9)}</div><span class="learning-arrow">${icon('arrow')}</span><div class="learning-processor">${icon('chip')}</div><span class="learning-arrow">${icon('arrow')}</span><div class="learning-result">สุก / ดิบ</div></div><p class="learning-caption" aria-live="polite">${learningModes[0].text}</p></div>`;el.addEventListener('click',e=>{const b=e.target.closest('[data-mode]');if(!b)return;const m=learningModes[Number(b.dataset.mode)];$$('[data-mode]',el).forEach(t=>{t.classList.toggle('active',t===b);t.setAttribute('aria-selected',t===b)});$('.learning-result',el).innerHTML=m.out;$('.learning-caption',el).innerHTML=m.text});return{dispose(){el.replaceChildren()}}}
  const mounted = new Map();
  let visualObserver;
  function setupVisuals(){
    if(visualObserver || !window.mountVisual)return;
    visualObserver=new IntersectionObserver(entries=>{entries.forEach(entry=>{const el=entry.target;if(entry.isIntersecting&&!mounted.has(el)){try{el.replaceChildren();mounted.set(el,el.dataset.visual==='learning'?mountLearning(el):window.mountVisual(el.dataset.visual,el))}catch(error){el.innerHTML='<p class="visual-loading">ไม่สามารถแสดงภาพ 3D ได้ โปรดอ่านคำอธิบายประกอบ</p>';console.warn('Visual unavailable:',error)}}else if(!entry.isIntersecting&&mounted.has(el)){mounted.get(el)?.dispose?.();mounted.delete(el);el.replaceChildren();}})},{rootMargin:'180px 0px'});
    $$('[data-visual]').forEach(el=>visualObserver.observe(el));
  }
  window.addEventListener('visuals-ready',setupVisuals);setupVisuals();
  // The text remains usable even on browsers that cannot load or render WebGL.
  setTimeout(()=>{if(!window.mountVisual){$$('.visual-loading').forEach(el=>el.innerHTML='<span>ภาพ 3D ไม่พร้อมใช้งานบนเบราว์เซอร์นี้<br>อ่านคำอธิบายได้ตามปกติ</span>')}},12000);
})();
