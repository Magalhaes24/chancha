// aura/js/script.js
import { initializeApp }
  from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

// ─── Firebase init ──────────────────────────────────────
const firebaseConfig = {
  apiKey:    "AIzaSyDA41xrlhiufQgEPu1rtg0uTzaPHPKBlFs",
  authDomain:"chancha-f052c.firebaseapp.com",
  projectId: "chancha-f052c",
  storageBucket:"chancha-f052c.appspot.com",
  messagingSenderId:"212584059178",
  appId:     "1:212584059178:web:59fdfbe4a6c735421b4e53",
  measurementId:"G-D1HZ9YBNT4"
};

const app = initializeApp(firebaseConfig);
const db  = getFirestore(app);
const auraCol = collection(db, "aura");
const grid    = document.getElementById("counter-grid");

// ─── Load & render ──────────────────────────────────────
document.addEventListener("DOMContentLoaded", async () => {
  const snap = await getDocs(auraCol);
  snap.docs.forEach(docSnap => {
    const { name, aura_points } = docSnap.data();
    renderCard(docSnap.id, name, aura_points);
  });
});

function renderCard(id, name, pts) {
  const card = document.createElement("div");
  card.className = "counter-card";
  card.id        = `${id}-card`;
  card.innerHTML = `
    <div class="avatar-wrapper" id="${id}-avatar-wrapper">
      <img src="/assets/${name}.png" alt="Avatar ${name}" class="avatar">
    </div>
    <h2>${name}</h2>
    <p class="points" id="${id}-points">${pts}</p>
    <div class="controls">
      <button class="dec" data-id="${id}"></button>
      <button class="inc" data-id="${id}"></button>
      <input type="number" id="${id}-step" class="manual" value="10" min="1" title="Valor do passo">
    </div>
  `;
  grid.appendChild(card);
  updateUI(id, pts);

  const ref = doc(db, "aura", id);
  const stepInput = card.querySelector("input.manual");
  const decBtn    = card.querySelector("button.dec");
  const incBtn    = card.querySelector("button.inc");

  // Helper to refresh button labels
  function updateButtonLabels() {
    const step = parseInt(stepInput.value, 10) || 0;
    decBtn.textContent = `−${step}`;
    incBtn.textContent = `+${step}`;
  }

  // Initialize labels
  updateButtonLabels();

  // Re-label when step changes
  stepInput.addEventListener("change", updateButtonLabels);

  // Wire up +/− using dynamic step
  [decBtn, incBtn].forEach(btn => {
    btn.addEventListener("click", async () => {
      const step = parseInt(stepInput.value, 10) || 0;
      const cur  = parseInt(
        card.querySelector("p.points").textContent, 10
      ) || 0;
      const next = cur + (btn === incBtn ? step : -step);
      await updateDoc(ref, { aura_points: next });
      updateUI(id, next);
    });
  });
}

function updateUI(id, val) {
  const ptsEl  = document.getElementById(`${id}-points`);
  const wrapEl = document.getElementById(`${id}-avatar-wrapper`);

  ptsEl.textContent = val;
  ptsEl.classList.toggle("negative", val < 0);
  ptsEl.classList.toggle("positive", val >= 0);

  wrapEl.classList.remove("aura-blue", "aura-gold");
  if (val >= 5000)      wrapEl.classList.add("aura-gold");
  else if (val >= 1000) wrapEl.classList.add("aura-blue");
}
