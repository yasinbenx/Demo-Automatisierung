import {
  PRAYERS, load, save, clearAll, defaultState, normalize, dateKey, fromKey, addDays,
  weekdayIndex, startOfWeek, getDay, ensureDay,
} from './storage.js';
import { quoteOfDay, quoteById, PAUSE_DUAS } from './quotes.js';
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
  { v: 1, l: 'schwer' },
  { v: 2, l: 'eher schwer' },
  { v: 3, l: 'okay' },
  { v: 4, l: 'eher gut' },
  { v: 5, l: 'gut' },
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

function miniPrayer() {
  return PRAYERS.find((p) => p.id === state.settings.miniGoal.prayer) || PRAYERS[4];
}

function miniLabel() {
  const m = state.settings.miniGoal;
  if (m.type === 'prayer') return `${miniPrayer().name} beten`;
  if (m.type === 'clear') return `Ein ${state.settings.clearName === 'Klar-Tage' ? 'klarer Tag' : state.settings.clearName}`;
  if (m.type === 'money') return 'Kurz die Konten anschauen';
  if (m.type === 'gym') return 'Kurz bewegen';
  return m.label?.trim() || 'Eine kleine Sache';
}

function miniDone(day) {
  const m = state.settings.miniGoal;
  if (m.type === 'prayer') return !!day.prayers[miniPrayer().id];
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
  if (h >= 4 && h < 11) return { title: 'Guten Morgen.', sub: 'Womit fängst du heute an?' };
  if (h >= 11 && h < 17) return { title: 'Hallo.', sub: 'Was steht heute noch an?' };
  if (h >= 17 && h < 22) return { title: 'Guten Abend.', sub: 'Wie war dein Tag?' };
  return { title: 'Gute Nacht.', sub: 'Zeit zum Schlafen. Morgen geht es weiter.' };
}

function heroDate() {
  const d = new Date();
  return `${WEEKDAYS[weekdayIndex(d)]}, ${d.getDate()}. ${MONTHS[d.getMonth()]}`;
}

function hero(title, sub) {
  return `
    <header class="hero">
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
      <div class="card-foot"><span>Alle fünf Gebete: ${w} von 7 Tagen</span></div>
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
        <span>${gymDay ? `${WEEKDAYS[weekdayIndex(today)]} ist Gym-Tag` : 'Eigentlich Ruhetag'}</span></span>
      </button>
      <div class="reveal ${day.gym.done ? 'open' : ''}"><div>
        <input class="field" data-input="gym-note" value="${esc(day.gym.note)}" placeholder="Was hast du trainiert? z. B. Brust & Trizeps" maxlength="80" autocomplete="off">
      </div></div>`;
  } else {
    body = `
      <div class="rest">
        <span class="rest-badge">${icon.leaf(22)}</span>
        <span class="label" style="flex:1"><strong style="display:block;font-weight:500">Ruhetag.</strong>
        <span class="muted small">Heute fehlt dir nichts.</span></span>
      </div>
      <div style="text-align:right;margin-top:4px"><button class="link-btn" data-action="gym">Doch trainiert?</button></div>`;
  }
  return `
    <section class="card" aria-labelledby="h-gym">
      <div class="card-head">
        <div class="card-title"><span class="card-icon">${icon.gym(18)}</span><h2 id="h-gym">Bewegung</h2></div>
        <div class="card-meta">${gymDay ? 'Gym-Tag' : 'Ruhetag'}</div>
      </div>
      <div class="card-body">${body}</div>
      <div class="card-foot"><span>Gym diese Woche: ${done} von ${planned}</span></div>
    </section>`;
}

