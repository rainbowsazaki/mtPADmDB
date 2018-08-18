
var commonData = {

  booleanTable: {
    0: "×",
    1: "○",

    9: "不明",
  },

  typeTable: {
    0: { name: "なし", senzaiKiller: [] },
    1: { name: "神", senzaiKiller: [ 3, 9, 10, 11, 12 ] },
    2: { name: "ドラゴン", senzaiKiller: [ 4, 9, 10, 11, 12] },
    3: { name: "悪魔", senzaiKiller: [ 1, 9, 10, 11, 12 ] },
    4: { name: "マシン", senzaiKiller: [1, 6, 9, 10, 11, 12 ] },
    5: { name: "バランス", senzaiKiller: [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12 ] },
    6: { name: "攻撃", senzaiKiller: [ 3, 7, 9, 10, 11, 12 ] },
    7: { name: "体力", senzaiKiller: [ 4, 8, 9, 10, 11, 12 ] },
    8: { name: "回復", senzaiKiller: [ 2, 6, 9, 10, 11, 12 ] },
    9: { name: "進化用", senzaiKiller: [] },
    10: { name: "能力覚醒用", senzaiKiller: [] },
    11: { name: "合成強化用", senzaiKiller: [] },
    12: { name: "売却用", senzaiKiller: [] },

    99: { name: "不明", senzaiKiller: [] },
  },

  attributeTable: {
    0: "なし",
    1: "火",
    2: "水",
    3: "木",
    4: "光",
    5: "闇",
    99: "不明",
  },

  attrColors: {
    0: "rgba(0,0,0,0)",
    1: "rgba(255, 0, 0, 1.0)",
    2: "rgba(0, 192, 255, 1.0)",
    3: "rgba(0, 224, 0, 1.0)",
    4: "rgba(255, 255, 0, 1.0)",
    5: "rgba(192, 0, 192, 1.0)",

    99: "rgba(192, 192, 192, 1.0)",
  },

  evolutionTypeTable: {
    0: "進化なし",
    1: "通常進化",
    2: "究極進化",
    3: "転生進化",
    4: "ドット進化",
    5: "アシスト進化",

    99: "不明"
  },

  awakenTable: {
    0: { name: "なし", description: '' },
    1: { name: "HP強化", description: 'HPが500アップする' },
    2: { name: "攻撃強化", description: '攻撃力が100アップする' },
    3: { name: "回復強化", description: '回復力が200アップする' },
    4: { name: "火ダメージ軽減", description: '火属性の敵から\n受けるダメージを軽減する' },
    5: { name: "水ダメージ軽減", description: '水属性の敵から\n受けるダメージを軽減する' },
    6: { name: "木ダメージ軽減", description: '木属性の敵から\n受けるダメージを軽減する' },
    7: { name: "光ダメージ軽減", description: '光属性の敵から\n受けるダメージを軽減する' },
    8: { name: "闇ダメージ軽減", description: '闇属性の敵から\n受けるダメージを軽減する' },
    9: { name: "自動回復", description: 'ドロップを消したターン、HPが回復する' },
    10: { name: "バインド耐性", description: '自分自身へのバインド攻撃を\n無効化することがある' },
    11: { name: "暗闇耐性", description: '暗闇攻撃を無効化することがある' },
    12: { name: "お邪魔耐性", description: 'お邪魔攻撃や爆弾攻撃を\n無効化することがある' },
    13: { name: "毒耐性", description: '毒攻撃を無効化することがある' },
    14: { name: "火ドロップ強化", description: '強化された火ドロップの出現率と\nダメージがアップする' },
    15: { name: "水ドロップ強化", description: '強化された水ドロップの出現率と\nダメージがアップする' },
    16: { name: "木ドロップ強化", description: '強化された木ドロップの出現率と\nダメージがアップする' },
    17: { name: "光ドロップ強化", description: '強化された光ドロップの出現率と\nダメージがアップする' },
    16: { name: "闇ドロップ強化", description: '強化された闇ドロップの出現率と\nダメージがアップする' },
    19: { name: "操作時間延長", description: 'ドロップ操作時間が少し延びる' },
    20: { name: "バインド回復", description: '回復ドロップを横一列でそろえて消すと\nバインド状態が3ターン回復する' },
    21: { name: "スキルブースト", description: 'チーム全体のスキルが\n1ターン溜まった状態で始まる' },
    22: { name: "火属性強化", description: '火ドロップを横一列でそろえて消すと\n火属性の攻撃力がアップする' },
    23: { name: "水属性強化", description: '水ドロップを横一列でそろえて消すと\n火属性の攻撃力がアップする' },
    24: { name: "木属性強化", description: '木ドロップを横一列でそろえて消すと\n火属性の攻撃力がアップする' },
    25: { name: "光属性強化", description: '光ドロップを横一列でそろえて消すと\n火属性の攻撃力がアップする' },
    26: { name: "闇属性強化", description: '闇ドロップを横一列でそろえて消すと\n火属性の攻撃力がアップする' },
    27: { name: "2体攻撃", description: '自分と同じ属性のドロップを4個消すと\n攻撃力がアップし、敵2体に攻撃する' },
    28: { name: "封印耐性", description: 'スキル封印攻撃を無効化することがある' },
    29: { name: "回復ドロップ強化", description: '強化された回復ドロップの出現率と\n回復力がアップする\n回復の4個消しで回復力がアップする' },
    30: { name: "マルチブースト", description: '協力プレイ時に\n自分の全パラメータがアップする' },
    31: { name: "ドラゴンキラー", description: 'ドラゴンタイプの敵に対して\n攻撃力がアップする' },
    32: { name: "神キラー", description: '神タイプの敵に対して\n攻撃力がアップする' },
    33: { name: "悪魔キラー", description: '悪魔タイプの敵に対して\n攻撃力がアップする' },
    34: { name: "マシンキラー", description: 'マシンタイプの敵に対して\n攻撃力がアップする' },
    35: { name: "バランスキラー", description: 'バランスタイプの敵に対して\n攻撃力がアップする' },
    36: { name: "攻撃キラー", description: '攻撃タイプの敵に対して\n攻撃力がアップする' },
    37: { name: "体力キラー", description: '体力タイプの敵に対して\n攻撃力がアップする' },
    38: { name: "回復キラー", description: '回復タイプの敵に対して\n攻撃力がアップする' },
    39: { name: "進化用キラー", description: '進化用タイプの敵に対して\n攻撃力がアップする' },
    40: { name: "能力覚醒用キラー", description: '能力覚醒用タイプの敵に対して\n攻撃力がアップする' },
    41: { name: "強化合成用キラー", description: '強化合成用タイプの敵に対して\n攻撃力がアップする' },
    42: { name: "売却用キラー", description: '売却用タイプの敵に対して\n攻撃力がアップする' },
    43: { name: "コンボ強化", description: '7コンボ以上で攻撃力がアップする' },
    44: { name: "ガードブレイク", description: '5属性同時攻撃すると\n敵の防御力を無視してダメージを与える' },
    45: { name: "追加攻撃", description: '回復ドロップを縦一列でそろえて消すと\n1ダメージの追い打ち' },
    46: { name: "チームHP強化", description: 'チームのHPが5％アップする' },
    47: { name: "チーム回復強化", description: 'チームの回復力が10％アップする' },
    48: { name: "ダメージ無効貫通", description: '自分と同じ属性のドロップを3×3の正方形で消すと\n攻撃力がアップし、ダメージ無効を貫通する' },
    49: { name: "覚醒アシスト", description: '他のモンスターにアシストすると\n自分の覚醒スキルが付与される' },
    50: { name: "超追加攻撃", description: '回復ドロップを3×3の正方形で消すと\n攻撃力がアップし、2ダメージの追い打ち' },
    51: { name: "スキルチャージ", description: '5属性同時攻撃すると\n自分のスキルが1ターン貯まる' },
    52: { name: "バインド耐性+", description: '自分自身へのバインド攻撃を\n無効化する' },
    53: { name: "操作時間延長+", description: 'ドロップ操作時間が延びる' },
    54: { name: "雲耐性", description: '雲攻撃を無効化する' },
    55: { name: "操作不可耐性", description: '操作不能攻撃を無効化する' },
    56: { name: "スキルブースト+", description: 'チーム全体のスキルが\n2ターン溜まった状態で始まる' },
    57: { name: "HP80%以上強化", description: 'HP80%以上で攻撃力がアップする' },
    58: { name: "HP50%以下強化", description: 'HP50%以下で攻撃力がアップする' },
    59: { name: "L字消し軽減", description: '回復ドロップ5個をL字型に消すと\n敵から受けるダメージを軽減する' },
    60: { name: "L字消し攻撃", description: '自分と同じ属性のドロップ5個を\nL字型に消すと攻撃力がアップし、\n盤面のロック状態を解除する' },
    61: { name: "超コンボ強化", description: '10コンボ以上で攻撃力がかなりアップする' },
    62: { name: "コンボドロップ", description: '自分と同じ属性のドロップを12個つなげて消すと\nコンボドロップが1個落ちてくる(最大3個まで)' },
    63: { name: "スキルボイス", description: 'スキル使用時に声が出る' },
    64: { name: "ダンジョンボーナス", description: '1人プレイのときにランク経験値、モンスター経験値、入手コイン、卵ドロップ率がほんの少し上昇' },

    99: { name: "不明", description: '' },
  },

  monsterData: {
    no: undefined,
    name:"",
    attributes: [ 0, 0 ],
    cost: 0,
    rare: 0,
    types: [ 0, 0, 0],
    awakens: [ 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
    expTable:0,
    maxLevel:0,
    maxParam: {
      hp: 0,
      attack: 0,
      recovery: 0
    },
    skill: 0,
    skillDetails: {
      name: '',
      description: '',
      baseTurn: 0,
      maxLevel: 0
    },
    leaderSkill: 0,
    leaderSkillDetails: {
      name: '',
      description: ''
    },
    assist: 0,
    overLimit: 0,
    overLimitParam: {
      hp:0,
      attack:0,
      recovery: 0
    },
    superAwakens: [],
    evolutionType: 0,
    evolution: {
      baseNo: 0,
      materials: [
        0, 0, 0, 0, 0
      ]
    }
  },
  monsterData_: {
    no:3764,
    name:"刻水の時女神・スクルド",
    attributes: [ 2, 0 ],
    cost: 50,
    rare: 8,
    types: [ 1, 6, 0],
    awakens: [ 27, 26, 7, 28, 7, 29, 45, 43, 43 ],
    expTable:4000000,
    maxLevel:99,
    maxParam: {
    },
    skill: {
    },
    leaderSkill: {
    },
    assist: 1,
    overLimit: 9,
    overLimitParam: {
      hp:5375,
      attack:2011,
      recovery: 181
    },
    superAwakens: [],
    evolutionType: 2,
    evolution: {
      baseNo:1674,
      materials: [
        148, 148, 1294, 1294, 247
      ]
    },

  },

  navis: [
    { text: 'ホーム', to: '/' },
    { text: '新規追加', to: '/edit' },
    { text: '画像投稿', to: '/pic' },
    { text: 'これは何？', to: '/about' },
  ],

  isLoadedTableData: 0,
  monsterTable: {},
  skillTable: {},
  leaderSkillTable: {},
  imageTable: {},

  messages: [],
  errors: []
};

const constData = {
  title: "みんなで作るパズドラデータベース",

  /** モンスター情報の空データ */
  monsterClearData: {
    no: 0,
    name:"",
    attributes: [ 99, 0 ],
    cost: undefined,
    rare: undefined,
    types: [ 99, 0, 0],
    awakens: [ 99, 0, 0, 0, 0, 0, 0, 0, 0 ],
    expTable: undefined,
    maxLevel: undefined,
    maxParam: {
      hp: undefined,
      attack: undefined,
      recovery: undefined
    },
    skill: 0,
    skillDetails: {
      name: '',
      description: '',
      baseTurn: undefined,
      maxLevel: undefined
    },
    leaderSkill: 0,
    leaderSkillDetails: {
      name: '',
      description: ''
    },
    assist: 9,
    overLimit: 9,
    overLimitParam: {
      hp: undefined,
      attack: undefined,
      recovery: undefined
    },
    superAwakens: [],
    evolutionType: 99,
    evolution: {
      baseNo: undefined,
      materials: [
        undefined, undefined, undefined, undefined, undefined
      ]
    },
    comment: ''
  },
};


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


const store = new Vuex.Store({
  state: commonData,
  mutations: {
    fetchCommonData: function (state) {
      axios.all([
        axios.get('./listJson/monster_list.json'),
        axios.get('./listJson/skill_list.json'),
        axios.get('./listJson/leader_skill_list.json'),
        axios.get('./listJson/image_list.json'),
      ]).then( axios.spread( (monsterListResponse, skillListResponse, leaderSkillListResponse, imageListResponse) => {
        state.monsterTable = monsterListResponse.data;
        state.skillTable = skillListResponse.data;
        state.leaderSkillTable = leaderSkillListResponse.data;
        state.imageTable = imageListResponse.data;
      }));
    },
    
    loadMonsterData: function (state, param) {
      this.commit('setMessages', [ '初期情報取得中' ]);
      axios.get('./monsterJson/' + param.no + '.json').then(
        response => {
          // 古いモンスターデータJSONとの互換性保持。（いずれ消す）
          if (!('skill' in response.data)) {
            response.data.skill = response.data.skillNo;
            delete response.data.skillNo;
          }
          if (!('leaderSkill' in response.data)) {
            response.data.leaderSkill = response.data.leaderSkillNo;
            delete response.data.leaderSkillNo
          }
          if (!('evolutionType' in response.data)) {
            response.data.evolutionType = response.data.evolution.type;
            delete response.data.evolution.type;
          }

          var data = $.extend(true, {}, commonData.monsterClearData, response.data);
          state.monsterData = data;
          
          this.commit('setMessages', [ '取得完了' ]);
          if (typeof param.callback === 'function') { param.callback(); }
        }
      ).catch(
        error => {
          var errorMessage = `モンスターデータファイル (${error.config.url}) が ${error.response.status} ${error.response.statusText} です。`;
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

    setErrors: function (state, errors) {
      state.errors = errors;
    },
    setMessages: function (state, messages) {
      state.messages = messages;
      setTimeout(() => {
        state.messages = [];
      }, 2000)
    },
    clearErrors: function (state) {
      store.errors = [];
    },
    clearMessages: function (state) {
      state.messages = [];
    },
    deleteError: function (state, error) {
      state.errors = state.errors.filter(n => n !== error);
    },
    deleteMessage: function (state, message) {
      state.messages = state.messages.filter(n => n !== message)
    }
  }
})


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
  <input :value="value" @input="$emit('input', $event.target.value); showPopup($event.target);" class="form-control dropdown-toggle" :placeholder="placeholder" data-toggle="dropdown" onfocus="$('.dropdown-toggle').dropdown();" required minLength="1" maxLength="50">
  <div class="dropdown-menu" style="height: auto; max-height: 200px; overflow-x: hidden;">
    <a v-for="(value, key) in filteredSkillTable" class="dropdown-item" @click="$emit('select-no', key)" href="javascript:void(0)">
      {{value.name}}<br>
      <span style="font-size: 80%;">{{value.description}}</span>
    </a>
  </div>
</div>
  `,
  props: [ 'value', 'skillTable', 'placeholder' ],

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
  <input v-model="filter" class="form-control dropdown-toggle" @input="showPopup($event.target);" data-toggle="dropdown">
  <div class="dropdown-menu" style="height: auto; max-height: 200px; overflow-x: hidden;">
    <a v-for="(value, key) in filteredMonsterTable" class="dropdown-item" @click="updateValue(key)" href="javascript:void(0)">
      {{value.name}}
    </a>
  </div>
</div>
  `,
  props: [ 'value', 'monsterTable' ],
  data: function () {
    return {
      filter: ""
    }
  },

  mounted: function () {
    this.updateFilter();
  },
  
  watch: {
    value: function (val, oldVal) {
      this.updateFilter();
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
      <div class="input-group-prepend">
        <span class="input-group-text">No.</span>
      </div>
      <input type="number" class="form-control"  
      :value="value"
      @input="updateValue($event.target.value);">
    </div>
  </div>
  <div class="col-md-8">
      <monster-incremental-input 
      :value="value"
      @input="updateValue($event);" :monster-table="monsterTable"></monster-incremental-input>
    </div>
  </div>
</div>
  `,
  props: [ 'value', 'monsterTable' ],
  data: function () {
    return {
      filter: ""
    }
  },

  mounted: function () {
    this.updateFilter();
  },
  
  watch: {
    value: function (val, oldVal) {
      this.updateFilter();
    },
  },
  computed: {
    filteredMonsterTable: function () {
      var obj = {};
      for (var key in this.monsterTable) {
        var value = this.monsterTable[key];
        if (value.name.indexOf(this.filter) != -1) {
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
    }
  }
});


/**
 * ページ送りのコンポーネント
 */
Vue.component('pagination', {
  template: `
<nav">
  <ul class="pagination justify-content-center">
    <li class="page-item" :class="{ disabled: page <= 1 }">
      <router-link class="page-link" :to="'?page=' + (page - 1)" append aria-label="前">
        <span aria-hidden="true">&laquo;</span>
        <span class="sr-only">前</span>
      </router-link>
    </li>
    
    <li v-for="n in paginationNos" :class="{ 'page-item': 1, 'active': n == page }">
      <router-link v-if="n != page" class="page-link" :to="'?page=' + n" append>{{n}}</router-link>
      <span v-else class="page-link">{{n}}</span>
    </li>

    <li class="page-item" :class="{ disabled: page >= pageCount }">
      <router-link class="page-link" :to="'?page=' + (page + 1)" append aria-label="次">
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
      default: 5
    }
  },
  data: function () {
    return {
    }
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
  pageTitle: undefined,
  data: function () {
    return {
      inPageCount: 20,
    };
  },
  computed: {
    monsterTable () { return this.$store.state.monsterTable; },
    attrColors () { return this.$store.state.attrColors; },

    pageCount() { return ((this.monsterTableArray.length + this.inPageCount - 1) / this.inPageCount) | 0; },
    page () { return (this.$route.query.page * 1) || 1; },

    monsterTableArray: function() {
      var array = [];
      for (var key in this.monsterTable) {
        array.push(this.monsterTable[key]);
      }
      return array;
    },
    monsterTableInPage () {
      return this.monsterTableArray.slice((this.page - 1) * this.inPageCount, this.page * this.inPageCount);
    }
  },
};


/**
 * モンスター情報ページコンポーネント
 */
var componentMonsterData = {
  name: 'pageMonsterData',
  template: '#templateMonsterData',
  pageTitle: function () {
    return `No.${this.$route.params.no} ${this.monsterData.name}`;
  },
  props: [ 'no' ],
  data: function () {
    return {
      booleanTable: commonData.booleanTable,
      typeTable: commonData.typeTable,
      attributeTable: commonData.attributeTable,
      evolutionTypeTable: commonData.evolutionTypeTable,
      awakenTable: commonData.awakenTable,
    };
  },
  created: function () {
    this.fetchData();
  },

  watch: {
    "$route.params.no": function () {
      this.fetchData();
    }
  },
  
  methods: {
    fetchData: function () {
      this.$store.state.monsterData = constData.monsterClearData;
      this.$_mixinForPage_updateTitle();
      this.$store.commit('loadMonsterData', { 
          no: this.$route.params.no,
          callback: () => {
            this.$_mixinForPage_updateTitle();
          },
      });
    },
    hasImage: function (no) {
      return (no in this.$store.state.imageTable);
    },
    getIconPath: function (no) {
      if (this.hasImage(no)) {
        return `./monsterImages/icon_${no}.jpg`;
      } else {
        return undefined;
      }
    },
  },

  computed: {
    monsterTable: function () { return this.$store.state.monsterTable; },
    skillTable: function () { return this.$store.state.skillTable; },
    leaderSkillTable: function () { return this.$store.state.leaderSkillTable; },
    
    monsterData: function () { return this.$store.state.monsterData },

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

    senzaiKillerNos: function () {
      var killerNoSet = new Set();
      for (var type of this.monsterData.types) {
        for (var killerNo of this.typeTable[type].senzaiKiller) {
          killerNoSet.add(killerNo);
        }
      }
      return Array.from(killerNoSet).sort(((a, b) => a - b ));
    }
  },
};


/**
 * モンスター情報編集ページコンポーネント
 */
var componentMonsterEdit = {
  name: 'pageMonsterEdit',
  template: '#templateMonsterEdit',
  pageTitle: function () {
    if (this.$route.params.no) {
        return `編集 No.${this.$route.params.no} ${this.monsterData.name}`;
    } else {
      return '編集';
    }
  },
  middleOfBreadcrumbs: function () {
    if (this.$route.params.no) {
      return { text: `No.${this.$route.params.no} ${this.monsterData.name}`, link: '/' + this.$route.params.no };
    } else {
      return undefined;
    }
  },
  props: ['no'],
  data: function () {
    return {
      booleanTable: commonData.booleanTable,
      typeTable: commonData.typeTable,
      attributeTable: commonData.attributeTable,
      evolutionTypeTable: commonData.evolutionTypeTable,
      awakenTable: commonData.awakenTable,

      monsterData: {},
    };
  },

  created: function () {
    this.fetchData();
  },

  watch: {
    "$route.params.no": function () {
      this.fetchData();
    }
  },

  computed: {
    monsterTable: function () { return this.$store.state.monsterTable; },
    skillTable: function () { return this.$store.state.skillTable; },
    leaderSkillTable: function () { return this.$store.state.leaderSkillTable; },

//    monsterData: function () { return this.$store.state.monsterData },

    skillDetails: function () {
      if (this.monsterData.skill != 0) {
        this.setSkillNo(this.monsterData.skill);
        this.monsterData.skill = 0;
      }
      return this.monsterData.skillDetails;
    },
    leaderSkillDetails: function () {
      if (this.monsterData.leaderSkill != 0) {
        this.setLeaderSkillNo(this.monsterData.leaderSkill);
        this.monsterData.leaderSkill = 0;
      }
      return this.monsterData.leaderSkillDetails;
    },
  },
  
  methods: {
    fetchData: function () {
      this.monsterData = jQuery.extend(true, {}, constData.monsterClearData);
      this.$_mixinForPage_updateTitle();
      if (this.$route.params.no) {
        this.$store.commit('loadMonsterData', { 
          no: this.$route.params.no,
          callback: () => {
            var m = $.extend(true, {}, this.$store.state.monsterData);
            m.leaderSkillDetails = $.extend(true, m.leaderSkillDetails, this.leaderSkillTable[m.skill]);
            m.skillDetails = $.extend(true, m.skillDetails, this.skillTable[m.leaderSkill]);
            m.comment = '';

            this.monsterData = m;
            this.$_mixinForPage_updateTitle();
          }
        });
      }
    },
    setSkillNo: function (no) {
      this.monsterData.skillDetails = $.extend(true, {}, this.skillTable[no]);
    },
    setLeaderSkillNo: function (no) {
      this.monsterData.leaderSkillDetails = $.extend(true, {}, this.leaderSkillTable[no]);
    },
    submit: function( ) {
      this.$store.commit('clearMessages');
      this.$store.commit('setMessages', [ '通信中...' ]);

      axios.post('./api.cgi', this.monsterData)
      .then(response => {
        this.$store.commit('clearErrors');
        this.$store.commit('clearMessages');
        if (response.data.error) {
          this.$store.commit('setErrors', response.data.error);
        } else {
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
      })
    }
  }, 
}


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
      return { text: `No.${this.$route.params.no} ${this.selectMonsterName}`, link: '/' + this.$route.params.no }
    } else {
      return undefined;
    }
  },

  data: function () {
    return {
      monsterNo: 0,
      uploadImgSrc: '',
      imageResultSrc: '',
      iconResultSrc: '',
    };
  },

  created: function () {
    this.udpateMonsterNo();
  },

  watch: {
    "$route.params.no": function () {
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
          alert('画像を選択してください');
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
          this.uploadImgSrc = reader.result;

          // Canvas上に画像を表示
          var img = new Image();
          img.src = uploadImgSrc;
          img.onload = () => {
            var iconWidth = 96;
            var iconHeight = 96;
            
            function checkWaku(array, startIndex, targetColor) {
              function isRange(value, target, margin) {
                return value - margin <= target && value + margin >= target;
              }
              var colorMargin = 64;
              return  isRange(array[startIndex + 0], targetColor[0], colorMargin) &&
                      isRange(array[startIndex + 1], targetColor[1], colorMargin) &&
                      isRange(array[startIndex + 2], targetColor[2], colorMargin)
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

            // アイコン画像取得
            var srcX = marginLeft + (iconSrcScale[0] * imgWidth) | 0;
            var srcY = (imgHeight - iconSrcScale[1] * imgWidth) | 0;
            var srcWidth = (iconSrcScale[2] * imgWidth )| 0;
            var srcHeight = srcWidth + 1;

            // Canvasの準備
            canvas.width = iconWidth;
            canvas.height = iconHeight;
            ctx.drawImage(img, srcX, srcY, srcWidth, srcHeight, 0, 0, iconWidth, iconHeight);

            // 一番上が黒くなかったら位置を微調整
            data = ctx.getImageData(0, 0, 32, 8);
            if (data.data[4 * 8 + 0] > 200 || data.data[4 * 8 + 1] > 200 || data.data[4 * 8 + 2] > 200) {
              ctx.drawImage(img, srcX, srcY - (640 * 5 / imgWidth), srcWidth, srcHeight, 0, 0, iconWidth, iconHeight);
            }

            // canvasを画像に変換
            var data = canvas.toDataURL('image/jpeg', 0.7);
            this.iconResultSrc = data;

            // モンスター画像取得
            var imageWidth = 540;
            var imageHeight = 405;
            
            srcX = marginLeft + (imageSrcScale[0] * imgWidth + 0.5) | 0;
            srcY = (imgHeight - imageSrcScale[1] * imgWidth + 0.5) | 0;
            srcWidth = (imageSrcScale[2] * imgWidth + 0.5)| 0;
            srcHeight = (imageSrcScale[3] * imgWidth + 0.5)| 0;
            // Canvasの準備
            canvas.width = imageWidth;
            canvas.height = imageHeight;
            ctx.drawImage(img, srcX, srcY, srcWidth, srcHeight, 0, 0, imageWidth, imageHeight);

            // canvasを画像に変換
            var data = canvas.toDataURL('image/jpeg', 0.7);
            this.imageResultSrc = data;

            canvas.width = canvas.height = 0;
          }
          
      }
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
            type: "image/jpeg"
        });
        return blob;
      }

      if (!this.iconResultSrc) { alert('画像が選択されていません。'); return; }
      if (this.monsterNo == 0) { alert('モンスター番号が指定されていません。'); return; }
      if (this.monsterNo < 1 || this.monsterNo > 9999) { alert('モンスター番号の指定が不正です。'); return; }
      
      var blobIcon = toBlob(this.iconResultSrc);
      var blobImage = toBlob(this.imageResultSrc);

      let formData = new FormData();
      formData.append('mode', 'image');
      formData.append('no', this.monsterNo);
      formData.append('icon', blobIcon);
      formData.append('image', blobImage);

      axios.post('./api.cgi', formData, {
        headers: { 'content-type': 'multipart/form-data' },
      })
      .then(response => {
        if (response.errors) {
          alert(response.data.errors);
        } else {
          alert(response.data.success);
          if (this.$route.params.no) {
            this.$router.push({ path:`/${this.$route.params.no}` });
          } else {
            this.monsterNo = 0;
            this.uploadImgSrc = '';
            this.iconResultSrc = '';
            this.imageResultSrc = '';
            $('#monsterImageFile').next('.custom-file-label').text('モンスター情報画像選択');
            $('html,body').scrollTop(0);
          }
        }
      });
    }
  },

  computed: {
    monsterTable: function () { return this.$store.state.monsterTable; },
    selectMonsterName: function () {
      return (this.monsterTable[this.$route.params.no] || {}).name || '';
    }
  }
}


// ルートオプションを渡してルーターインスタンスを生成します
var router = new VueRouter({
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
      path: '/edit/:no',
      component: componentMonsterEdit,
      props: true
    },
    {
      path: '/pic',
      component: componentPic,
      props: true
    },
    {
      path: '/pic/:no',
      component: componentPic,
      props: true
    },
    {
      path: '/about',
      component: componentAbout,
    },
    {
      path: '/:no',
      component: componentMonsterData,
      props: true
    },
  ]
})

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
  computed: {
    errors: function () { return this.$store.state.errors; },
    messages: function () { return this.$store.state.messages; },
    navis: function () { return this.$store.state.navis; }
  }
}).$mount('#app')
