const $=s=>document.querySelector(s),DAYS=['월','화','수','목','금'],AIR='#2F6DB5',LAND='#E07B39',NS='http://www.w3.org/2000/svg';
let R,F,di,sel=null;
document.querySelectorAll('nav button').forEach(b=>b.onclick=()=>{document.querySelectorAll('nav button,.tab').forEach(e=>e.classList.remove('on'));b.classList.add('on');$('#'+b.dataset.t).classList.add('on')});
document.querySelectorAll('[data-x]').forEach(b=>b.onclick=async()=>{$('#dlgc').innerHTML=await (await fetch('data/explain_'+b.dataset.x+'.html')).text();$('#dlg').showModal()});
const P=([lat,lon])=>[(lon-124.3)/7*400*0.95+10,(38.75-lat)/5.75*410+5];
function el(t,a,p){const e=document.createElementNS(NS,t);for(const k in a)e.setAttribute(k,a[k]);p&&p.appendChild(e);return e}
function base(svg){svg.innerHTML='';const d=el('defs',{},svg);[['a',AIR],['l',LAND],['g','#C9D1DA']].forEach(([i,c])=>{const m=el('marker',{id:'m'+i+svg.id,viewBox:'0 0 10 10',refX:9,refY:5,markerWidth:6,markerHeight:6,orient:'auto'},d);el('path',{d:'M0,0L10,5L0,10z',fill:c},m)});
 R.polys.forEach(pl=>el('path',{d:'M'+pl.map(p=>P([p[1],p[0]]).map(v=>v.toFixed(1)).join(',')).join('L')+'Z',fill:'#EEF2F6',stroke:'#B8C4D0','stroke-width':.6},svg))}
function draw1(){const svg=$('#map1');base(svg);const pl=R.plan[di];let hl=null;
 if(sel!=null)hl=new Set([sel]);
 pl.runs.forEach((r,i)=>r.legs.forEach(l=>{const[a,b]=[P(R.coords[l.f]),P(R.coords[l.t])];const on=hl&&hl.has(i),dim=hl&&!on;
  const c=dim?'#C9D1DA':(r.mode=='공수'?AIR:LAND),k=dim?'g':(r.mode=='공수'?'a':'l');
  const s=b[0]-a[0],t=b[1]-a[1],L=Math.hypot(s,t)||1,sh=6;
  el('line',{x1:a[0]+s/L*sh,y1:a[1]+t/L*sh,x2:b[0]-s/L*sh,y2:b[1]-t/L*sh,stroke:c,'stroke-width':on?3:1.4,opacity:l.ret?.6:.9,'stroke-dasharray':l.ret?'2 3':'', 'marker-end':l.ret?'':'url(#m'+k+'map1)'},svg)}));
 const used=new Set(pl.runs.flatMap(r=>r.stops.map(s=>s[0])));
 for(const p in R.coords){const[x,y]=P(R.coords[p]),k=R.kind[p],on=used.has(p)||k=='hub';
  if(k=='hub')el('text',{x,y:y+7,'text-anchor':'middle','font-size':22,fill:'#D9382F'},svg).textContent='★';
  else el('circle',{cx:x,cy:y,r:k=='dest'?4:2.5,fill:on?(k=='dest'?'#1F6FB5':'#8A96A3'):'#D5DAE0'},svg);
  const as=pl.assign.find(a=>a.dest==p);if(as){const g=el('circle',{cx:x,cy:y,r:9,fill:'transparent'},svg);el('title',{},g).textContent=as.run==null?`${p}: 오늘 수송편 없음 · 다음 편 ${as.next||'노선표에 없음'}`:`${p}: ${pl.runs[as.run].name} ${as.arr} 도착${as.ret?' (복귀 편)':''}`;g.onclick=()=>{sel=as.run;render1()}}
  el('text',{x:x+6,y:y-4,'font-size':k=='hub'?13:10,'font-weight':k=='via'?'normal':'bold',fill:on?'#222':'#A0A8B0'},svg).textContent=p}}
