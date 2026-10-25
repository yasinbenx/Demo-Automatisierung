import {
  PRAYERS, load, save, dateKey, fromKey, addDays, weekdayIndex, startOfWeek,
  getDay, ensureDay,
} from './storage.js';
import { quoteOfDay, PAUSE_DUAS } from './quotes.js';
import { icon } from './icons.js';

// ---------- Zustand ----------

let state = load();
let saveTimer = null;

function persist(now = false) {
  clearTimeout(saveTimer);
  if (now) save(state);
  else saveTimer = setTimeout(() => save(state), 300);
}

const $view = document.getElementById('view');
const MONTHS = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
const WEEKDAYS = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];
const MOODS = [
  { v: 1, e: '😔', l: 'schwer' },
  { v: 2, e: '😕', l: 'eher schwer' },
  { v: 3, e: '😐', l: 'okay' },
  { v: 4, e: '🙂', l: 'gut' },
  { v: 5, e: '😊', l: 'sehr gut' },
];

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const todayKey = () => dateKey(new Date());
const visible = (id) => state.settings.visible[id] !== false;

function parseAmount(v) {
  const n = parseFloat(String(v).replace(/\s/g, '').replace(',', '.'));
  return Number.isFinite(n) ? n : 0;
}

const euro = (n) => n.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });

// ---------- Auswertung ----------

function prayerCount(day) {
  return PRAYERS.filter((p) => day.prayers[p.id]).length;
}

function isGymDay(date) {
  return !!state.settings.gymDays[weekdayIndex(date)];
}

function miniLabel() {
  const m = state.settings.miniGoal;
  if (m.type === 'prayer') return 'Ein Gebet';
  if (m.type === 'clear') return `Ein ${state.settings.clearName === 'Klar-Tage' ? 'klarer Tag' : state.settings.clearName}`;
  if (m.type === 'money') return 'Kurz die Konten anschauen';
  if (m.type === 'gym') return 'Kurz bewegen';
  return m.label?.trim() || 'Eine kleine Sache';
}

function miniDone(day) {
  const m = state.settings.miniGoal;
  if (m.type === 'prayer') return prayerCount(day) > 0;
  if (m.type === 'clear') return day.clear === true;
  if (m.type === 'money') return day.money.checked;
  if (m.type === 'gym') return day.gym.done;
  return !!day.mini;
}

// Status einer Gewohnheit an einem Tag: 'done' | 'part' | 'rest' | 'open'
export function habitStatus(id, date, day) {
  if (day.hard && miniDone(day)) return 'done';
  switch (id) {
    case 'prayers': {
      const c = prayerCount(day);
      return c === 5 ? 'done' : c > 0 ? 'part' : 'open';
    }
    case 'gym':
      if (day.gym.done) return 'done';
      return isGymDay(date) ? 'open' : 'rest';
    case 'clear':
      return day.clear === true ? 'done' : 'open';
    case 'money':
      return day.money.checked ? 'done' : 'open';
    case 'reflection':
      return day.mood > 0 ? 'done' : 'open';
    default:
      return 'open';
  }
}

// „X von 7 Tagen diese Woche“ (Mo–So, nur bis heute gezählt)
function weekCount(id) {
  const start = startOfWeek();
  const today = new Date();
  let n = 0;
  for (let i = 0; i < 7; i++) {
    const d = addDays(start, i);
    if (d > today) break;
    const s = habitStatus(id, d, getDay(state, dateKey(d)));
    if (s === 'done' || s === 'rest') n++;
  }
  return n;
}

function gymWeek() {
  const start = startOfWeek();
  const today = new Date();
  let planned = 0;
  let done = 0;
  for (let i = 0; i < 7; i++) {
    const d = addDays(start, i);
    const day = getDay(state, dateKey(d));
    if (isGymDay(d)) planned++;
    if (d <= today && day.gym.done) done++;
  }
  return { planned, done };
}

function clearStats() {
  const now = new Date();
  const prefix = dateKey(now).slice(0, 7);
  let month = 0;
  for (const [k, d] of Object.entries(state.days)) {
    if (k.startsWith(prefix) && d && d.clear === true) month++;
  }
  // Serie: zusammenhängende klare Tage bis heute (oder gestern, falls heute noch offen)
  let series = 0;
  let d = new Date(now);
  if (getDay(state, dateKey(d)).clear !== true) d = addDays(d, -1);
  while (getDay(state, dateKey(d)).clear === true) {
    series++;
    d = addDays(d, -1);
  }
  return { month, series, monthName: MONTHS[now.getMonth()] };
}

