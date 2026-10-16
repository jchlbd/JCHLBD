// ============================================================
//  জামালপুর সেন্ট্রাল হাসপাতাল — MediMap | script.js
//  Search, body-part / department / disease / doctor navigation.
//  Data comes from data.js (no changes needed there).
//
//  Deep links (use these from the main website if needed):
//    index.html#dept:neuro      → a department
//    index.html#part:brain      → a body part
//    index.html#disease:dis01   → a disease
//    index.html#doctor:d01      → a doctor profile
// ============================================================
"use strict";

// ── Doctor profile links (main website) ──────────────────────
// প্রতিটি ডাক্তারের আলাদা লিংক এখানে বসান: ডাক্তারের id → লিংক
// (অথবা data.js এ ডাক্তারের অবজেক্টে  profileUrl: "https://..."  লিখলেও চলবে)
// লিংক না দিলে নিচের ডিফল্ট appointment পেজে যাবে।
const DEFAULT_APPOINTMENT_URL = "https://jchlbd.com/doctors";
const DOCTOR_LINKS = {
  "d01": "https://jchlbd.com/doctors/prof-dr-khaja-masum-kobir;doctorNo=109",
  "d02": "https://jchlbd.com/doctors/dr-mohammad-shafiqullah-akber;doctorNo=117",
  "d03": "https://jchlbd.com/doctors/dr-md-harun-or-rashid;doctorNo=123",
  "d04": "https://jchlbd.com/doctors/dr-israt-jahan-chowdhury;doctorNo=108",
  "d05": "https://jchlbd.com/doctors/dr-asma-sarkar-shuchona;doctorNo=101",
  "d06": "https://jchlbd.com/doctors/dr-md-murshidul-haque;doctorNo=114",
  "d07": "https://jchlbd.com/doctors/dr-md-manjurul-haque;doctorNo=121",
  "d08": "https://jchlbd.com/doctors/dr-md-fazlul-karim;doctorNo=116",
  "d09": "https://jchlbd.com/doctors/dr-anjuman-ara;doctorNo=105",
  "d10": "https://jchlbd.com/doctors/dr-md-tazul-islam;doctorNo=103",
  "d11": "https://jchlbd.com/doctors/dr-md-mahmudul-hasan-biplob;doctorNo=122",
  "d12": "https://jchlbd.com/doctors/dr-s-d-tithi;doctorNo=125",
  "d13": "https://jchlbd.com/doctors/dr-sadikur-rahman-jamil;doctorNo=128",
  "d14": "https://jchlbd.com/doctors/dr-md-ismail-hossen;doctorNo=107",
  "d15": "https://jchlbd.com/doctors/dr-nazmus-sadat;doctorNo=410",
  "d16": "https://jchlbd.com/doctors/dr-polash-datta;doctorNo=127",
  "d17": "https://jchlbd.com/doctors/dr-mahfuz-alam-khan-ratul;doctorNo=729",
  "d18": "https://jchlbd.com/doctors/prof-dr-md-golam-robbani;doctorNo=118",
  //"d19": "https://jchlbd.com/doctors",
  "d20": "https://jchlbd.com/doctors/dr-abdullah-al-ragib;doctorNo=126",
  "d21": "https://jchlbd.com/doctors/dr-g-d-mondol;doctorNo=119",
  "d22": "https://jchlbd.com/doctors/dr-md-shafiul-alam-babul;doctorNo=110",
  "d23": "https://jchlbd.com/doctors/dr-md-aminul-islam;doctorNo=113",
  "d24": "https://jchlbd.com/doctors/prof-dr-sheikh-mohammad-ali-imam;doctorNo=900",
  //"d25": "https://jchlbd.com/doctors",
  "d26": "https://jchlbd.com/doctors/dr-ahmad-ali-akand;doctorNo=911",
  //"d27": "https://jchlbd.com/doctors",
  //"d28": "https://jchlbd.com/doctors",
  //"d29": "https://jchlbd.com/doctors",
  "d30": "https://jchlbd.com/doctors/dr-md-mynul-islam;doctorNo=1101",
  "d31": "https://jchlbd.com/doctors/dr-ferdousur-rahman-almahmud;doctorNo=1107",
  "d32": "https://jchlbd.com/doctors",
  "d33": "https://jchlbd.com/doctors/dr-asma-labony;doctorNo=1215",
  "d34": "https://jchlbd.com/doctors/dr-mohammad-ahmadur-rahman;doctorNo=104",
  "d35": "https://jchlbd.com/doctors/dr-md-robiul-islam-roni;doctorNo=1214",
  "d36": "https://jchlbd.com/doctors/dr-subir-gupta;doctorNo=1174",
  "d37": "https://jchlbd.com/doctors/dr-hasanul-bari-shisir;doctorNo=111",
  "d32": "https://jchlbd.com/doctors",
  "d39": "https://jchlbd.com/doctors/dr-mohammad-mahmudur-rahman;doctorNo=1187",
  "d32": "https://jchlbd.com/doctors",
  "d32": "https://jchlbd.com/doctors",
};
function doctorLink(doc) {
  return doc.profileUrl || DOCTOR_LINKS[doc.id] || DEFAULT_APPOINTMENT_URL;
}