function render1(){const pl=R.plan[di],tb=$('#tb1');$('#dayl').textContent=pl.day+'요일';$('#head1').textContent=`오늘의 수송경로 — ${pl.day}요일 운행 편`;let h='';
 pl.runs.forEach((r,i)=>{const via=r.stops.map((s,j)=>`<span class="nw">${s[0]}${j&&r.legs[j-1].ret?'(복귀)':''}</span>`).join(' → ');h+=`<tr data-r="${i}" class="${sel===i?'sel':''}"><td class="nw">${r.name}</td><td class="nw">${r.mode=='공수'?'항공':'육로'}</td><td class="nw">${r.stops[0][0]}</td><td class="nw">${r.stops[0][2]}</td><td style="text-align:left">${via}</td><td class="nw">${r.stops.at(-1)[1]}</td></tr>`});
 $('#none1').innerHTML=pl.assign.filter(a=>a.run==null).map(a=>`<span>${a.dest}: 오늘 수송편 없음 (다음 편 ${a.next||'노선표에 없음'})</span>`).join('')||'';
 $('#none1').style.display=pl.assign.some(a=>a.run==null)?'':'none';
 tb.innerHTML=h;tb.querySelectorAll('tr[data-r]').forEach(t=>t.onclick=()=>{const i=+t.dataset.r;sel=sel===i?null:i;render1()});draw1()}
function setDay(d){di=(d+5)%5;sel=null;render1()}
$('#prev').onclick=()=>setDay(di-1);$('#next').onclick=()=>setDay(di+1);$('#today').onclick=()=>{const w=new Date().getDay();setDay(w>=1&&w<=5?w-1:0)};
// ---------- 2
function render2(){const M=F.models[$('#model').value],N=+$('#ndays').value,ds=Object.keys(M.pred).sort();const s=new Date(F.start);const days=[];for(let k=0;k<N;k++){const d=new Date(s);d.setDate(s.getDate()+k);days.push(d.toISOString().slice(0,10))}
 const reg={},by={};days.forEach(d=>{by[d]=0;const p=M.pred[d];if(!p)return;for(const u in p)for(const h in p[u]){const v=p[u][h];by[d]+=v;(reg[u]??={t:0})[h]=(reg[u][h]||0)+v;reg[u].t+=v}});
 const tot=Object.values(by).reduce((a,b)=>a+b,0),wd=days.filter(d=>M.pred[d]).length;
 $('#info2').textContent=`현재 데이터(총 ${F.n_rows.toLocaleString()}건, 기간 ${F.period[0]} ~ ${F.period[1]}) 학습 결과 기반 예측 · 모델: ${$('#model').value}`;
 $('#sum2').textContent=`향후 ${N}일(${days[0].slice(5)} ~ ${days.at(-1).slice(5)}, 평일 ${wd}일) 예상 수송청구: 총 ${Math.round(tot).toLocaleString()}건 · 하루 평균 ${Math.round(tot/Math.max(wd,1))}건`;
 const rows=Object.entries(reg).sort((a,b)=>b[1].t-a[1].t);$('#tb2').innerHTML=rows.map(([u,v],i)=>`<tr class="${i<3?'sel':''}"><td>${i+1}</td><td>${u}</td><td><b>${Math.round(v.t)}</b></td><td>${Math.round(v['대구']||0)}</td><td>${Math.round(v['김해']||0)}</td><td>${Math.round(v['서산']||0)}</td></tr>`).join('');
 const svg=$('#map2');base(svg);const mx=Math.max(...rows.map(r=>r[1].t),1);rows.forEach(([u,v])=>{if(!R.coords[u])return;const[x,y]=P(R.coords[u]);el('circle',{cx:x,cy:y,r:5+22*Math.sqrt(v.t/mx),fill:'#2F6DB5','fill-opacity':.4,stroke:'#1F3F6B'},svg);el('text',{x,y:y+4,'text-anchor':'middle','font-size':10,'font-weight':'bold'},svg).textContent=u+' '+Math.round(v.t)});
 ['대구','김해','서산'].forEach(h=>{const[x,y]=P(R.coords[h]);el('text',{x:x+12,y:y+12,'font-size':16,fill:'#D9382F'},svg).textContent='★'});
 const c=$('#chart2');c.innerHTML='';const A=F.actual,all=[...A.map(a=>a[1]),...Object.values(by)],ym=Math.max(...all)*1.15,W=560,H=210,n=A.length+days.length,X=i=>30+i*W/n,Y=v=>230-v/ym*H;
 el('text',{x:300,y:14,'text-anchor':'middle','font-size':13,'font-weight':'bold'},c).textContent='일별 수송청구: 최근 실적(회색) vs 예측(파랑)';
 el('polyline',{points:A.map((a,i)=>X(i)+','+Y(a[1])).join(' '),fill:'none',stroke:'#7F8C99','stroke-width':1.5},c);
 days.forEach((d,k)=>{const v=by[d];if(!v)return;const x=X(A.length+k);el('rect',{x:x-4,y:Y(v),width:8,height:230-Y(v),fill:'#2F6DB5'},c)});
 [0,A.length-1].forEach(i=>el('text',{x:X(i),y:248,'font-size':10,'text-anchor':'middle'},c).textContent=A[i][0].slice(5));el('text',{x:X(n-1),y:248,'font-size':10,'text-anchor':'middle'},c).textContent=days.at(-1).slice(5);
 el('line',{x1:30,y1:230,x2:590,y2:230,stroke:'#999'},c)}