function moneyWeekSum() {
  const start = startOfWeek();
  let sum = 0;
  for (let i = 0; i < 7; i++) sum += parseAmount(getDay(state, dateKey(addDays(start, i))).money.amount);
  return sum;
}

// ---------- Bausteine ----------

function checkBtn(on, attrs = '', label = '') {
  return `<span class="check ${on ? 'on' : ''}" ${attrs} aria-hidden="true">${icon.check}</span>${label}`;
}

function greeting() {
  const h = new Date().getHours();
  if (h >= 4 && h < 11) return { word: 'Morgen', pre: 'Guten', sub: 'Ein neuer Tag. Du musst nichts aufholen, nur anfangen.' };
  if (h >= 11 && h < 17) return { word: 'Tag', pre: 'Schönen', sub: 'Schritt für Schritt. Alles, was du heute tust, zählt.' };
  if (h >= 17 && h < 22) return { word: 'Abend', pre: 'Guten', sub: 'Der Tag wird ruhiger. Schau freundlich auf das, was war.' };
  return { word: 'Nacht', pre: 'Ruhige', sub: 'Ruh dich aus. Morgen ist ein neuer Anfang.' };
}

function heroDate() {
  const d = new Date();
  return `${WEEKDAYS[weekdayIndex(d)]}, ${d.getDate()}. ${MONTHS[d.getMonth()]}`;
}

function hero(title, sub) {
  return `
    <header class="hero">
      <div class="zellige"></div>
      <div class="hero-top">
        <div class="brand"><img src="icons/logo.svg" alt="">Habit</div>
        <div class="hero-date">${heroDate()}</div>
      </div>
      <h1>${title}</h1>
      ${sub ? `<p class="hero-sub">${sub}</p>` : ''}
    </header>`;
}

function whyBlock(label = 'Mein Warum') {
  const why = state.settings.why?.trim();
  if (!why) return '';
  return `<div class="why-card"><div class="lbl">${label}</div><p>${esc(why)}</p></div>`;
}

const IMPULSE_IMAGES = ['images/sunrise.svg', 'images/atlas.svg', 'images/desert.svg'];

function impulseCard(q, { compact = false } = {}) {
  const fav = state.favorites.includes(q.id);
  const photo = state.settings.impulsePhoto;
  const n = Math.floor(Date.now() / 86400000);
  const img = IMPULSE_IMAGES[n % IMPULSE_IMAGES.length];
  return `
    <article class="card impulse ${photo ? '' : 'plain'}" ${photo ? `style="background-image:url('${img}')"` : ''}>
      <div class="zellige"></div>
      <div class="impulse-inner">
        <div class="impulse-top">
          <span class="chip">${esc(q.cat)} · ${esc(q.type)}</span>
          ${compact ? '' : `<button class="heart ${fav ? 'on' : ''}" data-action="fav" data-id="${esc(q.id)}" aria-pressed="${fav}" aria-label="${fav ? 'Aus Favoriten entfernen' : 'Als Favorit speichern'}">${icon.heart}</button>`}
        </div>
        ${q.ar ? `<p class="ar">${q.ar}</p>` : ''}
        <p class="impulse-text">${esc(q.text)}</p>
        <p class="impulse-src">${esc(q.source)}</p>
      </div>
    </article>`;
}

// ---------- Karten des Heute-Screens ----------

function prayersCard(day) {
  const c = prayerCount(day);
  const w = weekCount('prayers');
  return `
    <section class="card" aria-labelledby="h-prayers">
      <div class="card-head">
        <div class="card-title"><span class="card-icon">${icon.moon(18)}</span><h2 id="h-prayers">Gebete</h2></div>
        <div class="card-meta"><b>${c} von 5</b> heute</div>
      </div>
      <div class="card-body">
        <div class="prayers">
          ${PRAYERS.map((p) => `
            <button class="prayer" data-action="prayer" data-id="${p.id}" aria-pressed="${!!day.prayers[p.id]}">
              ${checkBtn(day.prayers[p.id], `data-check="prayer-${p.id}"`)}
              <span class="prayer-name">${p.name}</span>
              <span class="prayer-ar">${p.ar}</span>
            </button>`).join('')}
        </div>
      </div>
      <div class="card-foot"><span>Alle fünf: ${w} von 7 Tagen diese Woche</span></div>
    </section>`;
}

