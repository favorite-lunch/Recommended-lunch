const STORAGE_KEY = "jimbocho-lunch-restaurants";
const BATTLE_LOG_KEY = "jimbocho-lunch-battle-log";
const K_FACTOR = 32;
const INITIAL_RATING = 1500;
const RETRAIN_INTERVAL = 5;
const RECOMMEND_COUNT = 5;

const GENRE_EMOJI = {
  "カレー": "🍛",
  "インドカレー": "🍛",
  "洋食": "🍳",
  "そば": "🍜",
  "うどん": "🍜",
  "洋食・喫茶": "☕",
  "寿司": "🍣",
  "タイ料理": "🍲",
  "インド料理": "🍛",
  "フレンチ": "🥖",
  "ラーメン": "🍜",
  "中華": "🥟",
  "焼肉": "🥩",
  "とんかつ": "🍱",
  "餃子": "🥟",
  "天丼": "🍤",
  "定食": "🍚",
  "イタリアン": "🍝",
  "韓国料理": "🍲",
  "ベトナム料理": "🍲",
  "ハンバーグ・ステーキ": "🥩",
  "和食": "🍱",
  "ビアホール・洋食": "🍺",
  "ベーカリーカフェ": "🥐",
  "カフェ": "☕"
};

let restaurants = [];
let currentPair = [];
let battleLog = [];
let mlModel = null;

function loadData() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    restaurants = JSON.parse(raw);
  } else {
    restaurants = initialRestaurants.map((r) => ({
      ...r,
      rating: INITIAL_RATING,
      matches: 0
    }));
    saveData();
  }
}

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(restaurants));
}

function findRestaurant(id) {
  return restaurants.find((r) => r.id === id);
}

// ---------- 気分・対戦ログ ----------
function loadBattleLog() {
  const raw = localStorage.getItem(BATTLE_LOG_KEY);
  battleLog = raw ? JSON.parse(raw) : [];
}

function saveBattleLog() {
  localStorage.setItem(BATTLE_LOG_KEY, JSON.stringify(battleLog));
}

function getCurrentMood() {
  return {
    hunger: Number(document.getElementById("mood-hunger").value),
    sweet: Number(document.getElementById("mood-sweet").value)
  };
}

// 神田錦町・神保町エリア付近の座標で現在の気温・湿度・天候をOpen-Meteo(APIキー不要)から取得
const WEATHER_API_URL =
  "https://api.open-meteo.com/v1/forecast?latitude=35.694&longitude=139.758&current=temperature_2m,relative_humidity_2m,weather_code&timezone=Asia%2FTokyo";
const DEFAULT_WEATHER = { temperature: 20, humidity: 50, weatherCode: 1 };
let currentWeather = { ...DEFAULT_WEATHER };

async function fetchWeather() {
  try {
    const res = await fetch(WEATHER_API_URL);
    const data = await res.json();
    currentWeather = {
      temperature: data.current.temperature_2m,
      humidity: data.current.relative_humidity_2m,
      weatherCode: data.current.weather_code
    };
  } catch (e) {
    currentWeather = { ...DEFAULT_WEATHER };
  }
  renderAutoContextNote();
}

function renderAutoContextNote() {
  const note = document.getElementById("auto-context-note");
  if (!note) return;
  const dowNames = ["日", "月", "火", "水", "木", "金", "土"];
  const auto = getAutoContext();
  const category = WEATHER_CATEGORIES[weatherCodeToCategory(currentWeather.weatherCode)];
  note.textContent = `自動取得: ${dowNames[auto.dow]}曜日 / 気温${currentWeather.temperature}℃ / 湿度${currentWeather.humidity}% / ${category}`;
}

function recordBattle(aId, bId, scoreA) {
  battleLog.push({
    timestamp: Date.now(),
    aId,
    bId,
    scoreA,
    mood: getCurrentMood(),
    auto: getAutoContext(),
    weather: currentWeather
  });
  saveBattleLog();

  if (isMlAvailable() && battleLog.length % RETRAIN_INTERVAL === 0) {
    retrainModel();
  }
}

async function initModel() {
  if (!isMlAvailable()) return;
  mlModel = await loadOrCreateModel();
}

