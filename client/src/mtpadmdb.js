import axios from 'axios';
import store from './store';

/** このウェブサービス固有の情報関連。 */
export const mtpadmdb = {
  /** サーバーAPI とのやり取りを行う。 */
  api: function (mode, params, option, onSuccess, onError) {
    if (typeof (option) === 'function') {
      onError = onSuccess;
      onSuccess = option;
      option = undefined;
    }
    // 後で option.header に追加を行うので、そこの処理を単純化するため指定のない場合に空オブジェクトを入れておく。
    if (!option) { option = {}; }
    if (!option.headers) { option.headers = {}; }

    let axiosObj;
    switch (mode) {
    case 'monsterDetails':
      // APIではなくJSONファイルをリクエストする。
      Object.assign(option.headers, {
        'Cache-Control': 'no-cache',
        'Expires': '-1'
      });
      axiosObj = axios.get(`./monsterJson/${params.no}.json`, option);
      break;
    case 'monsterHistory':
    case 'monsterHistoryDetails':
    case 'monsterImageHistory':
    case 'skillHistory':
      Object.assign(option.headers, {
        'Cache-Control': 'no-cache',
        'Expires': '-1',
        'X-Requested-With': 'XMLHttpRequest'
      });
      option.params = Object.assign(option.params || {}, params);
      axiosObj = axios.get(`./api.cgi/${mode}`, option);
      break;
    case 'updateMonster':
    case 'image':
    case 'updateSkill':
      Object.assign(option.headers, {
        'X-Requested-With': 'XMLHttpRequest'
      });
      axiosObj = axios.post(`./api.cgi/${mode}`, params, option);
      break;
    default:
      console.log(`mode"${mode}" is not found. by mtpadmdb.api()\n`);
      return;
    }
    const commonWork = (response) => {
      if (!response.data) { return; }
      if (response.data.newTableData) {
        const newTableData = response.data.newTableData;
        if (newTableData.monster) {
          store.commit('addMonsterData', newTableData.monster);
        }
        if (newTableData.skillDetails) {
          store.commit('addSkillData', newTableData.skillDetails);
        }
        if (newTableData.leaderSkillDetails) {
          store.commit('addLeaderSkillData', newTableData.leaderSkillDetails);
        }
        if (newTableData.imageTable) {
          store.commit('addImageData', newTableData.imageTable);
        }
      }
      store.commit('clearErrors');
      store.commit('clearMessages');
      if (response.data._messages) {
        store.commit('setMessages', response.data._messages);
      }
      if (response.data._errors) {
        store.commit('setErrors', response.data._errors);
      }
    };

    axiosObj.then(response => {
      commonWork(response);
      if (response.data._errors) {
        onError && onError(response);
      } else {
        onSuccess(response);
      }
    }).catch(response => {
      commonWork(response);
      onError && onError(response);
    });
  }
};

export const commonData = {

  monsterData: {},

  monsterTable: null,
  skillTable: {},
  leaderSkillTable: {},
  imageTable: {},
  evolutionTable: {},

  /** モンスターをお気に入りに入れているかの情報 */
  monsterFavorites: {},
  /** commonData のJSONを最後に読み込んだ時間 */
  lastLoadCommonDataTime: 0,

  messages: [],
  errors: [],

  /**
   * 現在のログインアカウントの情報。ログイン情報未確認時は null、
   * 未ログイン時は空オブジェクト、ログイン時はそのアカウントの情報が入ったオブジェクト。
   */
  accountData: null
};