function gymCard(day) {
  const today = new Date();
  const gymDay = isGymDay(today);
  const { planned, done } = gymWeek();
  let body;
  if (gymDay || day.gym.done) {
    body = `
      <button class="check-row" data-action="gym" aria-pressed="${day.gym.done}">
        ${checkBtn(day.gym.done, 'data-check="gym"')}
        <span class="label"><strong>${day.gym.done ? 'Training erledigt' : 'Training heute'}</strong>
        <span>${gymDay ? `${WEEKDAYS[weekdayIndex(today)]} ist Gym-Tag` : 'Extra-Einheit am Ruhetag'}</span></span>
      </button>
      <div class="reveal ${day.gym.done ? 'open' : ''}"><div>
        <input class="field" data-input="gym-note" value="${esc(day.gym.note)}" placeholder="Notiz, z. B. Brust & Trizeps" maxlength="80" autocomplete="off">
      </div></div>`;
  } else {
    body = `
      <div class="rest">
        <span class="rest-badge">${icon.leaf(22)}</span>
        <span class="label" style="flex:1"><strong style="display:block;font-weight:500">Ruhetag</strong>
        <span class="muted small">Erholung gehört dazu. Heute zählt nichts als verpasst.</span></span>
      </div>
      <div style="text-align:right;margin-top:4px"><button class="link-btn" data-action="gym">Trotzdem trainiert?</button></div>`;
  }
  return `
    <section class="card" aria-labelledby="h-gym">
      <div class="card-head">
        <div class="card-title"><span class="card-icon">${icon.gym(18)}</span><h2 id="h-gym">Bewegung</h2></div>
        <div class="card-meta">${gymDay ? 'Gym-Tag' : 'Ruhetag'}</div>
      </div>
      <div class="card-body">${body}</div>
      <div class="card-foot"><span>${done} von ${planned} Gym-Tagen diese Woche</span></div>
    </section>`;
}

function clearCard(day, flash) {
  const { month, series, monthName } = clearStats();
  const slip = day.clear === 'slip';
  return `
    <section class="card" aria-labelledby="h-clear">
      <div class="card-head">
        <div class="card-title"><span class="card-icon">${icon.clear(18)}</span><h2 id="h-clear">${esc(state.settings.clearName)}</h2></div>
        <div class="card-meta">${series > 1 ? `Serie ${series}` : ''}</div>
      </div>
      <div class="card-body">
        <div class="clear-wrap">
          <div class="clear-count">${month}<small>${month === 1 ? 'Tag' : 'Tage'} im ${monthName}</small></div>
          <div class="clear-actions">
            <button class="check-row" style="width:auto" data-action="clear" aria-pressed="${day.clear === true}">
              <span class="label" style="text-align:right"><strong>Heute</strong><span>${day.clear === true ? 'erledigt' : 'abhaken'}</span></span>
              ${checkBtn(day.clear === true, 'data-check="clear"')}
            </button>
          </div>
        </div>
        ${slip ? `
          <div class="note">
            <strong>Das ist kein Neustart bei null.</strong> Mach morgen einfach weiter. Deine ${month} ${month === 1 ? 'Tag' : 'Tage'} im ${monthName} bleiben deine.
            ${flash && state.settings.why?.trim() ? `<p class="why-text">„${esc(state.settings.why.trim())}“</p>` : ''}
          </div>` : ''}
      </div>
      <div class="card-foot">
        <span>${slip ? 'Heute notiert. Morgen geht es weiter.' : 'Jeder Tag zählt für sich.'}</span>
        ${slip ? '' : '<button class="link-btn" style="padding:0" data-action="slip">Ausrutscher</button>'}
      </div>
    </section>`;
}

