/* ------------------------------------------------- */
/*  CONSTANTS                                        */
/* ------------------------------------------------- */
const ROWS = 5, COLS = 5, CELLS = ROWS * COLS;
const STORAGE_KEY = "bingoCardStateV3";

/* ------------------------------------------------- */
/*  PHRASES (keep your list)                         */
/* ------------------------------------------------- */
const phrases = [
  "Um senhor idoso a ler jornal num banco de praça",
  "Um ciclista a atravessar uma passadeira sem desmontar",
  "Um turista com um mapa a tentar orientar-se",
  "Um vendedor ambulante a oferecer pulseiras e bijuteria",
  "Um homem de fato a beber café num balcão de bar",
  "Uma senhora a passear um cão pequeno com um casaco",
  "Um homem a tocar guitarra na praça",
  "Uma pessoa a andar com uma caixa de pizza",
  "Um casal de idosos de braço dado a caminhar lentamente",
  "Um artista de rua a desenhar caricaturas",
  "Um barco de pescadores a descarregar peixe",
  "Um vendedor de comida ambulante",
  "Um grupo de estudantes sentados no chão a conversar",
  "Um homem de bicicleta a ultrapassar o trânsito",
  "Um trabalhador de limpeza a varrer a calçada",
  "Um casal a tirar selfies com o mar ao fundo",
  "Um músico de rua a tocar acordeão",
  "Um jovem com uma trotinete elétrica a desviar-se dos peões",
  "Um grupo de turistas a seguir um guia com guarda-chuva levantado",
  "Um vendedor de gelados a servir um cone gigante",
  "Um senhor a discutir com o motorista de autocarro",
  "Um empregado de restaurante a ajustar as cadeiras do terraço",
  "Um casal a discutir em voz alta no meio da rua",
  "Um carteiro a distribuir cartas",
  "Um artista de rua a fazer estátua humana",
  "Um vendedor de rua a vender óculos de sol falsificados",
  "Um jovem a andar com uma mala de viagem pequena",
  "Um homem a passear dois cães grandes",
  "Uma mulher a correr para apanhar o autocarro",
  "Um sem-abrigo a pedir esmola com um cão ao lado",
  "Uma criança a correr atrás dos pombos na praça",
  "Um grupo de amigos a rir alto num café",
  "Um motociclista a acelerar num semáforo vermelho",
  "Um turista a tentar falar italiano e a gesticular muito",
  "Um pintor de rua a retratar uma paisagem",
  "Uma pessoa a usar chapéu italiano",
  "Um jovem a ouvir música alta com auscultadores enormes",
  "Uma pessoa a andar com um saco de compras",
  "Um estudante a ler um livro",
  "Um homem de meia-idade a fumar um charuto",
  "Uma criança a comer um gelado",
  "Um casal de namorados sem noção de espaço público",
  "Um grupo de ciclistas vestidos com roupa desportiva",
  "Uma pessoa a pescar",
  "Um turista a tentar tirar foto a uma gaivota",
  "Alguém com uma mala enorme a procurar o hostel"
];  

/* ------------------------------------------------- */
/*  SAVE / LOAD                                      */
/* ------------------------------------------------- */
const loadState=()=>{try{return JSON.parse(localStorage.getItem(STORAGE_KEY));}catch{return null;}};
const saveState=s=>localStorage.setItem(STORAGE_KEY,JSON.stringify(s));