export const constData = {
  title: 'みんなで作るパズドラモンスターデータベース',

  /** ナビゲーションメニュー用データ */
  navis: [
    { text: 'モンスター一覧', to: { name: 'monsterList' }},
    { text: 'スキル一覧', to: { name: 'skillList' }},
    { text: 'リーダースキル一覧', to: { name: 'leaderSkillList' }},
    { text: 'モンスター比較', to: { name: 'compare' }},
    { text: 'ランキング', to: { name: 'ranking' }},
    { text: '新規登録', to: { name: 'monsterEdit' }},
    { text: '画像投稿', to: { name: 'monsterPicture' }},
    { text: 'これは何？', to: { name: 'about' }}
  ],

  /** モンスター情報の空データ */
  monsterClearData: {
    no: null,
    name: '',
    attributes: [null, 0],
    cost: null,
    rare: null,
    types: [null, 0, 0],
    awakens: [null, 0, 0, 0, 0, 0, 0, 0, 0],
    maxExp: null,
    maxLevel: null,
    maxParam: {
      hp: null,
      attack: null,
      recovery: null
    },
    skill: 0,
    skillDetails: {
      name: '',
      description: '',
      baseTurn: null,
      minTurn: null
    },
    leaderSkill: 0,
    leaderSkillDetails: {
      name: '',
      description: ''
    },
    assist: null,
    overLimit: null,
    overLimitParam: {
      hp: null,
      attack: null,
      recovery: null
    },
    superAwakens: [null],
    evolutionType: null,
    evolution: {
      baseNo: null,
      materials: [
        null, null, null, null, null
      ]
    },
    comment: ''
  },

  booleanTable: {
    0: '×',
    1: '○',

    null: '不明'
  },

  typeTable: {
    0: { name: 'なし', senzaiKiller: [] },
    1: { name: '神', senzaiKiller: [3, 9, 10, 11, 12] },
    2: { name: 'ドラゴン', senzaiKiller: [4, 9, 10, 11, 12] },
    3: { name: '悪魔', senzaiKiller: [1, 9, 10, 11, 12] },
    4: { name: 'マシン', senzaiKiller: [1, 6, 9, 10, 11, 12] },
    5: { name: 'バランス', senzaiKiller: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] },
    6: { name: '攻撃', senzaiKiller: [3, 7, 9, 10, 11, 12] },
    7: { name: '体力', senzaiKiller: [4, 8, 9, 10, 11, 12] },
    8: { name: '回復', senzaiKiller: [2, 6, 9, 10, 11, 12] },
    9: { name: '進化用', senzaiKiller: [] },
    10: { name: '能力覚醒用', senzaiKiller: [] },
    11: { name: '強化合成用', senzaiKiller: [] },
    12: { name: '売却用', senzaiKiller: [] },

    null: { name: '不明', senzaiKiller: [] }
  },

  attributeTable: {
    0: 'なし',
    1: '火',
    2: '水',
    3: '木',
    4: '光',
    5: '闇',
    null: '不明'
  },

  attrColors: {
    0: 'rgba(0,0,0,0)',
    1: 'rgba(255, 0, 0, 1.0)',
    2: 'rgba(0, 192, 255, 1.0)',
    3: 'rgba(0, 224, 0, 1.0)',
    4: 'rgba(255, 255, 0, 1.0)',
    5: 'rgba(192, 0, 192, 1.0)',

    null: 'rgba(192, 192, 192, 1.0)'
  },

  evolutionTypeTable: {
    0: '進化なし',
    1: '通常進化',
    2: '究極進化',
    3: '転生進化',
    4: 'ドット進化',
    5: 'アシスト進化',
    6: '超転生進化',
    7: '超究極進化',

    null: '進化形態不明'
  },

  awakenTable: {
    0: { name: 'なし', description: '' },
    1: { name: 'HP強化', description: 'HPが500アップする', value: 500 },
    2: { name: '攻撃強化', description: '攻撃力が100アップする', value: 100 },
    3: { name: '回復強化', description: '回復力が200アップする', value: 200 },
    4: { name: '火ダメージ軽減', description: '火属性の敵から\n受けるダメージを軽減する', rate: 0.07 },
    5: { name: '水ダメージ軽減', description: '水属性の敵から\n受けるダメージを軽減する', rate: 0.07 },
    6: { name: '木ダメージ軽減', description: '木属性の敵から\n受けるダメージを軽減する', rate: 0.07 },
    7: { name: '光ダメージ軽減', description: '光属性の敵から\n受けるダメージを軽減する', rate: 0.07 },
    8: { name: '闇ダメージ軽減', description: '闇属性の敵から\n受けるダメージを軽減する', rate: 0.07 },
    9: { name: '自動回復', description: 'ドロップを消したターン、HPが回復する', value: 1000 },
    10: { name: 'バインド耐性', description: '自分自身へのバインド攻撃を\n無効化することがある', probability: 0.5 },
    11: { name: '暗闇耐性', description: '暗闇攻撃を無効化することがある', probability: 0.2 },
    12: { name: 'お邪魔耐性', description: 'お邪魔攻撃や爆弾攻撃を\n無効化することがある', probability: 0.2 },
    13: { name: '毒耐性', description: '毒攻撃を無効化することがある', probability: 0.2 },
    14: { name: '火ドロップ強化', description: '強化された火ドロップの出現率と\nダメージがアップする', probability: 0.2, rate: 0.07 },
    15: { name: '水ドロップ強化', description: '強化された水ドロップの出現率と\nダメージがアップする', probability: 0.2, rate: 0.07 },
    16: { name: '木ドロップ強化', description: '強化された木ドロップの出現率と\nダメージがアップする', probability: 0.2, rate: 0.07 },
    17: { name: '光ドロップ強化', description: '強化された光ドロップの出現率と\nダメージがアップする', probability: 0.2, rate: 0.07 },
    18: { name: '闇ドロップ強化', description: '強化された闇ドロップの出現率と\nダメージがアップする', probability: 0.2, rate: 0.07 },
    19: { name: '操作時間延長', description: 'ドロップ操作時間が少し延びる', value: 0.5 },
    20: { name: 'バインド回復', description: '回復ドロップを横一列でそろえて消すと\nバインド状態が3ターン回復する', value: 3 },
    21: { name: 'スキルブースト', description: 'チーム全体のスキルが\n1ターン溜まった状態で始まる', value: 1 },
    22: { name: '火属性強化', description: '火ドロップを横一列でそろえて消すと\n火属性の攻撃力がアップする', rate: 0.15 },
    23: { name: '水属性強化', description: '水ドロップを横一列でそろえて消すと\n火属性の攻撃力がアップする', rate: 0.15 },
    24: { name: '木属性強化', description: '木ドロップを横一列でそろえて消すと\n火属性の攻撃力がアップする', rate: 0.15 },
    25: { name: '光属性強化', description: '光ドロップを横一列でそろえて消すと\n火属性の攻撃力がアップする', rate: 0.15 },
    26: { name: '闇属性強化', description: '闇ドロップを横一列でそろえて消すと\n火属性の攻撃力がアップする', rate: 0.15 },
    27: { name: '2体攻撃', description: '自分と同じ属性のドロップを4個消すと\n攻撃力がアップし、敵2体に攻撃する', rate: 1.5 },
    28: { name: '封印耐性', description: 'スキル封印攻撃を無効化することがある', probability: 0.2 },
    29: { name: '回復ドロップ強化', description: '強化された回復ドロップの出現率と\n回復力がアップする\n回復の4個消しで回復力がアップする', probability: 0.2, rate: 1.5, rate2: 0.05 },
    30: { name: 'マルチブースト', description: '協力プレイ時に\n自分の全パラメータがアップする', rate: 1.5 },
    31: { name: 'ドラゴンキラー', description: 'ドラゴンタイプの敵に対して\n攻撃力がアップする', rate: 3 },
    32: { name: '神キラー', description: '神タイプの敵に対して\n攻撃力がアップする', rate: 3 },
    33: { name: '悪魔キラー', description: '悪魔タイプの敵に対して\n攻撃力がアップする', rate: 3 },
    34: { name: 'マシンキラー', description: 'マシンタイプの敵に対して\n攻撃力がアップする', rate: 3 },
    35: { name: 'バランスキラー', description: 'バランスタイプの敵に対して\n攻撃力がアップする', rate: 3 },
    36: { name: '攻撃キラー', description: '攻撃タイプの敵に対して\n攻撃力がアップする', rate: 3 },
    37: { name: '体力キラー', description: '体力タイプの敵に対して\n攻撃力がアップする', rate: 3 },
    38: { name: '回復キラー', description: '回復タイプの敵に対して\n攻撃力がアップする', rate: 3 },
    39: { name: '進化用キラー', description: '進化用タイプの敵に対して\n攻撃力がアップする', rate: 3 },
    40: { name: '能力覚醒用キラー', description: '能力覚醒用タイプの敵に対して\n攻撃力がアップする', rate: 3 },
    41: { name: '強化合成用キラー', description: '強化合成用タイプの敵に対して\n攻撃力がアップする', rate: 3 },
    42: { name: '売却用キラー', description: '売却用タイプの敵に対して\n攻撃力がアップする', rate: 3 },
    43: { name: 'コンボ強化', description: '7コンボ以上で攻撃力がアップする', rate: 2 },
    44: { name: 'ガードブレイク', description: '5属性同時攻撃すると\n敵の防御力を無視してダメージを与える' },
    45: { name: '追加攻撃', description: '回復ドロップを縦一列でそろえて消すと\n1ダメージの追い打ち', value: 1 },
    46: { name: 'チームHP強化', description: 'チームのHPが5％アップする', rate: 0.05 },
    47: { name: 'チーム回復強化', description: 'チームの回復力が10％アップする', rate: 0.1 },
    48: { name: 'ダメージ無効貫通', description: '自分と同じ属性のドロップを3×3の正方形で消すと\n攻撃力がアップし、ダメージ無効を貫通する', rate: 2.5 },
    49: { name: '覚醒アシスト', description: '他のモンスターにアシストすると\n自分の覚醒スキルが付与される' },
    50: { name: '超追加攻撃', description: '回復ドロップを3×3の正方形で消すと\n攻撃力がアップし、99ダメージの追い打ち', value: 99, rate: 2 },
    51: { name: 'スキルチャージ', description: '5属性同時攻撃すると\n自分のスキルが1ターン貯まる', value: 1 },
    52: { name: 'バインド耐性+', description: '自分自身へのバインド攻撃を\n無効化する', probability: 1 },
    53: { name: '操作時間延長+', description: 'ドロップ操作時間が延びる', value: 1 },
    54: { name: '雲耐性', description: '雲攻撃を無効化する', probability: 1 },
    55: { name: '操作不可耐性', description: '操作不能攻撃を無効化する', probability: 1 },
    56: { name: 'スキルブースト+', description: 'チーム全体のスキルが\n2ターン溜まった状態で始まる', value: 2 },
    57: { name: 'HP80%以上強化', description: 'HP80%以上で攻撃力がアップする', rate: 1.5 },
    58: { name: 'HP50%以下強化', description: 'HP50%以下で攻撃力がアップする', rate: 2 },
    59: { name: '回復L字消し', description: '回復ドロップ5個をL字型に消すと\n敵から受けるダメージを軽減し、\n攻撃力がアップする\nさらにバインド状態が１ターン回復する', rate: 0.05, rate2: 1.5 },
    60: { name: 'L字消し攻撃', description: '自分と同じ属性のドロップ5個を\nL字型に消すと攻撃力がアップし、\nロック状態を解除する', rate: 1.5 },
    61: { name: '超コンボ強化', description: '10コンボ以上で攻撃力がかなりアップする', rate: 5 },
    62: { name: 'コンボドロップ', description: '自分と同じ属性のドロップを\n10〜12個つなげて消すと\nコンボドロップが1個落ちてくる(最大4個まで)\nさらに１コンボ加算(最大２コンボまで)' },
    63: { name: 'スキルボイス', description: 'スキル使用時に声が出る' },
    64: { name: 'ダンジョンボーナス', description: '1人プレイのときにランク経験値、モンスター経験値、入手コイン、卵ドロップ率がほんの少し上昇' },
    65: { name: 'HP弱化', description: 'HPが5000ダウンする(最小1まで)', value: -5000 },
    66: { name: '攻撃弱化', description: '攻撃力が1000ダウンする(最小1まで)', value: -1000 },
    67: { name: '回復弱化', description: '回復力が2000ダウンする', value: -2000 },
    68: { name: '暗闇耐性+', description: '暗闇攻撃を無効化する', probability: 1 },
    69: { name: 'お邪魔耐性+', description: 'お邪魔攻撃や爆弾攻撃を\n無効化する', probability: 1 },
    70: { name: '毒耐性+', description: '毒攻撃を無効化する', probability: 1 },
    71: { name: 'お邪魔ドロップの加護', description: 'お邪魔ドロップが落ちてくるようになり、\nお邪魔ドロップを消すと攻撃力がアップする', rate: 2, },
    72: { name: '毒ドロップの加護', description: '毒ドロップが落ちてくるようになり、\n毒か猛毒ドロップを消すと攻撃力がアップする', rate: 2 },

    null: { name: '不明', description: '' }
  },

  rareStoneExchangeTable: {
    // 希石【小】
    4453: [
      142, 216, 283, 441, 540,
      782, 974, 1166, 1591, 1761,
      1957, 2333, 2429, 2575, 2577,
      2642, 2647
    ],
    4454: [
      143, 217, 284, 442, 541,
      783, 975, 1167, 1592, 1762,
      1958, 2334, 2430, 2579, 2643,
      2648
    ],
    4455: [
      144, 218, 285, 443, 542,
      784, 976, 1168, 1593, 1763,
      1959, 2336, 2431, 2576, 2644,
      2649
    ],
    4456: [
      145, 219, 286, 444, 543,
      785, 977, 1169, 1594, 1764,
      1960, 2335, 2337, 2434, 2578,
      2645, 2650
    ],
    4457: [
      146, 220, 287, 445, 544,
      786, 978, 1170, 1595, 1765,
      1961, 2338, 2432, 2433, 2580,
      2646, 2651
    ],
    // 希石【中】
    4458: [
      408, 566, 599, 772, 1252,
      1590, 2875, 3000, 3207, 3721,
      3835
    ],
    4459: [
      409, 597, 773, 1307, 1461,
      1532, 2876, 3001, 3011, 3208,
      3722, 3836
    ],
    4460: [
      410, 651, 774, 778, 1098,
      1189, 1190, 1223, 1425, 2877,
      3002, 3209, 3723, 3837
    ],
    4461: [
      188, 226, 411, 649, 775,
      810, 812, 1250, 1463, 2878,
      2890, 3012, 3210, 3724, 3838
    ],
    4462: [
      190, 412, 645, 647, 776,
      814, 1062, 1465, 1648, 2879,
      3211, 3725, 3839
    ],
    // 希石【大】
    4463: [
      1750, 2008, 2184, 2398, 2722,
      1225, 1272
    ],
    4464: [
      1227, 1273, 1752, 2104, 2182,
      2263, 2383
    ],
    4465: [
      1274, 1472, 1629, 1711, 1754,
      1837, 1945, 2069, 2129, 2320,
      2549
    ],
    4466: [
      917, 1119, 1246, 1510, 1525,
      1631, 2234, 2400, 2524, 2551
    ],
    4467: [
      918, 985, 1215, 1248, 1646,
      2402
    ]
  }
};