function moneyCard(day) {
  return `
    <section class="card" aria-labelledby="h-money">
      <div class="card-head">
        <div class="card-title"><span class="card-icon">${icon.money(18)}</span><h2 id="h-money">Geld-Check</h2></div>
        <div class="card-meta">1 Minute</div>
      </div>
      <div class="card-body">
        <button class="check-row" data-action="money" aria-pressed="${day.money.checked}">
          ${checkBtn(day.money.checked, 'data-check="money"')}
          <span class="label"><strong>Konten angeschaut</strong><span>Kurz reinschauen reicht.</span></span>
        </button>
        <div class="field-row" style="margin-top:12px">
          <label class="field-euro"><span class="sr-only">Heute ausgegeben</span>
            <input class="field" data-input="money-amount" inputmode="decimal" value="${esc(day.money.amount)}" placeholder="0,00" autocomplete="off">
          </label>
          <label style="flex:1"><span class="sr-only">Notiz</span>
            <input class="field" data-input="money-note" value="${esc(day.money.note)}" placeholder="Wofür? (optional)" maxlength="80" autocomplete="off">
          </label>
        </div>
      </div>
      <div class="card-foot"><span>Diese Woche ausgegeben</span><strong data-out="money-week" style="color:var(--ink)">${euro(moneyWeekSum())}</strong></div>
    </section>`;
}

function reflectionCard(day) {
  const evening = new Date().getHours() >= 17;
  return `
    <section class="card" aria-labelledby="h-refl">
      <div class="card-head">
        <div class="card-title"><span class="card-icon">${icon.pen(18)}</span><h2 id="h-refl">Tagesreflexion</h2></div>
        <div class="card-meta">${evening ? 'Jetzt am Abend' : 'Für den Abend'}</div>
      </div>
      <div class="card-body">
        <p class="muted small" style="margin-bottom:10px">Wie war dein Tag?</p>
        <div class="moods ${day.mood ? 'has' : ''}" role="radiogroup" aria-label="Stimmung">
          ${MOODS.map((m) => `<button class="mood ${day.mood === m.v ? 'on' : ''}" role="radio" aria-checked="${day.mood === m.v}" aria-label="${m.l}" data-action="mood" data-v="${m.v}">${m.e}</button>`).join('')}
        </div>
        <textarea class="field" data-input="good" rows="2" placeholder="Was war heute gut?" maxlength="280">${esc(day.good)}</textarea>
      </div>
    </section>`;
}

// ---------- Heute-ist-schwer ----------

function miniGoalCard(day) {
  const m = state.settings.miniGoal;
  const done = miniDone(day);
  let inner;
  if (m.type === 'prayer') {
    inner = `
      <div class="prayers">
        ${PRAYERS.map((p) => `
          <button class="prayer" data-action="prayer" data-id="${p.id}" aria-pressed="${!!day.prayers[p.id]}">
            ${checkBtn(day.prayers[p.id], `data-check="prayer-${p.id}"`)}
            <span class="prayer-name">${p.name}</span>
          </button>`).join('')}
      </div>`;
  } else {
    const action = { clear: 'clear', money: 'money', gym: 'gym' }[m.type] || 'mini';
    inner = `
      <button class="check-row" data-action="${action}" aria-pressed="${done}">
        ${checkBtn(done, `data-check="${action}"`)}
        <span class="label"><strong>${esc(miniLabel())}</strong><span>${done ? 'Geschafft.' : 'Nur das. Mehr nicht.'}</span></span>
      </button>`;
  }
  return `
    <section class="card">
      <div class="card-head">
        <div class="card-title"><span class="card-icon">${icon.sparkle(18)}</span><h2>Mini-Ziel</h2></div>
        <div class="card-meta">${done ? '<b>Tag geschafft</b>' : esc(miniLabel())}</div>
      </div>
      <div class="card-body">${inner}</div>
      <div class="card-foot"><span>${done ? 'Das zählt heute als ganzer Tag. Gut gemacht.' : 'Sobald das erledigt ist, zählt der Tag als geschafft.'}</span></div>
    </section>`;
}

