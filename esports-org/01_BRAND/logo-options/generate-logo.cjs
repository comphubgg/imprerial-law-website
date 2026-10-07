const fs=require('fs');
const CW={
 amethyst:{name:'Amethyst',hi:'#F4E6FF',mid:'#B98CFF',lo:'#6A3BD1',deep:'#2E1070',glow:'#9B5CFF',bg0:'#2B0F55',bg1:'#07030F',rib:['#FFD6F5','#E06BFF','#7B35E0']},
 rosegold:{name:'Rosegold',hi:'#FFF1E6',mid:'#F6B49A',lo:'#D2706E',deep:'#6E2A3A',glow:'#FF8F8A',bg0:'#43151F',bg1:'#0A0305',rib:['#FFF1E6','#F6B49A','#C25A66']},
 sapphire:{name:'Sapphire',hi:'#EAFBFF',mid:'#7FD6FF',lo:'#2F7BEA',deep:'#0E2F78',glow:'#3AA0FF',bg0:'#0A2A5C',bg1:'#010610',rib:['#E9FBFF','#6FD0FF','#2F6BE0']},
};
function build(k,{w=1000,h=1000}={}){
 const C=CW[k];let seed=11;const rnd=()=>(seed=(seed*16807)%2147483647)/2147483647;
 const L={V:'0,0 27,0 50,66 73,0 100,0 60,100 40,100',L:'0,0 28,0 28,72 82,72 82,100 0,100',X:'0,0 30,0 50,34 70,0 100,0 66,50 100,100 70,100 50,66 30,100 0,100 34,50'};
 const off={V:0,L:112,X:206};
 const letters=Object.entries(L).map(([n,p])=>`<polygon transform="translate(${off[n]},0)" points="${p}"/>`).join('');
 // Blütenblätter / Scherben
 let petals='';for(let i=0;i<46;i++){const x=rnd()*w,y=rnd()*h;if(Math.abs(x-500)<300&&Math.abs(y-500)<130)continue;const s=.5+rnd()*1.9,r=rnd()*360,op=.35+rnd()*.6,blur=s>1.9?'filter="url(#bl)"':'';
  petals+=`<path ${blur} transform="translate(${x},${y}) rotate(${r}) scale(${s*9})" d="M0,-1 C.55,-.4 .55,.4 0,1 C-.55,.4 -.55,-.4 0,-1Z" fill="url(#pt)" opacity="${op}"/>`;}
 let dust='';for(let i=0;i<150;i++){dust+=`<circle cx="${(rnd()*w).toFixed(0)}" cy="${(rnd()*h).toFixed(0)}" r="${(.6+rnd()*1.8).toFixed(1)}" fill="${C.hi}" opacity="${(.2+rnd()*.7).toFixed(2)}"/>`;}
 let bokeh='';for(let i=0;i<9;i++){bokeh+=`<circle cx="${(rnd()*w).toFixed(0)}" cy="${(rnd()*h).toFixed(0)}" r="${(24+rnd()*60).toFixed(0)}" fill="${C.glow}" opacity="${(.08+rnd()*.14).toFixed(2)}" filter="url(#bl2)"/>`;}
 const sparkle=(x,y,s)=>`<path transform="translate(${x},${y}) scale(${s})" d="M0,-10 Q1,-1 10,0 Q1,1 0,10 Q-1,1 -10,0 Q-1,-1 0,-10Z" fill="#fff"/>`;
 const rib='M-70,128 C60,176 240,170 322,104 C372,62 352,-6 290,-14 C226,-22 196,44 242,86 C286,126 372,112 392,52';
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
<defs>
 <radialGradient id="bg" cx=".5" cy=".5" r=".75"><stop offset="0" stop-color="${C.bg0}"/><stop offset="1" stop-color="${C.bg1}"/></radialGradient>
 <linearGradient id="satin" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.hi}"/><stop offset=".30" stop-color="${C.mid}"/><stop offset=".48" stop-color="${C.lo}"/><stop offset=".52" stop-color="${C.mid}"/><stop offset=".78" stop-color="${C.lo}"/><stop offset="1" stop-color="${C.deep}"/></linearGradient>
 <linearGradient id="sheen" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".45" stop-color="#fff" stop-opacity=".0"/><stop offset=".5" stop-color="#fff" stop-opacity=".55"/><stop offset=".56" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
 <linearGradient id="rg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${C.rib[0]}"/><stop offset=".5" stop-color="${C.rib[1]}"/><stop offset="1" stop-color="${C.rib[2]}"/></linearGradient>
 <linearGradient id="pt" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${C.hi}"/><stop offset="1" stop-color="${C.lo}"/></linearGradient>
 <filter id="glow" x="-30%" y="-60%" width="160%" height="220%"><feGaussianBlur stdDeviation="14" result="b"/><feColorMatrix in="b" type="matrix" values="0 0 0 0 ${parseInt(C.glow.slice(1,3),16)/255} 0 0 0 0 ${parseInt(C.glow.slice(3,5),16)/255} 0 0 0 0 ${parseInt(C.glow.slice(5,7),16)/255} 0 0 0 1.4 0"/></filter>
 <filter id="bl"><feGaussianBlur stdDeviation="3"/></filter><filter id="bl2"><feGaussianBlur stdDeviation="14"/></filter>
 <filter id="soft"><feGaussianBlur stdDeviation="1.2"/></filter>
 <clipPath id="front"><rect x="262" y="-60" width="200" height="260"/></clipPath>
 <clipPath id="lt"><g>${letters}</g></clipPath>
 <mask id="cut"><rect x="-50" y="-50" width="500" height="250" fill="#fff"/><polygon points="150,-50 163,-50 118,150 105,150" fill="#000"/></mask>