async function retrainModel() {
  if (!isMlAvailable()) return;
  if (!mlModel) mlModel = await loadOrCreateModel();
  mlModel = await trainModel(mlModel, battleLog, restaurants);
}

// ---------- Elo ----------
function expectedScore(ratingA, ratingB) {
  return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
}

function applyResult(idA, idB, scoreA) {
  const a = findRestaurant(idA);
  const b = findRestaurant(idB);
  const expectedA = expectedScore(a.rating, b.rating);
  const expectedB = expectedScore(b.rating, a.rating);
  const scoreB = 1 - scoreA;
  a.rating = Math.round(a.rating + K_FACTOR * (scoreA - expectedA));
  b.rating = Math.round(b.rating + K_FACTOR * (scoreB - expectedB));
  a.matches += 1;
  b.matches += 1;
  saveData();
  recordBattle(idA, idB, scoreA);
}

// ---------- 対戦タブ ----------
function pickPair() {
  if (restaurants.length < 2) {
    currentPair = [];
    return;
  }
  const i = Math.floor(Math.random() * restaurants.length);
  let j = Math.floor(Math.random() * (restaurants.length - 1));
  if (j >= i) j += 1;
  currentPair = [restaurants[i].id, restaurants[j].id];
}

function renderBattleCard(el, restaurant, scoreLabel) {
  el.innerHTML = "";
  if (!restaurant) {
    el.textContent = "お店が登録されていません";
    return;
  }

  if (scoreLabel) {
    const badge = document.createElement("div");
    badge.className = "score-badge";
    badge.textContent = scoreLabel;
    el.appendChild(badge);
  }

  const photo = document.createElement("div");
  photo.className = "photo";
  if (restaurant.image) {
    const img = document.createElement("img");
    img.src = restaurant.image;
    img.alt = restaurant.name;
    img.onerror = () => {
      photo.innerHTML = GENRE_EMOJI[restaurant.genre] || "🍽️";
    };
    photo.appendChild(img);
  } else {
    photo.textContent = GENRE_EMOJI[restaurant.genre] || "🍽️";
  }

  const info = document.createElement("div");
  info.className = "info";
  info.innerHTML = `
    <span class="genre">${escapeHtml(restaurant.genre || "")}</span>
    <h3>${escapeHtml(restaurant.name)}</h3>
    <p class="dish">${escapeHtml(restaurant.dish || "")}</p>
    <p class="price">${escapeHtml(restaurant.price || "")}</p>
    <p class="note">${escapeHtml(restaurant.note || "")}</p>
    ${restaurant.url ? `<p class="link"><a href="${escapeAttr(restaurant.url)}" target="_blank" rel="noopener">お店のサイトを見る ↗</a></p>` : ""}
  `;
  const link = info.querySelector(".link a");
  if (link) {
    link.addEventListener("click", (e) => e.stopPropagation());
  }

  el.appendChild(photo);
  el.appendChild(info);
}

function renderBattle() {
  if (currentPair.length < 2) {
    pickPair();
  }
  const cardA = document.getElementById("card-a");
  const cardB = document.getElementById("card-b");
  if (currentPair.length < 2) {
    renderBattleCard(cardA, null);
    renderBattleCard(cardB, null);
    return;
  }
  renderBattleCard(cardA, findRestaurant(currentPair[0]));
  renderBattleCard(cardB, findRestaurant(currentPair[1]));
}

function nextBattle() {
  pickPair();
  renderBattle();
}

function setupBattleHandlers() {
  document.getElementById("card-a").addEventListener("click", () => {
    if (currentPair.length < 2) return;
    applyResult(currentPair[0], currentPair[1], 1);
    nextBattle();
    renderRanking();
  });
  document.getElementById("card-b").addEventListener("click", () => {
    if (currentPair.length < 2) return;
    applyResult(currentPair[1], currentPair[0], 1);
    nextBattle();
    renderRanking();
  });
  document.getElementById("btn-draw").addEventListener("click", () => {
    if (currentPair.length < 2) return;
    applyResult(currentPair[0], currentPair[1], 0.5);
    nextBattle();
    renderRanking();
  });
  document.getElementById("btn-skip").addEventListener("click", () => {
    nextBattle();
  });
}

