/* Portfolio V9 — pixel-aligned interactive index based on the Figma V9 exports.
   Keeps the pre-existing links, sorting and merged-cell hover behavior of V8.
   The hover preview is ALWAYS coloured and blurred; related cells white/red.
*/
(() => {
  'use strict';
  const projects = window.SITE_PROJECTS?.slice() || [];
  const archive = document.getElementById('archive');
  const canvas = document.getElementById('home-canvas');
  const viewport = document.getElementById('home-viewport');
  const picture = document.getElementById('preview-image');
  if (!archive || !canvas || !viewport || !picture) return;

  const fields = ['name','category','medium','context','year'];
  const labels = {name:'INDEX',category:'CATEGORY',medium:'MEDIUM',context:'CONTEXT',year:'YEAR'};
  const ROW = 28;
  const HEADER = 28;
  const collator = new Intl.Collator('en',{numeric:true,sensitivity:'base'});
  let ordered = projects.slice();
  let sortKey = null;
  let ascending = true;
  let activeId = null;
  let activeRow = -1;

  function element(tag, className, value) {
    const e = document.createElement(tag); e.className = className;
    if (value !== undefined) e.textContent = value;
    return e;
  }
  function runs(field) {
    const result = [];
    ordered.forEach((p,i) => {
      const value = String(p[field] ?? '');
      const last = result[result.length-1];
      if (last && last.value===value && last.to===i-1) last.to=i;
      else result.push({value,from:i,to:i});
    });
    return result;
  }
  function place(node,from,to) {
    node.style.top = (HEADER+from*ROW)+'px';
    node.style.height = ((to-from+1)*ROW)+'px';
    node.dataset.from = from;
    node.dataset.to = to;
  }
  function render() {
    const columns = fields.map(field => {
      const col=element('div','column'); col.dataset.field=field;
      const heading=element('button','cell is-header'); heading.type='button';
      heading.style.height=HEADER+'px';
      heading.append(document.createTextNode(labels[field]));
      const arrow=element('span','sort-arrow',field===sortKey?(ascending?'↑':'↓'):'↓');
      arrow.setAttribute('aria-hidden','true'); heading.append(arrow);
      heading.setAttribute('aria-label','Sort by '+field);
      heading.setAttribute('aria-pressed',String(field===sortKey));
      heading.addEventListener('click',()=>sortBy(field)); col.append(heading);
      if (field==='name') {
        ordered.forEach((p,i)=>{
          const cell=element('div','cell row-name',p.name);
          place(cell,i,i); cell.dataset.projectId=p.id; col.append(cell);
        });
      } else {
        runs(field).forEach(group=>{
          const cell=element('div','cell merged',group.value);
          place(cell,group.from,group.to); col.append(cell);
        });
      }
      return col;
    });
    archive.replaceChildren(...columns);
    archive.style.minHeight = Math.max(992,HEADER+ROW*ordered.length)+'px';
    canvas.style.minHeight = Math.max(1024,32+HEADER+ROW*ordered.length)+'px';
    resize(); highlight();
  }
  function highlight() {
    archive.querySelectorAll('.selected').forEach(cell=>cell.classList.remove('selected'));
    const i = ordered.findIndex(x=>x.id===activeId);
    if (i===-1) {
      canvas.classList.remove('has-hover');
      canvas.removeAttribute('data-preview');
      picture.removeAttribute('src');
      picture.style.display='none';
      return;
    }
    const current=ordered[i];
    canvas.dataset.preview=current.id;
    if (current.preview) {
      if (picture.getAttribute('src') !== current.preview) picture.src=current.preview;
      picture.style.display='block'; canvas.classList.add('has-hover');
    } else {
      picture.removeAttribute('src'); picture.style.display='none';
      canvas.classList.remove('has-hover');
    }
    for (const field of fields) {
      const col=archive.querySelector('.column[data-field="'+field+'"]');
      const matching=Array.from(col.querySelectorAll('.cell:not(.is-header)'))
        .find(cell=>Number(cell.dataset.from)<=i && Number(cell.dataset.to)>=i);
      if (matching) matching.classList.add('selected');
    }
  }
  function selectByRow(i) {
    if (i<0 || i>=ordered.length) { clear(); return; }
    const next=ordered[i].id;
    if (next===activeId && i===activeRow) return;
    activeId=next; activeRow=i; highlight();
  }
  function clear() {
    if (activeId===null) return;
    activeId=null; activeRow=-1; highlight();
  }
  function sortBy(field) {
    clear();
    if(field==='name') {sortKey=null;ascending=true;ordered=projects.slice();}
    else {
      ascending=field===sortKey?!ascending:true; sortKey=field;
      ordered=projects.slice().sort((a,b)=>{
        const cmp=collator.compare(String(a[field]??''),String(b[field]??''));
        return cmp?(ascending?cmp:-cmp):projects.indexOf(a)-projects.indexOf(b);
      });
    }
    render();
  }
  function rowFromPointer(e) {
    const rect=archive.getBoundingClientRect();
    const scale=rect.width/1440;
    const y=(e.clientY-rect.top)/scale;
    return y<HEADER?-1:Math.floor((y-HEADER)/ROW);
  }
  archive.addEventListener('pointermove',e=>selectByRow(rowFromPointer(e)));
  archive.addEventListener('pointerleave',clear);
  archive.addEventListener('click',e=>{
    if (e.target.closest('.is-header')) return;
    const p=ordered[rowFromPointer(e)];
    if(p?.href) window.location.assign(p.href);
  });
  archive.addEventListener('keydown',e=>{
    if(e.target.closest('.is-header')) return;
    if(e.key==='ArrowDown' || e.key==='ArrowUp') {
      e.preventDefault();
      selectByRow(Math.min(ordered.length-1,Math.max(0,activeRow+(e.key==='ArrowDown'?1:-1))));
    } else if(e.key==='Enter' && activeRow>=0) {
      if(ordered[activeRow]?.href) location.assign(ordered[activeRow].href);
    }
  });
  archive.addEventListener('focusout',e=>{if(!archive.contains(e.relatedTarget))clear();});
  document.addEventListener('keydown',e=>{
    if(e.key==='Escape'){
      clear();
      if(document.activeElement===archive)archive.blur();
    }
  });
  window.addEventListener('blur',clear);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)clear();});

  function resize() {
    const width=document.documentElement.clientWidth||innerWidth;
    const scale=width/1440;
    canvas.style.transform='scale('+scale+')';
    viewport.style.width=width+'px';
    viewport.style.height=Math.ceil(Math.max(1024,32+HEADER+ROW*ordered.length)*scale)+'px';
  }
  window.addEventListener('resize',resize,{passive:true});
  document.fonts?.ready?.then(resize).catch(()=>{});
  render();
})();
