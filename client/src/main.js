import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

Vue.config.productionTip = false

import { mtpadmdb, commonData, constData, gtagProductionOnly, escapeRegExp, leaderSkillDescriptionToDecoratedHtml, getRouterBase } from './mtpadmdb.js';

axios.interceptors.request.use(function (config) {
  config.headers['X-Requested-With'] = 'XMLHttpRequest';
  config.headers['Cache-Control'] = 'no-cache';
  config.headers['Expires'] = '-1';

  return config;
}, function (err) {
  return Promise.reject(err);
});

jQuery.fn.scrollParentShowThis = function () {
  if (this.length === 0) { return this; }
  
  const offsetParent = this.offsetParent();
  const scrollTop = offsetParent.scrollTop();
  const scrollHeight = offsetParent.height();
  
  const nowTop = this.position().top;
  const nowBottom = nowTop + this.height();
  if (nowTop < 0) {
    offsetParent.scrollTop(scrollTop + nowTop);
  }
  if (nowBottom > scrollHeight) {
    offsetParent.scrollTop(scrollTop + nowBottom - scrollHeight);
  }
  return this;
};


// 数字をカンマ区切りにする。
Vue.filter('addComma', function (val) {
  const arr = String(val).split('.');
  arr[0] = arr[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,');
  return arr.join('.');
});

Vue.component('pdSelect', {
  props: {
    'value': {
      type: [Number, String],
      default: 0
    }
  },
  data: function () {
    return {
      html: ''
    };
  },
  watch: {
    value: 'changeDisp'
  },
  mounted: function () {
    $(this.$el).on('shown.bs.dropdown', () => {
      $(this.$el).children('div.dropdown-menu').children('.active').focus().scrollParentShowThis();
    });
    this.$on('clickOption', this.clickOption);
    this.changeDisp(this.value);
  },
  methods: {
    clickOption: function (option) {
      this.$emit('input', option[0]);
      $(this.$el).children(0).focus();
    },
    changeDisp: function (value) {
      // html要素上では null の値はなく文字列になっているため、値が null の場合は文字列にする。
      value = (value === null) ? 'null' : value.toString();
      $(this.$el).children('.dropdown-menu').children().each((index, elem) => {
        if (elem.getAttribute('data-value') === value) {
          $(elem).addClass('active');
          this.html = $(elem).html();
        } else {
          $(elem).removeClass('active');
        }
      });
    }
  },
  template: `
<div class="dropdown pd-select" style="width: 100%">
  <div class="custom-select" tabindex="0" data-toggle="dropdown" v-html="html">{{html}}</div>
  <div class="dropdown-menu" style="height: auto; max-height: 200px; overflow-x: hidden; -webkit-overflow-scrolling: touch; width: 100%;">
    <slot></slot>
  </div>
</div>
  `
});

Vue.component('pdOption', {
  props: {
    value: {
      type: String,
      required: true
    }
  },

  methods: {
    click: function () {
      this.$parent.$emit('clickOption', [this.value]);
    }
  },
  template: `
<a class="dropdown-item pd-option" href="javascript:void(0);" @click="click" :data-value="value" style="width: 8em; overflow-x: hidden; display: inline-flex; padding: 4px;">
  <slot></slot>
</a>
  `
});

Vue.component('skillIncrementalInput', {
  props: {
    'id': {
      type: String,
      default: undefined
    },
    'value': {
      type: String,
      default: 0
    },
    'skillTable': {
      type: Object,
      required: true
    },
    'placeholder': {
      type: String,
      default: ''
    },
    'required': {
      type: Boolean,
      default: true
    }
  },

  computed: {
    filteredSkillTable: function () {
      // 文字が入力されていない場合は表示しない。
      if (this.value.length < 1) { return {}; }
      const obj = {};
      for (const key in this.skillTable) {
        const value = this.skillTable[key];
        if (value.name.indexOf(this.value) !== -1) {
          obj[key] = value;
        }
      }
      return obj;
    }
  },
  methods: {
    showPopup: function (target) {
      if (!$(target).siblings('.dropdown-menu').hasClass('show')) {
        $(target).dropdown('toggle');
      }
      $(target).dropdown('update');
    }
  },
  template: `
<div class="dropdown show">
  <input :value="value" :id="id" @input="$emit('input', $event.target.value); showPopup($event.target);" class="form-control dropdown-toggle" :placeholder="placeholder" data-toggle="dropdown" onfocus="$('.dropdown-toggle').dropdown();" :required="required" minLength="1" maxLength="50">
  <div class="dropdown-menu" style="height: auto; max-height: 200px; overflow-x: hidden;">
    <a v-for="value in filteredSkillTable" class="dropdown-item" @click="$emit('select-no', value.no)" href="javascript:void(0)">
      {{value.name}}<br>
      <span style="font-size: 80%;">{{value.description}}</span>
    </a>
  </div>
</div>
  `
});

Vue.component('monsterIncrementalInput', {
  props: {
    'value': {
      type: Number,
      default: null
    },
    'monsterTable': {
      type: Object,
      required: true
    },
    'imageTable': {
      type: Object,
      default: undefined
    }
  },
  data: function () {
    return {
      filter: ''
    };
  },
  computed: {
    filteredMonsterTable: function () {
      // 文字が入力されていない場合は表示しない。
      if (this.filter.length < 1) { return {}; }
      const obj = {};
      for (const key in this.monsterTable) {
        const value = this.monsterTable[key];
        if (value && value.name && value.name.indexOf(this.filter) !== -1) {
          obj[key] = value;
        }
      }
      return obj;
    }
  },
  watch: {
    value: function () {
      this.updateFilter();
    },
    monsterTable: function () {
      if (this.filter === '') { this.updateFilter(); }
    }
  },
  mounted: function () {
    this.updateFilter();
  },
  methods: {
    updateFilter: function () {
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
  template: `
<div class="dropdown show">
  <input v-model="filter" placeholder="モンスター名で検索" class="form-control dropdown-toggle" @input="showPopup($event.target);" data-toggle="dropdown">
  <div class="dropdown-menu" style="height: auto; max-height: 200px; overflow-x: hidden;">
    <a v-for="value in filteredMonsterTable" class="dropdown-item" @click="updateValue(value.no)" href="javascript:void(0)">
      <monster-icon v-if="imageTable" :no="value.no" :monsterTable="monsterTable" :imageTable="imageTable" width="1.6em" height="1.6em" />
      {{value.name}}
    </a>
  </div>
</div>
  `
});

Vue.component('monsterIncrementalSearch', {
  props: {
    'id': {
      type: String,
      default: undefined
    },
    'value': {
      type: Number,
      default: null
    },
    'monsterTable': {
      type: Object,
      required: true
    },
    'imageTable': {
      type: Object,
      default: undefined
    }
  },
  data: function () {
    return {
    };
  },
  
  methods: {
    updateValue: function (value) {
      this.$emit('input', value);
    }
  },
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
      @input="updateValue(parseInt($event.target.value));" min="1" max="9999">
    </div>
  </div>
  <div class="col-md-8">
      <monster-incremental-input
      :value="value"
      @input="updateValue($event);" :monster-table="monsterTable" :imageTable="imageTable"></monster-incremental-input>
    </div>
  </div>
</div>
  `
});

/**
 * ページ送りのコンポーネント
 */
Vue.component('pagination', {
  props: {
    'page': {
      type: Number,
      default: 0
    },
    'pageCount': {
      type: Number,
      required: true
    },
    'itemCount': {
      type: Number,
      default: 7
    }
  },
  data: function () {
    return {
    };
  },
  computed: {
    itemCountReal () { return Math.min(this.itemCount, this.pageCount); },
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
      const array = [];
      for (let i = this.paginationStart; i <= this.paginationEnd; i++) {
        array.push(i);
      }
      return array;
    }
  },
  methods: {
    createToObj: function (pageNo) {
      const query = Object.assign({}, this.$route.query);
      query.page = pageNo;

      return {
        path: this.$route.path,
        params: this.$route.params,
        query: query
      };
    }
  },
  template: `
<nav>
  <ul class="pagination pagination-sm justify-content-center">
    <li class="page-item" :class="{ disabled: page <= 1 }">
      <router-link class="page-link" :to="createToObj(page - 1)" append aria-label="前">
        <span aria-hidden="true">&laquo;</span>
        <span class="sr-only">前</span>
      </router-link>
    </li>
    
    <li v-for="n in paginationNos" :class="{ 'page-item': 1, 'active': n === page }" style="min-width: 2.2em; text-align: center;">
      <router-link v-if="n !== page" class="page-link" style="padding:.25rem .2rem;" :to="createToObj(n)" append>{{n}}</router-link>
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
  `
});

/** モンスターアイコンを表示するコンポーネント。 */
Vue.component('monsterIcon', {
  props: {
    'no': {
      type: Number,
      default: null
    },
    'monsterTable': {
      type: Object,
      default: undefined
    },
    'imageTable': {
      type: Object,
      required: true
    },
    'width': {
      type: String,
      default: '96px'
    },
    'height': {
      type: String,
      default: '96px'
    }
  },
  computed: {
    hasImage: function () { return !!this.imageTable[this.no]; },
    monsterData: function () { return (this.monsterTable[this.no] || {}); },
    monsterNoAndName: function () { return `No.${this.monsterData.no} ${this.monsterData.name}`; },
    attributes: function () { return this.monsterData.attributes || []; },
    hasAttr0: function () { const attr = this.attributes[0]; return (attr && attr !== 0 && attr !== 99); },
    hasAttr1: function () { const attr = this.attributes[1]; return (attr && attr !== 0 && attr !== 99); },
    iconPath: function () { return `./monsterIconsLog/icon_${this.no}_${this.imageTable[this.no].id}.jpg`; },
    attrPath0: function () { return `./image/attribute/${this.attributes[0]}.png`; },
    attrPath1: function () { return `./image/attribute/${this.attributes[1]}.png`; },
    
    fontSize: function () {
      const ret = /^([\d|.]*)(.*)$/.exec(this.width);
      return ret[1] / 3 + ret[2];
    }
  },
  template: `
  <div v-if="hasImage" style="display: inline-block; background-color: #ccc; vertical-align:bottom; border-radius: 6%;" :style="{ width: width, height: height }">
    <img :src="iconPath" style="border-radius: 6%;" :style="{width: width, height: height }" :alt="monsterNoAndName" :key="no" />
  </div>
  <div v-else style="display: inline-block; background-color: #ccc; position:relative; vertical-align:bottom; border: 1px solid #bbb; border-bottom-width: 2px; border-radius: 6%;" :style="{ width: width, height: height }">
    <img v-if="hasAttr0" style="position:absolute; left:  2%; top:    2%; width: 23%; height: 23%;" :src="attrPath0" />
    <img v-if="hasAttr1" style="position:absolute; right: 2%; bottom: 2%; width: 23%; height: 23%;" :src="attrPath1" />
    <div v-if="!isNaN(no)":style="{ fontSize: fontSize, lineHeight: height }" style="text-align: center; overflow: hidden; color: #aaa;">{{no}}</div>
  </div>
  `
});

/** ツイートボタン表示のコンポーネント */
Vue.component('tweetButton', {
  props: {
    'hashtags': {
      type: String,
      default: ''
    }
  },
  data: function () {
    return {
      id: 'tweetButton' + (Math.random() * 1000000).toFixed(0)
    };
  },
  watch: {
    '$route': function () {
      this.createButton();
    }
  },
  mounted: function () {
    this.createButton();
  },
  methods: {
    createButton: function () {
      if (typeof twttr === 'undefined') {
        setTimeout(() => { this.createButton(); }, 100);
        return;
      }
      let hashtags = 'パズドラ,mtPADmDB';
      if (this.hashtags) { hashtags += ',' + this.hashtags; }
      
      const jq = $(`#${this.id}`);
      if (!jq.length) { return; }
      jq.empty();
      twttr.widgets.createShareButton(
        location.href,
        document.getElementById(this.id),
        {
          hashtags: hashtags
        }
      );
    }
  },
  template: '<span :id="id" style="width: 61px; height:20px; display: inline-block;"></span>'
});

/** 親要素および親要素の子要素にのみ適用されるスタイル情報要素のコンポーネントです。 */
Vue.component('scopedStyle', {
  common: { inc: 0 },
  mounted: function () {
    const className = 'scopedStyle' + this.$options.common.inc++;
    this.$el.parentNode.classList.add(className);
    this.$el.textContent = this.$slots.default[0].text.replace(/([^\}]+\{)/g, `.${className} $1`);
  },
  template: '<div is="style" />'
});

// ページ用のコンポーネントで使用する処理のミックスイン
Vue.mixin({
  created: function () {
    this.$_mixinForPage_updateTitle();
  },
  methods: {
    // ページタイトルの更新。
    $_mixinForPage_updateTitle: function () { // eslint-disable-line camelcase
      if ('pageTitle' in this.$options) {
        let pageTitle = this.$options.pageTitle;
        if (typeof pageTitle === 'function') {
          pageTitle = pageTitle.call(this);
        }
        if (pageTitle) {
          document.title = `${pageTitle} - ${constData.title}`;
          // パンくずリスト
          let breadcrumbs = [
            { text: 'ホーム', link: '/' }
          ];
          let middleOfBreadcrumbs = this.$options.middleOfBreadcrumbs;
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
            { text: 'ホーム' }
          ];
        }
      }
    }
  }
});

