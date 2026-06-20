// 気分・状況コンテキストを加味したレストラン推薦モデル(TensorFlow.js)
// ペアワイズ学習(Bradley-Terry/RankNet方式): 対戦の勝者の方が敗者よりスコアが高くなるように学習する。
// TensorFlow.js が読み込めない(オフライン等)場合は呼び出し側がルールベースにフォールバックする想定。

const MODEL_STORAGE_URL = "indexeddb://jimbocho-lunch-model";
const MIN_BATTLES_FOR_ML = 20;

const GENRE_LIST = [
  "カレー", "インドカレー", "洋食", "そば", "うどん", "洋食・喫茶", "寿司",
  "タイ料理", "インド料理", "フレンチ", "ラーメン", "中華", "焼肉", "とんかつ",
  "餃子", "天丼", "定食", "イタリアン", "韓国料理", "ベトナム料理",
  "ハンバーグ・ステーキ", "和食", "ビアホール・洋食", "ベーカリーカフェ", "カフェ"
];

const RESTAURANT_VECTOR_SIZE = GENRE_LIST.length + 1 + 3; // ジャンル(+その他) + 価格帯3区分
const CONTEXT_VECTOR_SIZE = 2 + 4 + 1 + 1 + 1 + 4; // 気分2(空腹/甘い物欲) + 時間帯4 + 休日1 + 気温1 + 湿度1 + 天候4
const INPUT_VECTOR_SIZE = RESTAURANT_VECTOR_SIZE + CONTEXT_VECTOR_SIZE;

const WEATHER_CATEGORIES = ["晴れ", "曇り", "雨", "雪"];

// Open-Meteoの天候コード(WMO)を簡易4分類にマッピング
function weatherCodeToCategory(code) {
  if (code === 0 || code === 1) return 0; // 晴れ
  if (code === 2 || code === 3 || code === 45 || code === 48) return 1; // 曇り
  if (code >= 71 && code <= 86) return 3; // 雪
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 99)) return 2; // 雨(雷雨含む)
  return 1; // 不明は曇り扱い
}

function isMlAvailable() {
  return typeof tf !== "undefined";
}

// ---------- 特徴エンコード ----------
function priceToYen(price) {
  const match = String(price || "").match(/\d[\d,]*/);
  if (!match) return null;
  return parseInt(match[0].replace(/,/g, ""), 10);
}

function encodeRestaurant(restaurant) {
  const vec = new Array(RESTAURANT_VECTOR_SIZE).fill(0);
  const genreIndex = GENRE_LIST.indexOf(restaurant.genre);
  vec[genreIndex >= 0 ? genreIndex : GENRE_LIST.length] = 1; // 不明ジャンルは「その他」

  const base = GENRE_LIST.length + 1;
  const yen = priceToYen(restaurant.price);
  if (yen === null) {
    vec[base + 1] = 1; // 不明は中間帯扱い
  } else if (yen < 1000) {
    vec[base + 0] = 1;
  } else if (yen <= 1500) {
    vec[base + 1] = 1;
  } else {
    vec[base + 2] = 1;
  }
  return vec;
}

function hourBucketIndex(hour) {
  if (hour < 11) return 0; // 朝
  if (hour < 12) return 1; // 午前
  if (hour < 14) return 2; // 昼
  return 3; // 午後
}

function getAutoContext(date = new Date()) {
  return {
    hour: date.getHours(),
    dow: date.getDay()
  };
}

// weather: { temperature(℃), humidity(%), weatherCode } を期待。取得失敗時は呼び出し側で平均的な値を渡す
// (旧バージョンのbattleLogにはmood.sweetやweatherが無いため、欠損時は中間値で補う)
function encodeContext(mood, auto, weather) {
  const safeWeather = weather || {};
  const vec = new Array(CONTEXT_VECTOR_SIZE).fill(0);
  vec[0] = ((mood.hunger || 3) - 1) / 4;
  vec[1] = ((mood.sweet || 3) - 1) / 4;

  vec[2 + hourBucketIndex(auto.hour)] = 1;
  vec[2 + 4] = auto.dow === 0 || auto.dow === 6 ? 1 : 0;

  const base = 2 + 4 + 1;
  const temperature = safeWeather.temperature ?? 20;
  const humidity = safeWeather.humidity ?? 50;
  vec[base] = Math.min(1, Math.max(0, (temperature + 10) / 50)); // -10~40℃を0~1に正規化
  vec[base + 1] = Math.min(1, Math.max(0, humidity / 100));
  vec[base + 2 + weatherCodeToCategory(safeWeather.weatherCode)] = 1;
  return vec;
}

function buildInputVector(restaurant, mood, auto, weather) {
  return [...encodeRestaurant(restaurant), ...encodeContext(mood, auto, weather)];
}

// ---------- モデル ----------
function createModel() {
  const model = tf.sequential();
  model.add(tf.layers.dense({ inputShape: [INPUT_VECTOR_SIZE], units: 16, activation: "relu" }));
  model.add(tf.layers.dense({ units: 8, activation: "relu" }));
  model.add(tf.layers.dense({ units: 1 }));
  return model;
}

async function loadOrCreateModel() {
  if (!isMlAvailable()) return null;
  try {
    return await tf.loadLayersModel(MODEL_STORAGE_URL);
  } catch (e) {
    return createModel();
  }
}

async function saveModel(model) {
  if (!isMlAvailable() || !model) return;
  await model.save(MODEL_STORAGE_URL);
}

// battleLog: { aId, bId, scoreA, mood, auto: {hour, dow}, weather: {temperature, humidity, weatherCode} } の配列
// restaurants: 現在の店舗一覧(idでルックアップ)
async function trainModel(model, battleLog, restaurants, epochs = 20) {
  if (!isMlAvailable() || !model) return model;
  const byId = new Map(restaurants.map((r) => [r.id, r]));
  const pairs = battleLog
    .filter((b) => b.scoreA === 1 || b.scoreA === 0)
    .map((b) => {
      const winnerId = b.scoreA === 1 ? b.aId : b.bId;
      const loserId = b.scoreA === 1 ? b.bId : b.aId;
      return {
        winner: byId.get(winnerId),
        loser: byId.get(loserId),
        mood: b.mood,
        auto: b.auto,
        weather: b.weather
      };
    })
    .filter((p) => p.winner && p.loser);

  if (pairs.length === 0) return model;

  const winnerVecs = pairs.map((p) => buildInputVector(p.winner, p.mood, p.auto, p.weather));
  const loserVecs = pairs.map((p) => buildInputVector(p.loser, p.mood, p.auto, p.weather));

  const optimizer = tf.train.adam(0.01);

  for (let epoch = 0; epoch < epochs; epoch++) {
    optimizer.minimize(() => {
      return tf.tidy(() => {
        const winnerScores = model.predict(tf.tensor2d(winnerVecs));
        const loserScores = model.predict(tf.tensor2d(loserVecs));
        const diff = winnerScores.sub(loserScores);
        // -log(sigmoid(diff)) をバッチ平均
        const loss = tf.logSigmoid(diff).mul(-1).mean();
        return loss;
      });
    });
  }

  await saveModel(model);
  return model;
}

function predictScores(model, restaurants, mood, auto, weather) {
  if (!isMlAvailable() || !model) return null;
  return tf.tidy(() => {
    const vecs = restaurants.map((r) => buildInputVector(r, mood, auto, weather));
    const scores = model.predict(tf.tensor2d(vecs)).dataSync();
    return restaurants.map((r, i) => ({ id: r.id, score: scores[i] }));
  });
}
