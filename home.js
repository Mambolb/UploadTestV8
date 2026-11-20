/* Portfolio V8.3 — C2F-inspired scroll experiment.
   This is an original approximation, not a copy of C2F's private JS.
   Category/medium/context/year columns remain stationary in a sticky stage.
   Name values shift with native scroll and spring inertia. No scroll hijack.
   Key parameters: SCROLL_DISTANCE (CSS-px), NAME_TRAVEL (Figma-px),
   SPRING_STIFFNESS, SPRING_DAMPING. */
(() => {
'use strict';
const projects=window.SITE_PROJECTS.slice();
const archive=document.querySelector('#archive');
const canvas=document.querySelector('#home-canvas');
const viewport=document.querySelector('#home-viewport');
const stage=document.querySelector('#home-sticky');
const picture=document.querySelector('#preview-image');
const fields=['name','category','medium','context','year'];
const labels={name:'INDEX',category:'CATEGORY',medium:'MEDIUM',context:'CONTEXT',year:'YEAR'};
const css=getComputedStyle(canvas);
const ROW=parseFloat(css.getPropertyValue('--row-height'))||28;
const HEADER=parseFloat(css.getPropertyValue('--header-height'))||28;
const BASE_HEIGHT=1024;
const SCROLL_DISTANCE=640;       // How much native scrolling is available after first viewport
const NAME_TRAVEL=224;           // Max downward movement of project-name track (in Figma pixels)
const SPRING_STIFFNESS=0.052;    // Higher = responds more quickly
const SPRING_DAMPING=0.76;       // Lower = settles sooner
const REDUCED=matchMedia('(prefers-reduced-motion: reduce)');
let ordered=projects.slice();
let sortKey='year',ascending=false,activeId=null,activeRow=-1;
let track=null,trackPos=0,trackVelocity=0,targetPos=0,raf=0;
let scale=1;
const collator=new Intl.Collator('en',{numeric:true,sensitivity:'base'});
function yearValue(v){const nums=String(v||'').match(/\d{4}/g);return nums?Number(nums[nums.length-1]):0;}
function sortProjects(key,asc){return projects.map((p,i)=>({p,i})).sort((a,b)=>{
 let cmp;
 if(key==='year')cmp=yearValue(a.p.year)-yearValue(b.p.year);
 else cmp=collator.compare(String(a.p[key]??''),String(b.p[key]??''));
 return cmp?(asc?cmp:-cmp):a.i-b.i;
}).map(x=>x.p);}
ordered=sortProjects(sortKey,ascending);
function make(tag,cls,text){const n=document.createElement(tag);n.className=cls;if(text!==undefined)n.textContent=text;return n;}
function groupRuns(field){const runs=[];
 for(let i=0;i<ordered.length;i++){
  const value=String(ordered[i][field]??'');const last=runs[runs.length-1];
  if(last&&last.value===value&&last.end===i-1)last.end=i;
  else runs.push({value,start:i,end:i});
 }return runs;}
function positionCell(node,from,to){node.style.top=(HEADER+from*ROW)+'px';
 node.style.height=((to-from+1)*ROW)+'px';node.dataset.start=from;node.dataset.end=to;}
function render(){
 const columns=fields.map(field=>{
  const col=make('div','column');col.dataset.field=field;
  const title=make('button','cell is-header');title.type='button';title.style.top='0px';title.style.height=HEADER+'px';
  title.append(document.createTextNode(labels[field]));
  const arrow=make('span','sort-arrow',field===sortKey?(ascending?'↑':'↓'):'↓');
  arrow.setAttribute('aria-hidden','true');title.append(arrow);
  title.setAttribute('aria-label','Sort by '+field);title.setAttribute('aria-pressed',String(field===sortKey));
  title.addEventListener('click',()=>sortBy(field));col.append(title);
  if(field==='name'){
    const holder=make('div','name-track');
    for(const [i,p] of ordered.entries()){
      const node=make('a','cell row-name',p.name);positionCell(node,i,i);
      node.href=p.href||'#';node.dataset.projectId=p.id;node.dataset.index=String(i);
      node.setAttribute('aria-label',p.name+' — open project');holder.append(node);
    }
    track=holder;col.append(holder);
  }else{
   for(const g of groupRuns(field)){
    const node=make('div','cell merged',g.value);positionCell(node,g.start,g.end);col.append(node);
   }
  }return col;
 });
 archive.replaceChildren(...columns);
 archive.style.minHeight=Math.max(985,HEADER+ROW*ordered.length)+'px';
 canvas.style.minHeight=Math.max(BASE_HEIGHT,39+HEADER+ROW*ordered.length)+'px';
 setTrack(trackPos);resize();paint();
}
function paint(){
 for(const n of archive.querySelectorAll('.selected'))n.classList.remove('selected');
 const pos=ordered.findIndex(x=>x.id===activeId);
 if(pos<0){canvas.classList.remove('has-hover');canvas.removeAttribute('data-preview');picture.removeAttribute('src');return;}
 const p=ordered[pos];canvas.dataset.preview=p.id;
 if(p.preview){picture.src=p.preview;picture.style.display='block';}
 else {picture.removeAttribute('src');picture.style.display='none';}
 canvas.classList.add('has-hover');
 // Reproduce Figma's white filled blocks with green active type.
 for(const field of fields){
  const col=archive.querySelector('.column[data-field="'+field+'"]');
  for(const cell of col.querySelectorAll('.cell:not(.is-header)')){
   if(Number(cell.dataset.start)<=pos&&pos<=Number(cell.dataset.end)){
    cell.classList.add('selected');break;
   }
  }
 }
}
function selectByIndex(i){
 if(i<0||i>=ordered.length){clear();return;}
 const id=ordered[i].id;if(activeId===id&&activeRow===i)return;
 activeRow=i;activeId=id;paint();
}
function clear(){if(activeId===null)return;activeId=null;activeRow=-1;paint();}
function sortBy(key){
 clear();if(key==='name'){sortKey='name';ascending=true;ordered=projects.slice();}
 else{ascending=key===sortKey?!ascending:(key==='year'?false:true);sortKey=key;
 ordered=sortProjects(key,ascending);}
 render();
}
function indexFromPointer(e){
 // Name cells are animated. Use their physical DOM box, not the unshifted row index.
 const anchor=e.target.closest('.row-name');
 if(anchor)return Number(anchor.dataset.index);
 const rect=archive.getBoundingClientRect();
 const y=(e.clientY-rect.top)/scale;
 if(y<HEADER)return -1;
 return Math.floor((y-HEADER)/ROW);
}
archive.addEventListener('pointermove',e=>{
 if(e.target.closest('.is-header')){clear();return;}
 selectByIndex(indexFromPointer(e));
});
archive.addEventListener('pointerleave',clear);
archive.addEventListener('click',e=>{
 const anchor=e.target.closest('.row-name');if(anchor)return;
 if(e.target.closest('.is-header'))return;
 const p=ordered[indexFromPointer(e)];if(p?.href)location.assign(p.href);
});
archive.addEventListener('keydown',e=>{
 if(e.target.closest('.is-header'))return;
 if(e.key==='ArrowDown'||e.key==='ArrowUp'){
  e.preventDefault();selectByIndex(Math.max(0,Math.min(ordered.length-1,activeRow+(e.key==='ArrowDown'?1:-1))));
 }else if(e.key==='Enter'&&activeRow>=0){const p=ordered[activeRow];if(p?.href)location.assign(p.href);}
 else if(e.key==='Escape'){clear();if(document.activeElement===archive)archive.blur();}
});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){clear();if(document.activeElement===archive)archive.blur();}});
window.addEventListener('blur',clear);
document.addEventListener('visibilitychange',()=>{if(document.hidden)clear();});
function setTrack(v){if(track)track.style.transform='translate3d(0,'+v.toFixed(3)+'px,0)';}
function animate(){
 raf=0;
 const accel=(targetPos-trackPos)*SPRING_STIFFNESS;
 trackVelocity=(trackVelocity+accel)*SPRING_DAMPING;
 trackPos+=trackVelocity;
 if(Math.abs(targetPos-trackPos)<.02&&Math.abs(trackVelocity)<.02){trackPos=targetPos;trackVelocity=0;setTrack(trackPos);return;}
 setTrack(trackPos);raf=requestAnimationFrame(animate);
}
function updateScroll(){
 // Current stage starts at document top. Clamp its total progress to its scroll travel.
 const top=viewport.getBoundingClientRect().top+window.scrollY;
 const progress=Math.min(1,Math.max(0,(window.scrollY-top)/(SCROLL_DISTANCE*scale)));
 targetPos=NAME_TRAVEL*progress;
 if(REDUCED.matches){trackPos=targetPos;trackVelocity=0;setTrack(trackPos);return;}
 if(!raf)raf=requestAnimationFrame(animate);
}
function resize(){
 const availableWidth=document.documentElement.clientWidth||innerWidth;
 scale=availableWidth/1440;
 const contentHeight=Math.max(BASE_HEIGHT,39+HEADER+ROW*ordered.length);
 canvas.style.transform='scale('+scale+')';
 viewport.style.width=availableWidth+'px';
 stage.style.height=Math.ceil(contentHeight*scale)+'px';
 viewport.style.height=Math.ceil((contentHeight+SCROLL_DISTANCE)*scale)+'px';
 updateScroll();
}
addEventListener('scroll',updateScroll,{passive:true});
addEventListener('resize',resize,{passive:true});
REDUCED.addEventListener?.('change',updateScroll);
render();
})();
