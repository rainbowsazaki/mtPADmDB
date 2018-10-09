
var commonData = {

  monsterData: {},

  monsterTable: {},
  skillTable: {},
  leaderSkillTable: {},
  imageTable: {},
  evolutionTable: {},

  /** commonData のJSONを最後に読み込んだ時間 */
  lastLoadCommonDataTime: 0,

  messages: [],
  errors: []
};

const constData = {
  title: 'みんなで作るパズドラデータベース',

  /** ナビゲーションメニュー用データ */
  navis: [
    { text: 'ホーム', to: '/' },
    { text: 'パラメータ比較', to: '/compare' },
    { text: '新規登録', to: '/edit' },
    { text: '画像投稿', to: '/pic' },
    { text: 'これは何？', to: '/about' },
  ],

  /** モンスター情報の空データ */
  monsterClearData: {
    no: null,
    name:'',
    attributes: [ null, 0 ],
    cost: null,
    rare: null,
    types: [ null, 0, 0],
    awakens: [ null, 0, 0, 0, 0, 0, 0, 0, 0 ],
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
    superAwakens: [ null ],
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

    null: '不明',
  },

  typeTable: {
    0: { name: 'なし', senzaiKiller: [] },
    1: { name: '神', senzaiKiller: [ 3, 9, 10, 11, 12 ] },
    2: { name: 'ドラゴン', senzaiKiller: [ 4, 9, 10, 11, 12] },
    3: { name: '悪魔', senzaiKiller: [ 1, 9, 10, 11, 12 ] },
    4: { name: 'マシン', senzaiKiller: [1, 6, 9, 10, 11, 12 ] },
    5: { name: 'バランス', senzaiKiller: [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12 ] },
    6: { name: '攻撃', senzaiKiller: [ 3, 7, 9, 10, 11, 12 ] },
    7: { name: '体力', senzaiKiller: [ 4, 8, 9, 10, 11, 12 ] },
    8: { name: '回復', senzaiKiller: [ 2, 6, 9, 10, 11, 12 ] },
    9: { name: '進化用', senzaiKiller: [] },
    10: { name: '能力覚醒用', senzaiKiller: [] },
    11: { name: '合成強化用', senzaiKiller: [] },
    12: { name: '売却用', senzaiKiller: [] },

    null: { name: '不明', senzaiKiller: [] },
  },

  attributeTable: {
    0: 'なし',
    1: '火',
    2: '水',
    3: '木',
    4: '光',
    5: '闇',
    null: '不明',
  },

  attrColors: {
    0: 'rgba(0,0,0,0)',
    1: 'rgba(255, 0, 0, 1.0)',
    2: 'rgba(0, 192, 255, 1.0)',
    3: 'rgba(0, 224, 0, 1.0)',
    4: 'rgba(255, 255, 0, 1.0)',
    5: 'rgba(192, 0, 192, 1.0)',

    null: 'rgba(192, 192, 192, 1.0)',
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

    null: { name: '不明', description: '' },
  },

};

/** 本番環境でのみ gtag を実行する関数 */
var gtagProductionOnly = (document.domain == 'localhost') ? function () {} : gtag;

axios.interceptors.request.use(function (config) {
  config.headers['X-Requested-With'] = 'XMLHttpRequest';
  config.headers['Cache-Control'] = 'no-cache';
  config.headers['Expires'] = '-1';

  return config;
}, function (err) {
  return Promise.reject(err);
});

jQuery.fn.scrollParentShowThis = function() {
  if (this.length == 0) { return this; }
  
  var offsetParent = this.offsetParent();
  var scrollTop    = offsetParent.scrollTop();
  var scrollHeight = offsetParent.height();
  
  var nowTop = this.position().top;
  var nowBottom = nowTop + this.height();
  if (nowTop < 0){
    offsetParent.scrollTop(scrollTop + nowTop);
  }
  if (nowBottom > scrollHeight) {
    offsetParent.scrollTop(scrollTop + nowBottom - scrollHeight);
  }
  return this;
};