function hardView(day) {
  const q = quoteOfDay(new Date(), ['Vergebung', 'Geduld']);
  return `
    ${hero('Heute <em>sanft</em>.', 'Manche Tage sind schwer. Das ist in Ordnung. Heute reicht eine einzige Sache.')}
    <div class="stack">
      <div class="hard-banner">
        <div class="zellige"></div>
        <h2>Du bist nicht zurück am Anfang.</h2>
        <p class="muted">Alles andere ist für heute ausgeblendet. Kein Druck, keine Liste.</p>
        ${whyBlock()}
      </div>
      ${miniGoalCard(day)}
      ${impulseCard(q, { compact: true })}
      <button class="quick-btn pause" data-action="pause" style="width:100%">
        <span class="ic">${icon.pause(20)}</span><span>Kurze Pause<small>10 Minuten durchatmen</small></span>
      </button>
      <button class="btn ghost block" data-action="hard-off">Zur normalen Ansicht</button>
    </div>`;
}

// ---------- Heute ----------

function todayView(flash = {}) {
  const key = todayKey();
  const day = getDay(state, key);
  if (day.hard) return hardView(day);

  const g = greeting();
  const doneCount = ['prayers', 'gym', 'clear', 'money', 'reflection']
    .filter((id) => visible(id))
    .filter((id) => habitStatus(id, new Date(), day) === 'done').length;
  const sub = doneCount === 0 ? g.sub : doneCount === 1 ? 'Eine Sache ist heute schon erledigt. Schön.' : `Heute schon ${doneCount} Dinge erledigt. Schön, dass du dranbleibst.`;

  const cards = [];
  if (visible('impulse')) cards.push(impulseCard(quoteOfDay()));
  if (visible('prayers')) cards.push(prayersCard(day));
  if (visible('gym')) cards.push(gymCard(day));
  if (visible('clear')) cards.push(clearCard(day, flash.slip));
  if (visible('money')) cards.push(moneyCard(day));
  if (visible('reflection')) cards.push(reflectionCard(day));

  return `
    ${hero(`${g.pre} <em>${g.word}</em>`, sub)}
    <div class="stack">
      <div class="quick">
        <button class="quick-btn" data-action="hard-on"><span class="ic">${icon.feather(19)}</span><span>Heute ist schwer<small>Nur ein Mini-Ziel</small></span></button>
        <button class="quick-btn pause" data-action="pause"><span class="ic">${icon.pause(20)}</span><span>Kurze Pause<small>10 Minuten</small></span></button>
      </div>
      ${cards.length ? cards.join('') : `<div class="empty"><div class="zellige"></div><p>Alle Gewohnheiten sind ausgeblendet.<br>In den Einstellungen kannst du sie wieder einschalten.</p></div>`}
    </div>`;
}

// ---------- Platzhalter für die übrigen Screens ----------

function weekView() {
  return `
    ${hero('Deine <em>Woche</em>', 'Die letzten sieben Tage auf einen Blick.')}
    <div class="stack"><div class="empty"><div class="zellige"></div><p>Die Wochenübersicht folgt im nächsten Schritt.</p></div></div>`;
}

function settingsView() {
  return `
    ${hero('<em>Einstellungen</em>', '')}
    <div class="stack"><div class="empty"><div class="zellige"></div><p>Die Einstellungen folgen im nächsten Schritt.</p></div></div>`;
}

// ---------- Router & Rendern ----------

const ROUTES = { heute: todayView, woche: weekView, einstellungen: settingsView };

function currentRoute() {
  const r = location.hash.replace(/^#\/?/, '');
  return ROUTES[r] ? r : 'heute';
}

function render(flash) {
  const route = currentRoute();
  // Beim Abhaken ohne Einblend-Animation neu zeichnen, nur beim Screenwechsel animieren
  $view.innerHTML = `<div class="${flash ? '' : 'screen'}">${ROUTES[route](flash)}</div>`;
  document.querySelectorAll('.tab').forEach((t) => {
    if (t.dataset.route === route) t.setAttribute('aria-current', 'page');
    else t.removeAttribute('aria-current');
  });
  if (flash?.pop) {
    const el = $view.querySelector(`[data-check="${flash.pop}"], .heart[data-id="${flash.pop}"]`);
    if (el) el.classList.add('pop');
  }
}

function rerender(flash = {}) {
  render(flash);
}

window.addEventListener('hashchange', () => {
  render();
  window.scrollTo(0, 0);
});

// ---------- Aktionen ----------

function toast(msg) {
  document.querySelectorAll('.toast').forEach((t) => t.remove());
  const t = document.createElement('div');
  t.className = 'toast';
  t.setAttribute('role', 'status');
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2700);
}