// ---------- 今のおすすめタブ ----------
// 空腹度が高いほどボリューム系、低いほど軽め系を優先。気温が低い日は温かい物、高い日は冷たい/軽い物を軽く優先
const HEAVY_GENRES = ["焼肉", "とんかつ", "ハンバーグ・ステーキ", "中華", "カレー", "インドカレー", "ラーメン", "天丼", "ビアホール・洋食", "餃子"];
const LIGHT_GENRES = ["そば", "うどん", "寿司", "洋食・喫茶", "カフェ", "和食", "ベーカリーカフェ"];
const SWEET_GENRES = ["カフェ", "ベーカリーカフェ", "洋食・喫茶"];

function ruleBasedRecommendations(mood) {
  const scored = restaurants.map((r) => {
    let score = 0;
    if (mood.hunger >= 4 && HEAVY_GENRES.includes(r.genre)) score += 2;
    if (mood.hunger <= 2 && LIGHT_GENRES.includes(r.genre)) score += 2;
    if (mood.sweet >= 4 && SWEET_GENRES.includes(r.genre)) score += 2;
    if (currentWeather.temperature <= 10 && HEAVY_GENRES.includes(r.genre)) score += 1;
    if (currentWeather.temperature >= 28 && LIGHT_GENRES.includes(r.genre)) score += 1;
    score += r.rating / 1000; // 同点時はレーティングでタイブレーク
    return { restaurant: r, score };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, RECOMMEND_COUNT);
}

function mlRecommendations(mood) {
  const auto = getAutoContext();
  const scores = predictScores(mlModel, restaurants, mood, auto, currentWeather);
  if (!scores) return null;
  const byId = new Map(scores.map((s) => [s.id, s.score]));
  const scored = restaurants.map((r) => ({ restaurant: r, score: byId.get(r.id) }));
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, RECOMMEND_COUNT);
}

function renderRecommendations(items, scoreFormatter) {
  const container = document.getElementById("recommend-results");
  container.innerHTML = "";
  items.forEach(({ restaurant, score }) => {
    const card = document.createElement("div");
    card.className = "battle-card recommend-card";
    renderBattleCard(card, restaurant, scoreFormatter(score));
    container.appendChild(card);
  });
}

async function showRecommendations() {
  const mood = getCurrentMood();
  const note = document.getElementById("recommend-mode-note");
  const usableMl = isMlAvailable() && battleLog.length >= MIN_BATTLES_FOR_ML;

  if (usableMl) {
    if (!mlModel) await initModel();
    const results = mlRecommendations(mood);
    if (results) {
      note.textContent = `対戦データ${battleLog.length}件から学習したAIモデルでおすすめ中`;
      renderRecommendations(results, (s) => `推薦度 ${s.toFixed(2)}`);
      return;
    }
  }

  const reason = isMlAvailable()
    ? `対戦データがまだ${battleLog.length}件(${MIN_BATTLES_FOR_ML}件以上で学習モデルに切替)のため`
    : "AIモデル(TensorFlow.js)が読み込めない(オフライン等)ため";
  note.textContent = `${reason}、ジャンルの簡易マッチングでおすすめしています`;
  const results = ruleBasedRecommendations(mood);
  renderRecommendations(results, (s) => `マッチ度 ${s.toFixed(2)}`);
}

function setupRecommendHandlers() {
  document.getElementById("btn-recommend").addEventListener("click", showRecommendations);
}