/** 本番環境でのみ gtag を実行する関数 */
export const gtagProductionOnly = (location.port !== '')
  ? function () {}
  : function () {
    if (store.getters.isAdmin) { return; }
    gtag(...arguments);
  };

/** HTMLエスケープを行う。 */
export function escapeHtml (str) {
  if (typeof str !== 'string') { return; }
  return str.replace(/[<>&"'`]/g, (match) => {
    const escape = {
      '<': '&lt;',
      '>': '&gt;',
      '&': '&amp;',
      '"': '&quot;',
      '\'': '&#39;',
      '`': '&#x60;'
    };
    return escape[match];
  });
}

// 正規表現エスケープを行う関数を作成する。 from https://s8a.jp/javascript-escape-regexp にあるものを若干変更
export let escapeRegExp;
(function (w) {
  const reRegExp = /[\\^$.*+?()[\]{}|]/g;
  const reHasRegExp = new RegExp(reRegExp.source);

  function _escapeRegExp (string) {
    return (string && reHasRegExp.test(string))
      ? string.replace(reRegExp, '\\$&')
      : string;
  }

  escapeRegExp = _escapeRegExp;
})();

/**
 * 検索ワードのひらがなカタカナを、ひらがなとカタカナの両方にヒットする正規表現に変更する。
 * 小文字大文字のある文字の場合はその両方を含める。
 */
