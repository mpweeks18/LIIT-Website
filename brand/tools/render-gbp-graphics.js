const { chromium } = require('playwright');
const path = require('path');
const OUT = process.argv[2];

const GOLD = '#D9A54A', IVORY = '#F4EEE2', CHAR = '#1B1C1F';
const PAL = {
  warm: ['#FFD9A0'],
  holiday: ['#FF4040', '#FFF3DC', '#2FD46B', '#FFF3DC'],
};

// roofline segments [x1,y1,x2,y2]
const SEGS = [
  [455,525,630,398],[630,398,805,525],          // main gable
  [232,606,365,527],[365,527,470,589],          // left wing rakes
  [232,606,470,606],                            // left wing eave
  [790,602,890,544],[890,544,1018,618],         // garage rakes
  [790,618,1018,618],                           // garage eave
];

function dots(mode){
  const cols = PAL[mode]; let out = [], i = 0;
  for (const [x1,y1,x2,y2] of SEGS){
    const len = Math.hypot(x2-x1,y2-y1), n = Math.floor(len/12.5);
    for (let k=0;k<=n;k++){ const t=k/n; out.push([x1+(x2-x1)*t, y1+(y2-y1)*t, cols[i++%cols.length]]); }
  }
  return out;
}

function house(mode, id){
  const d = dots(mode);
  const wash = mode==='warm' ? '#FFC877' : '#FFE6C8';
  const halo = SEGS.map(s=>`<line x1="${s[0]}" y1="${s[1]}" x2="${s[2]}" y2="${s[3]}"/>`).join('');
  const glows = d.map(([x,y,c])=>`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="9.5" fill="${c}"/>`).join('');
  const cores = d.map(([x,y,c])=>`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3" fill="${c}"/><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="1.2" fill="#fff"/>`).join('');
  const win = (x,y,w,h,o=.85)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#win${id})" opacity="${o}"/><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="#0e0e10" stroke-width="3"/><line x1="${x+w/2}" y1="${y}" x2="${x+w/2}" y2="${y+h}" stroke="#0e0e10" stroke-width="2"/>`;
  return `
  <defs>
    <filter id="blur${id}" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6"/></filter>
    <filter id="halo${id}" x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="22"/></filter>
    <linearGradient id="win${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E9A956"/><stop offset="1" stop-color="#9C5A22"/></linearGradient>
    <linearGradient id="wallA${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a3530"/><stop offset=".35" stop-color="#26262a"/><stop offset="1" stop-color="#1d1d21"/></linearGradient>
    <radialGradient id="pool${id}" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="${wash}" stop-opacity=".18"/><stop offset="1" stop-color="${wash}" stop-opacity="0"/></radialGradient>
  </defs>
  <ellipse cx="625" cy="560" rx="520" ry="230" fill="url(#pool${id})"/>
  <!-- trees -->
  <g fill="#111214">
    <ellipse cx="135" cy="660" rx="95" ry="125"/><rect x="128" y="700" width="12" height="70"/>
    <ellipse cx="1110" cy="650" rx="85" ry="135"/><rect x="1103" y="700" width="12" height="70"/>
  </g>
  <!-- left wing -->
  <polygon points="250,606 365,537 470,598 470,760 250,760" fill="url(#wallA${id})"/>
  <polygon points="232,606 365,527 470,589 470,600 365,539 248,610" fill="#121214"/>
  ${win(285,650,70,70)}${win(375,650,70,70)}
  <!-- garage -->
  <polygon points="790,610 890,553 1004,618 1004,760 790,760" fill="url(#wallA${id})"/>
  <polygon points="790,602 890,544 1018,618 1004,624 890,556 790,614" fill="#121214"/>
  <rect x="818" y="655" width="160" height="105" fill="#2c2b2d"/>
  ${[0,1,2,3].map(k=>`<line x1="818" x2="978" y1="${676+k*21}" y2="${676+k*21}" stroke="#1a1a1c" stroke-width="2"/>`).join('')}
  <!-- main block -->
  <polygon points="470,525 630,410 790,525 790,760 470,760" fill="url(#wallA${id})"/>
  <polygon points="455,525 630,398 805,525 790,532 630,414 470,532" fill="#121214"/>
  ${[0,1,2,3,4,5].map(k=>`<line x1="${492+k*50}" x2="${492+k*50}" y1="${k===0||k===5?540:470+Math.abs(2.5-k)*18}" y2="760" stroke="#000" stroke-opacity=".18" stroke-width="2"/>`).join('')}
  ${win(500,555,80,95)}${win(680,555,80,95)}${win(598,470,64,50,.75)}
  <rect x="600" y="668" width="60" height="92" fill="#3a2a1c"/><rect x="600" y="668" width="60" height="92" fill="none" stroke="#0e0e10" stroke-width="3"/>
  <rect x="588" y="676" width="8" height="70" fill="#E9A956" opacity=".8"/><rect x="664" y="676" width="8" height="70" fill="#E9A956" opacity=".8"/>
  <!-- ground -->
  <rect x="0" y="758" width="1200" height="142" fill="#0f1012"/>
  <rect x="610" y="760" width="40" height="140" fill="#17181b"/>
  <rect x="818" y="760" width="160" height="140" fill="#141517"/>
  <g fill="#0b0b0d"><ellipse cx="300" cy="765" rx="90" ry="22"/><ellipse cx="530" cy="765" rx="60" ry="18"/><ellipse cx="730" cy="765" rx="60" ry="18"/></g>
  <!-- light -->
  <g stroke="${wash}" stroke-width="26" stroke-linecap="round" opacity=".48" filter="url(#halo${id})">${halo}</g>
  <g filter="url(#blur${id})" opacity=".85">${glows}</g>
  <g>${cores}</g>`;
}