const actions = {
  prayer(el) {
    const day = ensureDay(state, todayKey());
    const id = el.dataset.id;
    day.prayers[id] = !day.prayers[id];
    persist(true);
    rerender({ pop: day.prayers[id] ? `prayer-${id}` : null });
  },
  gym() {
    const day = ensureDay(state, todayKey());
    day.gym.done = !day.gym.done;
    persist(true);
    rerender({ pop: day.gym.done ? 'gym' : null });
  },
  clear() {
    const day = ensureDay(state, todayKey());
    day.clear = day.clear === true ? null : true;
    persist(true);
    rerender({ pop: day.clear === true ? 'clear' : null });
  },
  slip() {
    const day = ensureDay(state, todayKey());
    day.clear = 'slip';
    persist(true);
    rerender({ slip: true });
  },
  money() {
    const day = ensureDay(state, todayKey());
    day.money.checked = !day.money.checked;
    persist(true);
    rerender({ pop: day.money.checked ? 'money' : null });
  },
  mini() {
    const day = ensureDay(state, todayKey());
    day.mini = !day.mini;
    persist(true);
    rerender({ pop: day.mini ? 'mini' : null });
  },
  mood(el) {
    const day = ensureDay(state, todayKey());
    const v = Number(el.dataset.v);
    day.mood = day.mood === v ? 0 : v;
    persist(true);
    rerender({});
  },
  fav(el) {
    const id = el.dataset.id;
    const i = state.favorites.indexOf(id);
    if (i >= 0) state.favorites.splice(i, 1);
    else state.favorites.push(id);
    persist(true);
    rerender({ pop: i >= 0 ? null : id });
    toast(i >= 0 ? 'Aus den Favoriten entfernt' : 'In deinen Favoriten gespeichert');
  },
  'hard-on'() {
    ensureDay(state, todayKey()).hard = true;
    persist(true);
    render();
    window.scrollTo(0, 0);
  },
  'hard-off'() {
    ensureDay(state, todayKey()).hard = false;
    persist(true);
    render();
    window.scrollTo(0, 0);
  },
  pause() {
    openPause();
  },
};

document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-action]');
  if (!el) return;
  const fn = actions[el.dataset.action];
  if (fn) {
    e.preventDefault();
    fn(el, e);
  }
});

// Texteingaben speichern ohne Neu-Rendern, damit der Fokus bleibt
document.addEventListener('input', (e) => {
  const el = e.target.closest('[data-input]');
  if (!el) return;
  const day = ensureDay(state, todayKey());
  switch (el.dataset.input) {
    case 'gym-note': day.gym.note = el.value; break;
    case 'money-amount': {
      day.money.amount = el.value.replace(/[^\d.,]/g, '');
      const out = document.querySelector('[data-out="money-week"]');
      if (out) out.textContent = euro(moneyWeekSum());
      break;
    }
    case 'money-note': day.money.note = el.value; break;
    case 'good': day.good = el.value; break;
    default: return;
  }
  persist();
});

window.addEventListener('pagehide', () => persist(true));
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') persist(true);
  else render(); // neuer Tag nach Mitternacht
});

// ---------- Sheets ----------

function openSheet(html, { onClose, dismissable = true } = {}) {
  const back = document.createElement('div');
  back.className = 'sheet-backdrop';
  back.innerHTML = `<div class="sheet" role="dialog" aria-modal="true">${html}</div>`;
  document.body.appendChild(back);
  document.body.style.overflow = 'hidden';
  const close = () => {
    back.remove();
    document.body.style.overflow = '';
    onClose?.();
  };
  if (dismissable) {
    back.addEventListener('click', (e) => {
      if (e.target === back) close();
    });
  }
  return { el: back.firstElementChild, close };
}

// ---------- Erster Start: Mein Warum ----------