/**
 * アバウトページコンポーネント
 */
const componentAbout = {
  name: 'pageAbout',
  template: '#templateAbout',
  pageTitle: 'これは何？'
};

/**
 * モンスター一覧ページコンポーネント
 */
const componentMonsterList = {
  name: 'pageMonsterList',
  template: '#templateMonsterList',
  pageTitle: null,
  data: function () {
    return {
      searchWord: '',
      inPageCount: 50
    };
  },

  created: function () {
    this.$store.commit('fetchCommonData');
    this.searchWord = this.$route.query.searchWord;
  },

  computed: {
    monsterTable () { return this.$store.state.monsterTable; },
    imageTable () { return this.$store.state.imageTable; },
    attrColors () { return constData.attrColors; },

    monsterCount () { return this.monsterTableArray.length; },
    /** モンスター一覧情報を読込中かどうか。 現在の実装だとデータ未登録の場合、ずっと読み込み中判定となる。 */
    isLoadingMonsterList () { return this.monsterCount === 0; },
    pageCount () { return ((this.searchedMonsterTableArray.length + this.inPageCount - 1) / this.inPageCount) | 0; },
    page () { return (this.$route.query.page * 1) || 1; },

    monsterTableArray: function () {
      const array = [];
      for (const key in this.monsterTable) {
        array.push(this.monsterTable[key]);
      }
      return array;
    },
    /** 検索条件を満たすモンスターデータの配列。 */
    searchedMonsterTableArray: function () {
      const searchWord = this.$route.query.searchWord;
      if (!searchWord) { return this.monsterTableArray; }
      const searchWords = searchWord.split(/\s+/g);
      // (?=.*hogehoge) が連続していて ^ と .*$ で挟まれた正規表現で、肯定先読みを利用した AND 検索になるとのこと。
      const regexp = new RegExp('^(?=.*' + searchWords.map(escapeRegExp).join(')(?=.*') + ').*$', 's');

      return this.monsterTableArray.filter(monsterData => {
        return regexp.test(monsterData.name);
      });
    },
    monsterTableInPage () {
      return this.searchedMonsterTableArray.slice((this.page - 1) * this.inPageCount, this.page * this.inPageCount);
    }
  },
  methods: {

    search: function () {
      this.$router.push({ path: this.$router.path, query: { searchWord: this.searchWord }});
    }

  }
};

