const projects = await fetch('./projects.json').then(res => res.json());

function scrollToProj() {
  document.getElementById('proj-section').scrollIntoView({ behavior:'smooth' });
}

const CARD_W = 340;
const GAP    = 20;
let PEEK = window.innerWidth <= 768 ? (window.innerWidth - (CARD_W + 60)) / 2 : 40;
let cur      = 0;
let busy     = false;

window.addEventListener('resize', () => {
  PEEK = window.innerWidth <= 768 ? (window.innerWidth - (CARD_W + 60)) / 2 : 40;
  applyPos(cur, false);
});

function buildStrip() {
  const track = document.getElementById('projTrack');
  const dots  = document.getElementById('projDots');

  projects.forEach((p, i) => {
    const card = document.createElement('div');
    card.className = 'proj-card' + (i === 0 ? ' current' : '');
    card.id = 'card-' + i;
    card.innerHTML = `
      <div class="card-glow"></div>
      <div class="card-visual">${p.emoji}</div>
      <div class="card-meta">
        <span class="card-year">${p.year}</span>
        <span class="card-dot"></span>
        <span class="card-type">${p.type}</span>
      </div>
      <h3 class="card-title">${p.title}</h3>h
      <p class="card-desc">${p.desc}</p>
      <div class="card-stack">${p.stack.map(s => `<span class="chip">${s}</span>`).join('')}</div>
      <a class="card-link" href="./projects.html?project=${i}">View project</a>
    `;
    track.appendChild(card);

    const dot = document.createElement('div');
    dot.className = 'proj-dot' + (i === 0 ? ' active' : '');
    dot.onclick = () => goTo(i);
    dots.appendChild(dot);
  });

  applyPos(0, false);
  setTitle(0, null);
}

function applyPos(idx, animate) {
  const track = document.getElementById('projTrack');
  const offset = PEEK - idx * (CARD_W + GAP);
  track.style.transition = animate
    ? 'transform .58s cubic-bezier(.4,0,.2,1)'
    : 'none';
  track.style.transform = `translateX(${offset}px)`;
}

function goTo(next) {
  const n = Math.max(0, Math.min(projects.length - 1, next));
  if (n === cur || busy) return;
  const prev = cur;
  cur = n;
  busy = true;
  setTimeout(() => busy = false, 680);

  document.querySelectorAll('.proj-card').forEach((c, i) => c.classList.toggle('current', i === cur));
  document.querySelectorAll('.proj-dot').forEach((d, i)  => d.classList.toggle('active',  i === cur));
  applyPos(cur, true);
  setTitle(cur, cur > prev ? 'up' : 'down');
  document.getElementById('projCounter').textContent =
    `0${cur + 1} / 0${projects.length}`;
}

function setTitle(idx, dir) {
  const el = document.getElementById('projTitleText');
  if (!dir) { el.textContent = projects[idx].title; return; }

  // slide out
  el.classList.add('exit-up');
  setTimeout(() => {
    el.textContent = projects[idx].title;
    el.classList.remove('exit-up');
    el.classList.add('enter-dn');
    requestAnimationFrame(() =>
      requestAnimationFrame(() => el.classList.remove('enter-dn'))
    );
  }, 260);
}

if(document.getElementById('projTrack')){buildStrip();}

const vp = document.getElementById('projViewport');
if(vp){
    vp.addEventListener('wheel', e => {
    e.preventDefault();
    goTo(cur + (e.deltaY > 0 ? 1 : -1));
    }, { passive: false });

}
/* ─── STARS ─────────────────────────────────────── */
(function () {
  const c = document.getElementById('stars');
  const x = c.getContext('2d');
  let stars = [];
  function init() {
    c.width = innerWidth; c.height = innerHeight;
    stars = Array.from({ length: 180 }, () => ({
      x: Math.random() * c.width, y: Math.random() * c.height,
      r: Math.random() * 1.4, a: Math.random() * .65 + .1,
      sp: 0.002 + Math.random() * .004, ph: Math.random() * Math.PI * 2
    }));
  }
  function draw() {
    x.clearRect(0, 0, c.width, c.height);
    stars.forEach(s => {
      s.ph += s.sp;
      const a = s.a * (.3 + .7 * Math.abs(Math.sin(s.ph)));
      x.beginPath(); x.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      x.fillStyle = `rgba(180,200,255,${a})`; x.fill();
    });
    requestAnimationFrame(draw);
  }
  init(); draw();
  addEventListener('resize', init);
})();

/* ─── CURSOR ────────────────────────────────────── */
(function () {
  const dot  = document.getElementById('cur');
  const ring = document.getElementById('curR');
  let mx = 0, my = 0, rx = 0, ry = 0;
  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.left = (mx - 4) + 'px';
    dot.style.top  = (my - 4) + 'px';
  });
  (function loop() {
    rx += (mx - rx) * .11; ry += (my - ry) * .11;
    ring.style.left = (rx - 16) + 'px';
    ring.style.top  = (ry - 16) + 'px';
    requestAnimationFrame(loop);
  })();
  document.querySelectorAll('a,button,.proj-card,.proj-dot,.sk,.hob,.soc-btn').forEach(el => {
    el.addEventListener('mouseenter', () => {
      dot.style.transform = 'scale(2.8)';
      ring.style.width = ring.style.height = '48px';
      ring.style.borderColor = 'rgba(59,130,246,.55)';
    });
    el.addEventListener('mouseleave', () => {
      dot.style.transform = 'scale(1)';
      ring.style.width = ring.style.height = '32px';
      ring.style.borderColor = 'rgba(59,130,246,.35)';
    });
  });
})();

document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', e => {
    if(link.href === window.location.href){e.preventDefault();}
  });
});

const params = new URLSearchParams(window.location.search);
const idx = params.get('project');

if (idx !== null && document.getElementById('d-tag')) {
const p = projects[idx];
document.getElementById('d-tag').textContent       = p.tag;
document.getElementById('d-title').textContent     = p.title;
document.getElementById('d-year').textContent      = p.year;
document.getElementById('d-type').textContent      = p.type;
document.getElementById('d-status').textContent    = p.status;
document.getElementById('d-hero').textContent      = p.emoji;
document.getElementById('d-overview').textContent  = p.overview;
document.getElementById('d-challenge').textContent = p.challenge;
document.getElementById('d-built').textContent     = p.built;
document.getElementById('d-stack').textContent     = p.stack.join(', ');
document.getElementById('d-outcomes').textContent  = p.outcomes;
}