function sky(id){
  const stars = Array.from({length:40},(_,i)=>{const x=(i*263.7)%1200, y=(i*97.3)%380; return `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${i%5?0.8:1.3}" fill="#fff" opacity="${0.12+(i%4)*0.06}"/>`}).join('');
  return `<defs><linearGradient id="sky${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#121316"/><stop offset=".7" stop-color="#202126"/><stop offset="1" stop-color="#2a2a2e"/></linearGradient></defs>
  <rect width="1200" height="900" fill="url(#sky${id})"/>${stars}`;
}

const wordmark = (x,y,anchor='middle',size=30)=>`<text x="${x}" y="${y}" text-anchor="${anchor}" font-family="Inter Display" font-weight="600" font-size="${size}" letter-spacing="${size*0.42}" fill="${IVORY}">LIIT</text>
<text x="${x}" y="${y+size*0.75}" text-anchor="${anchor}" font-family="Inter" font-weight="500" font-size="${size*0.38}" letter-spacing="${size*0.38*0.6}" fill="${GOLD}">LIGHTING</text>`;

function headline(lines, sub, y0=118){
  return lines.map((l,i)=>`<text x="600" y="${y0+i*64}" text-anchor="middle" font-family="Inter Display" font-weight="300" font-size="56" letter-spacing="-0.5" fill="${IVORY}">${l}</text>`).join('')
   + `<line x1="570" x2="630" y1="${y0+lines.length*64-22}" y2="${y0+lines.length*64-22}" stroke="${GOLD}" stroke-width="2"/>`
   + `<text x="600" y="${y0+lines.length*64+14}" text-anchor="middle" font-family="Inter" font-weight="400" font-size="22" letter-spacing="3" fill="${GOLD}">${sub}</text>`;
}

const scenes = {
  'liit-holiday-roofline': {w:1200,h:900, svg:`${sky('a')}${house('holiday','a')}${headline(['Holiday lights.','No ladders this year.'],'PERMANENT ROOFLINE LIGHTING')}${wordmark(600,836,'middle',26)}`},
  'liit-every-evening': {w:1200,h:900, svg:`${sky('b')}${house('warm','b')}${headline(['Beautiful every evening,','not just in December.'],'PERMANENT ARCHITECTURAL LIGHTING')}${wordmark(600,836,'middle',26)}`},
  'liit-one-system-every-season': {w:1200,h:900, svg:`
    <defs><clipPath id="L"><rect width="600" height="900"/></clipPath><clipPath id="R"><rect x="600" width="600" height="900"/></clipPath></defs>
    <g clip-path="url(#L)">${sky('c')}${house('warm','c')}</g>
    <g clip-path="url(#R)">${sky('d')}${house('holiday','d')}</g>
    <line x1="600" x2="600" y1="330" y2="900" stroke="${GOLD}" stroke-width="2" opacity=".9"/>
    <circle cx="600" cy="330" r="5" fill="${GOLD}"/>
    ${headline(['One system.','Every season.'],'EVERYDAY WARM WHITE  ·  HOLIDAY COLOR')}
    <text x="300" y="836" text-anchor="middle" font-family="Inter" font-size="18" letter-spacing="4" fill="${IVORY}" opacity=".85">EVERY EVENING</text>
    <text x="900" y="836" text-anchor="middle" font-family="Inter" font-size="18" letter-spacing="4" fill="${IVORY}" opacity=".85">EVERY HOLIDAY</text>`},
  'liit-holiday-estimate-square': {w:1200,h:1200, svg:`
    <rect width="1200" height="1200" fill="${CHAR}"/>
    <g transform="translate(0,180)">${sky('e')}${house('holiday','e')}</g>
    <rect width="1200" height="260" fill="#121316"/>
    <rect y="200" width="1200" height="120" fill="url(#fadeE)"/>
    <defs><linearGradient id="fadeE" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#121316"/><stop offset="1" stop-color="#121316" stop-opacity="0"/></linearGradient></defs>
    ${wordmark(600,110,'middle',34)}
    ${headline(['Ready for the holidays?'],'PERMANENT LIGHTING, INSTALLED ONCE',258)}
    <rect y="1080" width="1200" height="120" fill="#0f1012"/>
    <rect x="390" y="1102" width="420" height="64" rx="32" fill="none" stroke="${GOLD}" stroke-width="2"/>
    <text x="600" y="1143" text-anchor="middle" font-family="Inter" font-weight="500" font-size="22" letter-spacing="3" fill="${IVORY}">REQUEST AN ESTIMATE</text>`},
};

(async()=>{
  const b = await chromium.launch(); const p = await b.newPage();
  for (const [name,s] of Object.entries(scenes)){
    await p.setViewportSize({width:s.w,height:s.h});
    await p.setContent(`<html><body style="margin:0;background:${CHAR}"><svg xmlns="http://www.w3.org/2000/svg" width="${s.w}" height="${s.h}" viewBox="0 0 ${s.w} ${s.h}">${s.svg}</svg></body></html>`);
    await p.screenshot({path: path.join(OUT, name+'.png'), clip:{x:0,y:0,width:s.w,height:s.h}});
  }
  await b.close();
})();