function onboarding() {
  const s = openSheet(`
    <div style="text-align:center;margin-bottom:6px"><img src="icons/logo.svg" alt="" width="64" height="64" style="border-radius:18px;box-shadow:var(--shadow)"></div>
    <h2 style="text-align:center">Schön, dass du da bist.</h2>
    <p class="lead" style="text-align:center">Hier gibt es keine Streaks und keinen Druck. Ein verpasster Tag setzt nichts zurück.</p>
    <label for="why-input" style="display:block;font-weight:500;margin-bottom:8px">Warum willst du wieder anfangen?</label>
    <textarea id="why-input" class="field" rows="4" placeholder="In deinen eigenen Worten …" maxlength="500"></textarea>
    <p class="muted small" style="margin-top:8px">Diesen Satz zeigt dir die App an schweren Tagen. Du kannst ihn jederzeit in den Einstellungen ändern.</p>
    <div class="sheet-actions">
      <button class="btn block" data-sheet="save">Speichern</button>
      <button class="btn ghost block" data-sheet="skip">Überspringen</button>
    </div>`, { dismissable: false });
  s.el.addEventListener('click', (e) => {
    const b = e.target.closest('[data-sheet]');
    if (!b) return;
    if (b.dataset.sheet === 'save') state.settings.why = s.el.querySelector('#why-input').value.trim();
    state.settings.onboarded = true;
    persist(true);
    s.close();
    render();
  });
}

// ---------- Kurze Pause ----------

const PAUSE_TASKS = [
  { t: 'Trink ein großes Glas Wasser', d: 'Langsam, Schluck für Schluck.' },
  { t: '20 Liegestütze', d: 'Oder so viele, wie gerade gehen.' },
  { t: 'Geh kurz raus', d: 'Frische Luft, ein paar Schritte, den Himmel anschauen.' },
  { t: 'Mach Wudu', d: 'Kühles Wasser, ruhige Bewegungen.' },
];
const PAUSE_SECONDS = 10 * 60;
let pauseTimer = null;