/* ------------------------------------------------- */
/*  CONFETTI (unchanged)                             */
/* ------------------------------------------------- */
function ensureConfetti(){
  if(window.confetti)return Promise.resolve();
  return new Promise(res=>{
    const s=document.createElement("script");
    s.src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js";
    s.async=true; s.onload=s.onerror=()=>res(); document.head.appendChild(s);
  });
}
function fallbackConfetti(){
  const clrs=["#ffd700","#ffb84d","#fff275","#ffe66d"];
  for(let i=0;i<180;i++){
    const d=document.createElement("div");
    d.style.cssText=
      `position:fixed;left:${Math.random()*100}vw;top:-10vh;width:10px;height:10px;`+
      `background:${clrs[i%clrs.length]};border-radius:50%;z-index:9999;pointer-events:none;`+
      `transition:transform 3.4s ease-out,opacity 3.4s`;
    document.body.appendChild(d);
    requestAnimationFrame(()=>{d.style.transform=`translateY(130vh) rotate(${Math.random()*720}deg)`;d.style.opacity=0;});
    setTimeout(()=>d.remove(),3600);
  }
}
async function blastConfetti(){
  await ensureConfetti();
  (window.confetti||fallbackConfetti)({particleCount:320,spread:200,startVelocity:60,ticks:600,origin:{y:0.55}});
}

/* ------------------------------------------------- */
/*  BINGO OVERLAY + LONGER, DEEPER CHANCHA RAIN      */
/* ------------------------------------------------- */
function showBingoBanner(){
  if(document.getElementById("bingoOverlay"))return;

  /* global CSS once */
  if(!document.getElementById("bingoCSS")){
    const st=document.createElement("style");st.id="bingoCSS";
    st.textContent=`
    @keyframes bingoPop {0%{transform:scale(.2) rotate(-12deg);opacity:0}
      65%{transform:scale(1.25) rotate(4deg);opacity:1}
      100%{transform:scale(1) rotate(0)}}
    @keyframes heartBeat {0%,40%,100%{transform:scale(1)}
      20%{transform:scale(1.12)}
      60%{transform:scale(1.07)}}
    @keyframes overlayFade {to{opacity:0}}
    /* NEW: drop past viewport + fade */
    @keyframes chanchaFall {0%{transform:translateY(-160px) rotate(0deg);opacity:1}
      80%{opacity:1}
      100%{transform:translateY(160vh) rotate(360deg);opacity:0}}`;
    document.head.appendChild(st);
  }

  const overlay=document.createElement("div");
  Object.assign(overlay.style,{
    position:"fixed",inset:0,display:"flex",justifyContent:"center",alignItems:"center",
    background:"rgba(0,0,0,.55)",backdropFilter:"blur(3px)",
    zIndex:10000,pointerEvents:"none",
    animation:"overlayFade .9s ease 5.4s forwards"
  });
  overlay.id="bingoOverlay";

  /* huge central chancha with heartbeat */
  const big=document.createElement("img");
  big.src="/bingo/img/chancha.png";
  Object.assign(big.style,{
    position:"absolute",
    width:"clamp(300px,60vw,700px)",
    filter:"drop-shadow(0 0 28px rgba(0,0,0,.55))",
    animation:"bingoPop .9s cubic-bezier(.16,1.03,.62,1) forwards, heartBeat 1.6s ease-in-out 1s infinite"
  });
  overlay.appendChild(big);

  /* gold BINGO text with heartbeat */
  const txt=document.createElement("div");
  txt.textContent="B  I  N  G  O !";
  Object.assign(txt.style,{
    fontFamily:"Poppins,Arial,sans-serif",fontWeight:900,lineHeight:1,
    fontSize:"clamp(3rem,11vw,9.5rem)",
    color:"#ffd700",whiteSpace:"nowrap",textAlign:"center",
    textShadow:"0 0 22px rgba(255,215,0,.9),0 0 12px rgba(255,215,0,.7)",
    WebkitTextStroke:"2px rgba(0,0,0,.45)",
    animation:"bingoPop .9s cubic-bezier(.16,1.03,.62,1) forwards, heartBeat 1.6s ease-in-out 1s infinite"
  });
  overlay.appendChild(txt);
  document.body.appendChild(overlay);

  /* rain container */
  const rain=document.createElement("div");
  Object.assign(rain.style,{position:"fixed",inset:0,pointerEvents:"none",zIndex:9999});
  document.body.appendChild(rain);

  const TOTAL=100;
  for(let i=0;i<TOTAL;i++){
    const img=document.createElement("img");
    img.src="/bingo/img/chancha.png";
    const size=60+Math.random()*60; // 60–120 px
    Object.assign(img.style,{
      position:"absolute",
      left:`${Math.random()*100}vw`,
      top:`-${170+Math.random()*150}px`,
      width:`${size}px`,
      filter:"drop-shadow(0 4px 9px rgba(0,0,0,.45))",
      animation:`chanchaFall ${3+Math.random()*2}s linear ${Math.random()}s forwards`
    });
    rain.appendChild(img);
  }

  setTimeout(()=>{overlay.remove();rain.remove();},6000); // 6-second celebration
}