/** HTMLエスケープを行う。 */
function escapeHtml(str) {
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

const store = new Vuex.Store({
  state: commonData,
  mutations: {
    fetchCommonData: function (state) {
      // 最後に読み込んだ時間から 5分以上経過していた場合に読み込みを実効する。
      var nowMs = (new Date()).getTime();
      if (state.lastLoadCommonDataTime + 5 * 60 * 1000 > nowMs) { return; }

      // モンスター情報と画像情報はモンスター一覧ページをいち早く表示するために他と分けて読み込み処理を行う。
      axios.get('./listJson/monster_list.json')
        .then(responce => {
          state.monsterTable = responce.data;
        });
      axios.get('./listJson/image_list.json')
        .then(responce => {
          state.imageTable = responce.data;

        });

      axios.all([
        axios.get('./listJson/skill_list.json'),
        axios.get('./listJson/leader_skill_list.json'),
        axios.get('./listJson/evolution_list.json'),
      ]).then( axios.spread( (
        skillListResponse,
        leaderSkillListResponse,
        evolutionListResponse
      ) => {
        state.skillTable = skillListResponse.data;
        state.leaderSkillTable = leaderSkillListResponse.data;
        state.evolutionTable = evolutionListResponse.data;
      }));

      state.lastLoadCommonDataTime = nowMs;
    },
    
    loadMonsterData: function (state, param) {
      var path, option;
      if (param.historyId) {
        path = './api.cgi';
        option = {
          params: {
            mode: 'monsterHistoryDetails',
            id: param.historyId
          }
        };
      } else {
        path = `./monsterJson/${param.no}.json`;
        option = undefined;
      }

      this.commit('setMessages', [ 'モンスター情報取得中' ]);
      axios.get(path, option).then(
        response => {
          var data = $.extend(true, {}, constData.monsterClearData, response.data);
          if (!data.superAwakens) { data.superAwakens = []; }
          state.monsterData = data;
          
          this.commit('clearMessages');
          if (typeof param.callback === 'function') { param.callback(); }
        }
      ).catch(
        error => {
          var errorMessage = '';
          if (param.historyId) {
            errorMessage = `モンスター編集履歴 ID:${param.historyId} の情報が見つかりませんでした。`;
          } else {
            errorMessage = `モンスター No.${param.no} の情報が見つかりませんでした。`;
          }
          this.commit('clearMessages');
          this.commit('setErrors', [ errorMessage ]);
        }
      );
    },

    addMonsterData: function (state, monsterData) {
      Object.assign(state.monsterTable, monsterData);
    },
    addSkillData: function (state, skillData) {
      Object.assign(state.skillTable, skillData);
    },
    addLeaderSkillData: function (state, leaderSkillData) {
      Object.assign(state.leaderSkillTable, leaderSkillData);
    },
    addImageData: function (state, imageData) {
      Object.assign(state.imageTable, imageData);
    },

    setErrors: function (state, errors) {
      state.errors = errors;
    },
    setMessages: function (state, messages) {
      state.messages = messages;
      setTimeout(() => {
        state.messages = [];
      }, 3000);
    },
    clearErrors: function (state) {
      state.errors = [];
    },
    clearMessages: function (state) {
      state.messages = [];
    },
    deleteError: function (state, error) {
      state.errors = state.errors.filter(n => n !== error);
    },
    deleteMessage: function (state, message) {
      state.messages = state.messages.filter(n => n !== message);
    }
  }
});


// 数字をカンマ区切りにする。
Vue.filter('addComma', function(val) {
  var arr;
  arr = String(val).split('.');
  arr[0] = arr[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,');
  return arr.join('.');
});

Vue.component('pdSelect', {
  template: `
<div class="dropdown pd-select" style="width: 100%">
  <div class="custom-select" tabindex="0" data-toggle="dropdown" v-html="html">{{html}}</div>
  <div class="dropdown-menu" style="height: auto; max-height: 200px; overflow-x: hidden; -webkit-overflow-scrolling: touch; width: 100%;">
    <slot></slot>
  </div>
</div>
  `,
  props: [ 'value' ],
  data: function () {
    return {
      html: '',
    };
  },
  mounted: function () {
    $(this.$el).on('shown.bs.dropdown', () => {
      $(this.$el).children('div.dropdown-menu').children('.active').focus().scrollParentShowThis();
    });
    this.$on('clickOption', this.clickOption);
    this.changeDisp(this.value);
  },
  watch: {
    value: function (newValue, oldValue) {
      this.changeDisp(newValue);
      $(this.$el).children('div.dropdown-menu').children().each((index, elem) => {
        if (elem.getAttribute('data-value') == newValue) {
          $(elem).addClass('active');
        } else {
          $(elem).removeClass('active');
        }
      });
    }
  },
  methods: {
    clickOption: function (option) {
      this.$emit('input', option[0]);
      $(this.$el).children(0).focus();
    },
    changeDisp: function (value) {
      // html要素上では null の値はなく文字列になっているため、値が null の場合は文字列にする。
      if (value === null) { value = 'null'; }
      $(this.$el).children('.dropdown-menu').children().each((index, elem) => {
        if (elem.getAttribute('data-value') == value) {
          this.html = $(elem).html();
        }
      });
    },
  },
});


Vue.component('pdOption', {
  template: `
<a class="dropdown-item pd-option" href="javascript:void(0);" @click="click" :data-value="value" style="width: 8em; overflow-x: hidden; display: inline-flex; padding: 4px;">
  <slot></slot>
</a>
  `,
  props: [ 'value' ],

  methods: {
    click: function (event) {
      this.$parent.$emit('clickOption', [ this.value ] );
    }
  }
});


Vue.component('skillIncrementalInput', {
  template: `
<div class="dropdown show">
  <input :value="value" :id="id" @input="$emit('input', $event.target.value); showPopup($event.target);" class="form-control dropdown-toggle" :placeholder="placeholder" data-toggle="dropdown" onfocus="$('.dropdown-toggle').dropdown();" :required="required" minLength="1" maxLength="50">
  <div class="dropdown-menu" style="height: auto; max-height: 200px; overflow-x: hidden;">
    <a v-for="(value, key) in filteredSkillTable" class="dropdown-item" @click="$emit('select-no', key)" href="javascript:void(0)">
      {{value.name}}<br>
      <span style="font-size: 80%;">{{value.description}}</span>
    </a>
  </div>
</div>
  `,
  props: {
    'id': String,
    'value': String,
    'skillTable': Object,
    'placeholder': String, 
    'required': {
      type: Boolean,
      default: true,
    } 
  },

  computed: {
    filteredSkillTable: function () {
      // 文字が入力されていない場合は表示しない。
      if (this.value.length < 1) { return {}; }
      var obj = {};
      for (var key in this.skillTable) {
        var value = this.skillTable[key];
        if (value.name.indexOf(this.value) != -1) {
          obj[key] = value;
        }
      }
      return obj;
    },
  },
  methods: {
    showPopup: function (target) {
      if (!$(target).siblings('.dropdown-menu').hasClass('show')) {
        $(target).dropdown('toggle');
      }
      $(target).dropdown('update');
    }
  },
});


Vue.component('monsterIncrementalInput', {
  template: `
<div class="dropdown show">
  <input v-model="filter" placeholder="モンスター名で検索" class="form-control dropdown-toggle" @input="showPopup($event.target);" data-toggle="dropdown">
  <div class="dropdown-menu" style="height: auto; max-height: 200px; overflow-x: hidden;">
    <a v-for="(value, key) in filteredMonsterTable" class="dropdown-item" @click="updateValue(key)" href="javascript:void(0)">
      <monster-icon v-if="imageTable" :no="value.no" :monsterTable="monsterTable" :imageTable="imageTable" width="1.6em" height="1.6em" />
      {{value.name}}
    </a>
  </div>
</div>
  `,
  props: {
    'value': String,
    'monsterTable': Object,
    'imageTable': Object
  },
  data: function () {
    return {
      filter: ''
    };
  },

  mounted: function () {
    this.updateFilter();
  },
  
  watch: {
    value: function (val, oldVal) {
      this.updateFilter();
    },
    monsterTable: function () {
      if (this.filter == '') { this.updateFilter(); }
    },
  },
  computed: {
    filteredMonsterTable: function () {
      // 文字が入力されていない場合は表示しない。
      if (this.filter.length < 1) { return {}; }
      var obj = {};
      for (var key in this.monsterTable) {
        var value = this.monsterTable[key];
        if (value && value.name && value.name.indexOf(this.filter) != -1) {
          obj[key] = value;
        }
      }
      return obj;
    },
  },
  
  methods: {
    updateFilter: function() {
      this.filter = (this.monsterTable[this.value] || { name: '' }).name;
    },

    updateValue: function (value) {
      this.filter = (this.monsterTable[value] || { name: '' }).name;
      this.$emit('input', value);
    },
    showPopup: function (target) {
      if (!$(target).siblings('.dropdown-menu').hasClass('show')) {
        $(target).dropdown('toggle');
      }
      $(target).dropdown('update');
    }
  },
});


Vue.component('monsterIncrementalSearch', {
  template: `
<div class="form-row">
  <div class="col-md-4">
    <div class="input-group">
      <monster-icon v-if="imageTable" :no="value" :monsterTable="monsterTable" :imageTable="imageTable" width="38px" height="38px" />
      <div class="input-group-prepend">
        <span class="input-group-text">No.</span>
      </div>
      <input :id="id" type="number" class="form-control"  
      :value="value"
      @input="updateValue($event.target.value);" min="1" max="9999">
    </div>
  </div>
  <div class="col-md-8">
      <monster-incremental-input 
      :value="value"
      @input="updateValue($event);" :monster-table="monsterTable" :imageTable="imageTable"></monster-incremental-input>
    </div>
  </div>
</div>
  `,
  props: [ 'id', 'value', 'monsterTable', 'imageTable' ],
  data: function () {
    return {
    };
  },
  
  methods: {
    updateValue: function (value) {
      this.$emit('input', value);
    }
  }
});


/**
 * ページ送りのコンポーネント
 */
Vue.component('pagination', {
  template: `
<nav">
  <ul class="pagination pagination-sm justify-content-center">
    <li class="page-item" :class="{ disabled: page <= 1 }">
      <router-link class="page-link" :to="createToObj(page - 1)" append aria-label="前">
        <span aria-hidden="true">&laquo;</span>
        <span class="sr-only">前</span>
      </router-link>
    </li>
    
    <li v-for="n in paginationNos" :class="{ 'page-item': 1, 'active': n == page }" style="min-width: 2.2em; text-align: center;">
      <router-link v-if="n != page" class="page-link" style="padding:.25rem .2rem;" :to="createToObj(n)" append>{{n}}</router-link>
      <span v-else class="page-link" style="padding:.25rem .35rem;">{{n}}</span>
    </li>

    <li class="page-item" :class="{ disabled: page >= pageCount }">
      <router-link class="page-link" :to="createToObj(page + 1)" append aria-label="次">
        <span aria-hidden="true">&raquo;</span>
        <span class="sr-only">次</span>
      </router-link>
    </li>
  </ul>
</nav>
  `,

  props: {
    'page': Number,
    'pageCount': Number,
    'itemCount': {
      type: Number,
      default: 7
    }
  },
  data: function () {
    return {
    };
  },
  methods: {
    createToObj: function (pageNo) {
      var query = Object.assign({}, this.$route.query);
      query.page = pageNo;

      return {
        path: this.$route.path,
        params: this.$route.params,
        query: query,
      };
    },
  },

  computed: {
    itemCountReal() { return Math.min(this.itemCount, this.pageCount); },
    itemCountHarf () { return (this.itemCountReal / 2) | 0; },
    paginationStart () {
      return (this.page > this.pageCount - this.itemCountHarf)
        ? this.pageCount - this.itemCountReal + 1
        : Math.max(1, this.page - this.itemCountHarf);
    },
    paginationEnd () {
      return (this.page <= this.itemCountHarf)
        ? this.itemCountReal
        : Math.min(this.pageCount, this.page + this.itemCountHarf);
    },

    paginationNos () {
      var array = [];
      for (var i = this.paginationStart; i <= this.paginationEnd; i++) {
        array.push(i);
      }
      return array;
    },
  }
});


/** モンスターアイコンを表示するコンポーネント。 */
Vue.component('monsterIcon', {
  template: `
  <img v-if="hasImage" :src="iconPath" style="border-radius: 6%;" :style="{width: width, height: height }" :alt="monsterNoAndName" :key="no" />
  <div v-else style="display: inline-block; background-color: #ccc; position:relative; vertical-align:bottom; border: 1px solid #bbb; border-bottom-width: 2px; border-radius: 6%;" :style="{ width: width, height: height }"> 
    <img v-if="hasAttr0" style="position:absolute; left:  2%; top:    2%; width: 23%; height: 23%;" :src="attrPath0" />
    <img v-if="hasAttr1" style="position:absolute; right: 2%; bottom: 2%; width: 23%; height: 23%;" :src="attrPath1" />
    <div :style="{ fontSize: fontSize, lineHeight: height }" style="text-align: center; overflow: hidden; color: #aaa;">{{no}}</div>
  </div>
  `,
  props: [ 'no', 'monsterTable', 'imageTable', 'width', 'height' ],
  
  computed: {
    hasImage: function () { return !!this.imageTable[this.no]; },
    monsterData: function () {return (this.monsterTable[this.no] || {}); },
    monsterNoAndName: function () { return `No.${this.monsterData.no} ${this.monsterData.name}`; },
    attributes: function () { return this.monsterData.attributes || []; },
    hasAttr0: function () { var attr = this.attributes[0]; return (attr && attr != 0 && attr != 99); },
    hasAttr1: function () { var attr = this.attributes[1]; return (attr && attr != 0 && attr != 99); },
    iconPath: function () { return `./monsterIconsLog/icon_${this.no}_${this.imageTable[this.no].id}.jpg`; },
    attrPath0: function () { return `./image/attribute/${this.attributes[0]}.png`; },
    attrPath1: function () { return `./image/attribute/${this.attributes[1]}.png`; },
    
    fontSize: function () {
      var ret = /^([\d|.]*)(.*)$/.exec(this.width);
      return ret[1] / 3 + ret[2];
    }
  }
});

/** ツイートボタン表示のコンポーネント */
Vue.component('tweetButton', {
  template: `<span :id="id" style="width: 61px; height:20px; display: inline-block;"></span>`,
  props: {
    'hashtags': String,
  },
  data: function () {
    return {
      id: 'tweetButton' + (Math.random() * 1000000).toFixed(0),
    };
  },
  mounted: function () {
    this.createButton();
  },
  watch: {
    '$route': function () {
      this.createButton();
    }
  },
  methods: {
    createButton: function () {
      if(typeof twttr === 'undefined') {
        setTimeout(() => { this.createButton(); }, 100);
        return;
      }
      var hashtags = 'パズドラ,mtPADmDB';
      if (this.hashtags) { hashtags += ',' + this.hashtags; }
      
      var targetId = 'tweetButtonPlace';
      var jq = $(`#${this.id}`);
      if (!jq.length) { return; }
      jq.empty();
      twttr.widgets.createShareButton(
        location.href,
        document.getElementById(this.id),
        {
          hashtags: hashtags,
        }
      );
    }
  }
});


// ページ用のコンポーネントで使用する処理のミックスイン
var mixinForPage = {
  created: function () {
    this.$_mixinForPage_updateTitle();
  },
  
  methods: {
    // ページタイトルの更新。
    $_mixinForPage_updateTitle: function () {
      if ('pageTitle' in this.$options) {
        var pageTitle = this.$options.pageTitle;
        if (typeof pageTitle === 'function') {
          pageTitle = pageTitle.call(this);
        }
        if (pageTitle) {
          document.title = `${pageTitle} - ${constData.title}`;
          // パンくずリスト
          var breadcrumbs = [
            { text: 'ホーム', link: '/' },
          ];
          var middleOfBreadcrumbs = this.$options.middleOfBreadcrumbs;
          if (typeof middleOfBreadcrumbs === 'function') {
            middleOfBreadcrumbs = middleOfBreadcrumbs.call(this);
          }
          if (middleOfBreadcrumbs) {
            breadcrumbs = breadcrumbs.concat(middleOfBreadcrumbs);
          }
          breadcrumbs.push({ text: pageTitle });

          this.$root.breadcrumbs = breadcrumbs;
        } else {
          document.title = constData.title;
          // パンくずリスト
          this.$root.breadcrumbs = [
            { text: 'ホーム' },
          ];
        }
      }
    },
  },
};

Vue.mixin(mixinForPage);


/**
 * アバウトページコンポーネント
 */
var componentAbout = {
  name: 'pageAbout',
  template: '#templateAbout',
  pageTitle: 'これは何？',
};


/**
 * モンスター一覧ページコンポーネント
 */
var componentMonsterList = {
  name: 'pageMonsterList',
  template: '#templateMonsterList',
  pageTitle: null,
  data: function () {
    return {
      searchWord: '',
      inPageCount: 50,
    };
  },

  created: function () {
    this.$store.commit('fetchCommonData');
    this.searchWord = this.$route.query.searchWord;
  },

  computed: {
    monsterTable () { return this.$store.state.monsterTable; },
    imageTable() { return this.$store.state.imageTable; },
    attrColors () { return constData.attrColors; },

    monsterCount () { return this.monsterTableArray.length; },
    /** モンスター一覧情報を読込中かどうか。 現在の実装だとデータ未登録の場合、ずっと読み込み中判定となる。 */
    isLoadingMonsterList () { return this.monsterCount == 0; },
    pageCount() { return ((this.searchedMonsterTableArray.length + this.inPageCount - 1) / this.inPageCount) | 0; },
    page () { return (this.$route.query.page * 1) || 1; },

    monsterTableArray: function() {
      var array = [];
      for (var key in this.monsterTable) {
        array.push(this.monsterTable[key]);
      }
      return array;
    },
    searchedMonsterTableArray: function () {
      var searchWord = this.$route.query.searchWord;
      if (!searchWord) { return this.monsterTableArray; }
      return this.monsterTableArray.filter(monsterData => {
        return monsterData.name.indexOf(searchWord) != -1;
      });
    },
    monsterTableInPage () {
      return this.searchedMonsterTableArray.slice((this.page - 1) * this.inPageCount, this.page * this.inPageCount);
    }
  },
  methods: {

    search: function () {
      this.$router.push({ path: this.$router.path, query: { searchWord: this.searchWord }});
    },

  }
};


/**
 * モンスター情報ページコンポーネント
 */
var componentMonsterData = {
  name: 'pageMonsterData',
  template: '#templateMonsterData',
  pageTitle: function () {
    var str = `No.${this.$route.params.no || this.monsterData.no} ${this.monsterData.name}`;
    if (this.isHistory) { str += ` (${this.monsterData.datetime})`; }
    return str;
  },
  props: [ 'no' ],
  data: function () {
    return {
      booleanTable: constData.booleanTable,
      typeTable: constData.typeTable,
      attributeTable: constData.attributeTable,
      evolutionTypeTable: constData.evolutionTypeTable,
      awakenTable: constData.awakenTable,

      /** 履歴情報の読み込み中かどうか。 */
      isLoadingHistory: false,
      /** 履歴情報 */
      histories: null,
    };
  },
  created: function () {
    this.fetchData();
  },

  watch: {
    '$route': function () {
      this.fetchData();
    }
  },
  
  methods: {
    fetchData: function () {
      this.$store.state.monsterData = constData.monsterClearData;
      this.histories = null;
      this.isLoadingHistory = false;

      var param = {
        callback: () => {
          this.$_mixinForPage_updateTitle();
        },
      };

      if (this.isHistory) {
        param.historyId = this.$route.params.id;
      } else {
        param.no = this.$route.params.no;
      }

      this.$_mixinForPage_updateTitle();
      this.$store.commit('loadMonsterData', param);
      this.$store.commit('fetchCommonData');
    },
    
    /** パラメータをプラス換算に変換する。 */
    culcPlusCountParam: function (param) {
      var obj = {
        hp: param.hp / 10,
        attack: param.attack / 5,
        recovery: param.recovery / 3,
      };
      obj.total = obj.hp + obj.attack + obj.recovery;
      return obj;
    },
    
    /** 履歴リストを取得する。 */
    loadHistories: function () {
      this.isLoadingHistory = true;
      axios.get('./api.cgi', {
        params: { mode: 'monsterHistory', no: this.monsterData.no }
      }).then(response => {
        this.histories = response.data;
      });
    },

    /** 指定された履歴情報が今有効なデータかどうかを取得する。 */
    isActiveHistory: function (history) {
      return history.state == 1;
    },
    /** 指定された履歴情報が現在表示している */
    isShowHistory: function (history) {
      if (this.isHistory) {
        return history.id == this.$route.params.id;
      } else {
        return this.isActiveHistory(history);
      }
    }
  },

  computed: {
    monsterTable: function () { return this.$store.state.monsterTable; },
    skillTable: function () { return this.$store.state.skillTable; },
    leaderSkillTable: function () { return this.$store.state.leaderSkillTable; },
    evolutionTable: function () { return this.$store.state.evolutionTable; },
    imageTable: function () { return this.$store.state.imageTable; },
    monsterData: function () { return this.$store.state.monsterData; },

    monsterImagePath: function () {
      var no = this.monsterData.no;
      var imageData = this.imageTable[no];
      if (!imageData) { return './monsterImages/notFound.jpg'; }
      return `./monsterImagesLog/${no}_${imageData.id}.jpg`;
    },
    skillDetails: function () {
      var skillDetails = {};
      if (this.monsterData.skill != 0) { 
        var target = this.skillTable[this.monsterData.skill];
        if (target) {
          skillDetails = target;
        }
      }
      return skillDetails;
    },
    leaderSkillDetails: function () {
      var leaderSkillDetails = {};
      if (this.monsterData.leaderSkill != 0) {
        var target = this.leaderSkillTable[this.monsterData.leaderSkill];
        if (target) {
          leaderSkillDetails = target;
        }
      }
      return leaderSkillDetails;
    },

    /** リーダースキル説明文を装飾したHTMLを取得する。 */
    leaderSkillDescriptionHtml: function () {
      var description = escapeHtml(this.leaderSkillDetails.description);
      description = description.replace(/^(【.*】|ドロップを\d+個以下で消せない)/, '<span style="color:rgba(224, 0, 0, 0.8);">$&</span>');
      return description;
    },

    /** このモンスターに振れる潜在キラーの番号を配列を取得する。 */
    senzaiKillerNos: function () {
      // 合成できないものは潜在覚醒を降ることができないので無し。
      if (!this.canAddPlus) { return []; }
      var killerNoSet = new Set();
      for (var type of this.monsterData.types) {
        for (var killerNo of this.typeTable[type].senzaiKiller) {
          killerNoSet.add(killerNo);
        }
      }
      return Array.from(killerNoSet).sort(((a, b) => a - b ));
    },

    /** プラスが振れるキャラクターかどうかを返す。 */
    canAddPlus: function () {
      // 素材系のタイプの場合はプラス合成不可と判断する。
      // レベルアップの可能なキャラの場合はプラスを降ることも可能だが需要もないだろうから無視。
      var type = this.monsterData.types[0];
      return !((type >= 9 && type <= 12) || type == 99);
    },

    /** 最大レベル時のパラメータが登録されているかどうかを取得する。 */
    hasMaxParam: function () { 
      var maxParam = this.monsterData.maxParam;
      return (maxParam.hp != undefined || maxParam.attack != undefined || maxParam.recovery != undefined);
    },
    /** 限界突破時のパラメータが登録されているかどうかを取得する。 */
    hasOverLimitParam: function () { 
      var maxParam = this.monsterData.overLimitParam;
      return (maxParam.hp != undefined || maxParam.attack != undefined || maxParam.recovery != undefined);
    },

    /** 最大レベル時のパラメータのプラス換算値 */
    plusCountParam: function () {
      return this.culcPlusCountParam(this.monsterData.maxParam);
    },
    /** 限界突破時のパラメータのプラス換算値 */
    plusCountOverlimitParam: function () {
      return this.culcPlusCountParam(this.monsterData.overLimitParam);
    },
    /** 編集履歴の表示かどうか。 */
    isHistory: function () {
      return (this.$route.name == 'history');
    },
  },
};


/**
 * モンスター情報変更履歴ページコンポーネント
 */
var componentHistory = {
  name: 'pageHistory',
  template: '#templateHistory',
  pageTitle: function () {
    return '履歴一覧';
  },
  props: [ 'no' ],
  data: function () {
    return {
      /** 履歴情報 */
      histories: null,
    };
  },
  created: function () {
    this.loadHistories();
  },
  
  methods: {
    /** 履歴リストを取得する。 */
    loadHistories: function () {
      this.isLoadingHistory = true;
      axios.get('./api.cgi', {
        params: { mode: 'monsterHistory' }
      }).then(response => {
        this.histories = response.data;
      });
    },

    /** 指定された履歴情報が今有効なデータかどうかを取得する。 */
    isActiveHistory: function (history) {
      return history.state == 1;
    },
    /** 指定された番号のモンスターの名前を取得する。 */
    monsterName: function (no) {
      return (this.monsterTable[no] || { name: '' }).name;
    }
  },

  computed: {
    monsterTable: function () { return this.$store.state.monsterTable; },
    imageTable: function () { return this.$store.state.imageTable; },

    /** 編集履歴の表示かどうか。 */
    isHistory: function () {
      return (this.$route.name == 'history');
    },
  },
};


/**
 * モンスター情報編集ページコンポーネント
 */
var componentMonsterEdit = {
  name: 'pageMonsterEdit',
  template: '#templateMonsterEdit',
  pageTitle: function () {
    if (this.isHistory) { return '履歴をもとに編集'; }
    if (this.$route.params.no) {
      return `編集 No.${this.$route.params.no} ${this.monsterData.name}`;
    } else {
      return '新規登録';
    }
  },
  middleOfBreadcrumbs: function () {
    if (this.isHistory) {
      return {
        text: `No.${this.monsterData.no} ${this.monsterData.name} (${this.monsterData.datetime})`,
        link: `/history/${this.$route.params.id}`,
      };
    } else if (this.$route.params.no) {
      return {
        text: `No.${this.$route.params.no} ${this.monsterData.name}`,
        link: `/${this.$route.params.no}`,
      };
    } else {
      return undefined;
    }
  },
  props: ['no'],
  data: function () {
    return {
      booleanTable: constData.booleanTable,
      typeTable: constData.typeTable,
      attributeTable: constData.attributeTable,
      evolutionTypeTable: constData.evolutionTypeTable,
      awakenTable: constData.awakenTable,

      monsterData: {},
      /** 送信済みかどうか。 */
      isSubmitted: false,
    };
  },

  created: function () {
    this.fetchData();
    window._inputFromJson = (json) => { this.inputFromJson(json); };
  },

  destroyed: function () {
    delete window._inputFromJson;
  },

  watch: {
    '$route.params.no': function () {
      this.fetchData();
    }
  },

  computed: {
    monsterTable: function () { return this.$store.state.monsterTable; },
    skillTable: function () { return this.$store.state.skillTable; },
    leaderSkillTable: function () { return this.$store.state.leaderSkillTable; },
    imageTable: function () { return this.$store.state.imageTable; },

    /** スキルレベル最大時の（最短の）スキルターン */
    minimumSkillTurn: function () {
      if (!this.skillDetails.baseTurn || !this.skillDetails.maxLevel) { return NaN; }
      var turn = this.skillDetails.baseTurn - this.skillDetails.maxLevel + 1;
      if (turn < 0) { return NaN; }
      return turn;
    },

    skillDetails: function () {
      if (this.monsterData.skill != 0) {
        this.monsterData.skillDetails = $.extend(true, { name:'', description:'' }, this.skillTable[this.monsterData.skill]);
      }
      return this.monsterData.skillDetails;
    },

    skillName: {
      get: function () { return this.skillDetails.name; },
      set: function (value) {
        this.skillDetails.name = value; 
        this.monsterData.skill = 0;
      }
    },
    skillBaseTurn: {
      get: function () { return this.skillDetails.baseTurn; },
      set: function (value) {
        this.skillDetails.baseTurn = value; 
        this.monsterData.skill = 0;
      }
    },
    skillMaxLevel: {
      get: function () { return this.skillDetails.maxLevel; },
      set: function (value) {
        this.skillDetails.maxLevel = value; 
        this.monsterData.skill = 0;
      }
    },
    skillDescription: {
      get: function () { return this.skillDetails.description; },
      set: function (value) {
        this.skillDetails.description = value; 
        this.monsterData.skill = 0;
      }
    },

    leaderSkillDetails: function () {
      if (this.monsterData.leaderSkill != 0) {
        this.monsterData.leaderSkillDetails = $.extend(true, { name:'', description:'' }, this.leaderSkillTable[this.monsterData.leaderSkill]);
      }
      return this.monsterData.leaderSkillDetails;
    },

    leaderSkillName: {
      get: function () { return this.leaderSkillDetails.name; },
      set: function (value) {
        this.leaderSkillDetails.name = value;
        this.monsterData.leaderSkill = 0;
      }
    },
    leaderSkillDescription: {
      get: function () { return this.leaderSkillDetails.description; },
      set: function (value) {
        this.leaderSkillDetails.description = value;
        this.monsterData.leaderSkill = 0;
      }
    },

    /** 編集履歴を元データとした編集かどうか。 */
    isHistory: function () {
      return (this.$route.name == 'historyEdit');
    },

    /** 超覚醒が 不明 かどうか */
    isUnknownSuperAwaken: function () {
      return this.monsterData.superAwakens.indexOf(null) != -1;
    },
  },
  
  methods: {
    /** 指定されたJSONテキストをもとに情報を設定する。 */
    inputFromJson: function (json) {
      this.monsterData = jQuery.extend(true, {}, constData.monsterClearData, JSON.parse(json));
      this.monsterData.comment = '新規登録';
    },
    fetchData: function () {
      this.monsterData = jQuery.extend(true, {}, constData.monsterClearData);
      this.$_mixinForPage_updateTitle();

      var commitParam = undefined;
      if (this.isHistory) {
        commitParam = { historyId: this.$route.params.id };
      }
      if (this.$route.params.no) {
        commitParam = { no: this.$route.params.no };
      }
      if (commitParam) {
        commitParam.callback = () => {
          var m = $.extend(true, {}, this.$store.state.monsterData);
          m.leaderSkillDetails = $.extend(true, m.leaderSkillDetails, this.leaderSkillTable[m.skill]);
          m.skillDetails = $.extend(true, m.skillDetails, this.skillTable[m.leaderSkill]);
          m.comment = '';

          this.monsterData = m;
          this.$_mixinForPage_updateTitle();
        };
        this.$store.commit('loadMonsterData', commitParam);
      } else {
        this.monsterData.comment = '新規登録';
      }
      this.$store.commit('fetchCommonData');
    },
    submit: function( ) {
      // 多重送信防止処理
      if (this.isSubmitted) { return; }
      this.isSubmitted = true;
      // 何かしらあってレスポンスが帰ってこなかった場合に再送信できるように２０秒後に復帰させる。
      var timeoutId = setTimeout(() => { this.isSubmitted = false; }, 20 * 1000);

      this.$store.commit('clearErrors');
      this.$store.commit('setMessages', [ '送信中...' ]);

      // データの整形
      // 超覚醒を昇順ソート
      this.monsterData.superAwakens.sort((a, b) => a - b);

      axios.post(
        './api.cgi', this.monsterData
      ).then(response => {
        // レスポンス来なかったときの復帰処理を止める。
        clearTimeout(timeoutId);

        this.$store.commit('clearErrors');
        this.$store.commit('clearMessages');
        if (response.data.error) {
          this.$store.commit('setErrors', response.data.error);
          // 再度送信可能にする。
          this.isSubmitted = false;
        } else {
          // Google Analiticsにイベントを送信。
          var action = 'monsterDataPost';
          if (this.$route.params.no) { action = 'monsterDataUpdate'; }      // 現在のデータを元した編集の場合
          if (this.isHistory) { action = 'monsterDataUpdateFromHistory'; }  // 編集履歴をもとにした編集の場合
          gtagProductionOnly('event', action, {
            'event_category': 'monsterData',
            'event_label': `No.${this.monsterData.no}`
          });

          this.$router.push({ path:`/${this.monsterData.no}` });
        }
        if (response.data.message) {
          this.$store.commit('setMessages', response.data.message);
        }
        if (response.data.newTableData) {
          var newTableData = response.data.newTableData;
          if (newTableData.monster) {
            this.$store.commit('addMonsterData', newTableData.monster);
          }
          if (newTableData.skillDetails) {
            this.$store.commit('addSkillData', newTableData.skillDetails);
          }
          if (newTableData.leaderSkillDetails) {
            this.$store.commit('addLeaderSkillData', newTableData.leaderSkillDetails);
          }
        }
      });
    }
  }, 
};


/**
 * 画像投稿ページコンポーネント
 */
var componentPic = {
  name: 'pagePic',
  template: '#templatePic',
  pageTitle: function () {
    if (this.$route.params.no) {
      return `画像投稿 No.${this.$route.params.no} ${this.selectMonsterName}`;
    } else {
      return '画像投稿';
    }
  },
  middleOfBreadcrumbs: function () {
    if (this.$route.params.no) {
      return { text: `No.${this.$route.params.no} ${this.selectMonsterName}`, link: '/' + this.$route.params.no };
    } else {
      return undefined;
    }
  },

  data: function () {
    return {
      monsterNo: null,
      uploadImgSrc: '',
      imageResultSrc: '',
      iconResultSrc: '',
      /** 送信済みかどうか */
      isSubmitted: false,
    };
  },

  created: function () {
    this.udpateMonsterNo();
  },

  watch: {
    '$route.params.no': function () {
      this.udpateMonsterNo();
    }
  },

  methods: {
    udpateMonsterNo: function () {
      if (this.$route.params.no) {
        this.monsterNo = this.$route.params.no;
      } else {
        this.monsterNo = '';
      }
      this.$_mixinForPage_updateTitle();
    },
    loadLocalImage: function loadLocalImage(e) {
      // ファイル情報を取得
      var fileData = e.target.files[0];
  
      // 画像ファイル以外は処理を止める
      if(!fileData.type.match('image.*')) {
        this.$store.commit('setErrors', [ '画像を選択してください' ]);
        return;
      }

      $(e.target).next('.custom-file-label').text($(e.target)[0].files[0].name);
  
      // FileReaderオブジェクトを使ってファイル読み込み
      var reader = new FileReader();
      // ファイル読み込みに成功したときの処理
      reader.onload = () => {
        // Canvas上に表示する
        var uploadImgSrc = reader.result;
        var iconSrcScale = [12 / 640, (1136 - 795.8) / 640, 98.5 / 640 ];
        var imageSrcScale = [ 50 / 640, (1136 - 795 + 480) / 640, 540 / 640, 405 / 640 ];
        var canvas = document.getElementById('canvas');
        var ctx = canvas.getContext('2d');

        // Canvas上に画像を表示
        var img = new Image();
        img.src = uploadImgSrc;
        img.onload = () => {
          var iconWidth = 98;
          var iconHeight = 98;
          
          function checkWaku(array, startIndex, targetColor) {
            function isRange(value, target, margin) {
              return value - margin <= target && value + margin >= target;
            }
            var colorMargin = 64;
            return  isRange(array[startIndex + 0], targetColor[0], colorMargin) &&
                    isRange(array[startIndex + 1], targetColor[1], colorMargin) &&
                    isRange(array[startIndex + 2], targetColor[2], colorMargin);
          }


          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, img.width, img.height);
          // 下端位置取得
          var data = ctx.getImageData(img.width * 0.1, 0, 8, img.height);
          var imgHeight = img.height;
          for (var i = data.height - 1; i > 0; i--) {
            if (checkWaku(data.data, data.width * 4 * i, [152, 114, 64])) {
              imgHeight = i + 1;
              break;
            }
          }
          // 上端位置取得
          var imgTop = 0;
          data = ctx.getImageData(1, 0, 8, img.height);
          for (var i = 0; i < img.height; i++) {
            if (checkWaku(data.data, data.width * 4 * i + 4, [152, 114, 64])) {
              imgTop = i;
              break;
            }
          }
          // 左端・横幅取得
          var marginLeft = 0;
          var imgWidth = img.width;
          data = ctx.getImageData(0, imgHeight - (img.width * 0.2) | 0, img.width, 8);
          for (var i = 0; i < data.width; i++) {
            if (checkWaku(data.data, 4 * i, [132, 101, 57])) {
              marginLeft = i;
              imgWidth -= marginLeft * 2;
              break;
            }
          }

          // 公式サイトのプレイヤー情報部分のない画像への対応。
          if (imgWidth == 640 && imgHeight >= 944 && imgHeight <= 948) {
            imgTop = imgHeight - 1096;
          }

          // アイコン画像取得
          var srcX = marginLeft + (iconSrcScale[0] * imgWidth) | 0;
          var srcY = (imgHeight - iconSrcScale[1] * imgWidth) | 0;
          var srcWidth = (iconSrcScale[2] * imgWidth )| 0;
          var srcHeight = srcWidth;

          // アイコン上端の黒い線の位置を探す。
          srcY += 1; // 上にずらして確認していくので、最初は5sサイズの上端ラインの１段下から始める。
          // アイコン左上の主属性の上辺りを確認する。
          var checkWidth = 8;
          var checkHeight = 16;
          var isHitBlackLine = false;
          data = ctx.getImageData(srcX + srcWidth * 0.2, srcY - (checkHeight - 1), checkWidth, checkHeight);
          for (var i = 0; i < 10; i++) {
            var n = 4 * (checkHeight - 1 - i) * checkWidth;
            if (data.data[n] < 40 && data.data[n + 1] < 40 && data.data[n + 2] < 40) {
              srcY -= i;
              isHitBlackLine = true;
              break;
            }
          }
          // 黒線が見つからなかった場合は最初の位置に戻す。
          if (!isHitBlackLine) { srcY -= 1; }
          
          // Canvasの準備
          canvas.width = iconWidth;
          canvas.height = iconHeight;
          ctx.drawImage(img, srcX, srcY, srcWidth, srcHeight, 0, 0, iconWidth, iconHeight);
          // canvasを画像に変換
          var data = canvas.toDataURL('image/jpeg', 0.7);
          this.iconResultSrc = data;

          // モンスター画像取得
          var imageWidth = 540;
          var imageHeight = 405;
          
          // モンスター画像の縦の中心を求める
          var monsterAreaTop = imgTop + 144 / 640 * imgWidth;
          var monsterAreaBottom = imgHeight - 354 / 640 * imgWidth;
          var monsterAreaMiddleRate = 0.624;
          var monsterAreaMiddleOffset = imgWidth * 0.07;
          var monsterAreaMiddle = (monsterAreaTop * monsterAreaMiddleRate + monsterAreaBottom * (1 - monsterAreaMiddleRate) - monsterAreaMiddleOffset) | 0;

          srcX = marginLeft + (imageSrcScale[0] * imgWidth + 0.5) | 0;
          srcY = monsterAreaMiddle - srcHeight / 2;
          srcWidth = (imageSrcScale[2] * imgWidth + 0.5)| 0;
          srcHeight = (imageSrcScale[3] * imgWidth + 0.5)| 0;
          // Canvasの準備
          canvas.width = imageWidth;
          canvas.height = imageHeight;
          ctx.drawImage(img, srcX, srcY, srcWidth, srcHeight, 0, 0, imageWidth, imageHeight);

          // canvasを画像に変換
          var data = canvas.toDataURL('image/jpeg', 0.85);
          this.imageResultSrc = data;

          // モンスター番号＆モンスター名の領域を切り抜く。
          var nameAreaHeight = 76 / 640 * imgWidth;
          var nameAreaTop = monsterAreaTop + 8 / 640 * imgWidth;
          srcX = marginLeft + (0.15 * imgWidth + 0.5) | 0;
          srcWidth = (0.7 * imgWidth + 0.5)| 0;
          // Canvasの準備
          canvas.width = srcWidth;
          canvas.height = nameAreaHeight;
          ctx.drawImage(img, srcX, nameAreaTop, srcWidth, nameAreaHeight, 0, 0, srcWidth, nameAreaHeight);
          // canvasを画像に変換
          this.uploadImgSrc = canvas.toDataURL('image/png');

          canvas.width = canvas.height = 0;
        };
          
      };
      // ファイル読み込みを実行
      reader.readAsDataURL(fileData);
    },

    submit: function () {
      function toBlob (dataUrl) {
        var bin = atob(dataUrl.replace(/^.*,/, ''));
        var buffer = new Uint8Array(bin.length);
        for (var i = 0; i < bin.length; i++) {
          buffer[i] = bin.charCodeAt(i);
        }
        // Blobを作成
        var blob = new Blob([buffer.buffer], {
          type: 'image/jpeg'
        });
        return blob;
      }

      if (!this.iconResultSrc) { this.$store.commit('setErrors', [ '画像が選択されていません。' ]); return; }
      if (this.monsterNo == 0) { this.$store.commit('setErrors', [ 'モンスター番号が指定されていません。' ]); return; }
      if (this.monsterNo < 1 || this.monsterNo > 9999) { this.$store.commit('setErrors', [ 'モンスター番号の指定が不正です。' ]); return; }
      
      // 多重送信防止処理
      if (this.isSubmitted) { return; }
      this.isSubmitted = true;
      // 何かしらあってレスポンスが帰ってこなかった場合に再送信できるように２０秒後に復帰させる。
      var timeoutId = setTimeout(() => { this.isSubmitted = false; }, 20 * 1000);
      
      this.$store.commit('clearErrors');
      this.$store.commit('setMessages', [ '送信中...' ]);

      var blobIcon = toBlob(this.iconResultSrc);
      var blobImage = toBlob(this.imageResultSrc);

      let formData = new FormData();
      formData.append('mode', 'image');
      formData.append('no', this.monsterNo);
      formData.append('icon', blobIcon);
      formData.append('image', blobImage);

      var onUploadProgress = (ev) => {
        if (ev.loaded == ev.total) {
          this.$store.commit('setMessages', [ '登録中...' ]);
        }
      };

      axios.post('./api.cgi', formData, {
        headers: { 'content-type': 'multipart/form-data' },
        onUploadProgress: onUploadProgress,
      }).then(response => {
        // レスポンス来なかったときの復帰処理を止める。
        clearTimeout(timeoutId);
        
        if (response.errors) {
          this.$store.commit('setErrors', response.data.errors);
          // 再度送信可能にする。
          this.isSubmitted = false;
        } else {
          // Google Analiticsにイベントを送信。
          var action = 'monsterImagePost';
          if (this.monsterNo in this.$store.state.imageTable) {
            action = 'monsterImageUpdate'; // すでに画像投稿のあるモンスターに対して上書き投稿した場合。
          }
          gtagProductionOnly('event', action, {
            'event_category': 'monsterImage',
            'event_label': `No.${this.monsterNo}`
          });

          this.$store.commit('setMessages', response.data.success);

          if (response.data.newTableData) {
            var newTableData = response.data.newTableData;
            if (newTableData.imageTable) {
              this.$store.commit('addImageData', newTableData.imageTable);
            }
          }

          if (this.$route.params.no) {
            this.$router.push({ path:`/${this.$route.params.no}` });
          } else {
            this.monsterNo = null;
            this.uploadImgSrc = '';
            this.iconResultSrc = '';
            this.imageResultSrc = '';
            $('#monsterImageFile').next('.custom-file-label').text('モンスター情報画像選択');
            $('html,body').scrollTop(0);
            // 再度送信可能にする。
            this.isSubmitted = false;
          }
        }
      });
    }
  },

  computed: {
    monsterTable: function () { return this.$store.state.monsterTable; },
    imageTable: function () { return this.$store.state.imageTable; },
    selectMonsterName: function () {
      return (this.monsterTable[this.$route.params.no] || {}).name || '';
    }
  }
};

/** 現在のURLでの history 形式でのルートを求める */
function getRouterBase () {
  var routerBaseArray = /^.*padmdb[^/]*\//i.exec(location.pathname);
  if (routerBaseArray) { return routerBaseArray[0]; }
  return '/';
}

// ルートオプションを渡してルーターインスタンスを生成します
var router = new VueRouter({
  mode: 'history',
  base: getRouterBase(),
  // 各ルートにコンポーネントをマッピングします
  // コンポーネントはVue.extend() によって作られたコンポーネントコンストラクタでも
  // コンポーネントオプションのオブジェクトでも構いません
  routes: [
    {
      path: '/',
      component: componentMonsterList,
      props: true
    },
    {
      path: '/edit',
      component: componentMonsterEdit,
      props: true
    },
    {
      path: '/:no/edit/',
      component: componentMonsterEdit,
      props: true
    },
    {
      path: '/pic',
      component: componentPic,
      props: true
    },
    {
      path: '/:no/pic',
      component: componentPic,
      props: true
    },
    {
      path: '/about',
      component: componentAbout,
    },
    {
      path: '/history',
      component: componentHistory,
      props: true
    },

    {
      path: '/history/:id',
      name: 'history',
      component: componentMonsterData,
      props: true
    },
    {
      path: '/history/:id/edit/',
      name: 'historyEdit',
      component: componentMonsterEdit,
      props: true
    },
    
    {
      path: '/compare',
      component: componentCompare,
      props: true
    },
    {
      path: '/compare/:nos',
      name: 'compare',
      component: componentCompare,
      props: true
    },
    {
      path: '/compare/:no1/:no2',
      name: 'compare',
      component: componentCompare,
    },
    
    {
      path: '/:no',
      component: componentMonsterData,
      props: true
    },
  ]
});

// ナビゲーション変更時に一番上にスクロールする。
router.afterEach((to, from) => {
  $('html,body').scrollTop(0);
});

// ルーターのインスタンスをrootとなるVueインスタンスに渡します
var app = new Vue({
  router: router,
  store: store,
  data: {
    breadcrumbs: [],
  },
  created: function () {
    this.$store.commit('fetchCommonData');
  },
  mounted: function () {
    this.sendGa();
  },
  watch: {
    '$route': function () {
      this.sendGa();
      // 元のページでのエラー表示を消す。
      this.$store.commit('clearErrors');
    }
  },
  methods: {
    /** Google Analytics のページビュートラッキングを送信する。 */
    sendGa: function () {
      // タイトルを変更させるために少しあとに実行する。
      setTimeout(() => {
        gtagProductionOnly('config', 'UA-124771141-1', {
          'page_location': location.href,
        });
      }, 1);
    },

    hideNavi: function () {
      if ($('#navbarNav').hasClass('show')) {
        $('button.navbar-toggler').click();
      }
    },

  },
  computed: {
    errors: function () { return this.$store.state.errors; },
    messages: function () { return this.$store.state.messages; },
    navis: function () { return constData.navis; }
  }
}).$mount('#app');