/**
 * モンスター情報ページコンポーネント
 */
const componentMonsterData = {
  name: 'pageMonsterData',
  template: '#templateMonsterData',
  pageTitle: function () {
    let str = `No.${this.$route.params.no || this.monsterData.no} ${this.monsterData.name}`;
    if (this.isHistory) { str += ` (${this.monsterData.datetime})`; }
    return str;
  },
  props: ['no'],
  data: function () {
    return {
      booleanTable: constData.booleanTable,
      typeTable: constData.typeTable,
      attributeTable: constData.attributeTable,
      evolutionTypeTable: constData.evolutionTypeTable,
      awakenTable: constData.awakenTable,

      /** モンスター評価ページへのリンク情報の配列 */
      evaluationOfMonsterLinks: null,
      /** 履歴情報の読み込み中かどうか。 */
      isLoadingHistory: false,
      /** 履歴情報 */
      histories: null
    };
  },
  created: function () {
    this.fetchData();
    this.updateEvaluationOfMonsterLinks();
  },

  watch: {
    '$route': function () {
      this.fetchData();
    },
    'monsterData': ['$_mixinForPage_updateTitle', 'updateEvaluationOfMonsterLinks']
  },
  
  methods: {
    fetchData: function () {
      this.$store.state.monsterData = constData.monsterClearData;
      this.histories = null;
      this.isLoadingHistory = false;

      // 現在のデータの取得の場合は読み込み処理は行わず、monsterTable 内から取得する処理が computed の monsterData で行われる。

      if (this.isHistory) {
        const param = {
          callback: () => {
            this.$_mixinForPage_updateTitle();
          },
          historyId: this.$route.params.id
        };
        this.$store.commit('loadMonsterData', param);
      }
      this.$store.commit('fetchCommonData');
    },
    
    /** パラメータをプラス換算に変換する。 */
    culcPlusCountParam: function (param) {
      const obj = {
        hp: param.hp / 10,
        attack: param.attack / 5,
        recovery: param.recovery / 3
      };
      obj.total = obj.hp + obj.attack + obj.recovery;
      return obj;
    },
    /** モンスター評価ページへのリンク情報を更新する。 */
    updateEvaluationOfMonsterLinks: function () {
      this.evaluationOfMonsterLinks = null;
      if (this.isShowEvaluationLinks && this.monsterData.name) {
        axios.get('evaluation_of_monster_links.cgi', {
          params: { name: this.monsterData.name }
        }).then(response => {
          // 何らかの問題があってテキストが帰ってきた場合の対策。
          if (response.data.length > 100) {
            this.evaluationOfMonsterLinks = [];
          } else {
            this.evaluationOfMonsterLinks = response.data;
          }
        }).catch(response => {
          this.evaluationOfMonsterLinks = [];
        });
      }
    },
    /** 履歴リストを取得する。 */
    loadHistories: function () {
      this.isLoadingHistory = true;
      mtpadmdb.api('monsterHistory', { no: this.monsterData.no },
        (response) => {
          this.histories = response.data;
        });
    },

    /** 指定された履歴情報が今有効なデータかどうかを取得する。 */
    isActiveHistory: function (history) {
      return history.state === 1;
    },
    /** 指定された履歴情報が現在表示している */
    isShowHistory: function (history) {
      if (this.isHistory) {
        return history.id === parseInt(this.$route.params.id);
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
    monsterData: function () {
      return this.isHistory ? this.$store.state.monsterData : this.monsterTable[this.$route.params.no];
    },

    monsterImagePath: function () {
      const no = this.monsterData.no;
      const imageData = this.imageTable[no];
      if (!imageData) { return './monsterImages/notFound.jpg'; }
      return `./monsterImagesLog/${no}_${imageData.id}.jpg`;
    },
    skillDetails: function () {
      let skillDetails = {};
      if (this.monsterData.skill !== 0) {
        const target = this.skillTable[this.monsterData.skill];
        if (target) {
          skillDetails = target;
        }
      }
      return skillDetails;
    },
    leaderSkillDetails: function () {
      let leaderSkillDetails = {};
      if (this.monsterData.leaderSkill !== 0) {
        const target = this.leaderSkillTable[this.monsterData.leaderSkill];
        if (target) {
          leaderSkillDetails = target;
        }
      }
      return leaderSkillDetails;
    },

    /** リーダースキル説明文を装飾したHTMLを取得する。 */
    leaderSkillDescriptionHtml: function () {
      return leaderSkillDescriptionToDecoratedHtml(this.leaderSkillDetails.description);
    },

    /** このモンスターに振れる潜在キラーの番号を配列を取得する。 */
    senzaiKillerNos: function () {
      // 合成できないものは潜在覚醒を降ることができないので無し。
      if (!this.canAddPlus) { return []; }
      const killerNoSet = new Set();
      for (const type of this.monsterData.types) {
        for (const killerNo of this.typeTable[type].senzaiKiller) {
          killerNoSet.add(killerNo);
        }
      }
      return Array.from(killerNoSet).sort((a, b) => a - b);
    },

    /** プラスが振れるキャラクターかどうかを返す。 */
    canAddPlus: function () {
      // 素材系のタイプの場合はプラス合成不可と判断する。
      // レベルアップの可能なキャラの場合はプラスを降ることも可能だが需要もないだろうから無視。
      const type = this.monsterData.types[0];
      return !((type >= 9 && type <= 12) || type === 99);
    },
    /** 現在表示しているのがモンスター評価ページのリストを表示する情報かどうかを返す。 */
    isShowEvaluationLinks: function () {
      return !this.isHistory && this.canAddPlus;
    },

    /** 最大レベル時のパラメータが登録されているかどうかを取得する。 */
    hasMaxParam: function () {
      const maxParam = this.monsterData.maxParam;
      return (maxParam.hp !== null || maxParam.attack !== null || maxParam.recovery !== null);
    },
    /** 限界突破時のパラメータが登録されているかどうかを取得する。 */
    hasOverLimitParam: function () {
      const maxParam = this.monsterData.overLimitParam;
      return (maxParam.hp !== null || maxParam.attack !== null || maxParam.recovery !== null);
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
      return (this.$route.name === 'history');
    }
  }
};

/**
 * モンスター情報変更履歴ページコンポーネント
 */
const componentHistory = {
  name: 'pageHistory',
  template: '#templateHistory',
  pageTitle: function () {
    return '履歴一覧';
  },
  props: ['no'],
  data: function () {
    return {
      /** 履歴情報 */
      histories: null
    };
  },
  created: function () {
    this.loadHistories();
  },
  
  methods: {
    /** 履歴リストを取得する。 */
    loadHistories: function () {
      this.isLoadingHistory = true;
      mtpadmdb.api('monsterHistory', {},
        (response) => {
          this.histories = response.data;
        });
    },

    /** 指定された履歴情報が今有効なデータかどうかを取得する。 */
    isActiveHistory: function (history) {
      return history.state === 1;
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
      return (this.$route.name === 'history');
    }
  }
};

/**
 * モンスター情報編集ページコンポーネント
 */
const componentMonsterEdit = {
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
        link: `/history/${this.$route.params.id}`
      };
    } else if (this.$route.params.no) {
      return {
        text: `No.${this.$route.params.no} ${this.monsterData.name}`,
        link: `/${this.$route.params.no}`
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
      isSubmitted: false
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
      const turn = this.skillDetails.baseTurn - this.skillDetails.maxLevel + 1;
      if (turn < 0) { return NaN; }
      return turn;
    },

    skillDetails: function () {
      if (this.monsterData.skill !== 0) {
        this.monsterData.skillDetails = $.extend(true, { name: '', description: '' }, this.skillTable[this.monsterData.skill]);
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
      if (this.monsterData.leaderSkill !== 0) {
        this.monsterData.leaderSkillDetails = $.extend(true, { name: '', description: '' }, this.leaderSkillTable[this.monsterData.leaderSkill]);
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
      return (this.$route.name === 'historyEdit');
    },

    /** 超覚醒が 不明 かどうか */
    isUnknownSuperAwaken: function () {
      return this.monsterData.superAwakens.indexOf(null) !== -1;
    }
  },
  
  methods: {
    /** 指定されたJSONテキストをもとに情報を設定する。 */
    inputFromJson: function (json) {
      this.monsterData = jQuery.extend(true, {}, this.monsterData, JSON.parse(json));
      this.monsterData.comment = '新規登録';
    },
    fetchData: function () {
      this.monsterData = jQuery.extend(true, {}, constData.monsterClearData);
      this.$_mixinForPage_updateTitle();

      let commitParam = null;
      if (this.isHistory) {
        commitParam = { historyId: this.$route.params.id };
      }
      if (this.$route.params.no) {
        commitParam = { no: this.$route.params.no };
      }
      if (commitParam) {
        commitParam.callback = () => {
          const m = $.extend(true, {}, this.$store.state.monsterData);
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
    submit: function () {
      // 多重送信防止処理
      if (this.isSubmitted) { return; }
      this.isSubmitted = true;
      // 何かしらあってレスポンスが帰ってこなかった場合に再送信できるように２０秒後に復帰させる。
      const timeoutId = setTimeout(() => { this.isSubmitted = false; }, 20 * 1000);

      this.$store.commit('clearErrors');
      this.$store.commit('setMessages', ['送信中...']);

      // データの整形
      // 超覚醒を昇順ソート
      this.monsterData.superAwakens.sort((a, b) => a - b);

      mtpadmdb.api('updateMonster', this.monsterData, (response) => {
        // レスポンス来なかったときの復帰処理を止める。
        clearTimeout(timeoutId);

        // Google Analiticsにイベントを送信。
        let action = 'monsterDataPost';
        if (this.$route.params.no) { action = 'monsterDataUpdate'; } // 現在のデータを元した編集の場合
        if (this.isHistory) { action = 'monsterDataUpdateFromHistory'; } // 編集履歴をもとにした編集の場合
        gtagProductionOnly('event', action, {
          'event_category': 'monsterData',
          'event_label': `No.${this.monsterData.no}`
        });

        this.$router.push({ path: `/${this.monsterData.no}` });
      }, (response) => {
        // レスポンス来なかったときの復帰処理を止める。
        clearTimeout(timeoutId);
        // 再度送信可能にする。
        this.isSubmitted = false;
      });
    }
  }
};

/**
 * 画像投稿ページコンポーネント
 */
const componentPic = {
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
      isSubmitted: false
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
        this.monsterNo = null;
      }
      this.$_mixinForPage_updateTitle();
    },
    loadLocalImage: function loadLocalImage (e) {
      // ファイル情報を取得
      const fileData = e.target.files[0];
  
      // 画像ファイル以外は処理を止める
      if (!fileData.type.match('image.*')) {
        this.$store.commit('setErrors', ['画像を選択してください']);
        return;
      }

      $(e.target).next('.custom-file-label').text($(e.target)[0].files[0].name);
  
      // FileReaderオブジェクトを使ってファイル読み込み
      const reader = new FileReader();
      // ファイル読み込みに成功したときの処理
      reader.onload = () => {
        // Canvas上に表示する
        const uploadImgSrc = reader.result;
        const iconSrcScale = [12 / 640, (1136 - 795.8) / 640, 98.5 / 640];
        const imageSrcScale = [50 / 640, (1136 - 795 + 480) / 640, 540 / 640, 405 / 640];
        const canvas = document.getElementById('canvas');
        const ctx = canvas.getContext('2d');

        // Canvas上に画像を表示
        const img = new Image();
        img.src = uploadImgSrc;
        img.onload = () => {
          const iconWidth = 98;
          const iconHeight = 98;
          
          function checkWaku (array, startIndex, targetColor) {
            function isRange (value, target, margin) {
              return value - margin <= target && value + margin >= target;
            }
            const colorMargin = 64;
            return isRange(array[startIndex + 0], targetColor[0], colorMargin) &&
                    isRange(array[startIndex + 1], targetColor[1], colorMargin) &&
                    isRange(array[startIndex + 2], targetColor[2], colorMargin);
          }

          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, img.width, img.height);
          // 下端位置取得
          let data = ctx.getImageData(img.width * 0.1, 0, 8, img.height);
          let imgHeight = img.height;
          for (let i = data.height - 1; i > 0; i--) {
            if (checkWaku(data.data, data.width * 4 * i, [152, 114, 64])) {
              imgHeight = i + 1;
              break;
            }
          }
          // 上端位置取得
          let imgTop = 0;
          data = ctx.getImageData(1, 0, 8, img.height);
          for (let i = 0; i < img.height; i++) {
            if (checkWaku(data.data, data.width * 4 * i + 4, [152, 114, 64])) {
              imgTop = i;
              break;
            }
          }
          // 左端・横幅取得
          let marginLeft = 0;
          let imgWidth = img.width;
          data = ctx.getImageData(0, imgHeight - (img.width * 0.2) | 0, img.width, 8);
          for (let i = 0; i < data.width; i++) {
            if (checkWaku(data.data, 4 * i, [132, 101, 57])) {
              marginLeft = i;
              imgWidth -= marginLeft * 2;
              break;
            }
          }

          // 公式サイトのプレイヤー情報部分のない画像への対応。
          let isOfficialW750 = false;
          if (imgWidth === 640 && imgHeight >= 944 && imgHeight <= 948) {
            imgTop = imgHeight - 1096;
          }
          if (imgWidth === 750 && imgHeight >= 1117 && imgHeight <= 1119) {
            imgTop = imgHeight - 1293;
            isOfficialW750 = true;
          }

          // アイコン画像取得
          let srcX = marginLeft + (iconSrcScale[0] * imgWidth) | 0;
          let srcY = (imgHeight - iconSrcScale[1] * imgWidth) | 0;
          let srcWidth = (iconSrcScale[2] * imgWidth) | 0;
          let srcHeight = srcWidth;

          // アイコン上端の黒い線の位置を探す。
          srcY += 1; // 上にずらして確認していくので、最初は5sサイズの上端ラインの１段下から始める。
          // アイコン左上の主属性の上辺りを確認する。
          const checkWidth = 8;
          const checkHeight = 16;
          let isHitBlackLine = false;
          data = ctx.getImageData(srcX + srcWidth * 0.2, srcY - (checkHeight - 1), checkWidth, checkHeight);
          for (let i = 0; i < 10; i++) {
            const n = 4 * (checkHeight - 1 - i) * checkWidth;
            if ((data.data[n] < 40 && data.data[n + 1] < 40 && data.data[n + 2] < 40) ||
                (isOfficialW750 && data.data[n] < 60 && data.data[n + 1] < 20 && data.data[n + 2] < 10)) { // iPhoneから公式サイトの横750pxが画像を指定したとき用
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
          this.iconResultSrc = canvas.toDataURL('image/jpeg', 0.7);

          // モンスター画像取得
          const imageWidth = 540;
          const imageHeight = 405;
          
          // モンスター画像の縦の中心を求める
          const monsterAreaTop = imgTop + 144 / 640 * imgWidth;
          const monsterAreaBottom = imgHeight - 354 / 640 * imgWidth;
          const monsterAreaMiddleRate = 0.624;
          const monsterAreaMiddleOffset = imgWidth * 0.07;
          const monsterAreaMiddle = (monsterAreaTop * monsterAreaMiddleRate + monsterAreaBottom * (1 - monsterAreaMiddleRate) - monsterAreaMiddleOffset) | 0;

          srcX = marginLeft + (imageSrcScale[0] * imgWidth + 0.5) | 0;
          srcY = monsterAreaMiddle - srcHeight / 2;
          srcWidth = (imageSrcScale[2] * imgWidth + 0.5) | 0;
          srcHeight = (imageSrcScale[3] * imgWidth + 0.5) | 0;
          // Canvasの準備
          canvas.width = imageWidth;
          canvas.height = imageHeight;
          ctx.drawImage(img, srcX, srcY, srcWidth, srcHeight, 0, 0, imageWidth, imageHeight);

          // canvasを画像に変換
          this.imageResultSrc = canvas.toDataURL('image/jpeg', 0.85);

          // モンスター番号＆モンスター名の領域を切り抜く。
          const nameAreaHeight = 76 / 640 * imgWidth;
          const nameAreaTop = monsterAreaTop + 8 / 640 * imgWidth;
          srcX = marginLeft + (0.15 * imgWidth + 0.5) | 0;
          srcWidth = (0.7 * imgWidth + 0.5) | 0;
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
        const bin = atob(dataUrl.replace(/^.*,/, ''));
        const buffer = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) {
          buffer[i] = bin.charCodeAt(i);
        }
        // Blobを作成
        const blob = new Blob([buffer.buffer], {
          type: 'image/jpeg'
        });
        return blob;
      }

      if (!this.iconResultSrc) { this.$store.commit('setErrors', ['画像が選択されていません。']); return; }
      if (isNaN(this.monsterNo) || this.monsterNo === null) { this.$store.commit('setErrors', ['モンスター番号が指定されていません。']); return; }
      if (this.monsterNo < 1 || this.monsterNo > 9999) { this.$store.commit('setErrors', ['モンスター番号の指定が不正です。']); return; }
      
      // 多重送信防止処理
      if (this.isSubmitted) { return; }
      this.isSubmitted = true;
      // 何かしらあってレスポンスが帰ってこなかった場合に再送信できるように２０秒後に復帰させる。
      const timeoutId = setTimeout(() => { this.isSubmitted = false; }, 20 * 1000);
      
      this.$store.commit('clearErrors');
      this.$store.commit('setMessages', ['送信中...']);

      const blobIcon = toBlob(this.iconResultSrc);
      const blobImage = toBlob(this.imageResultSrc);

      const formData = new FormData();
      formData.append('no', this.monsterNo);
      formData.append('icon', blobIcon);
      formData.append('image', blobImage);

      const onUploadProgress = (ev) => {
        if (ev.loaded === ev.total) {
          this.$store.commit('setMessages', ['登録中...']);
        }
      };

      mtpadmdb.api('image', formData, {
        headers: { 'content-type': 'multipart/form-data' },
        onUploadProgress: onUploadProgress
      }, (response) => {
        // レスポンス来なかったときの復帰処理を止める。
        clearTimeout(timeoutId);

        // Google Analiticsにイベントを送信。
        let action = 'monsterImagePost';
        if (this.monsterNo in this.$store.state.imageTable) {
          action = 'monsterImageUpdate'; // すでに画像投稿のあるモンスターに対して上書き投稿した場合。
        }
        gtagProductionOnly('event', action, {
          'event_category': 'monsterImage',
          'event_label': `No.${this.monsterNo}`
        });

        if (this.$route.params.no) {
          this.$router.push({ path: `/${this.$route.params.no}` });
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
      }, (response) => {
        // レスポンス来なかったときの復帰処理を止める。
        clearTimeout(timeoutId);
        // 再度送信可能にする。
        this.isSubmitted = false;
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

// ナビゲーション変更時に一番上にスクロールする。
router.afterEach(() => {
  $('html,body').scrollTop(0);
});

// ルーターのインスタンスをrootとなるVueインスタンスに渡します
new Vue({
  router: router,
  store: store,
  data: {
    breadcrumbs: []
  },
  computed: {
    errors: function () { return this.$store.state.errors; },
    messages: function () { return this.$store.state.messages; },
    navis: function () { return constData.navis; }
  },
  watch: {
    '$route': function () {
      this.sendGa();
      // 元のページでのエラー表示を消す。
      this.$store.commit('clearErrors');
    }
  },
  created: function () {
    this.$store.commit('fetchCommonData');
  },
  mounted: function () {
    this.sendGa();
  },
  methods: {
    /** Google Analytics のページビュートラッキングを送信する。 */
    sendGa: function () {
      // タイトルを変更させるために少しあとに実行する。
      setTimeout(() => {
        gtagProductionOnly('config', 'UA-124771141-1', {
          'page_location': location.href
        });
      }, 1);
    },

    hideNavi: function () {
      if ($('#navbarNav').hasClass('show')) {
        $('button.navbar-toggler').click();
      }
    }
  }
}).$mount('#app');