function toHiraKanaSearchRegExp (str) {
  return str.replace(/[\u3041-\u3096\u30a1-\u30f6]/g, function (match) {
    let hiraCode = match.charCodeAt(0);
    if (hiraCode >= 0x30a1) { hiraCode -= 0x60; }
    const kataCode = hiraCode + 0x60;
    const hira = String.fromCharCode(hiraCode);
    const kata = String.fromCharCode(kataCode);
    let resizeChars = '';
    if (/[あいうえおつやゆよわ]/.test(hira)) {
      resizeChars = String.fromCharCode(hiraCode - 1) + String.fromCharCode(kataCode - 1);
    }
    if (/[ぁぃぅぇぉっゃゅょゎ]/.test(hira)) {
      resizeChars = String.fromCharCode(hiraCode + 1) + String.fromCharCode(kataCode + 1);
    }
    return `[${hira}${kata}${resizeChars}]`;
  });
}

/**
 * ば行 と ヴァ行 を相互に検索可能な正規表現に置き換える。
 * ば行 の場合は /ゔ.{1,2}ぁ/ をヒットさせたくないので、文字間に関するあいまい検索置き換えのあとに行う。
 * そのため置き換え元の文字にも .{0,2} が入った状態でチェックする。
 */
function toBaVaAimaiRegExp (str) {
  const aimai = '.{0,2}';
  return str.replace(/[ばびぶべぼバビブベボ]|[ゔヴ](?:\.\{0,2\}([ぁあぃいぇえぉおァアィイェエォオ]))?/g, function (match) {
    switch (match[0]) {
    case 'ば': case 'バ':
      return '(?:ゔぁ|ば)';
    case 'び': case 'ビ':
      return '(?:ゔぃ|び)';
    case 'ぶ': case 'ブ':
      return '(?:ゔ|ぶ)';
    case 'べ': case 'ベ':
      return '(?:ゔぇ|べ)';
    case 'ぼ': case 'ボ':
      return '(?:ゔぉ|ぼ)';
    case 'ゔ': case 'ヴ':
      switch (RegExp.$1) {
      case 'ぁ': case 'あ': case 'ァ': case 'ア':
        return `(?:ゔ${aimai}ぁ|ば)`;
      case 'ぃ': case 'い': case 'ィ': case 'イ':
        return `(?:ゔ${aimai}ぃ|び)`;
      case '':
        return '(?:ゔ|ぶ)';
      case 'ぇ': case 'え': case 'ェ': case 'エ':
        return `(?:ゔ${aimai}ぇ|べ)`;
      case 'ぉ': case 'お': case 'ォ': case 'オ':
        return `(?:ゔ${aimai}ぉ|ぼ)`;
      }
    }
  }).replace();
}