// ── State ────────────────────────────────────────────────────
const state = { part: null, dept: null, disease: null, search: null };

let DB;            // lookup maps from data.js → buildLookups()
const els = {};    // cached DOM refs

// ── Inline SVG icons (stroke style) ──────────────────────────
const ICON = {
  user:     '<svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
  pulse:    '<svg viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>',
  building: '<svg viewBox="0 0 24 24"><rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4M12 6v6M9 9h6"/></svg>',
  clock:    '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
  pin:      '<svg viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>',
  calendar: '<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>',
  back:     '<svg viewBox="0 0 24 24"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>',
  right:    '<svg viewBox="0 0 24 24"><path d="m9 18 6-6-6-6"/></svg>',
  down:     '<svg viewBox="0 0 24 24"><path d="M12 5v14M19 12l-7 7-7-7"/></svg>',
  home:     '<svg viewBox="0 0 24 24"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
  close:    '<svg viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12"/></svg>',
};

// ── Init ─────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  DB = buildLookups();
  cacheEls();
  buildBodyPartsGrid();
  buildQuickCats();
  buildStatsBar();
  buildSuggestions();
  bindEvents();
  showWelcome(true);
  applyHash();
});

function cacheEls() {
  const q = id => document.getElementById(id);
  [
    ["searchInput", "search-input"], ["searchResults", "search-results"],
    ["searchClear", "search-clear"], ["bodyGrid", "body-parts-grid"],
    ["quickCats", "quick-cats-inner"], ["infoPanel", "info-panel"],
    ["doctorPanel", "doctor-panel"], ["diseaseDetail", "disease-detail"],
    ["welcome", "welcome-state"], ["profileOverlay", "profile-overlay"],
    ["profileModal", "profile-modal"], ["statsBar", "stats-bar"],
    ["suggestRow", "suggest-row"],
  ].forEach(([k, id]) => (els[k] = q(id)));
}

// ── Static UI ────────────────────────────────────────────────
function isPath(s) { return !!s && (s.includes("/") || /\.(png|svg|jpe?g|webp)$/i.test(s)); }

function buildBodyPartsGrid() {
  els.bodyGrid.innerHTML = BODY_PARTS.map(bp => {
    const icon = isPath(bp.icon)
      ? `<img src="${bp.icon}" alt="" width="28" height="28" onerror="this.style.display='none'">`
      : (bp.icon || "");
    return `
      <button class="bp-btn" data-act="part" data-id="${bp.id}" title="${esc(bp.name)}" aria-label="${esc(bp.name)}">
        <span class="bp-icon">${icon}</span>
        <span class="bp-label">${bp.name}</span>
      </button>`;
  }).join("");
}

function buildQuickCats() {
  els.quickCats.innerHTML = DEPARTMENTS.map(d =>
    `<button class="cat-chip" data-act="dept" data-id="${d.id}">${d.name}</button>`
  ).join("");
}

function buildStatsBar() {
  const items = [
    { icon: ICON.user,     val: DOCTORS.length,     lbl: "জন বিশেষজ্ঞ ডাক্তার" },
    { icon: ICON.pulse,    val: DISEASES.length,    lbl: "টি রোগের তথ্য" },
    { icon: ICON.building, val: DEPARTMENTS.length, lbl: "টি বিভাগ" },
  ];
  els.statsBar.innerHTML = items.map(i => `
    <div class="stat-card">
      <span class="stat-icon">${i.icon}</span>
      <div><div class="stat-val">${i.val}</div><div class="stat-lbl">${i.lbl}</div></div>
    </div>`).join("");
}