function clearCard(day, flash) {
  const { month, series, monthName } = clearStats();
  const slip = day.clear === 'slip';
  return `
    <section class="card" aria-labelledby="h-clear">
      <div class="card-head">
        <div class="card-title"><span class="card-icon">${icon.clear(18)}</span><h2 id="h-clear">${esc(state.settings.clearName)}</h2></div>
        <div class="card-meta">${series > 1 ? `${series} am Stück` : ''}</div>
      </div>
      <div class="card-body">
        <div class="clear-wrap">
          <div class="clear-count"><span class="num">${month}</span><small>${month === 1 ? 'Tag' : 'Tage'} im ${monthName}</small></div>
          <div class="clear-actions">
            <button class="check-row" style="width:auto" data-action="clear" aria-pressed="${day.clear === true}">
              <span class="label" style="text-align:right"><strong>Heute</strong><span>${day.clear === true ? 'geschafft' : 'antippen'}</span></span>
              ${checkBtn(day.clear === true, 'data-check="clear"')}
            </button>
          </div>
        </div>
        ${slip ? `
          <div class="note">
            <strong>Das ist kein Neustart bei null.</strong> Mach morgen einfach weiter. Deine ${month} ${month === 1 ? 'Tag' : 'Tage'} im ${monthName} bleiben.
            ${flash && state.settings.why?.trim() ? `<p class="why-text">„${esc(state.settings.why.trim())}“</p>` : ''}
          </div>` : ''}
      </div>
      <div class="card-foot">
        <span>${slip ? 'Ist notiert. Morgen geht es weiter.' : 'Tag für Tag.'}</span>
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
          <span class="label"><strong>Konten angeschaut</strong><span>Ein Blick reicht.</span></span>
        </button>
        <div class="field-row" style="margin-top:12px">
          <label class="field-euro"><span class="sr-only">Heute ausgegeben</span>
            <input class="field" data-input="money-amount" inputmode="decimal" value="${esc(day.money.amount)}" placeholder="0,00" autocomplete="off">
          </label>
          <label style="flex:1"><span class="sr-only">Notiz</span>
            <input class="field" data-input="money-note" value="${esc(day.money.note)}" placeholder="Wofür?" maxlength="80" autocomplete="off">
          </label>
        </div>
      </div>
      <div class="card-foot"><span>Diese Woche ausgegeben</span><strong class="num" data-out="money-week" style="color:var(--ink);font-size:17px">${euro(moneyWeekSum())}</strong></div>
    </section>`;
}

function reflectionCard(day) {
  const evening = new Date().getHours() >= 17;
  return `
    <section class="card" aria-labelledby="h-refl">
      <div class="card-head">
        <div class="card-title"><span class="card-icon">${icon.pen(18)}</span><h2 id="h-refl">Tagesreflexion</h2></div>
        <div class="card-meta">${evening ? 'Jetzt' : 'Am Abend'}</div>
      </div>
      <div class="card-body">
        <p class="muted small" style="margin-bottom:10px">Wie geht’s dir heute?</p>
        <div class="moods ${day.mood ? 'has' : ''}" role="radiogroup" aria-label="Stimmung">
          ${MOODS.map((m) => `<button class="mood ${day.mood === m.v ? 'on' : ''}" role="radio" aria-checked="${day.mood === m.v}" aria-label="${m.v}, ${m.l}" data-action="mood" data-v="${m.v}">${m.v}</button>`).join('')}
        </div>
        <div class="mood-scale" aria-hidden="true"><span>schwer</span><span>gut</span></div>
        <textarea class="field" data-input="good" rows="2" placeholder="Was war heute gut?" maxlength="280">${esc(day.good)}</textarea>
      </div>
    </section>`;
}

// ---------- Heute-ist-schwer ----------

function miniGoalCard(day) {
  const m = state.settings.miniGoal;
  const done = miniDone(day);
  // Genau ein Ziel, egal welcher Typ
  const action = { prayer: 'prayer', clear: 'clear', money: 'money', gym: 'gym' }[m.type] || 'mini';
  const id = m.type === 'prayer' ? miniPrayer().id : '';
  const check = m.type === 'prayer' ? `prayer-${id}` : action;
  const inner = `
      <button class="check-row" data-action="${action}" ${id ? `data-id="${id}"` : ''} aria-pressed="${done}">
        ${checkBtn(done, `data-check="${check}"`)}
        <span class="label"><strong>${esc(miniLabel())}</strong><span>${done ? 'Geschafft.' : 'Nur das, sonst nichts.'}</span></span>
      </button>`;
  return `
    <section class="card">
      <div class="card-head">
        <div class="card-title"><span class="card-icon">${icon.target(18)}</span><h2>Mini-Ziel</h2></div>
        <div class="card-meta">${done ? '<b>Tag geschafft</b>' : 'Heute nur das'}</div>
      </div>
      <div class="card-body">${inner}</div>
      <div class="card-foot"><span>${done ? 'Der Tag zählt als geschafft.' : 'Wenn das erledigt ist, zählt der Tag.'}</span></div>
    </section>`;
}