// ---------- ランキングタブ ----------
function renderRanking() {
  const tbody = document.getElementById("ranking-body");
  tbody.innerHTML = "";
  const sorted = [...restaurants].sort((a, b) => b.rating - a.rating);
  sorted.forEach((r, index) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${index + 1}</td>
      <td>${escapeHtml(r.name)}</td>
      <td>${escapeHtml(r.genre || "")}</td>
      <td>${escapeHtml(r.dish || "")}</td>
      <td>${escapeHtml(r.price || "")}</td>
      <td>${r.rating}</td>
      <td>${r.matches}</td>
      <td>${r.url ? `<a href="${escapeAttr(r.url)}" target="_blank" rel="noopener">サイト ↗</a>` : ""}</td>
    `;
    tbody.appendChild(tr);
  });
}

// ---------- お店管理タブ ----------
function renderManage() {
  const tbody = document.getElementById("manage-body");
  tbody.innerHTML = "";
  restaurants.forEach((r) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><input type="text" value="${escapeAttr(r.name)}" data-field="name"></td>
      <td><input type="text" value="${escapeAttr(r.genre || "")}" data-field="genre"></td>
      <td><input type="text" value="${escapeAttr(r.dish || "")}" data-field="dish"></td>
      <td><input type="text" value="${escapeAttr(r.price || "")}" data-field="price"></td>
      <td><input type="text" value="${escapeAttr(r.image || "")}" data-field="image"></td>
      <td><input type="text" value="${escapeAttr(r.url || "")}" data-field="url"></td>
      <td><input type="text" value="${escapeAttr(r.note || "")}" data-field="note"></td>
      <td><button data-action="delete">削除</button></td>
    `;
    tr.querySelectorAll("input").forEach((input) => {
      input.addEventListener("change", () => {
        r[input.dataset.field] = input.value;
        saveData();
        renderRanking();
        renderBattle();
      });
    });
    tr.querySelector('[data-action="delete"]').addEventListener("click", () => {
      if (!confirm(`「${r.name}」を削除しますか？`)) return;
      restaurants = restaurants.filter((x) => x.id !== r.id);
      saveData();
      renderManage();
      renderRanking();
      nextBattle();
    });
    tbody.appendChild(tr);
  });
}

function setupAddForm() {
  document.getElementById("form-add").addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("input-name").value.trim();
    if (!name) return;
    const newRestaurant = {
      id: `r-${Date.now()}`,
      name,
      genre: document.getElementById("input-genre").value.trim(),
      dish: document.getElementById("input-dish").value.trim(),
      price: document.getElementById("input-price").value.trim(),
      image: document.getElementById("input-image").value.trim(),
      url: document.getElementById("input-url").value.trim(),
      note: document.getElementById("input-note").value.trim(),
      rating: INITIAL_RATING,
      matches: 0
    };
    restaurants.push(newRestaurant);
    saveData();
    e.target.reset();
    renderManage();
    renderRanking();
  });
}

function setupDangerZone() {
  document.getElementById("btn-reset-rating").addEventListener("click", () => {
    if (!confirm("全店舗のレーティングを初期値(1500)にリセットします。よろしいですか？")) return;
    restaurants.forEach((r) => {
      r.rating = INITIAL_RATING;
      r.matches = 0;
    });
    saveData();
    renderRanking();
    nextBattle();
  });

  document.getElementById("btn-reset-data").addEventListener("click", () => {
    if (!confirm("お店データを初期状態に戻します。追加・編集した内容は失われます。よろしいですか？")) return;
    localStorage.removeItem(STORAGE_KEY);
    loadData();
    renderManage();
    renderRanking();
    nextBattle();
  });

  document.getElementById("btn-clear-battlelog").addEventListener("click", () => {
    if (!confirm("気分付きの対戦履歴(AI学習データ)を削除します。よろしいですか？")) return;
    battleLog = [];
    saveBattleLog();
    mlModel = null;
    initModel();
  });
}

// ---------- タブ切り替え ----------
function setupTabs() {
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"));
      document.querySelectorAll(".tab-content").forEach((c) => c.classList.remove("active"));
      btn.classList.add("active");
      document.getElementById(`tab-${btn.dataset.tab}`).classList.add("active");
    });
  });
}

// ---------- ユーティリティ ----------
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeAttr(str) {
  return escapeHtml(str).replace(/"/g, "&quot;");
}

// ---------- 初期化 ----------
function init() {
  loadData();
  loadBattleLog();
  setupTabs();
  setupBattleHandlers();
  setupRecommendHandlers();
  setupAddForm();
  setupDangerZone();
  nextBattle();
  renderRanking();
  renderManage();
  initModel();
  fetchWeather();
  setInterval(fetchWeather, 30 * 60 * 1000); // 30分ごとに天候を更新
}

init();