// Popular searches — only terms that really exist in the data are shown
function buildSuggestions() {
  const terms = ["মাথাব্যথা", "ডায়াবেটিস", "জ্বর", "হাঁপানি", "কিডনি", "পাথর", "গ্যাস্ট্রিক", "বুকে ব্যথা"];
  const ok = terms.filter(t => {
    const r = runSearch(t);
    return r.diseases.length || r.doctors.length || r.depts.length;
  }).slice(0, 6);
  if (!ok.length) { els.suggestRow.style.display = "none"; return; }
  els.suggestRow.innerHTML = ok.map(t => `<button class="suggest-chip" data-term="${esc(t)}">${t}</button>`).join("");
}

// ── Events ───────────────────────────────────────────────────
function bindEvents() {
  els.searchInput.addEventListener("input", onSearchInput);
  els.searchInput.addEventListener("focus", onSearchInput);
  els.searchInput.addEventListener("keydown", onSearchKey);

  els.searchClear.addEventListener("click", () => {
    els.searchInput.value = "";
    els.searchClear.classList.remove("visible");
    closeSearch();
    els.searchInput.focus();
  });

  els.suggestRow.addEventListener("click", e => {
    const chip = e.target.closest(".suggest-chip");
    if (!chip) return;
    els.searchInput.value = chip.dataset.term;
    els.searchClear.classList.add("visible");
    showSearchResults(chip.dataset.term);
  });

  // One delegated handler for every [data-act] element on the page
  document.addEventListener("click", e => {
    if (!e.target.closest(".search-wrap") && !e.target.closest(".suggest-chip")) closeSearch();

    if (e.target === els.profileOverlay) { closeProfile(); return; }

    const el = e.target.closest("[data-act]");
    if (!el) return;
    const { act, id } = el.dataset;
    switch (act) {
      case "part":      selectBodyPart(id); break;
      case "dept":      selectDepartment(id); break;
      case "disease":   closeProfile(true); showDiseaseDetail(id); break;
      case "doctor":    openDoctorProfile(id); break;
      case "home":      showWelcome(); break;
      case "back":      goBackFromDisease(); break;
      case "close":     closeProfile(); break;
      case "to-doctors": scrollToEl(els.doctorPanel); break;
    }
  });

  document.addEventListener("keydown", e => {
    if (e.key === "Escape") {
      if (els.profileOverlay.classList.contains("open")) closeProfile();
      else closeSearch();
    }
  });
}

