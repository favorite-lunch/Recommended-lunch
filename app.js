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

// ---------- 対戦カード描画 ----------
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

// ---------- おすすめ対戦(気分バー連動) ----------
// mood.hunger: 1(空腹)〜3(普通)〜5(満腹)。空腹なほどボリューム系、満腹に近いほど軽め系を優先
// mood.sweet:  1(辛い/しょっぱい物欲)〜3(普通)〜5(甘い物欲)
// 気温が低い日は温かい物、高い日は冷たい/軽い物を軽く優先
const HEAVY_GENRES = ["焼肉", "とんかつ", "ハンバーグ・ステーキ", "中華", "カレー", "インドカレー", "ラーメン", "天丼", "ビアホール・洋食", "餃子"];
const LIGHT_GENRES = ["そば", "うどん", "寿司", "洋食・喫茶", "カフェ", "和食", "ベーカリーカフェ"];
const SWEET_GENRES = ["カフェ", "ベーカリーカフェ", "洋食・喫茶"];
const SAVORY_SPICY_GENRES = ["カレー", "インドカレー", "インド料理", "韓国料理", "タイ料理", "ベトナム料理", "中華"];

function ruleBasedRecommendations(mood) {
  const scored = restaurants.map((r) => {
    let score = 0;
    if (mood.hunger <= 2 && HEAVY_GENRES.includes(r.genre)) score += 2;
    if (mood.hunger >= 4 && LIGHT_GENRES.includes(r.genre)) score += 2;
    if (mood.sweet >= 4 && SWEET_GENRES.includes(r.genre)) score += 2;
    if (mood.sweet <= 2 && SAVORY_SPICY_GENRES.includes(r.genre)) score += 2;
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

// おすすめ上位を「対戦カード」として1組ずつ提示し、選んだ結果をそのままElo更新・AI学習データにも使う
let recommendQueue = [];
let recommendScoreFormatter = () => "";

function renderRecommendPair() {
  const area = document.getElementById("battle-area");
  const winnerBox = document.getElementById("recommend-winner");
  const cardA = document.getElementById("card-a");
  const cardB = document.getElementById("card-b");

  if (recommendQueue.length === 0) {
    area.style.display = "none";
    winnerBox.textContent = "";
    return;
  }
  if (recommendQueue.length === 1) {
    area.style.display = "none";
    winnerBox.textContent = `🎉 これに決定！「${recommendQueue[0].restaurant.name}」`;
    return;
  }

  area.style.display = "flex";
  winnerBox.textContent = "";
  renderBattleCard(cardA, recommendQueue[0].restaurant, recommendScoreFormatter(recommendQueue[0].score));
  renderBattleCard(cardB, recommendQueue[1].restaurant, recommendScoreFormatter(recommendQueue[1].score));
}

function pickRecommendWinner(winnerIndex) {
  const winner = recommendQueue[winnerIndex];
  const loser = recommendQueue[1 - winnerIndex];
  applyResult(winner.restaurant.id, loser.restaurant.id, 1);
  recommendQueue = [winner, ...recommendQueue.slice(2)];
  renderRecommendPair();
  renderRanking();
}

function drawCurrentPair() {
  if (recommendQueue.length < 2) return;
  applyResult(recommendQueue[0].restaurant.id, recommendQueue[1].restaurant.id, 0.5);
  recommendQueue = recommendQueue.slice(2);
  if (recommendQueue.length < 2) {
    showRecommendations();
  } else {
    renderRecommendPair();
  }
  renderRanking();
}

function skipCurrentPair() {
  recommendQueue = recommendQueue.slice(2);
  if (recommendQueue.length < 2) {
    showRecommendations();
  } else {
    renderRecommendPair();
  }
}

async function showRecommendations() {
  const mood = getCurrentMood();
  const note = document.getElementById("recommend-mode-note");
  const usableMl = isMlAvailable() && battleLog.length >= MIN_BATTLES_FOR_ML;

  if (usableMl) {
    if (!mlModel) await initModel();
    const results = mlRecommendations(mood);
    if (results) {
      note.textContent = `対戦データ${battleLog.length}件から学習したAIモデルでおすすめ中(選ぶとさらに学習されます)`;
      recommendQueue = results;
      recommendScoreFormatter = (s) => `推薦度 ${s.toFixed(2)}`;
      renderRecommendPair();
      return;
    }
  }

  const reason = isMlAvailable()
    ? `対戦データがまだ${battleLog.length}件(${MIN_BATTLES_FOR_ML}件以上で学習モデルに切替)のため`
    : "AIモデル(TensorFlow.js)が読み込めない(オフライン等)ため";
  note.textContent = `${reason}、ジャンルの簡易マッチングでおすすめしています(選ぶとAI学習データにもなります)`;
  recommendQueue = ruleBasedRecommendations(mood);
  recommendScoreFormatter = (s) => `マッチ度 ${s.toFixed(2)}`;
  renderRecommendPair();
}

function setupRecommendHandlers() {
  document.getElementById("mood-hunger").addEventListener("input", showRecommendations);
  document.getElementById("mood-sweet").addEventListener("input", showRecommendations);
  document.getElementById("card-a").addEventListener("click", () => {
    if (recommendQueue.length < 2) return;
    pickRecommendWinner(0);
  });
  document.getElementById("card-b").addEventListener("click", () => {
    if (recommendQueue.length < 2) return;
    pickRecommendWinner(1);
  });
  document.getElementById("btn-draw").addEventListener("click", drawCurrentPair);
  document.getElementById("btn-skip").addEventListener("click", skipCurrentPair);
}

// ---------- 学習タブ(ランダム気分×ランダム対戦でAI学習データを増やす) ----------
// 天候・時間は実際の状況に依存させず、中立値に固定して「気分とお店の相性」だけを学習させる
const NEUTRAL_AUTO = { hour: 12, dow: 3 };
let learnMood = { hunger: 3, sweet: 3 };
let learnPair = [];

function randomMood() {
  return {
    hunger: 1 + Math.floor(Math.random() * 5),
    sweet: 1 + Math.floor(Math.random() * 5)
  };
}

function pickRandomPair() {
  if (restaurants.length < 2) return [];
  const i = Math.floor(Math.random() * restaurants.length);
  let j = Math.floor(Math.random() * (restaurants.length - 1));
  if (j >= i) j += 1;
  return [restaurants[i].id, restaurants[j].id];
}

function renderLearnRound() {
  document.getElementById("learn-hunger-bar").value = learnMood.hunger;
  document.getElementById("learn-sweet-bar").value = learnMood.sweet;
  document.getElementById("learn-mood-note").textContent = `学習データ ${battleLog.length}件`;

  const cardA = document.getElementById("learn-card-a");
  const cardB = document.getElementById("learn-card-b");
  if (learnPair.length < 2) {
    renderBattleCard(cardA, null);
    renderBattleCard(cardB, null);
    return;
  }
  renderBattleCard(cardA, findRestaurant(learnPair[0]));
  renderBattleCard(cardB, findRestaurant(learnPair[1]));
}

function newLearnRound() {
  learnMood = randomMood();
  learnPair = pickRandomPair();
  renderLearnRound();
}

// Eloレーティング(実際の好み)には影響させず、AI学習データ(battleLog)だけに追加する
function recordLearnBattle(idA, idB, scoreA) {
  battleLog.push({
    timestamp: Date.now(),
    aId: idA,
    bId: idB,
    scoreA,
    mood: learnMood,
    auto: NEUTRAL_AUTO,
    weather: DEFAULT_WEATHER
  });
  saveBattleLog();
  if (isMlAvailable() && battleLog.length % RETRAIN_INTERVAL === 0) {
    retrainModel();
  }
}

function setupLearnHandlers() {
  document.getElementById("learn-card-a").addEventListener("click", () => {
    if (learnPair.length < 2) return;
    recordLearnBattle(learnPair[0], learnPair[1], 1);
    newLearnRound();
  });
  document.getElementById("learn-card-b").addEventListener("click", () => {
    if (learnPair.length < 2) return;
    recordLearnBattle(learnPair[1], learnPair[0], 1);
    newLearnRound();
  });
  document.getElementById("btn-learn-draw").addEventListener("click", () => {
    if (learnPair.length < 2) return;
    recordLearnBattle(learnPair[0], learnPair[1], 0.5);
    newLearnRound();
  });
  document.getElementById("btn-learn-skip").addEventListener("click", () => {
    newLearnRound();
  });
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
        showRecommendations();
      });
    });
    tr.querySelector('[data-action="delete"]').addEventListener("click", () => {
      if (!confirm(`「${r.name}」を削除しますか？`)) return;
      restaurants = restaurants.filter((x) => x.id !== r.id);
      saveData();
      renderManage();
      renderRanking();
      showRecommendations();
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
    showRecommendations();
  });

  document.getElementById("btn-reset-data").addEventListener("click", () => {
    if (!confirm("お店データを初期状態に戻します。追加・編集した内容は失われます。よろしいですか？")) return;
    localStorage.removeItem(STORAGE_KEY);
    loadData();
    renderManage();
    renderRanking();
    showRecommendations();
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
  setupRecommendHandlers();
  setupLearnHandlers();
  setupAddForm();
  setupDangerZone();
  showRecommendations();
  newLearnRound();
  renderRanking();
  renderManage();
  initModel();
  fetchWeather();
  setInterval(fetchWeather, 30 * 60 * 1000); // 30分ごとに天候を更新
}

init();