</defs>
<rect width="${w}" height="${h}" fill="url(#bg)"/>
<g>${bokeh}</g>
<!-- fließende Lichtlinien -->
<g fill="none" stroke="${C.glow}" stroke-linecap="round" opacity=".5"><path d="M-20,780 C250,640 520,980 1040,330" stroke-width="2.5"/><path d="M-20,810 C260,690 520,1000 1040,380" stroke-width="1.4" opacity=".7"/><path d="M-20,750 C240,600 540,950 1040,290" stroke-width="1" opacity=".6"/></g>
<g>${petals}</g>
<g transform="translate(105,372) scale(2.62) skewX(-12)">
  <g filter="url(#glow)" opacity=".95">${letters}<path d="${rib}" stroke="#000" stroke-width="21" fill="none"/></g>
  <!-- Schlaufe hinten -->
  <path d="${rib}" fill="none" stroke="url(#rg)" stroke-width="19" stroke-linecap="round"/>
  <path d="${rib}" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="2.4" stroke-linecap="round" transform="translate(0,-3)"/>
  <!-- Buchstaben -->
  <g>
    <g fill="url(#satin)" stroke="${C.hi}" stroke-width="1.2" stroke-linejoin="round" paint-order="stroke">${letters}</g>
    <g clip-path="url(#lt)"><rect x="-30" y="0" width="360" height="100" fill="url(#sheen)" transform="skewX(18) translate(-10,0)"/>
    <rect x="-30" y="0" width="360" height="9" fill="#fff" opacity=".35"/></g>
  </g>
  <!-- Schlaufe vorne über dem X -->
  <g clip-path="url(#front)"><path d="${rib}" fill="none" stroke="url(#rg)" stroke-width="19" stroke-linecap="round"/>
  <path d="${rib}" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="2.4" stroke-linecap="round" transform="translate(0,-3)"/></g>
</g>
<g>${dust}</g>
<g>${sparkle(212,372,1.6)}${sparkle(780,330,1.2)}${sparkle(700,640,.9)}${sparkle(300,610,.7)}</g>
</svg>`;}
const out=process.argv[2];
for(const k of Object.keys(CW))fs.writeFileSync(`${out}/logo-${k}.svg`,build(k));