/** 指定された文字列を、検索ワードの文字と文字の間が2文字まで空いていてもヒットする検索形式の正規表現に変換する。 */
function toAimaiSpaceSearch (str) {
  // 文字と文字の間に .{0,2} を入れる。
  // 正規表現の制御文字（カッコの終了除く）やエスケープ文字の直後と正規表現の制御文字（カッコの開始除く）の直前は除く。
  return str.replace(/(?:[$^.*+?([{|]|\(?:|\(?=)*\\?.(?=[^\\^$.*+?)\]|])/g, '$&.{0,2}');
}

/**
 * 検索ワードをあいまい検索を行うための正規表現に変換する。
 * ２文字以上の間が空いていてもヒットする、『バ』と『ヴァ』の相互ヒット、ひらがか・カタカナの相互ヒットの３種類を適用する。
 */
export function toAimaiSearch (word) {
  const temp1 = toAimaiSpaceSearch(word);
  const temp2 = toBaVaAimaiRegExp(temp1);
  return toHiraKanaSearchRegExp(temp2);
}

/** リーダースキルの効果をゲーム内の表記と同様の表示になるよう装飾した HTML を作成する。 */
export function leaderSkillDescriptionToDecoratedHtml (description) {
  if (typeof description !== 'string') { return description; }
  const escapedDescription = escapeHtml(description);
  return escapedDescription.replace(/^(【.*】|ドロップを\d+個以下で消せない)+|ドロップ操作を[\d\.]+秒短縮。/, '<span style="color:rgba(224, 0, 0, 0.8);">$&</span>');
}

/** 現在のURLでの history 形式でのルートを求める */
export function getRouterBase () {
  const routerBaseArray = /^.*padmdb[^/]*\//i.exec(location.pathname);
  if (routerBaseArray) { return routerBaseArray[0]; }
  return '/';
}

/** 強化合成が可能なモンスターかどうかを判定する。 */
export function checkCanMixMonster (monsterData) {
  // 最大レベルが1で素材系のタイプの場合は合成不可と判断する。
  if (monsterData.maxLevel > 1) { return true; }
  const type = monsterData.types[0];
  return !((type >= 9 && type <= 12) || type === 99);
}

/** 再送を防ぐためために、送信状態をタイムアウト機能付きで記録するクラス。 */
export class MultiSendBlocker {
  /** タイムアウト処理のID。 */
  timeoutId = 0;
  /** タイムアウトを行うまでのミリ秒。 */
  timeoutMs;
  /** コンストラクタ。
   * @param {number} timeoutMs - タイムアウトを行うまでのミリ秒。省略時は20000。（=20秒）
   */
  constructor (timeoutMs) {
    this.timeoutMs = timeoutMs || 20 * 1000;
  }
  /** 現在送信中かどうか。 */
  get isSending () { return !!this.timeoutId; }
  /** 送信状態にする。 */
  set (timeoutTime) {
    this.reset();
    // 何かしらあってレスポンスが帰ってこなかった場合に再送信できるように指定時間後に復帰させる。
    this.timeoutId = setTimeout(() => {
      this.timeoutId = 0;
    }, this.timeoutMs);
  }
  /** 送信状態を解除する。 */
  reset () {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = 0;
    }
  }
};

/** 指定された要素の横幅が親要素より大きい場合に、親要素の横幅に収まるように縮小させる。 */
export function stretchElement (elm, parentOffset) {
  // 子要素を表示していることによって親要素のサイズか変わる可能性があるので、非表示に下状態で親要素のサイズを取得する。
  const tempDisplay = elm.style.display;
  elm.style.display = 'none';
  const parentStyle = getComputedStyle(elm.parentNode);
  const parentWidth = parseFloat(parentStyle.width) - parseFloat(parentStyle.paddingLeft) - parseFloat(parentStyle.paddingRight) -
    parseFloat(parentStyle.borderLeftWidth) - parseFloat(parentStyle.borderRightWidth);
  elm.style.display = tempDisplay;

  elm.style.transform = '';
  const width = elm.scrollWidth;
  if (parentWidth < width) {
    elm.style.transform = 'scaleX(' + (parentWidth / width) + ')';
    elm.style.transformOrigin = 'left';
  }
}
