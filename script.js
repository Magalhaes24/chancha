/********************************************************
 *  Parallax Trieste flag                               *
 ********************************************************/
const flag = document.querySelector(".flag-backdrop img");
window.addEventListener("pointermove", e => {
  const { innerWidth: w, innerHeight: h } = window;
  const rx = (e.clientY - h / 2) / h * 10;
  const ry = (e.clientX - w / 2) / w * 10;
  flag.style.transform = `rotateX(${rx}deg) rotateY(${-ry}deg) scale(1.05)`;
});

/********************************************************
 *  Floating lantern particles                           *
 ********************************************************/
const field = document.querySelector(".lantern-field");
setInterval(() => {
  const s = document.createElement("span");
  s.className = "lantern";
  s.style.setProperty("--startX", `${Math.random() * 140 - 70}vw`);
  s.style.setProperty("--endX",   `${Math.random() * 140 - 70}vw`);
  s.style.animationDuration = `${10 + Math.random() * 10}s`;
  field.appendChild(s);
  setTimeout(() => s.remove(), 12_000);
}, 1_200);

/********************************************************
 *  Tiles – tilt, ripple, page swipe                    *
 ********************************************************/
const tiles = document.querySelectorAll(".tile");
const SWIPE = 700;

tiles.forEach(t => {
  /* 3-D tilt */
  t.addEventListener("pointermove", e => {
    const r = t.getBoundingClientRect();
    const x = e.clientX - r.left - r.width / 2;
    const y = e.clientY - r.top  - r.height / 2;
    t.style.transform =
      `rotateX(${(y / r.height) * 9}deg) rotateY(${-(x / r.width) * 9}deg) translateY(-8px)`;
  });
  t.addEventListener("pointerleave", () => (t.style.transform = ""));

  /* ripple + full-page swipe */
  t.addEventListener("click", e => {
    e.preventDefault();
    const href = t.getAttribute("href");
    const r = t.getBoundingClientRect();
    const size = Math.max(r.width, r.height) * 1.4;
    const rip  = document.createElement("span");
    rip.className = "ripple";
    rip.style.width = rip.style.height = `${size}px`;
    rip.style.left  = `${e.clientX - r.left - size / 2}px`;
    rip.style.top   = `${e.clientY - r.top  - size / 2}px`;
    t.appendChild(rip);
    document.body.classList.add("leaving");
    setTimeout(() => (location.href = href), SWIPE);
  });
});
document.addEventListener("animationend",
  e => e.target.classList.contains("ripple") && e.target.remove());

/********************************************************
 *  Ambient waves – play by default, button = mute      *
 ********************************************************/
const waves    = document.getElementById("waves");
const audioBtn = document.getElementById("audioBtn");
const glowBtn  = document.getElementById("glowBtn");

function updateIcon() {
  audioBtn.textContent = waves.muted ? "🔇" : "🔈";
}

/* Try to start immediately */
(function initAudio() {
  waves.loop   = true;
  waves.volume = 0.35;   // audible
  waves.muted  = false;

  waves.play().then(updateIcon).catch(() => {
    /* Autoplay blocked – wait for first user gesture anywhere */
    console.warn("Autoplay blocked – will start on first gesture.");
    const unlock = () => {
      waves.play().catch(() => {});
      document.removeEventListener("pointerdown", unlock);
    };
    document.addEventListener("pointerdown", unlock, { once: true });
    updateIcon(); // show 🔈 even though paused – will start at first tap
  });
})();

/* Mute / un-mute */
audioBtn.addEventListener("click", () => {
  /* If audio hasn’t started yet (very first tap on iOS/Safari) play it first */
  if (waves.paused) {
    waves.play().then(() => { waves.muted = false; updateIcon(); })
                .catch(() => {});
    return;
  }
  waves.muted = !waves.muted;
  updateIcon();
});

/* Glow toggle */
glowBtn.addEventListener("click", () => document.body.classList.toggle("glow"));
