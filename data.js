// 神保町・神田錦町オフィス周辺(徒歩10分以内)のランチ候補店 初期データ
// このファイルはアプリ初回起動時のみ使用されます。
// 起動後はlocalStorageの内容が優先されるため、ここを編集しても
// 既にブラウザで一度開いたことがある場合は反映されません。
// (反映したい場合は「お店管理」タブの「初期データに戻す」を使ってください)

const initialRestaurants = [
  {
    id: "ethiopia",
    name: "カリーライス専門店エチオピア 本店",
    genre: "カレー",
    dish: "チキンカリー",
    price: "¥900",
    image: "https://ethiopia-curry.com/ethiopia/wp-content/uploads/2024/12/slide-1900x600_02.jpg",
    url: "https://www.ethiopia-curry.com/",
    note: "辛さ0~70倍まで選べる神保町カレーの名店"
  },
  {
    id: "sangam",
    name: "サンガム@神保町",
    genre: "インドカレー",
    dish: "バジルスペシャルセット",
    price: "¥1,300",
    image: "",
    url: "https://www.google.com/maps/search/?api=1&query=サンガム@神保町",
    note: "バターチキン+ほうれん草マトンカレーでナン・ライス両方"
  },
  {
    id: "shichijo",
    name: "七條",
    genre: "洋食",
    dish: "エビフライ定食",
    price: "¥1,200",
    image: "",
    url: "https://www.google.com/maps/search/?api=1&query=七條 神保町",
    note: "ぷりぷりの大エビフライが人気の隠れ家洋食店"
  },
  {
    id: "volz",
    name: "ボルツ 神田店",
    genre: "インドカレー",
    dish: "◯倍カレー",
    price: "¥999",
    image: "",
    url: "https://www.google.com/maps/search/?api=1&query=ボルツ 神田店",
    note: "元祖◯倍カレーで知られるレトロな雰囲気の老舗"
  },
  {
    id: "sarashina",
    name: "神田錦町 更科",
    genre: "そば",
    dish: "天ざる蕎麦",
    price: "¥1,500",
    image: "",
    url: "https://www.google.com/maps/search/?api=1&query=神田錦町更科",
    note: "味・コスパ・雰囲気の三拍子が揃った蕎麦の名店"
  },
  {
    id: "jinzo-udon",
    name: "肉讃岐 甚三うどん",
    genre: "うどん",
    dish: "豚バラうどん",
    price: "¥999",
    image: "",
    url: "https://www.google.com/maps/search/?api=1&query=肉讃岐 甚三うどん",
    note: "香川スタイルの優しいうどんに豚バラ肉"
  },
  {
    id: "kissa-pupe",
    name: "喫茶プペ",
    genre: "洋食・喫茶",
    dish: "ナポリタン",
    price: "¥1,000",
    image: "",
    url: "https://www.google.com/maps/search/?api=1&query=喫茶プペ 神保町",
    note: "昭和45年創業、神田カレーグランプリ常連の老舗喫茶"
  },
  {
    id: "sushi-wasabi",
    name: "神保町 すしわさび",
    genre: "寿司",
    dish: "ランチ握り",
    price: "¥999",
    image: "",
    url: "https://www.google.com/maps/search/?api=1&query=神保町 すしわさび",
    note: "生本マグロが楽しめるガラス張りの開放的な空間"
  },
  {
    id: "west-india",
    name: "WEST INDIA GROUP",
    genre: "タイ料理",
    dish: "ランチセット",
    price: "¥1,200",
    image: "",
    url: "https://www.google.com/maps/search/?api=1&query=WEST INDIA GROUP 神保町",
    note: "創業35年の本格タイ料理、テラススクエア2階"
  },
  {
    id: "namaste-india",
    name: "ナマステインディア 神保町店",
    genre: "インド料理",
    dish: "カレーセット",
    price: "¥1,200",
    image: "",
    url: "https://www.google.com/maps/search/?api=1&query=ナマステインディア 神保町店",
    note: "ゆったり寛げるインディアン・ダイニング"
  },
  {
    id: "garb-pintino",
    name: "GARB pintino",
    genre: "フレンチ",
    dish: "ランチコース",
    price: "¥1,500",
    image: "",
    url: "https://www.google.com/maps/search/?api=1&query=GARB pintino 神保町",
    note: "神保町駅A9出口から徒歩3分のフランス料理店"
  },
  {
    id: "thank-ramen",
    name: "鶏ポタラーメンTHANK",
    genre: "ラーメン",
    dish: "鶏ポタラーメン",
    price: "¥1,000",
    image: "",
    url: "https://www.google.com/maps/search/?api=1&query=鶏ポタラーメンTHANK",
    note: "鶏ポタージュスープが特徴の人気ラーメン店"
  },
  {
    id: "kitchen-nankai",
    name: "キッチン南海 神保町店",
    genre: "洋食",
    dish: "カツカレー",
    price: "¥1,000",
    image: "",
    url: "https://tabelog.com/en/tokyo/A1310/A131003/13249021/",
    note: "行列必至、黒カレーが香ばしい老舗洋食店"
  },
  {
    id: "marukou-udon",
    name: "うどん 丸香",
    genre: "うどん",
    dish: "きつねうどん",
    price: "¥780",
    image: "",
    url: "https://tabelog.com/en/tokyo/A1310/A131003/13000629/",
    note: "都内屈指の讃岐うどん、常に行列の人気店"
  },
  {
    id: "mandala",
    name: "マンダラ",
    genre: "インド料理",
    dish: "カレー&ナンセット",
    price: "¥1,200",
    image: "",
    url: "https://www.google.com/maps/search/?api=1&query=マンダラ 神保町",
    note: "創業38年、神田カレーグランプリ優勝&殿堂入り"
  },
  {
    id: "shouou",
    name: "松翁",
    genre: "そば",
    dish: "天せいろ",
    price: "¥1,200",
    image: "",
    url: "https://www.google.com/maps/search/?api=1&query=松翁 神保町 そば",
    note: "上質な風味のそばと揚げたて天ぷらが評判"
  },
  {
    id: "jimbocho-yakiniku",
    name: "神保町食肉センター",
    genre: "焼肉",
    dish: "食べ放題ランチ",
    price: "¥1,000",
    image: "",
    url: "https://www.google.com/maps/search/?api=1&query=神保町食肉センター",
    note: "45分の焼肉食べ放題ランチが楽しめる精肉店直営"
  },
  {
    id: "santousha",
    name: "三燈舍",
    genre: "インド料理",
    dish: "カレーセット",
    price: "¥1,200",
    image: "",
    url: "https://www.google.com/maps/search/?api=1&query=三燈舍 神保町",
    note: "靖国通り沿いの雑居ビル2F、行列のインド料理店"
  },
  {
    id: "ponchiken",
    name: "ポンチ軒",
    genre: "とんかつ",
    dish: "ロースかつ定食",
    price: "¥1,200",
    image: "",
    url: "https://www.google.com/maps/search/?api=1&query=ポンチ軒 小川町",
    note: "昭和レトロな雰囲気でザクザクの揚げたてかつ"
  },
  {
    id: "kansuitei",
    name: "ひろしま酒蔵 歓粋亭",
    genre: "定食",
    dish: "焼き魚定食",
    price: "¥1,000",
    image: "",
    url: "https://www.google.com/maps/search/?api=1&query=ひろしま酒蔵 歓粋亭",
    note: "広島の郷土料理、焼き魚と日替わり肉のセット定食"
  },
  {
    id: "kenuki-sushi",
    name: "けぬきすし",
    genre: "寿司",
    dish: "ランチ5点セット",
    price: "¥1,300",
    image: "",
    url: "https://www.google.com/maps/search/?api=1&query=けぬきすし 小川町",
    note: "創業元禄15年、300年以上の歴史を持つ老舗寿司店"
  },
  {
    id: "sweet-pause",
    name: "スヰートポーズ",
    genre: "餃子",
    dish: "焼き餃子",
    price: "¥600",
    image: "",
    url: "https://www.google.com/maps/search/?api=1&query=スヰートポーズ 神保町",
    note: "昭和11年創業、棒状に巻かれた独特の餃子"
  },
  {
    id: "hachimaki",
    name: "はちまき",
    genre: "天丼",
    dish: "天丼",
    price: "¥1,200",
    image: "",
    url: "https://www.google.com/maps/search/?api=1&query=はちまき 神保町 天丼",
    note: "昭和6年創業、硬めのコシヒカリと甘めのタレが特徴"
  },
  {
    id: "wadining-thirty",
    name: "和Dining三十",
    genre: "定食",
    dish: "日替わり定食",
    price: "¥1,000",
    image: "",
    url: "https://www.google.com/maps/search/?api=1&query=和Dining三十 神保町",
    note: "主菜と味噌汁以外おかわり自由の隠れ家ダイニング"
  },
  {
    id: "bondy",
    name: "欧風カレー ボンディ 神保町本店",
    genre: "カレー",
    dish: "ビーフカレー",
    price: "¥1,500",
    image: "",
    url: "https://tabelog.com/en/tokyo/A1310/A131003/13000439/",
    note: "甘めで食べやすい欧風カレーの有名店、行列必至"
  },
  {
    id: "shanghai-tantanmen",
    name: "上海担々麺",
    genre: "中華",
    dish: "担々麺",
    price: "¥1,200",
    image: "",
    url: "https://www.google.com/maps/search/?api=1&query=上海担々麺 神保町",
    note: "肉味噌たっぷり、焼売2個付きの担々麺が人気"
  },
  {
    id: "gengu",
    name: "NOODLE MEISTER 源九",
    genre: "ラーメン",
    dish: "貝だし塩ラーメン",
    price: "¥1,000",
    image: "",
    url: "https://www.google.com/maps/search/?api=1&query=NOODLE MEISTER 源九 九段下",
    note: "九段下徒歩2分、貝だし塩と丸鶏醤油が看板メニュー"
  },
  {
    id: "the-stamp-tokyo",
    name: "ジ・スタンプ・トウキョウ",
    genre: "イタリアン",
    dish: "ランチプレート",
    price: "¥1,300",
    image: "",
    url: "https://www.google.com/maps/search/?api=1&query=ジ・スタンプ・トウキョウ 九段下",
    note: "日本の食材を使った創作イタリアン、九段下徒歩5分"
  },
  {
    id: "machiavelli",
    name: "マキアヴェリの食卓",
    genre: "イタリアン",
    dish: "鴨肉のミートソースパスタ",
    price: "¥1,300",
    image: "",
    url: "https://www.google.com/maps/search/?api=1&query=マキアヴェリの食卓 神保町",
    note: "神保町駅すぐ、コク深い鴨肉ミートソースが名物"
  },
  {
    id: "deniro",
    name: "デニーロ",
    genre: "イタリアン",
    dish: "キーマカレースパゲティ",
    price: "¥1,400",
    image: "",
    url: "https://www.google.com/maps/search/?api=1&query=デニーロ 神保町 イタリアン",
    note: "開業20年超、開店前から行列のできる人気イタリアン"
  },
  {
    id: "bunka",
    name: "ぶん華",
    genre: "中華",
    dish: "ぶん華ランチ",
    price: "¥800",
    image: "",
    url: "https://www.google.com/maps/search/?api=1&query=ぶん華 神保町",
    note: "1950年創業、コスパ最強の大盛り中華ランチ"
  },
  {
    id: "shokudo-shin",
    name: "食堂新",
    genre: "定食",
    dish: "しょうが焼き定食",
    price: "¥1,100",
    image: "",
    url: "https://www.google.com/maps/search/?api=1&query=食堂新 神保町",
    note: "鯖の黒煮定食など、ボリューム満点の定食が人気"
  },
  {
    id: "sabouru",
    name: "さぼうる",
    genre: "喫茶店",
    dish: "ナポリタン",
    price: "¥1,000",
    image: "",
    url: "https://www.google.com/maps/search/?api=1&query=さぼうる 神保町",
    note: "1955年創業、具沢山で麺高盛りの名物ナポリタン"
  },
  {
    id: "sabouru2",
    name: "さぼうる2",
    genre: "喫茶店",
    dish: "ナポリタン",
    price: "¥1,000",
    image: "",
    url: "https://www.google.com/maps/search/?api=1&query=さぼうる2 神保町",
    note: "さぼうるの姉妹店、開店前から並ぶ人気店"
  },
  {
    id: "cafe-l",
    name: "喫茶 L(エル)",
    genre: "喫茶店",
    dish: "オムライス",
    price: "¥1,100",
    image: "",
    url: "https://www.google.com/maps/search/?api=1&query=喫茶L 神保町",
    note: "昔ながらの雰囲気、ナポリタンとオムライスが名物"
  },
  {
    id: "luncheon",
    name: "ランチョン",
    genre: "洋食",
    dish: "オムライス",
    price: "¥1,300",
    image: "",
    url: "https://www.google.com/maps/search/?api=1&query=ランチョン 神保町 オムライス",
    note: "1909年創業の老舗ビヤホール、ふんわり卵のオムライス"
  },
  {
    id: "radio",
    name: "神保町ラドリオ",
    genre: "喫茶店",
    dish: "ナポリタン",
    price: "¥1,000",
    image: "",
    url: "https://www.google.com/maps/search/?api=1&query=神保町ラドリオ",
    note: "1949年創業、ウインナーコーヒー発祥のレトロ純喫茶"
  },
  {
    id: "chogori",
    name: "チョゴリ",
    genre: "韓国料理",
    dish: "ランチセット",
    price: "¥1,200",
    image: "",
    url: "https://www.google.com/maps/search/?api=1&query=チョゴリ 神保町 韓国料理",
    note: "韓国人にも認められる本格派の韓国料理店"
  },
  {
    id: "betoya",
    name: "ベト屋 神保町店",
    genre: "ベトナム料理",
    dish: "フォー",
    price: "¥1,000",
    image: "",
    url: "https://www.google.com/maps/search/?api=1&query=ベト屋 神保町店",
    note: "神保町駅A9出口徒歩1分のベトナム料理店"
  },
  {
    id: "la-e-mikuni",
    name: "ラー・エ・ミクニ",
    genre: "フレンチ",
    dish: "ランチコース",
    price: "¥3,000",
    image: "",
    url: "https://www.google.com/maps/search/?api=1&query=ラー・エ・ミクニ 東京国立近代美術館",
    note: "東京国立近代美術館内、皇居の緑を望むフレンチ"
  },
  {
    id: "vmg-cafe",
    name: "VMG CAFE 九段会館テラス",
    genre: "カフェ",
    dish: "ランチプレート",
    price: "¥1,500",
    image: "",
    url: "https://www.google.com/maps/search/?api=1&query=VMG CAFE 九段会館テラス",
    note: "九段会館テラス内、ゆったりした空間のカフェ"
  },
  {
    id: "alcazar",
    name: "炭焼ハンバーグ&ステーキ アルカサール 神保町店",
    genre: "ハンバーグ・ステーキ",
    dish: "ハンバーグランチ",
    price: "¥1,500",
    image: "",
    url: "https://www.google.com/maps/search/?api=1&query=アルカサール 神保町店",
    note: "神保町駅徒歩1分、木の温もりあふれる炭焼きステーキ店"
  },
  {
    id: "myojinmaru",
    name: "藁焼き鰹たたき明神丸 竹橋パレスサイドビル店",
    genre: "和食",
    dish: "鰹たたき定食",
    price: "¥1,200",
    image: "",
    url: "https://shop.myojinmaru.jp/shop/takebashi/",
    note: "竹橋駅直結パレスサイドビル、わら焼き鰹たたきが名物"
  },
  {
    id: "newtokyo",
    name: "ニュートーキョー パレスサイドビル店",
    genre: "ビアホール・洋食",
    dish: "ハンバーグ&ミニステーキ",
    price: "¥1,580",
    image: "",
    url: "https://shop.newtokyo.co.jp/newtokyo/paresside/lunch/",
    note: "竹橋駅直結のビアホール、スープ・ライス・ドリンク付き"
  },
  {
    id: "akasaka-hanten",
    name: "赤坂飯店 パレスサイドビル店",
    genre: "中華",
    dish: "ランチセット",
    price: "¥1,000",
    image: "",
    url: "https://www.google.com/maps/search/?api=1&query=赤坂飯店 パレスサイドビル",
    note: "竹橋駅直結、お手頃価格でボリューム豊かな中華ランチ"
  },
  {
    id: "point-et-ligne",
    name: "ポワン エ リーニュ 神田スクエア店",
    genre: "ベーカリーカフェ",
    dish: "パン食べ放題ランチセット",
    price: "¥1,500",
    image: "",
    url: "https://www.google.com/maps/search/?api=1&query=ポワン エ リーニュ 神田スクエア店",
    note: "石臼自家製粉のパン食べ放題＋スープ・サラダ付き"
  },
  {
    id: "tam-tam",
    name: "石釜 bake bread 茶房 TAM TAM",
    genre: "カフェ",
    dish: "ホットケーキ",
    price: "¥1,200",
    image: "",
    url: "https://www.google.com/maps/search/?api=1&query=石釜 bake bread 茶房 TAM TAM",
    note: "神保町駅A7出口すぐ、石窯焼きホットケーキが評判"
  },
  {
    id: "kyoeido",
    name: "スマトラカレー共栄堂",
    genre: "カレー",
    dish: "タンカレー",
    price: "¥1,750",
    image: "",
    url: "https://www.kyoueidoo.com/",
    note: "大正13年創業、ミシュラン掲載のスマトラカレー老舗"
  },
  {
    id: "milonga",
    name: "ミロンガ・ヌオーバ",
    genre: "喫茶店",
    dish: "ハヤシライス",
    price: "¥1,000",
    image: "",
    url: "https://www.google.com/maps/search/?api=1&query=ミロンガ・ヌオーバ 神保町",
    note: "タンゴが流れる老舗喫茶、名物のハヤシライス"
  },
  {
    id: "kanda-yabusoba",
    name: "神田やぶそば",
    genre: "そば",
    dish: "もり蕎麦",
    price: "¥900",
    image: "",
    url: "https://www.google.com/maps/search/?api=1&query=神田やぶそば",
    note: "神田須田町の老舗、風情ある建物で味わう江戸前そば"
  }
];