// ── Hash routing ─────────────────────────────────────────────
function currentHash() {
  if (state.disease) return "disease:" + state.disease;
  if (state.part)    return "part:" + state.part;
  if (state.dept)    return "dept:" + state.dept;
  return "";
}
function setHash(h) {
  try {
    history.replaceState(null, "", h ? "#" + h : location.pathname + location.search);
  } catch (_) { /* file:// or sandbox — ignore */ }
}
function applyHash() {
  const raw = decodeURIComponent(location.hash.replace(/^#/, ""));
  if (!raw) return;
  const [type, id] = raw.split(":");
  const opts = { noScroll: true };
  if (type === "dept"    && DB.deptMap[id])    selectDepartment(id, opts);
  if (type === "part"    && DB.partMap[id])    selectBodyPart(id, opts);
  if (type === "disease" && DB.diseaseMap[id]) showDiseaseDetail(id, opts);
  if (type === "doctor"  && DB.doctorMap[id])  openDoctorProfile(id);
}

// ── SEARCH ───────────────────────────────────────────────────
function onSearchInput() {
  const q = els.searchInput.value.trim();
  els.searchClear.classList.toggle("visible", q.length > 0);
  if (!q) { closeSearch(); return; }
  let res;
  try { res = runSearch(q); }
  catch (err) { console.error("MediMap search error:", err); res = { diseases: [], doctors: [], depts: [] }; }
  renderSearchResults(res, q);
}

function onSearchKey(e) {
  if (e.key === "Enter") {
    const q = els.searchInput.value.trim();
    const focused = els.searchResults.querySelector(".sr-item.focus");
    e.preventDefault();
    if (focused) { focused.click(); return; }
    if (q) showSearchResults(q);
    return;
  }
  const items = [...els.searchResults.querySelectorAll(".sr-item")];
  if (!items.length || !els.searchResults.classList.contains("open")) return;
  let i = items.findIndex(x => x.classList.contains("focus"));
  if (e.key === "ArrowDown") { e.preventDefault(); i = (i + 1) % items.length; }
  else if (e.key === "ArrowUp") { e.preventDefault(); i = (i - 1 + items.length) % items.length; }
  else return;
  items.forEach(x => x.classList.remove("focus"));
  items[i].classList.add("focus");
  items[i].scrollIntoView({ block: "nearest" });
}

// Normalise text so Bangla typed with different keyboards (Avro, Bijoy, phone…)
// still matches the data: NFC, য়/ড়/ঢ় variants, zero-width chars, case, spaces.
function norm(v) {
  return String(v == null ? "" : v)
    .normalize("NFC")
    .replace(/\u09DF/g, "\u09AF\u09BC")   // য় (single code point) → য + নুক্তা
    .replace(/\u09DC/g, "\u09A1\u09BC")   // ড়
    .replace(/\u09DD/g, "\u09A2\u09BC")   // ঢ়
    .replace(/[\u200B-\u200D\uFEFF]/g, "") // ZWSP / ZWNJ / ZWJ
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

// Every word typed must be found somewhere in the item's searchable text
function matches(tokens, haystack) {
  return tokens.every(t => haystack.includes(t));
}

function runSearch(q, all) {
  const tokens = norm(q).split(" ").filter(Boolean);
  if (!tokens.length) return { diseases: [], doctors: [], depts: [] };

  const diseases = DISEASES.filter(d => {
    const part = DB.partMap[d.bodyPart];
    const dept = DB.deptMap[d.department];
    return matches(tokens, norm([
      d.name, d.nameEn, (d.keywords || []).join(" "),
      part ? part.name : "", dept ? dept.name : "",
    ].join(" ")));
  });

  const doctors = DOCTORS.filter(d => {
    const depts = toArray(d.departments).map(id => DB.deptMap[id]).filter(Boolean).map(x => x.name).join(" ");
    return matches(tokens, norm([
      d.name, d.designation, d.degrees, d.chamber, depts,
    ].join(" ")));
  });

  const depts = DEPARTMENTS.filter(d =>
    matches(tokens, norm([d.name, d.id, d.nameEn].join(" ")))
  );

  if (all) return { diseases, doctors, depts };
  return { diseases: diseases.slice(0, 6), doctors: doctors.slice(0, 4), depts: depts.slice(0, 4) };
}

function renderSearchResults({ diseases, doctors, depts }, q) {
  if (!diseases.length && !doctors.length && !depts.length) {
    els.searchResults.innerHTML =
      `<div class="sr-empty">"<strong>${esc(q)}</strong>" — কোনো ফলাফল পাওয়া যায়নি। অন্য শব্দ দিয়ে চেষ্টা করুন।</div>`;
    els.searchResults.classList.add("open");
    return;
  }
  const row = (act, id, icon, name, meta) => `
    <div class="sr-item" role="option" data-sr="${act}" data-id="${id}">
      <span class="sr-item-icon">${icon}</span>
      <div><div class="sr-item-name">${name}</div><div class="sr-item-meta">${meta}</div></div>
    </div>`;

  let html = "";
  if (diseases.length) {
    html += `<div class="sr-section-label">রোগ / লক্ষণ</div>`;
    diseases.forEach(d => {
      const dept = DB.deptMap[d.department];
      html += row("disease", d.id, ICON.pulse, d.name, `${dept ? dept.name : ""}${d.nameEn ? " · " + d.nameEn : ""}`);
    });
  }
  if (doctors.length) {
    html += `<div class="sr-section-label">ডাক্তার</div>`;
    doctors.forEach(d => {
      const first = DB.deptMap[toArray(d.departments)[0]];
      html += row("doctor", d.id, ICON.user, d.name, `${first ? first.name : ""}${d.chamber ? " · কক্ষ " + d.chamber : ""}`);
    });
  }
  if (depts.length) {
    html += `<div class="sr-section-label">বিভাগ</div>`;
    depts.forEach(d => { html += row("dept", d.id, ICON.building, d.name, "বিভাগ"); });
  }
  els.searchResults.innerHTML = html;
  els.searchResults.classList.add("open");

  els.searchResults.querySelectorAll(".sr-item").forEach(item => {
    item.addEventListener("click", () => {
      const { sr, id } = item.dataset;
      closeSearch();
      els.searchInput.value = "";
      els.searchClear.classList.remove("visible");
      if (sr === "disease") showDiseaseDetail(id);
      else if (sr === "doctor") openDoctorProfile(id);
      else if (sr === "dept") selectDepartment(id);
    });
  });
}

function closeSearch() { els.searchResults.classList.remove("open"); }

// Full results view (chip click / Enter key)
function showSearchResults(q, opts = {}) {
  q = (q || "").trim();
  if (!q) return;
  closeSearch();
  els.searchInput.blur();
  const { diseases, doctors, depts } = runSearch(q, true);

  if (!diseases.length && !doctors.length && depts.length === 1) { selectDepartment(depts[0].id); return; }

  state.part = null; state.dept = null; state.disease = null; state.search = q;
  markActive();

  const deptChips = depts.length
    ? `<div class="section-title">বিভাগ</div><div class="cats-grid" style="margin-bottom:18px">${depts.map(d => `<button class="cat-chip" data-act="dept" data-id="${d.id}">${d.name}</button>`).join("")}</div>`
    : "";

  renderInfoPanel({
    iconHTML: ICON.pulse,
    title: `"${esc(q)}" — অনুসন্ধানের ফলাফল`,
    sub: `${diseases.length}টি রোগ  ·  ${doctors.length} জন ডাক্তার`,
    crumb: "অনুসন্ধান",
    listTitle: `সম্পর্কিত রোগসমূহ (${diseases.length})`,
    diseases, showDept: true,
    emptyText: "কোনো রোগ পাওয়া যায়নি। অন্য শব্দ দিয়ে চেষ্টা করুন।",
  });
  if (deptChips) els.infoPanel.querySelector(".panel-body").insertAdjacentHTML("afterbegin", deptChips);
  renderDoctorPanel(`"${esc(q)}" — সংশ্লিষ্ট ডাক্তার`, doctors);
  els.diseaseDetail.classList.remove("visible");
  setHash("");
  if (!opts.noScroll) scrollToEl(els.infoPanel);
}

// ── BODY PART ────────────────────────────────────────────────
function selectBodyPart(partId, opts = {}) {
  const part = DB.partMap[partId];
  if (!part) return;
  state.part = partId; state.dept = null; state.disease = null; state.search = null;
  markActive();

  const depts = part.departments.map(id => DB.deptMap[id]).filter(Boolean);
  const diseases = DB.diseasesByPart[partId] || [];

  renderInfoPanel({
    iconHTML: isPath(part.icon) ? `<img src="${part.icon}" alt="">` : ICON.pulse,
    title: part.name,
    sub: depts.map(d => d.name).join("  ·  "),
    crumb: part.name,
    listTitle: `সম্পর্কিত রোগসমূহ (${diseases.length})`,
    diseases, showDept: true,
    emptyText: "এই অংশে কোনো রোগের তথ্য নেই।",
  });
  renderDoctorPanel(`${part.name} — সংশ্লিষ্ট ডাক্তার`, getDoctorsForPart(partId));
  els.diseaseDetail.classList.remove("visible");

  setHash(currentHash());
  if (!opts.noScroll) scrollToEl(els.infoPanel);
}

// ── DEPARTMENT ───────────────────────────────────────────────
function selectDepartment(deptId, opts = {}) {
  const dept = DB.deptMap[deptId];
  if (!dept) return;
  state.part = null; state.dept = deptId; state.disease = null; state.search = null;
  markActive();

  const diseases = DB.diseasesByDept[deptId] || [];
  const doctors = DB.doctorsByDept[deptId] || [];

  renderInfoPanel({
    iconHTML: isPath(dept.icon) ? `<img src="${dept.icon}" alt="">` : ICON.building,
    title: dept.name,
    sub: `${diseases.length}টি রোগ  ·  ${doctors.length} জন ডাক্তার`,
    crumb: dept.name,
    listTitle: `চিকিৎসাযোগ্য রোগসমূহ (${diseases.length})`,
    diseases, showDept: false,
    emptyText: "এই বিভাগের রোগের তথ্য এখনো যোগ করা হয়নি।",
  });
  renderDoctorPanel(`${dept.name} — ডাক্তারগণ`, doctors);
  els.diseaseDetail.classList.remove("visible");

  setHash(currentHash());
  if (!opts.noScroll) scrollToEl(els.infoPanel);
}

function markActive() {
  document.querySelectorAll(".bp-btn").forEach(b => b.classList.toggle("active", b.dataset.id === state.part));
  document.querySelectorAll(".cat-chip").forEach(c => c.classList.toggle("active", c.dataset.id === state.dept));
}

function renderInfoPanel({ iconHTML, title, sub, crumb, listTitle, diseases, showDept, emptyText }) {
  els.welcome.style.display = "none";
  els.infoPanel.innerHTML = `
    <div class="panel-hero">
      <span class="panel-hero-icon">${iconHTML}</span>
      <div>
        <div class="panel-hero-title">${title}</div>
        <div class="panel-hero-sub">${sub}</div>
      </div>
    </div>
    <div class="panel-body">
      ${breadcrumb([{ label: crumb }])}
      <div class="section-title">${listTitle}</div>
      ${diseases.length
        ? `<div class="disease-grid">${diseases.map(d => renderDiseaseCard(d, showDept)).join("")}</div>`
        : `<p class="pm-no-tests">${emptyText}</p>`}
    </div>`;
  els.infoPanel.classList.add("visible");
}

function breadcrumb(trail) {
  // trail: [{label, act?, id?}] — last item is the current page
  const parts = [`<span class="bc-item" data-act="home">${ICON.home.replace("<svg", '<svg style="width:14px;height:14px;vertical-align:-2px;color:inherit"')} হোম</span>`];
  trail.forEach((t, i) => {
    parts.push(ICON.right);
    parts.push(i === trail.length - 1
      ? `<span class="bc-current">${t.label}</span>`
      : `<span class="bc-item" data-act="${t.act}" data-id="${t.id}">${t.label}</span>`);
  });
  return `<nav class="breadcrumb" aria-label="breadcrumb">${parts.join("")}</nav>`;
}

// ── DISEASE DETAIL ───────────────────────────────────────────
function showDiseaseDetail(diseaseId, opts = {}) {
  const disease = DB.diseaseMap[diseaseId];
  if (!disease) return;

  // Opened from search / profile with no list on screen → show its department first
  if (!state.part && !state.dept && !state.search) selectDepartment(disease.department, { noScroll: true });

  state.disease = diseaseId;
  const dept = DB.deptMap[disease.department];
  const part = DB.partMap[disease.bodyPart];
  const doctors = DOCTORS.filter(d => d.diseases.includes(diseaseId));

  const trail = [];
  if (state.part && DB.partMap[state.part]) trail.push({ label: DB.partMap[state.part].name, act: "part", id: state.part });
  else if (state.search) trail.push({ label: "অনুসন্ধান", act: "back" });
  else if (dept) trail.push({ label: dept.name, act: "dept", id: dept.id });
  trail.push({ label: disease.name });

  els.diseaseDetail.innerHTML = `
    <div class="dd-top">
      <button class="back-btn" data-act="back">${ICON.back} পেছনে যান</button>
      ${breadcrumb(trail)}
      <div class="dd-title">${disease.name}</div>
      <div class="dd-en">${disease.nameEn}</div>
      <div class="badge-row">
        ${dept ? `<span class="badge badge-blue">${dept.name}</span>` : ""}
        ${part ? `<span class="badge badge-green">${part.name}</span>` : ""}
        <span class="badge badge-alert">${doctors.length} জন ডাক্তার</span>
      </div>
    </div>
    <div class="dd-body">
      <div class="section-title">সম্পর্কিত শব্দ</div>
      <div class="kw-row">${disease.keywords.map(k => `<span class="kw">${k}</span>`).join("")}</div>
      ${doctors.length ? `<button class="jump-btn" data-act="to-doctors">ডাক্তারদের দেখুন ${ICON.down}</button>` : ""}
    </div>`;
  els.diseaseDetail.classList.add("visible");

  document.querySelectorAll(".disease-card").forEach(c =>
    c.classList.toggle("active", c.dataset.id === diseaseId));

  renderDoctorPanel(`"${disease.name}" — চিকিৎসাকারী ডাক্তার`, doctors);

  setHash(currentHash());
  if (!opts.noScroll) scrollToEl(els.diseaseDetail);
}

function goBackFromDisease() {
  state.disease = null;
  els.diseaseDetail.classList.remove("visible");
  document.querySelectorAll(".disease-card").forEach(c => c.classList.remove("active"));
  if (state.part) {
    renderDoctorPanel(`${DB.partMap[state.part].name} — সংশ্লিষ্ট ডাক্তার`, getDoctorsForPart(state.part));
  } else if (state.dept) {
    renderDoctorPanel(`${DB.deptMap[state.dept].name} — ডাক্তারগণ`, DB.doctorsByDept[state.dept] || []);
  } else if (state.search) {
    showSearchResults(state.search); return;
  }
  setHash(currentHash());
  scrollToEl(els.infoPanel);
}

function getDoctorsForPart(partId) {
  const part = DB.partMap[partId];
  if (!part) return [];
  const all = [];
  part.departments.forEach(did => {
    (DB.doctorsByDept[did] || []).forEach(doc => {
      if (!all.find(d => d.id === doc.id)) all.push(doc);
    });
  });
  return all;
}

// ── DOCTOR PANEL ─────────────────────────────────────────────
function renderDoctorPanel(title, doctors) {
  if (!doctors || !doctors.length) { els.doctorPanel.classList.remove("visible"); return; }
  els.doctorPanel.innerHTML = `
    <div class="dp-header">
      <div class="dp-title">${title}</div>
      <span class="dp-count">${doctors.length} জন</span>
    </div>
    <div class="doctor-cards">${doctors.map(renderDoctorCard).join("")}</div>`;
  els.doctorPanel.classList.add("visible");
}

function renderDoctorCard(doc) {
  const depts = toArray(doc.departments).map(id => DB.deptMap[id]).filter(Boolean);
  const sched = (doc.schedule || []).slice(0, 2).map(s => `
    <div class="sch-row">${ICON.clock}<div><span class="sch-day">${s.day}</span> <span class="sch-time">${s.time}</span></div></div>`).join("");

  return `
    <button class="doctor-card" data-act="doctor" data-id="${doc.id}">
      <div class="doc-card-header">
        <div class="doc-avatar">${avatarHTML(doc)}</div>
        <div>
          <div class="doc-name">${doc.name}</div>
          <div class="doc-desig">${doc.designation}</div>
        </div>
      </div>
      <div class="doc-card-body">
        <div class="doc-tags">${depts.map(d => `<span class="doc-dept-tag">${d.name}</span>`).join("")}</div>
        ${sched}
        <div class="doc-room">
          <span>কক্ষ <b>${doc.chamber || "—"}</b></span>
          <span class="doc-view">বিস্তারিত ${ICON.right}</span>
        </div>
      </div>
    </button>`;
}

// ── DOCTOR PROFILE MODAL ─────────────────────────────────────
function openDoctorProfile(docId) {
  const doc = DB.doctorMap[docId];
  if (!doc) return;
  const depts = toArray(doc.departments).map(id => DB.deptMap[id]).filter(Boolean);
  const diseases = (doc.diseases || []).map(id => DB.diseaseMap[id]).filter(Boolean);

  const schedRows = (doc.schedule || []).map(s =>
    `<tr><td class="t-strong">${s.day}</td><td>${s.time}</td></tr>`).join("");

  const testsHTML = doc.tests && doc.tests.length
    ? `<table class="pm-table">
         <thead><tr><th>টেস্টের নাম</th><th class="t-price">মূল্য (টাকা)</th></tr></thead>
         <tbody>${doc.tests.map(t => `<tr><td>${t.name}</td><td class="t-price">৳ ${t.price}</td></tr>`).join("")}</tbody>
       </table>`
    : "";

  let feeHTML = "";
  if (doc.visitFee) {
    feeHTML = typeof doc.visitFee === "object"
      ? `<div class="pm-visit-fee-wrap">
           <div class="pm-visit-row pm-visit-new"><span class="pm-visit-type">নতুন রোগী</span><span class="pm-visit-price">৳ ${doc.visitFee.new}</span></div>
           <div class="pm-visit-divider"></div>
           <div class="pm-visit-row pm-visit-old"><span class="pm-visit-type">পুরাতন রোগী</span><span class="pm-visit-price">৳ ${doc.visitFee.old}</span></div>
         </div>
         ${doc.visitFee.note ? `<p class="pm-visit-note">${doc.visitFee.note}</p>` : ""}`
      : `<div class="pm-visit-fee-wrap"><div class="pm-visit-row pm-visit-new"><span class="pm-visit-type">ডাক্তার ভিজিট</span><span class="pm-visit-price">৳ ${doc.visitFee}</span></div></div>`;
  }

  els.profileModal.innerHTML = `
    <div class="pm-hero">
      <div class="pm-avatar">${avatarHTML(doc, true)}</div>
      <div>
        <div class="pm-name">${doc.name}</div>
        <div class="pm-desig">${doc.designation}</div>
        <div class="pm-deg">${doc.degrees || ""}</div>
      </div>
      <button class="pm-close" data-act="close" aria-label="বন্ধ করুন">${ICON.close}</button>
    </div>

    <div class="pm-body">
      <div class="pm-section">
        <div class="pm-section-title">বিভাগ ও কক্ষ</div>
        <div class="pm-chip-row">
          ${depts.length ? depts.map(d => `<span class="pm-dept-badge">${d.name}</span>`).join("") : `<span class="pm-dept-badge">বিভাগ নির্ধারিত নয়</span>`}
          <span class="pm-room">${ICON.pin} কক্ষ ${doc.chamber || "—"}</span>
        </div>
      </div>

      <div class="pm-section">
        <div class="pm-section-title">চেম্বার সময়সূচি</div>
        <table class="pm-table">
          <thead><tr><th>বার</th><th>সময়</th></tr></thead>
          <tbody>${schedRows}</tbody>
        </table>
      </div>

      ${diseases.length ? `
      <div class="pm-section">
        <div class="pm-section-title">চিকিৎসাযোগ্য রোগসমূহ (${diseases.length}টি)</div>
        <div class="pm-disease-tags">
          ${diseases.map(d => `<button class="pm-disease-tag" data-act="disease" data-id="${d.id}" title="${esc(d.nameEn)}">${d.name}</button>`).join("")}
        </div>
      </div>` : ""}

      ${testsHTML ? `<div class="pm-section"><div class="pm-section-title">টেস্টসমূহ ও মূল্য</div>${testsHTML}</div>` : ""}

      ${feeHTML ? `<div class="pm-section"><div class="pm-section-title">ভিজিট ফি</div>${feeHTML}</div>` : ""}
      
      <a class="pm-appointment-btn" href="${esc(doctorLink(doc))}" target="_blank" rel="noopener noreferrer">
        ${ICON.calendar} সিরিয়াল নিন
      </a>
    </div>`;

  els.profileOverlay.classList.add("open");
  document.body.classList.add("modal-open");
  els.profileModal.scrollTop = 0;
  setHash("doctor:" + docId);
}

function closeProfile(keepHash) {
  if (!els.profileOverlay.classList.contains("open")) return;
  els.profileOverlay.classList.remove("open");
  document.body.classList.remove("modal-open");
  if (!keepHash) setHash(currentHash());
}

// ── WELCOME ──────────────────────────────────────────────────
function showWelcome(initial) {
  state.part = state.dept = state.disease = state.search = null;
  markActive();
  els.infoPanel.classList.remove("visible");
  els.doctorPanel.classList.remove("visible");
  els.diseaseDetail.classList.remove("visible");
  els.welcome.style.display = "block";
  if (!initial) { setHash(""); window.scrollTo({ top: 0, behavior: "smooth" }); }
}

// ── HELPERS ──────────────────────────────────────────────────
function renderDiseaseCard(d, showDept) {
  const dept = DB.deptMap[d.department];
  return `
    <button class="disease-card${state.disease === d.id ? " active" : ""}" data-act="disease" data-id="${d.id}">
      <div class="dc-name">${d.name}</div>
      ${showDept && dept ? `<div class="dc-dept">${dept.name}</div>` : ""}
      <div class="dc-en">${d.nameEn}</div>
    </button>`;
}

function avatarHTML(doc, large) {
  const initial = (doc.name.replace(/^(অধ্যাপক|সহযোগী অধ্যাপক|সহকারী অধ্যাপক|ডাঃ)\s*/g, "").replace("ডাঃ ", "").trim()[0]) || "ড";
  if (!doc.photo) return `<span>${initial}</span>`;
  return `<img src="${doc.photo}" alt="${esc(doc.name)}" loading="lazy"
            onerror="this.replaceWith(Object.assign(document.createElement('span'),{textContent:'${initial}'}))">`;
}

function toArray(v) { return Array.isArray(v) ? v : (v == null ? [] : [v]); }

function esc(str) {
  return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function scrollToEl(el) {
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY - 16;
  window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
}

// Kept global for backward compatibility
window.showWelcome = showWelcome;
window.closeProfile = closeProfile;
window.selectBodyPart = selectBodyPart;
window.selectDepartment = selectDepartment;
window.showDiseaseDetail = showDiseaseDetail;
window.goBackFromDisease = goBackFromDisease;