function openPause() {
  let taskIdx = Math.floor(Math.random() * PAUSE_TASKS.length);
  const end = Date.now() + PAUSE_SECONDS * 1000;
  const startedAt = new Date();

  const s = openSheet('', { onClose: () => clearInterval(pauseTimer), dismissable: false });

  const timerHtml = () => `
    <div class="pause">
      <button class="pause-close" data-p="close" aria-label="Schließen">${icon.close(20)}</button>
      <p class="section-label" style="margin:0 0 8px;text-align:center">Kurze Pause</p>
      <div class="breath" aria-hidden="true"><div class="breath-ring"></div><div class="breath-ring r2"></div><div class="breath-core"></div></div>
      <div class="pause-time" data-p="time" aria-live="off">10:00</div>
      <p class="pause-hint" data-p="hint">Einatmen …</p>
      <div class="pause-task card">
        <div class="card-body" style="padding:16px 18px">
          <p class="section-label" style="margin:0 0 4px">Vorschlag</p>
          <strong style="display:block;font-size:17px;font-weight:500">${PAUSE_TASKS[taskIdx].t}</strong>
          <span class="muted small">${PAUSE_TASKS[taskIdx].d}</span>
        </div>
        <button class="pause-swap" data-p="swap" aria-label="Andere Aufgabe">${icon.refresh(18)}</button>
      </div>
      <button class="btn secondary block" data-p="done" style="margin-top:14px">Mir geht es besser</button>
    </div>`;

  const duaHtml = () => {
    const dua = PAUSE_DUAS[Math.floor(Math.random() * PAUSE_DUAS.length)];
    return `
      <h2>Gut gemacht.</h2>
      <p class="lead">Du hast dir einen Moment genommen. Das war stark.</p>
      ${whyBlock()}
      <div class="card impulse plain" style="min-height:0;margin-top:16px">
        <div class="zellige"></div>
        <div class="impulse-inner">
          <p class="ar" style="font-size:22px">${dua.ar}</p>
          <p class="impulse-text" style="font-size:18px">${esc(dua.text)}</p>
          <p class="impulse-src">${esc(dua.source)}</p>
        </div>
      </div>
      <div class="sheet-actions">
        <button class="btn block" data-p="reflect">Kurz festhalten</button>
        <button class="btn ghost block" data-p="close">Fertig</button>
      </div>`;
  };

  const PLACES = ['Zuhause', 'Bett', 'Arbeit', 'Unterwegs', 'Allein'];
  const FEELINGS = ['Gelangweilt', 'Gestresst', 'Müde', 'Einsam', 'Traurig', 'Unruhig'];
  const hh = String(startedAt.getHours()).padStart(2, '0');
  const mm = String(startedAt.getMinutes()).padStart(2, '0');

  const reflectHtml = () => `
    <h2>Kurz festhalten</h2>
    <p class="lead">Alles freiwillig. Es hilft, Muster zu erkennen, nicht dich zu bewerten.</p>
    <label class="form-label">Wo warst du?</label>
    <div class="chips" data-group="place">${PLACES.map((p) => `<button class="chip-btn" data-v="${p}">${p}</button>`).join('')}</div>
    <input class="field" data-f="place" placeholder="Oder eigene Angabe" maxlength="40" style="margin-top:8px">
    <label class="form-label">Wie hast du dich gefühlt?</label>
    <div class="chips" data-group="feeling">${FEELINGS.map((p) => `<button class="chip-btn" data-v="${p}">${p}</button>`).join('')}</div>
    <input class="field" data-f="feeling" placeholder="Oder eigene Worte" maxlength="40" style="margin-top:8px">
    <label class="form-label" for="p-time">Wie spät war es?</label>
    <input class="field" id="p-time" type="time" data-f="time" value="${hh}:${mm}">
    <div class="sheet-actions">
      <button class="btn block" data-p="save">Speichern</button>
      <button class="btn ghost block" data-p="close">Überspringen</button>
    </div>`;

  const show = (html) => {
    s.el.innerHTML = html;
    s.el.scrollTop = 0;
  };

  const tick = () => {
    const left = Math.max(0, Math.round((end - Date.now()) / 1000));
    const t = s.el.querySelector('[data-p="time"]');
    if (t) t.textContent = `${String(Math.floor(left / 60)).padStart(2, '0')}:${String(left % 60).padStart(2, '0')}`;
    const h = s.el.querySelector('[data-p="hint"]');
    if (h) h.textContent = Math.floor((PAUSE_SECONDS - left) / 5) % 2 === 0 ? 'Einatmen …' : 'Ausatmen …';
    if (left === 0) {
      clearInterval(pauseTimer);
      show(duaHtml());
    }
  };

  show(timerHtml());
  tick();
  pauseTimer = setInterval(tick, 1000);

  s.el.addEventListener('click', (e) => {
    const chip = e.target.closest('.chip-btn');
    if (chip) {
      const group = chip.parentElement;
      const was = chip.classList.contains('on');
      group.querySelectorAll('.chip-btn').forEach((c) => c.classList.remove('on'));
      if (!was) chip.classList.add('on');
      return;
    }
    const b = e.target.closest('[data-p]');
    if (!b) return;
    switch (b.dataset.p) {
      case 'close':
        s.close();
        break;
      case 'swap':
        taskIdx = (taskIdx + 1) % PAUSE_TASKS.length;
        s.el.querySelector('.pause-task strong').textContent = PAUSE_TASKS[taskIdx].t;
        s.el.querySelector('.pause-task .muted').textContent = PAUSE_TASKS[taskIdx].d;
        break;
      case 'done':
        clearInterval(pauseTimer);
        show(duaHtml());
        break;
      case 'reflect':
        show(reflectHtml());
        break;
      case 'save': {
        const pick = (g) => s.el.querySelector(`[data-group="${g}"] .on`)?.dataset.v || '';
        const place = s.el.querySelector('[data-f="place"]').value.trim() || pick('place');
        const feeling = s.el.querySelector('[data-f="feeling"]').value.trim() || pick('feeling');
        const time = s.el.querySelector('[data-f="time"]').value || `${hh}:${mm}`;
        state.pauses.push({ ts: startedAt.toISOString(), task: PAUSE_TASKS[taskIdx].t, place, feeling, time });
        persist(true);
        s.close();
        toast('Gespeichert. Danke, dass du hingeschaut hast.');
        break;
      }
    }
  });
}

// ---------- Theme ----------

function applyTheme() {
  const t = state.settings.theme;
  if (t === 'light' || t === 'dark') document.documentElement.dataset.theme = t;
  else delete document.documentElement.dataset.theme;
}

// ---------- Start ----------

applyTheme();
render();
if (!state.settings.onboarded) onboarding();

export { state, persist, render, toast, openSheet, fromKey };