/* ------------------------------------------------- */
/*  TEXT-FIT / STATE / BUILD / TOGGLE (unchanged)    */
/* ------------------------------------------------- */
function fitText(el,{max=18,min=8}={}){
  let f=max;el.style.fontSize=f+"px";
  while(f>min&&(el.scrollHeight>el.clientHeight||el.scrollWidth>el.clientWidth))
    el.style.fontSize=--f+"px";
  while(f<max&&el.scrollHeight<=el.clientHeight&&el.scrollWidth<=el.clientWidth)
    el.style.fontSize=++f+"px";
  if(el.scrollHeight>el.clientHeight||el.scrollWidth>el.clientWidth)
    el.style.fontSize=--f+"px";
}
function freshState(){
  return{order:[...phrases].sort(()=>Math.random()-.5).slice(0,CELLS),
    marks:Array(CELLS).fill(false),
    rowCount:Array(ROWS).fill(0),
    colCount:Array(COLS).fill(0),
    rowCelebrated:false,colCelebrated:false,cardCelebrated:false};
}
function build(st){
  const g=document.getElementById("bingoCard");g.innerHTML="";
  st.order.forEach((txt,i)=>{
    const r=Math.floor(i/COLS),c=i%COLS;
    const cell=document.createElement("div");
    cell.className="bingo-cell";cell.textContent=txt;
    cell.dataset.idx=i;cell.dataset.row=r;cell.dataset.col=c;
    if(st.marks[i])cell.classList.add("marked");
    cell.onclick=()=>toggleMark(cell,st);
    g.appendChild(cell);
  });
  requestAnimationFrame(()=>requestAnimationFrame(()=>document.querySelectorAll(".bingo-cell").forEach(fitText)));
}
function toggleMark(cell,st){
  const i=+cell.dataset.idx,r=+cell.dataset.row,c=+cell.dataset.col;
  st.marks[i]=!st.marks[i];cell.classList.toggle("marked");
  st.rowCount[r]+=st.marks[i]?1:-1; st.colCount[c]+=st.marks[i]?1:-1;
  if(!st.rowCelebrated&&st.rowCount[r]===COLS){st.rowCelebrated=true;blastConfetti();}
  if(!st.colCelebrated&&st.colCount[c]===ROWS){st.colCelebrated=true;blastConfetti();}
  if(!st.cardCelebrated&&st.marks.every(m=>m)){st.cardCelebrated=true;blastConfetti();showBingoBanner();}
  saveState(st);
}

/* ------------------------------------------------- */
/*  NEW CARD & INIT (unchanged)                      */
/* ------------------------------------------------- */
window.newBingoCard=()=>{const s=freshState();saveState(s);build(s);};
(function init(){
  let st=loadState()||freshState();
  st.rowCount??=Array(ROWS).fill(0);st.colCount??=Array(COLS).fill(0);
  st.marks.forEach((m,i)=>m&&(st.rowCount[Math.floor(i/COLS)]++,st.colCount[i%COLS]++));
  st.rowCelebrated??=false;st.colCelebrated??=false;st.cardCelebrated??=false;
  saveState(st);build(st);
  document.getElementById("refreshBtn").addEventListener("click",window.newBingoCard);
  addEventListener("resize",()=>document.querySelectorAll(".bingo-cell").forEach(fitText));
})();