function cmpTable(){const ms=Object.entries(F.models).filter(([k,v])=>v.metrics);if(!ms.length){$('#cmp').innerHTML='';return}
 const best=ms.reduce((a,b)=>b[1].metrics.MAE<a[1].metrics.MAE?b:a)[0];$('#cmp').innerHTML='<div class="card" style="margin-bottom:8px"><b>모델 비교 (같은 데이터·같은 검증 구간)</b><table><tr><th>모델</th><th>MAE</th><th>RMSE</th><th></th></tr>'+ms.map(([k,v])=>`<tr class="${k==best?'sel':''}"><td>${k}</td><td>${v.metrics.MAE.toFixed(2)}</td><td>${v.metrics.RMSE.toFixed(2)}</td><td>${k==best?'★ 최우수':''}</td></tr>`).join('')+'</table></div>';return best}
// ---------- 3
const HUBS=['대구','김해','서산'],UNITS=['서산','충주','원주','광주','대구','성남','사천','수원','김해','예천','청주','군산','강릉','제주','울릉'],UW=[.160,.134,.095,.085,.083,.075,.070,.064,.062,.052,.046,.032,.020,.016,.006],
NEAR={'서산':'서산','충주':'서산','원주':'대구','광주':'김해','대구':'대구','성남':'서산','사천':'김해','수원':'서산','김해':'김해','예천':'대구','청주':'서산','군산':'서산','강릉':'대구','제주':'김해','울릉':'대구'},DW=[1.25,1.10,1.00,.95,.70],TIMES=['08:00','09:00','10:00','11:00','13:00','14:00','15:00','16:00'];
function rng(a){return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function dw(d){const w=d.getDay();if(w==0||w==6)return 0;const s=new Date(d.getFullYear(),0,0),doy=Math.round((d-s)/864e5),m=d.getMonth()+1,dd=d.getDate();let x=1+.18*Math.sin(2*Math.PI*(doy-60)/182.5);if(m==8&&dd<=15)x*=.75;if((m==12&&dd>=24)||(m==1&&dd<=2))x*=.5;if([3,6,9,12].includes(m)&&dd>=20)x*=1.15;return DW[w-1]*x}
function pick(r,w){let u=r()*w.reduce((a,b)=>a+b,0);for(let i=0;i<w.length;i++){u-=w[i];if(u<=0)return i}return w.length-1}
let G=[];function gen(){const n=Math.min(+$('#gn').value,100000),r=rng(+$('#gseed').value),s=new Date($('#gs').value),D=+$('#gd').value,dates=[],w=[];
 for(let k=0;k<D;k++){const d=new Date(s);d.setDate(s.getDate()+k);dates.push(d);w.push(dw(d))}const cw=[];w.reduce((a,b,i)=>cw[i]=a+b,0);const T=cw.at(-1);
 const idx=[];for(let i=0;i<n;i++){let u=r()*T,lo=0,hi=cw.length-1;while(lo<hi){const m=lo+hi>>1;cw[m]<u?lo=m+1:hi=m}idx.push(lo)}idx.sort((a,b)=>a-b);
 G=idx.map((di,k)=>{const d=dates[di],u=UNITS[pick(r,UW)],o=r()<.6?NEAR[u]:HUBS[Math.floor(r()*3)],wt=+(1+r()*199).toFixed(1),fl=+(.8+r()*3.7).toFixed(1),th=+(wt+fl).toFixed(1);
  const ds=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
  return{DEMAND_ID:'REQ-'+String(k+1).padStart(6,'0'),REQ_DATE:ds,ORIGIN_HUB:o,DEST_UNIT:u,REQ_DAY:'일월화수목금토'[d.getDay()],REQ_TIME:TIMES[Math.floor(r()*8)],WEEKDAY_WAIT_HOURS:wt,FLIGHT_MOVE_HOURS:fl,TOTAL_TRANSPORT_HOURS:th,TOTAL_TRANSPORT_DAYS:+(th/24).toFixed(1)}});
 $('#tb3').innerHTML=G.slice(0,200).map(g=>`<tr><td>${g.DEMAND_ID}</td><td>${g.REQ_DATE}</td><td>${g.ORIGIN_HUB}</td><td>${g.DEST_UNIT}</td><td>${g.REQ_DAY}</td><td>${g.REQ_TIME}</td><td>${g.TOTAL_TRANSPORT_DAYS}</td></tr>`).join('');
 const reg={},hub={},wk={};G.forEach(g=>{reg[g.DEST_UNIT]=(reg[g.DEST_UNIT]||0)+1;hub[g.ORIGIN_HUB]=(hub[g.ORIGIN_HUB]||0)+1;const d=new Date(g.REQ_DATE);d.setDate(d.getDate()-(d.getDay()+6)%7);const k=d.toISOString().slice(0,10);wk[k]=(wk[k]||0)+1});
 $('#gstat').textContent=`총 ${G.length.toLocaleString()}건 · 기간 ${G[0]?.REQ_DATE} ~ ${G.at(-1)?.REQ_DATE} · 보급기지별 `+Object.entries(hub).sort((a,b)=>b[1]-a[1]).map(([h,c])=>h+' '+c.toLocaleString()).join(', ')+' (표는 앞 200건)';
 const c=$('#chart3');c.innerHTML='';const ks=Object.keys(wk).sort(),vs=ks.map(k=>wk[k]),m=Math.max(...vs)*1.1;el('text',{x:300,y:14,'text-anchor':'middle','font-size':13,'font-weight':'bold'},c).textContent='주별 청구 건수 (요일·계절 패턴)';
 el('polyline',{points:vs.map((v,i)=>(30+i*560/Math.max(ks.length-1,1))+','+(240-v/m*210)).join(' '),fill:'none',stroke:'#2F6DB5','stroke-width':1.5},c);
 const b=$('#chart3b');b.innerHTML='';const rs=Object.entries(reg).sort((a,b)=>b[1]-a[1]),rm=rs[0][1];el('text',{x:300,y:14,'text-anchor':'middle','font-size':13,'font-weight':'bold'},b).textContent='수령지역별 건수';
 rs.forEach(([u,v],i)=>{const y=24+i*18;el('text',{x:60,y:y+12,'text-anchor':'end','font-size':11},b).textContent=u;el('rect',{x:65,y,width:v/rm*480,height:14,fill:'#E07B39'},b);el('text',{x:70+v/rm*480,y:y+12,'font-size':10},b).textContent=v})}
$('#gen').onclick=gen;
$('#xl').onclick=async()=>{if(!G.length)gen();try{if(!window.XLSX)await new Promise((ok,no)=>{const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.mini.min.js';s.onload=ok;s.onerror=no;document.head.appendChild(s)});
 const wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(G),'data');XLSX.writeFile(wb,'가상_수송청구.xlsx')}
 catch(e){const k=Object.keys(G[0]),csv='\ufeff'+[k.join(','),...G.map(g=>k.map(x=>g[x]).join(','))].join('\n'),a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));a.download='가상_수송청구.csv';a.click()}};
// ---------- init
(async()=>{[R,F]=await Promise.all([fetch('data/routes.json').then(r=>r.json()),fetch('data/forecast.json').then(r=>r.json())]);
 const w=new Date().getDay();di=w>=1&&w<=5?w-1:0;render1();
 const best=cmpTable();$('#model').innerHTML=Object.keys(F.models).map(k=>`<option ${k==best?'selected':''}>${k}</option>`).join('');
 $('#ndays').innerHTML=Array.from({length:30},(_,i)=>`<option ${i==6?'selected':''}>${i+1}</option>`).join('');$('#model').onchange=$('#ndays').onchange=render2;render2();
 const d=new Date();d.setFullYear(d.getFullYear()-1);$('#gs').value=d.toISOString().slice(0,10);gen()})();
