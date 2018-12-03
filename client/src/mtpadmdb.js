import axios from 'axios';
import store from './store';

/** このウェブサービス固有の情報関連。 */
export const mtpadmdb = {
  /** サーバーAPI とのやり取りを行う。 */
  api: function (mode, params, option, onSuccess, onError) {
    if (typeof (option) === 'function') {
      onError = onSuccess;
      onSuccess = option;
    }

    let axiosObj;
    switch (mode) {
    case 'monsterDetails':
      // APIではなくJSONファイルをリクエストする。
      axiosObj = axios.get(`./monsterJson/${params.no}.json`);
      break;
    case 'monsterHistory':
    case 'monsterHistoryDetails':
    case 'skillHistory':
      axiosObj = axios.get(`./api.cgi/${mode}`, {
        params: params
      });
      break;
    case 'updateMonster':
    case 'image':
    case 'updateSkill':
      axiosObj = axios.post(
        `./api.cgi/${mode}`, params, option
      );
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

  /** commonData のJSONを最後に読み込んだ時間 */
  lastLoadCommonDataTime: 0,

  messages: [],
  errors: []
};

export const constData = {
  title: 'みんなで作るパズドラモンスターデータベース',

  /** ナビゲーションメニュー用データ */
  navis: [
    { text: 'ホーム', to: '/' },
    { text: 'スキル一覧', to: '/skill' },
    { text: 'リーダースキル一覧', to: { name: 'leaderSkillList' }},
    { text: 'パラメータ比較', to: '/compare' },
    { text: 'ランキング', to: { name: 'ranking' }},
    { text: '新規登録', to: '/edit' },
    { text: '画像投稿', to: '/pic' },
    { text: 'これは何？', to: '/about' }
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
      maxLevel: null
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
    11: { name: '強化合成用', senzaiKiller: [] },
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

    null: '進化形式不明'
  },

  awakenTable: {
    0: { name: 'なし', description: '' },
    1: { name: 'HP強化', description: 'HPが500アップする', value: 50 },
    2: { name: '攻撃強化', description: '攻撃力が100アップする', value: 100 },
    3: { name: '回復強化', description: '回復力が200アップする', value: 200 },
    4: { name: '火ダメージ軽減', description: '火属性の敵から\n受けるダメージを軽減する', rate: 0.05 },
    5: { name: '水ダメージ軽減', description: '水属性の敵から\n受けるダメージを軽減する', rate: 0.05 },
    6: { name: '木ダメージ軽減', description: '木属性の敵から\n受けるダメージを軽減する', rate: 0.05 },
    7: { name: '光ダメージ軽減', description: '光属性の敵から\n受けるダメージを軽減する', rate: 0.05 },
    8: { name: '闇ダメージ軽減', description: '闇属性の敵から\n受けるダメージを軽減する', rate: 0.05 },
    9: { name: '自動回復', description: 'ドロップを消したターン、HPが回復する', value: 1000 },
    10: { name: 'バインド耐性', description: '自分自身へのバインド攻撃を\n無効化することがある', probability: 0.5 },
    11: { name: '暗闇耐性', description: '暗闇攻撃を無効化することがある', probability: 0.2 },
    12: { name: 'お邪魔耐性', description: 'お邪魔攻撃や爆弾攻撃を\n無効化することがある', probability: 0.2 },
    13: { name: '毒耐性', description: '毒攻撃を無効化することがある', probability: 0.2 },
    14: { name: '火ドロップ強化', description: '強化された火ドロップの出現率と\nダメージがアップする', probability: 0.2, rate: 0.05 },
    15: { name: '水ドロップ強化', description: '強化された水ドロップの出現率と\nダメージがアップする', probability: 0.2, rate: 0.05 },
    16: { name: '木ドロップ強化', description: '強化された木ドロップの出現率と\nダメージがアップする', probability: 0.2, rate: 0.05 },
    17: { name: '光ドロップ強化', description: '強化された光ドロップの出現率と\nダメージがアップする', probability: 0.2, rate: 0.05 },
    18: { name: '闇ドロップ強化', description: '強化された闇ドロップの出現率と\nダメージがアップする', probability: 0.2, rate: 0.05 },
    19: { name: '操作時間延長', description: 'ドロップ操作時間が少し延びる', value: 0.5 },
    20: { name: 'バインド回復', description: '回復ドロップを横一列でそろえて消すと\nバインド状態が3ターン回復する', value: 3 },
    21: { name: 'スキルブースト', description: 'チーム全体のスキルが\n1ターン溜まった状態で始まる', value: 1 },
    22: { name: '火属性強化', description: '火ドロップを横一列でそろえて消すと\n火属性の攻撃力がアップする', rate: 0.1 },
    23: { name: '水属性強化', description: '水ドロップを横一列でそろえて消すと\n火属性の攻撃力がアップする', rate: 0.1 },
    24: { name: '木属性強化', description: '木ドロップを横一列でそろえて消すと\n火属性の攻撃力がアップする', rate: 0.1 },
    25: { name: '光属性強化', description: '光ドロップを横一列でそろえて消すと\n火属性の攻撃力がアップする', rate: 0.1 },
    26: { name: '闇属性強化', description: '闇ドロップを横一列でそろえて消すと\n火属性の攻撃力がアップする', rate: 0.1 },
    27: { name: '2体攻撃', description: '自分と同じ属性のドロップを4個消すと\n攻撃力がアップし、敵2体に攻撃する', rate: 1.5 },
    28: { name: '封印耐性', description: 'スキル封印攻撃を無効化することがある', probability: 0.2 },
    29: { name: '回復ドロップ強化', description: '強化された回復ドロップの出現率と\n回復力がアップする\n回復の4個消しで回復力がアップする', probability: 0.2, rate: 0.05, rate2: 1.5 },
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
    50: { name: '超追加攻撃', description: '回復ドロップを3×3の正方形で消すと\n攻撃力がアップし、2ダメージの追い打ち', value: 2, rate: 2 },
    51: { name: 'スキルチャージ', description: '5属性同時攻撃すると\n自分のスキルが1ターン貯まる', value: 1 },
    52: { name: 'バインド耐性+', description: '自分自身へのバインド攻撃を\n無効化する', probability: 1 },
    53: { name: '操作時間延長+', description: 'ドロップ操作時間が延びる', value: 1 },
    54: { name: '雲耐性', description: '雲攻撃を無効化する', probability: 1 },
    55: { name: '操作不可耐性', description: '操作不能攻撃を無効化する', probability: 1 },
    56: { name: 'スキルブースト+', description: 'チーム全体のスキルが\n2ターン溜まった状態で始まる', value: 2 },
    57: { name: 'HP80%以上強化', description: 'HP80%以上で攻撃力がアップする', rate: 1.5 },
    58: { name: 'HP50%以下強化', description: 'HP50%以下で攻撃力がアップする', rate: 2 },
    59: { name: 'L字消し軽減', description: '回復ドロップ5個をL字型に消すと\n敵から受けるダメージを軽減する', rate: 0.05 },
    60: { name: 'L字消し攻撃', description: '自分と同じ属性のドロップ5個を\nL字型に消すと攻撃力がアップし、\n盤面のロック状態を解除する', rate: 1.5 },
    61: { name: '超コンボ強化', description: '10コンボ以上で攻撃力がかなりアップする', rate: 5 },
    62: { name: 'コンボドロップ', description: '自分と同じ属性のドロップを12個つなげて消すと\nコンボドロップが1個落ちてくる(最大3個まで)' },
    63: { name: 'スキルボイス', description: 'スキル使用時に声が出る' },
    64: { name: 'ダンジョンボーナス', description: '1人プレイのときにランク経験値、モンスター経験値、入手コイン、卵ドロップ率がほんの少し上昇' },

    null: { name: '不明', description: '' }
  }

};

/** 本番環境でのみ gtag を実行する関数 */
export const gtagProductionOnly = (document.domain === 'localhost') ? function () {} : gtag;

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

/** リーダースキルの説明文をゲーム内の表記と同様の表示になるよう装飾した HTML を作成する。 */
export function leaderSkillDescriptionToDecoratedHtml (description) {
  const escapedDescription = escapeHtml(description);
  return escapedDescription.replace(/^(【.*】|ドロップを\d+個以下で消せない)+/, '<span style="color:rgba(224, 0, 0, 0.8);">$&</span>');
}

/** 現在のURLでの history 形式でのルートを求める */
export function getRouterBase () {
  const routerBaseArray = /^.*padmdb[^/]*\//i.exec(location.pathname);
  if (routerBaseArray) { return routerBaseArray[0]; }
  return '/';
}