function hardView(day) {
  const q = quoteOfDay(new Date(), ['Vergebung', 'Geduld']);
  return `
    ${hero('Heute nur eins.', 'Schwere Tage gibt es. Heute reicht eine Sache.')}
    <div class="stack">
      ${miniGoalCard(day)}
      <div class="hard-banner">
        <h2>Du fängst nicht bei null an.</h2>
        <p class="muted">Alles andere ist heute ausgeblendet.</p>
        ${whyBlock()}
      </div>
      ${impulseCard(q, { compact: true })}
      <button class="quick-btn pause" data-action="pause" style="width:100%">
        <span class="ic">${icon.pause(20)}</span><span>Kurze Pause<small>10 Minuten</small></span>
      </button>
      <button class="btn ghost block" data-action="hard-off">Alles wieder anzeigen</button>
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
  const sub = doneCount === 0 ? g.sub : doneCount === 1 ? 'Eine Sache ist heute schon geschafft.' : `${doneCount} Dinge sind heute schon geschafft.`;

  const cards = [];
  if (visible('impulse')) cards.push(impulseCard(quoteOfDay()));
  if (visible('prayers')) cards.push(prayersCard(day));
  if (visible('gym')) cards.push(gymCard(day));
  if (visible('clear')) cards.push(clearCard(day, flash.slip));
  if (visible('money')) cards.push(moneyCard(day));
  if (visible('reflection')) cards.push(reflectionCard(day));

  return `
    ${hero(g.title, sub)}
    <div class="stack">
      <div class="quick">
        <button class="quick-btn" data-action="hard-on"><span class="ic">${icon.feather(19)}</span><span>Heute ist schwer<small>Nur eins schaffen</small></span></button>
        <button class="quick-btn pause" data-action="pause"><span class="ic">${icon.pause(20)}</span><span>Kurze Pause<small>10 Minuten</small></span></button>
      </div>
      ${cards.length ? cards.join('') : `<div class="empty"><p>Gerade ist alles ausgeblendet.<br>In den Einstellungen kannst du es wieder einschalten.</p></div>`}
    </div>`;
}

// ---------- Woche ----------

const WD_SHORT = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
const GRID_LABELS = { prayers: 'Gebete', gym: 'Bewegung', clear: null, money: 'Geld', reflection: 'Reflexion' };
const SUMMARY_LABELS = { prayers: 'Alle fünf Gebete', gym: 'Bewegung', clear: null, money: 'Geld-Check', reflection: 'Tagesreflexion' };

function lastSevenDays() {
  const today = new Date();
  return Array.from({ length: 7 }, (_, i) => {
    const date = addDays(new Date(today.getFullYear(), today.getMonth(), today.getDate()), i - 6);
    const key = dateKey(date);
    return { date, key, day: getDay(state, key), isToday: i === 6 };
  });
}

function weekDot(id, d) {
  const s = habitStatus(id, d.date, d.day);
  const title = { done: 'geschafft', part: 'teilweise', rest: 'Ruhetag', open: 'offen' }[s];
  if (s === 'part') {
    const p = Math.round((prayerCount(d.day) / 5) * 100);
    return `<span class="wdot part" style="--p:${p}%" title="${prayerCount(d.day)} von 5"></span>`;
  }
  return `<span class="wdot ${s}" title="${title}"></span>`;
}

function weekView() {
  const days = lastSevenDays();
  const habits = ['prayers', 'gym', 'clear', 'money', 'reflection'].filter(visible);
  const label = (id, map) => map[id] ?? state.settings.clearName;
  const counts = Object.fromEntries(habits.map((id) => [id, days.filter((d) => ['done', 'rest'].includes(habitStatus(id, d.date, d.day))).length]));
  const first = days[0].date;
  const last = days[6].date;
  const range = first.getMonth() === last.getMonth()
    ? `${first.getDate()}. bis ${last.getDate()}. ${MONTHS[last.getMonth()]}`
    : `${first.getDate()}. ${MONTHS[first.getMonth()]} bis ${last.getDate()}. ${MONTHS[last.getMonth()]}`;

  const prayersTotal = days.reduce((n, d) => n + prayerCount(d.day), 0);
  const hardDays = days.filter((d) => d.day.hard).length;
  const spent = days.reduce((n, d) => n + parseAmount(d.day.money.amount), 0);
  const moods = days.filter((d) => d.day.mood > 0);
  const avgMood = moods.length ? moods.reduce((n, d) => n + d.day.mood, 0) / moods.length : 0;
  const good = days.filter((d) => d.day.good?.trim()).reverse();

  const extra = {
    prayers: `${prayersTotal} von 35 Gebeten`,
    gym: 'Ruhetage zählen mit',
    money: spent > 0 ? `${euro(spent)} ausgegeben` : '',
    reflection: avgMood ? `Stimmung im Schnitt ${avgMood.toLocaleString('de-DE', { maximumFractionDigits: 1 })}` : '',
    clear: '',
  };

  if (!habits.length) {
    return `${hero('Deine Woche', range)}
      <div class="stack"><div class="empty"><p>Gerade ist alles ausgeblendet.<br>In den Einstellungen kannst du es wieder einschalten.</p></div></div>`;
  }

  return `
    ${hero('Deine Woche', range)}
    <div class="stack">
      <section class="card" aria-labelledby="h-grid">
        <div class="card-head">
          <div class="card-title"><span class="card-icon">${icon.week(18)}</span><h2 id="h-grid">Letzte 7 Tage</h2></div>
        </div>
        <div class="card-body">
          <div class="wgrid" role="table" aria-label="Gewohnheiten der letzten 7 Tage">
            <div class="wrow whead" role="row">
              <span role="columnheader"></span>
              ${days.map((d) => `
                <span class="wday ${d.isToday ? 'today' : ''}" role="columnheader">
                  <small>${WD_SHORT[weekdayIndex(d.date)]}</small>
                  <b class="num">${d.date.getDate()}</b>
                  <i class="${d.day.hard ? 'hard' : ''}"></i>
                </span>`).join('')}
              <span role="columnheader"></span>
            </div>
            ${habits.map((id) => `
              <div class="wrow" role="row">
                <span class="wlabel" role="rowheader">${esc(label(id, GRID_LABELS))}</span>
                ${days.map((d) => `<span class="wcell" role="cell">${weekDot(id, d)}</span>`).join('')}
                <span class="wcount num" role="cell">${counts[id]}/7</span>
              </div>`).join('')}
          </div>
          <div class="legend">
            <span><span class="wdot done"></span>geschafft</span>
            ${habits.includes('prayers') ? '<span><span class="wdot part" style="--p:60%"></span>teilweise</span>' : ''}
            ${habits.includes('gym') ? '<span><span class="wdot rest"></span>Ruhetag</span>' : ''}
            ${hardDays ? '<span><i class="hard-key"></i>Mini-Ziel-Tag</span>' : ''}
          </div>
        </div>
      </section>

      <section class="card" aria-labelledby="h-sum">
        <div class="card-head">
          <div class="card-title"><span class="card-icon">${icon.today(18)}</span><h2 id="h-sum">So lief's</h2></div>
        </div>
        <div class="card-body sum-list">
          ${habits.map((id) => `
            <div class="sum-row">
              <div class="sum-top">
                <span>${esc(label(id, SUMMARY_LABELS))}</span>
                <span><b class="num">${counts[id]}</b> von 7 Tagen</span>
              </div>
              <div class="bar"><span style="width:${(counts[id] / 7) * 100}%"></span></div>
              ${extra[id] ? `<p class="muted small">${extra[id]}</p>` : ''}
            </div>`).join('')}
        </div>
        ${hardDays ? `<div class="card-foot"><span>${hardDays === 1 ? 'Ein Tag lief' : `${hardDays} Tage liefen`} im Mini-Ziel-Modus. Mit erledigtem Mini-Ziel zählt so ein Tag überall als geschafft.</span></div>` : ''}
      </section>

      ${good.length ? `
        <section class="card" aria-labelledby="h-good">
          <div class="card-head">
            <div class="card-title"><span class="card-icon">${icon.pen(18)}</span><h2 id="h-good">Was gut war</h2></div>
          </div>
          <div class="card-body good-list">
            ${good.map((d) => `
              <div class="good-item">
                <span class="good-day">${d.isToday ? 'Heute' : WEEKDAYS[weekdayIndex(d.date)]}</span>
                <p>${esc(d.day.good.trim())}</p>
              </div>`).join('')}
          </div>
        </section>` : ''}
    </div>`;
}

// ---------- Einstellungen ----------

const MINI_TYPES = [
  { id: 'prayer', label: 'Ein Gebet' },
  { id: 'clear', label: 'Klar-Tag' },
  { id: 'money', label: 'Geld-Check' },
  { id: 'gym', label: 'Bewegung' },
  { id: 'custom', label: 'Eigenes' },
];

const VISIBLE_ITEMS = [
  { id: 'impulse', label: 'Tagesimpuls' },
  { id: 'prayers', label: 'Gebete' },
  { id: 'gym', label: 'Bewegung' },
  { id: 'clear', label: null },
  { id: 'money', label: 'Geld-Check' },
  { id: 'reflection', label: 'Tagesreflexion' },
];

function toggle(on, action, id, label) {
  return `
    <button class="set-row" data-action="${action}" data-id="${id}" role="switch" aria-checked="${on}">
      <span>${esc(label)}</span>
      <span class="switch ${on ? 'on' : ''}" aria-hidden="true"><i></i></span>
    </button>`;
}

function segmented(name, options, value) {
  return `
    <div class="seg" role="radiogroup">
      ${options.map((o) => `<button class="${o.id === value ? 'on' : ''}" role="radio" aria-checked="${o.id === value}" data-action="${name}" data-id="${o.id}">${esc(o.label)}</button>`).join('')}
    </div>`;
}

// Kurze-Pause-Auswertung
const TIME_BUCKETS = [
  { label: 'Morgens', from: 5, to: 11 },
  { label: 'Mittags', from: 11, to: 14 },
  { label: 'Nachmittags', from: 14, to: 18 },
  { label: 'Abends', from: 18, to: 22 },
  { label: 'Nachts', from: 22, to: 29 },
];

function topCounts(values, n = 4) {
  const map = new Map();
  for (const v of values) {
    const k = String(v || '').trim();
    if (!k) continue;
    const key = k.toLowerCase();
    const cur = map.get(key) || { label: k, n: 0 };
    cur.n++;
    map.set(key, cur);
  }
  return [...map.values()].sort((a, b) => b.n - a.n).slice(0, n);
}

function bars(items) {
  if (!items.length) return '<p class="muted small">Noch nichts eingetragen.</p>';
  const max = Math.max(...items.map((i) => i.n));
  return items.map((i) => `
    <div class="stat-row">
      <span>${esc(i.label)}</span>
      <div class="bar thin"><span style="width:${(i.n / max) * 100}%"></span></div>
      <b class="num">${i.n}</b>
    </div>`).join('');
}

function pauseStats() {
  const list = state.pauses;
  if (!list.length) {
    return '<p class="muted">Noch keine Pausen. Wenn du nach einer Pause kurz festhältst, wo du warst und wie es dir ging, siehst du hier, wann es oft schwer wird.</p>';
  }
  const hours = list.map((p) => {
    const h = parseInt(String(p.time || '').split(':')[0], 10);
    return Number.isFinite(h) ? h : new Date(p.ts).getHours();
  });
  const times = TIME_BUCKETS.map((b) => ({
    label: b.label,
    n: hours.filter((h) => (h >= b.from && h < b.to) || (b.to > 24 && h + 24 >= b.from && h + 24 < b.to)).length,
  })).filter((b) => b.n > 0).sort((a, b) => b.n - a.n);
  const month = list.filter((p) => Date.now() - new Date(p.ts).getTime() < 30 * 86400000).length;
  return `
    <p class="muted small" style="margin-bottom:14px">${list.length === 1 ? 'Eine Pause' : `${list.length} Pausen`} insgesamt, ${month} in den letzten 30 Tagen.</p>
    <p class="stat-head">Uhrzeit</p>
    ${bars(times)}
    <p class="stat-head">Orte</p>
    ${bars(topCounts(list.map((p) => p.place)))}
    <p class="stat-head">Gefühle</p>
    ${bars(topCounts(list.map((p) => p.feeling)))}`;
}

function settingsView() {
  const s = state.settings;
  const m = s.miniGoal;
  const favs = state.favorites.map(quoteById).filter(Boolean);

  return `
    ${hero('Einstellungen', 'Deine Daten bleiben auf diesem Gerät.')}
    <div class="stack">

      <section class="card">
        <div class="card-head"><div class="card-title"><h2>Mein Warum</h2></div></div>
        <div class="card-body">
          <p class="muted small" style="margin-bottom:10px">Steht oben, wenn der Tag schwer ist, nach einem Ausrutscher und nach einer Pause.</p>
          <textarea class="field" data-setting="why" rows="3" maxlength="500" placeholder="Warum willst du wieder anfangen?">${esc(s.why)}</textarea>
        </div>
      </section>

      <section class="card">
        <div class="card-head"><div class="card-title"><h2>Mini-Ziel</h2></div></div>
        <div class="card-body">
          <p class="muted small" style="margin-bottom:12px">Das eine Ziel für Tage, an denen „Heute ist schwer“ an ist.</p>
          <div class="chips">
            ${MINI_TYPES.map((t) => `<button class="chip-btn ${m.type === t.id ? 'on' : ''}" data-action="mini-type" data-id="${t.id}" aria-pressed="${m.type === t.id}">${t.label}</button>`).join('')}
          </div>
          ${m.type === 'prayer' ? `
            <p class="form-label" style="margin-top:16px">Welches Gebet?</p>
            ${segmented('mini-prayer', PRAYERS.map((p) => ({ id: p.id, label: p.name })), miniPrayer().id)}` : ''}
          ${m.type === 'custom' ? `
            <label class="form-label" for="mini-label" style="margin-top:16px">Dein Mini-Ziel</label>
            <input id="mini-label" class="field" data-setting="mini-label" value="${esc(m.label)}" maxlength="60" placeholder="z. B. 10 Minuten spazieren">` : ''}
          <p class="muted small" style="margin-top:12px">Im Modus steht dann: <b>${esc(miniLabel())}</b></p>
        </div>
      </section>

      <section class="card">
        <div class="card-head"><div class="card-title"><h2>Gewohnheiten</h2></div></div>
        <div class="set-list">
          ${VISIBLE_ITEMS.map((v) => toggle(visible(v.id), 'visible', v.id, v.label ?? s.clearName)).join('')}
        </div>
        <div class="card-body" style="padding-top:6px">
          <label class="form-label" for="clear-name" style="margin-top:4px">Name für ${esc(s.clearName)}</label>
          <input id="clear-name" class="field" data-setting="clear-name" value="${esc(s.clearName)}" maxlength="24" placeholder="Klar-Tage">
          <p class="muted small" style="margin-top:6px">Nimm einen Namen, der für dich passt und für andere nichts verrät.</p>
        </div>
      </section>

      <section class="card">
        <div class="card-head"><div class="card-title"><h2>Gym-Tage</h2></div></div>
        <div class="card-body">
          <div class="weekdays">
            ${WD_SHORT.map((d, i) => `<button class="wd-btn ${s.gymDays[i] ? 'on' : ''}" data-action="gym-day" data-id="${i}" aria-pressed="${!!s.gymDays[i]}" aria-label="${WEEKDAYS[i]}">${d}</button>`).join('')}
          </div>
          <p class="muted small" style="margin-top:10px">${s.gymDays.filter(Boolean).length} Gym-Tage pro Woche. Die anderen sind Ruhetage und zählen nicht als verpasst.</p>
        </div>
      </section>

      <section class="card">
        <div class="card-head"><div class="card-title"><h2>Aussehen</h2></div></div>
        <div class="card-body">
          ${segmented('theme', [{ id: 'system', label: 'Automatisch' }, { id: 'light', label: 'Hell' }, { id: 'dark', label: 'Dunkel' }], s.theme)}
        </div>
        <div class="set-list" style="padding-top:0">
          ${toggle(s.impulsePhoto, 'impulse-photo', 'photo', 'Bild hinter dem Tagesimpuls')}
        </div>
      </section>

      <section class="card">
        <div class="card-head">
          <div class="card-title"><h2>Favoriten</h2></div>
          <div class="card-meta">${favs.length || ''}</div>
        </div>
        <div class="card-body">
          ${favs.length ? favs.map((q) => `
            <div class="fav">
              <div>
                ${q.ar ? `<p class="ar fav-ar">${q.ar}</p>` : ''}
                <p>${esc(q.text)}</p>
                <p class="muted small">${esc(q.source)}</p>
              </div>
              <button class="heart on" data-action="fav-remove" data-id="${esc(q.id)}" aria-label="Aus Favoriten entfernen">${icon.heart}</button>
            </div>`).join('') : '<p class="muted">Tipp beim Tagesimpuls auf das Herz, dann landet er hier.</p>'}
        </div>
      </section>

      <section class="card">
        <div class="card-head"><div class="card-title"><h2>Kurze Pausen</h2></div></div>
        <div class="card-body">${pauseStats()}</div>
      </section>

      <section class="card">
        <div class="card-head"><div class="card-title"><h2>Daten</h2></div></div>
        <div class="card-body">
          <p class="muted small" style="margin-bottom:12px">Alles liegt nur auf diesem Gerät. Mach ab und zu ein Backup, zum Beispiel bevor du das Handy wechselst.</p>
          <div class="btn-col">
            <button class="btn secondary block" data-action="export">Backup herunterladen</button>
            <button class="btn secondary block" data-action="import">Backup einspielen</button>
            <input type="file" accept="application/json,.json" data-import hidden>
            <button class="btn ghost block danger-text" data-action="wipe">Alle Daten löschen</button>
          </div>
        </div>
      </section>

      <p class="muted small" style="text-align:center;margin:6px 0 10px">Habit · Version 1.0</p>
    </div>`;
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
    toast(i >= 0 ? 'Aus den Favoriten entfernt' : 'Als Favorit gespeichert');
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

  // Einstellungen
  visible(el) {
    const id = el.dataset.id;
    state.settings.visible[id] = !visible(id);
    persist(true);
    rerender({});
  },
  'mini-type'(el) {
    state.settings.miniGoal.type = el.dataset.id;
    persist(true);
    rerender({});
  },
  'mini-prayer'(el) {
    state.settings.miniGoal.prayer = el.dataset.id;
    persist(true);
    rerender({});
  },
  'gym-day'(el) {
    const i = Number(el.dataset.id);
    state.settings.gymDays[i] = !state.settings.gymDays[i];
    persist(true);
    rerender({});
  },
  theme(el) {
    state.settings.theme = el.dataset.id;
    persist(true);
    applyTheme();
    rerender({});
  },
  'impulse-photo'() {
    state.settings.impulsePhoto = !state.settings.impulsePhoto;
    persist(true);
    rerender({});
  },
  'fav-remove'(el) {
    state.favorites = state.favorites.filter((id) => id !== el.dataset.id);
    persist(true);
    rerender({});
    toast('Aus den Favoriten entfernt');
  },
  export() {
    exportData();
  },
  import() {
    document.querySelector('[data-import]')?.click();
  },
  wipe() {
    confirmWipe();
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
  const set = e.target.closest('[data-setting]');
  if (set) {
    const v = set.value;
    switch (set.dataset.setting) {
      case 'why': state.settings.why = v; break;
      case 'mini-label': {
        state.settings.miniGoal.label = v;
        const out = set.closest('.card-body').querySelector('b');
        if (out) out.textContent = miniLabel();
        break;
      }
      case 'clear-name': state.settings.clearName = v.trim() || 'Klar-Tage'; break;
      default: return;
    }
    persist();
    return;
  }
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

document.addEventListener('change', (e) => {
  if (e.target.matches('[data-import]') && e.target.files?.[0]) importData(e.target.files[0], e.target);
  // Namensfeld erst beim Verlassen übernehmen, damit die Liste nicht beim Tippen springt
  if (e.target.matches('[data-setting="clear-name"]')) rerender({});
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
    <p class="lead" style="text-align:center">Hier gibt es keine Streaks. Wenn du mal einen Tag verpasst, geht nichts verloren.</p>
    <label for="why-input" style="display:block;font-weight:500;margin-bottom:8px">Warum willst du wieder anfangen?</label>
    <textarea id="why-input" class="field" rows="4" placeholder="In deinen Worten" maxlength="500"></textarea>
    <p class="muted small" style="margin-top:8px">Das zeigt dir die App an schweren Tagen. Ändern kannst du es später in den Einstellungen.</p>
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
  { t: 'Trink ein großes Glas Wasser', d: 'Ganz in Ruhe.' },
  { t: '20 Liegestütze', d: 'Oder so viele, wie gehen.' },
  { t: 'Geh kurz raus', d: 'Einmal um den Block reicht.' },
  { t: 'Mach Wudu', d: 'Mit kaltem Wasser.' },
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
      <button class="btn secondary block" data-p="done" style="margin-top:14px">Mir geht’s besser</button>
    </div>`;

  const duaHtml = () => {
    const dua = PAUSE_DUAS[Math.floor(Math.random() * PAUSE_DUAS.length)];
    return `
      <h2>Gut gemacht.</h2>
      <p class="lead">Du hast dir die Pause genommen.</p>
      ${whyBlock()}
      <div class="card impulse plain" style="min-height:0;margin-top:16px">
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
    <p class="lead">Alles freiwillig. So siehst du später, wann es schwer wird.</p>
    <label class="form-label">Wo warst du?</label>
    <div class="chips" data-group="place">${PLACES.map((p) => `<button class="chip-btn" data-v="${p}">${p}</button>`).join('')}</div>
    <input class="field" data-f="place" placeholder="Oder selbst eintippen" maxlength="40" style="margin-top:8px">
    <label class="form-label">Wie hast du dich gefühlt?</label>
    <div class="chips" data-group="feeling">${FEELINGS.map((p) => `<button class="chip-btn" data-v="${p}">${p}</button>`).join('')}</div>
    <input class="field" data-f="feeling" placeholder="Oder selbst eintippen" maxlength="40" style="margin-top:8px">
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
        toast('Gespeichert.');
        break;
      }
    }
  });
}

// ---------- Backup ----------

function exportData() {
  persist(true);
  const json = JSON.stringify({ app: 'habit', exportedAt: new Date().toISOString(), ...state }, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `habit-backup-${todayKey()}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
  toast('Backup gespeichert');
}

function importData(file, input) {
  const reader = new FileReader();
  reader.onload = () => {
    input.value = '';
    let data;
    try {
      data = JSON.parse(String(reader.result));
    } catch {
      toast('Die Datei konnte nicht gelesen werden.');
      return;
    }
    if (!data || typeof data !== 'object' || !data.settings || !data.days) {
      toast('Das sieht nicht nach einem Habit-Backup aus.');
      return;
    }
    const n = Object.keys(data.days).length;
    const s = openSheet(`
      <h2>Backup einspielen?</h2>
      <p class="lead">Das Backup hat ${n === 1 ? 'einen Tag' : `${n} Tage`}. Es ersetzt alles, was gerade in der App ist.</p>
      <div class="sheet-actions">
        <button class="btn block" data-sheet="ok">Einspielen</button>
        <button class="btn ghost block" data-sheet="cancel">Abbrechen</button>
      </div>`);
    s.el.addEventListener('click', (e) => {
      const b = e.target.closest('[data-sheet]');
      if (!b) return;
      if (b.dataset.sheet === 'ok') {
        const { app, exportedAt, ...rest } = data;
        state = normalize({ ...rest, settings: { ...rest.settings, onboarded: true } });
        persist(true);
        applyTheme();
        toast('Backup eingespielt');
      }
      s.close();
      render();
    });
  };
  reader.onerror = () => toast('Die Datei konnte nicht gelesen werden.');
  reader.readAsText(file);
}

function confirmWipe() {
  const s = openSheet(`
    <h2>Alles löschen?</h2>
    <p class="lead">Alle Tage, Einstellungen, Favoriten und Pausen werden von diesem Gerät gelöscht. Das lässt sich nicht rückgängig machen. Wenn du unsicher bist, lad vorher ein Backup herunter.</p>
    <div class="sheet-actions">
      <button class="btn danger block" data-sheet="ok">Ja, alles löschen</button>
      <button class="btn ghost block" data-sheet="cancel">Abbrechen</button>
    </div>`);
  s.el.addEventListener('click', (e) => {
    const b = e.target.closest('[data-sheet]');
    if (!b) return;
    s.close();
    if (b.dataset.sheet !== 'ok') return;
    clearAll();
    state = defaultState();
    applyTheme();
    location.hash = '#/heute';
    render();
    window.scrollTo(0, 0);
    onboarding();
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
