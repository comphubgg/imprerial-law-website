const fs=require('fs');
const M={
 silver:{st:['#FFFFFF','#D9DDE3','#8E949D','#3C4048','#E9ECF0','#A9AFB8','#4A4E57','#1B1D22'],edge:'#FFFFFF',glow:'#C9D2E0'},
 gold:{st:['#FFF6CC','#F7D774','#C98F1E','#5E3708','#FFE7A0','#D9A030','#8A5612','#2C1804'],edge:'#FFF2BE',glow:'#F2B84B'},
};
const grad=(id,c,ex='x1="0" y1="0" x2="0" y2="1"')=>`<linearGradient id="${id}" ${ex}><stop offset="0" stop-color="${c[0]}"/><stop offset=".22" stop-color="${c[1]}"/><stop offset=".44" stop-color="${c[2]}"/><stop offset=".5" stop-color="${c[3]}"/><stop offset=".56" stop-color="${c[4]}"/><stop offset=".78" stop-color="${c[5]}"/><stop offset=".92" stop-color="${c[6]}"/><stop offset="1" stop-color="${c[7]}"/></linearGradient>`;
const ribGrad=(id,c,x1,y1,x2,y2)=>`<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"><stop offset="0" stop-color="${c[3]}"/><stop offset=".18" stop-color="${c[2]}"/><stop offset=".38" stop-color="${c[0]}"/><stop offset=".5" stop-color="${c[1]}"/><stop offset=".62" stop-color="${c[5]}"/><stop offset=".85" stop-color="${c[2]}"/><stop offset="1" stop-color="${c[7]}"/></linearGradient>`;
function build(L,R,{bg=true,w=1000,h=1000}={}){ // L: Farbe Buchstaben, R: Farbe Band-X
 const V='8,0 32,0 50,60 68,0 100,0 62,100 38,100 0,10';
 const Lp='10,0 32,0 32,66 94,66 82,100 0,100 0,10';
 let seed=5;const rnd=()=>(seed=(seed*16807)%2147483647)/2147483647;
 let fl='';for(let i=0;i<26;i++){const x=rnd()*w,y=rnd()*h;if(Math.abs(x-500)<330&&Math.abs(y-500)<140)continue;fl+=`<path transform="translate(${x.toFixed(0)},${y.toFixed(0)}) rotate(${(rnd()*360).toFixed(0)}) scale(${(5+rnd()*9).toFixed(1)})" d="M0,-1 C.5,-.4 .5,.4 0,1 C-.5,.4 -.5,-.4 0,-1Z" fill="url(#flk)" opacity="${(.25+rnd()*.5).toFixed(2)}" ${rnd()>.6?'filter="url(#bl)"':''}/>`;}
 let dust='';for(let i=0;i<110;i++)dust+=`<circle cx="${(rnd()*w).toFixed(0)}" cy="${(rnd()*h).toFixed(0)}" r="${(.6+rnd()*1.5).toFixed(1)}" fill="${R.glow}" opacity="${(.15+rnd()*.5).toFixed(2)}"/>`;
 const gv=ribGrad('gA',R.st,39.2,57.3,60.8,42.7), gb=ribGrad('gB',R.st,39.2,42.7,60.8,57.3);
 const hx=c=>c.slice(1).match(/../g).map(v=>parseInt(v,16)/255);
 const glowCM=c=>{const [r,g,b]=hx(c);return `0 0 0 0 ${r} 0 0 0 0 ${g} 0 0 0 0 ${b} 0 0 0 1.3 0`};
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}"><defs>
 <radialGradient id="bg" cx=".5" cy=".48" r=".72"><stop offset="0" stop-color="#2A2218"/><stop offset=".55" stop-color="#0E0C0A"/><stop offset="1" stop-color="#030303"/></radialGradient>
 ${grad('sat',L.st)}${gv}${gb}
 <linearGradient id="flk" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${R.st[0]}"/><stop offset="1" stop-color="${R.st[2]}"/></linearGradient>
 <linearGradient id="sheen" x1="0" y1="0" x2="1" y2="0"><stop offset=".42" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".5"/><stop offset=".58" stop-color="#fff" stop-opacity="0"/></linearGradient>
 <filter id="gl" x="-30%" y="-60%" width="160%" height="220%"><feGaussianBlur stdDeviation="16"/><feColorMatrix type="matrix" values="${glowCM(L.glow)}"/></filter>
 <filter id="glR" x="-30%" y="-60%" width="160%" height="220%"><feGaussianBlur stdDeviation="16"/><feColorMatrix type="matrix" values="${glowCM(R.glow)}"/></filter>
 <filter id="bl"><feGaussianBlur stdDeviation="2.5"/></filter><filter id="sh" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="2.2"/></filter>
 <clipPath id="cA"><polygon points="0,0 32,0 100,100 68,100"/></clipPath>
 <clipPath id="cL"><polygon points="${V}"/><polygon transform="translate(116,0)" points="${Lp}"/></clipPath>
</defs>
${bg?`<rect width="${w}" height="${h}" fill="url(#bg)"/>
<g fill="none" stroke="${R.glow}" stroke-linecap="round" opacity=".35"><path d="M-20,830 C240,640 520,1010 1040,300" stroke-width="2"/><path d="M-20,860 C250,700 520,1030 1040,350" stroke-width="1.1"/></g>
<g>${fl}</g><g>${dust}</g>`:''}
<g transform="translate(98,405) scale(2.5) skewX(-12)">
 <g filter="url(#gl)" opacity=".4"><polygon points="${V}"/><polygon transform="translate(116,0)" points="${Lp}"/></g>
 <g filter="url(#glR)" opacity=".45" transform="translate(226,0)"><polygon points="0,0 32,0 100,100 68,100"/><polygon points="68,0 100,0 32,100 0,100"/></g>
 <!-- V + L -->
 <g fill="url(#sat)" stroke="${L.edge}" stroke-width="1" stroke-linejoin="round" paint-order="stroke"><polygon points="${V}"/><polygon transform="translate(116,0)" points="${Lp}"/></g>
 <g clip-path="url(#cL)"><rect x="-10" y="0" width="230" height="7" fill="#fff" opacity=".38"/></g>
 <!-- X als gekreuzte Satin-Bänder -->
 <g transform="translate(226,0)">
  <polygon points="0,0 32,0 100,100 68,100" fill="url(#gA)" stroke="${R.edge}" stroke-width=".9" stroke-linejoin="round" paint-order="stroke"/>
  <g clip-path="url(#cA)"><polygon points="68,0 100,0 32,100 0,100" transform="translate(3,5)" fill="#000" opacity=".55" filter="url(#sh)"/></g>
  <polygon points="68,0 100,0 32,100 0,100" fill="url(#gB)" stroke="${R.edge}" stroke-width=".9" stroke-linejoin="round" paint-order="stroke"/>
  <polygon points="68,0 100,0 32,100 0,100" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width=".6" transform="translate(-1.6,0)"/>
 </g>
</g></svg>`;}
const out=process.argv[2];
const W=[['silbergold',M.silver,M.gold],['gold',M.gold,M.gold],['silber',M.silver,M.silver]];
for(const [n,L,R] of W){fs.writeFileSync(`${out}/flat-${n}.svg`,build(L,R));fs.writeFileSync(`${out}/flat-${n}-transparent.svg`,build(L,R,{bg:false,w:1000,h:400}).replace(/translate\(112,405\)/,'translate(98,60)'));}
