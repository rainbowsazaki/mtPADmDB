<template>

  <div id="filter">
    <div v-if="!hideName" class="row">
      <div class="col-sm-12 mb-2">
        <input type="text" class="form-control" placeholder="モンスター名検索" v-model="filter.name">
      </div>
    </div>

    <span id="filterTrigger" :class="{ open: isOpenFilterTrigger }" @click="isVisibleFilter = !isVisibleFilter">
      その他絞り込み
      <svg viewBox="0 0 100 100" width="1em" height="1em">
        <path v-if="isVisibleFilter" d="M50 0 L10 75 L90 75 Z" />
        <path v-else d="M50 75 L10 0 L90 0 Z" />
      </svg>
    </span>
    <transition name="filter"
                @before-enter="setStyleHeight($event, 'filter'); isOpenFilterTrigger = true;"
                @after-enter="clearStyleHeight($event); isFullOpenFilterTrigger = true;"
                @before-leave="setStyleHeight($event); isFullOpenFilterTrigger = false;"
                @after-leave="isOpenFilterTrigger = false;"
    >
      <form id="filterForm" v-if="isVisibleFilter">
        <div class="formMenu">
          <div class="formMenuTitle">モンスター絞り込み</div>
          <a class="btn" @click="isVisibleFilter = false;">×</a>
        </div>
        <div class="formBottomMenu">
          <button class="btn btn-secondary btn-sm" type="button" @click="clearFilter">クリア</button>
          <button class="btn btn-primary btn-sm" type="button" @click="isVisibleFilter = false;">OK</button>
        </div>
        <div class="row">
          <label class="col-4 col-form-label">主属性</label>
          <div class="col-8">
            <attr-select use-unknown checkbox-style v-model="filter.attr" />
          </div>
        </div>
        <div class="row">
          <label class="col-4 col-form-label">複属性</label>
          <div class="col-8">
            <attr-select use-none checkbox-style v-model="filter.subAttr" />
          </div>
        </div>
        <div class="row">
          <label class="col-4 col-form-label">タイプ</label>
          <div class="col-8">
            <attr-select use-unknown checkbox-style mode="type" v-model="filter.type" />
          </div>
        </div>
        <div class="from-group row">
          <label class="col-4 col-form-label">レアリティ</label>
          <label class="col-8">
            <input type="number" v-model.number.lazy="filter.rarityMin" required min="1" max="10">以上
            <input type="number" v-model.number.lazy="filter.rarityMax" required min="1" max="10">以下
          </label>
        </div>
        <div class="row">
          <label class="col-4 col-form-label">スキル<span class="inlineBlock">ターン</span></label>
          <div class="col-8">
            <input type="number" v-model.number.lazy="filter.skillTurnMin" required min="1" max="99">以上
            <input type="number" v-model.number.lazy="filter.skillTurnMax" required min="1" max="99">以下
          </div>
        </div>
        <div class="row">
          <label class="col-sm-4 col-form-label">覚醒</label>
          <div class="col-sm-8">
            <awaken-select v-model="filter.awaken" />
          </div>
        </div>
        <div class="row">
          <label class="col-4 col-form-label">スキル<span class="inlineBlock">ブースト</span></label>
          <div class="col-8">
            <input type="number" v-model.number.lazy="filter.skillBoostMin" required min="0" max="9">以上
            <input type="number" v-model.number.lazy="filter.skillBoostMax" required min="0" max="9">以下
          </div>
        </div>
        <div class="row timeExtension">
          <label class="col-4 col-form-label">操作時間<span class="inlineBlock">延長</span></label>
          <div class="col-8">
            <input type="number" v-model.number="filter.timeExtensionMin" required min="0" max="4" step="0.5">秒以上
          </div>
        </div>
        <div class="row">
          <label class="col-4 col-form-label">アシスト</label>
          <div class="col-8">
            <select class="custom-select" v-model.number="filter.assist">
              <option :value="undefined">すべて</option>
              <option value="1">○</option>
              <option value="0">×</option>
            </select>
          </div>
        </div>
        <div class="innerButtons">
          <button class="btn btn-secondary btn-sm" type="button" @click="clearFilter">クリア</button>
        </div>
      </form>
    </transition>

    <ul class="settingText">
      <li v-for="(text, n) in filterSettingTextArray" :key="`settingText${n}`">{{ text }}</li>
    </ul>
  </div>
</template>

<script>
import { constData, commonData, escapeRegExp, toAimaiSearch, MultiSendBlocker } from '../mtpadmdb.js';
import RouteQueryWrapper from '../components/mixins/routeQueryWrapper.js';

/** filterの初期値。 */
const filterDefault = {
  name: undefined,
  attr: [],
  subAttr: [],
  type: [],
  awaken: [],
  rarityMin: 1,
  rarityMax: 10,
  skillTurnMin: 1,
  skillTurnMax: 99,
  skillBoostMin: 0,
  skillBoostMax: 9,
  timeExtensionMin: 0,
  assist: undefined
};

/** 頻出する一部の漢字を、ひらがなでも検索できるようにする */
function replaceKanjiWordToRegExp (str) {
  const wordPairList = [
    ['かくせい', '覚醒'],
    ['てんせい', '転生'],
    ['きょくせい|ごくせい', '極醒'],
    ['ばんにん', '番人'],
    ['かめん', '仮面'],
    ['ほうぎょく', '宝玉'],
    ['きせき', '希石']
  ];

  for (const wordPair of wordPairList) {
    str = str.replace(new RegExp(wordPair[0]), `(?:${wordPair[1]}|$&)`);
  }
  return str;
}

/** filter の初期値のオブジェクトを取得する。 */
export function getFilterDefault () {
  return Object.assign({}, filterDefault);
}

/**
 * 指定されたフィルタリング設定に基づき、モンスター情報を判定する関数を作成する。
 * フィルタリング指定のない設定の場合は、isAll プロパティに true が入った関数を返す。
 */
export function getFilterFunction (setting) {
  const functionArray = [];
  if (setting.name) {
    const searchWords = setting.name.split(/\s+/g);
    const searchWordsRegText = searchWords.map(escapeRegExp).map(replaceKanjiWordToRegExp).map(toAimaiSearch);
    // (?=.*hogehoge) が連続していて ^ と .*$ で挟まれた正規表現で、肯定先読みを利用した AND 検索になるとのこと。
    const regexp = new RegExp('^(?=.*' + searchWordsRegText.join(')(?=.*') + ').*$', 's');
    functionArray.push(d => { return regexp.test(d.name); });
  }
  if (setting.attr && setting.attr.length > 0) {
    const filterObj = {};
    for (const attr of setting.attr) { filterObj[attr] = true; }
    functionArray.push(d => filterObj[d.attributes[0]]);
  }
  if (setting.subAttr && setting.subAttr.length > 0) {
    const filterObj = {};
    for (const attr of setting.subAttr) { filterObj[attr] = true; }
    functionArray.push(d => filterObj[d.attributes[1]]);
  }
  if (setting.type && setting.type.length > 0) {
    const filterObj = {};
    for (const type of setting.type) { filterObj[type] = true; }
    functionArray.push(d => d.types.some(type => filterObj[type]));
  }
  if (setting.awaken && setting.awaken.length > 0) {
    const awakenFilter = {};
    for (const awaken of setting.awaken) {
      awakenFilter[awaken] = (awakenFilter[awaken] || 0) + 1;
    }
    const awakenKeys = Object.keys(awakenFilter);
    functionArray.push(d => awakenKeys.every(key => d.awakenCount[key] >= awakenFilter[key]));
  }
  const rarityMin = setting.rarityMin || filterDefault.rarityMin;
  const rarityMax = setting.rarityMax || filterDefault.rarityMax;
  if (rarityMin !== filterDefault.rarityMin ||
      rarityMax !== filterDefault.rarityMax) {
    functionArray.push(d => {
      return d.rare >= rarityMin && d.rare <= rarityMax;
    });
  }
  const skillTurnMin = setting.skillTurnMin || filterDefault.skillTurnMin;
  const skillTurnMax = setting.skillTurnMax || filterDefault.skillTurnMax;
  if (skillTurnMin !== filterDefault.skillTurnMin ||
      skillTurnMax !== filterDefault.skillTurnMax) {
    functionArray.push(d => {
      const skill = commonData.skillTable[d.skill];
      if (!skill) { return false; }
      // 最短ターン情報がない場合は弾く。
      if (skill.minTurn === null) { return false; }
      return skill.minTurn >= skillTurnMin && skill.minTurn <= skillTurnMax;
    });
  }
  const skillBoostMin = setting.hasOwnProperty('skillBoostMin') ? setting.skillBoostMin : filterDefault.skillBoostMin;
  const skillBoostMax = setting.hasOwnProperty('skillBoostMax') ? setting.skillBoostMax : filterDefault.skillBoostMax;
  if (skillBoostMin !== filterDefault.skillBoostMin ||
      skillBoostMax !== filterDefault.skillBoostMax) {
    functionArray.push(d => {
      const skillBoost = (d.awakenCount[21] | 0) + (d.awakenCount[56] | 0) * 2;
      return skillBoost >= skillBoostMin && skillBoost <= skillBoostMax;
    });
  }
  const timeExtensionMin = setting.hasOwnProperty('timeExtensionMin') ? setting.timeExtensionMin : filterDefault.timeExtensionMin;
  if (timeExtensionMin !== filterDefault.timeExtensionMin) {
    functionArray.push(d => {
      const timeExtension = (d.awakenCount[19] | 0) * 0.5 + (d.awakenCount[53] | 0) * 1;
      return timeExtension >= timeExtensionMin;
    });
  }
  
  if (setting.assist !== undefined) {
    functionArray.push(d => d.assist === setting.assist);
  }
  // フィルタリングがない場合は常に true を返す関数を返す。
  if (functionArray.length === 0) {
    const retFunc = d => true;
    retFunc.isAll = true;
    return retFunc;
  }
  return d => functionArray.every(f => f(d));
}

/** フィルタリング設定を使用してモンスター情報の配列から、フィルタリング情報の条件を満たすもののみ取り出した配列を作成する。 */
export function filterMonsterDataArray (setting, target) {
  const func = getFilterFunction(setting);
  if (func.isAll) { return target; }
  return target.filter(d => func(d.data || d));
}

/** フィルタリング設定の内容を表現したテキストの配列を作成する。 */
export function filterSettingTextArray (setting) {
  const textArray = [];
  if (setting.name) {
    textArray.push(`名前に『${setting.name}』を含む`);
  }
  const hasMainAttr = setting.attr && setting.attr.length > 0;
  const hasSubAttr = setting.subAttr && setting.subAttr.length > 0;
  if (hasMainAttr) {
    if (hasSubAttr) {
      textArray.push('属性:' + setting.attr.map(a => constData.attributeTable[a]).join('') +
        '/' + setting.subAttr.map(a => constData.attributeTable[a]).join('')
      );
    } else {
      textArray.push('主属性:' + setting.attr.map(a => constData.attributeTable[a]).join(''));
    }
  } else if (hasSubAttr) {
    textArray.push('複属性:' + setting.subAttr.map(a => constData.attributeTable[a]).join(''));
  }
  if (setting.type && setting.type.length > 0) {
    textArray.push('タイプ:' + setting.type.map(a => { const info = constData.typeTable[a]; return info && info.name || ''; }).join('/'));
  }
  if (setting.awaken && setting.awaken.length > 0) {
    textArray.push('覚醒:' + setting.awaken.map(a => { const info = constData.awakenTable[a]; return info && info.name || ''; }).join('/') + 'を含む');
  }
  function createRangeText (min, max, defaultMin, defaultMax, tanni) {
    if (tanni === undefined) { tanni = ''; }
    if (min === max) { return min + tanni; }
    if (min === defaultMin) { return `${max}${tanni}以下`; }
    if (max === defaultMax) { return `${min}${tanni}以上`; }
    return `${min}〜${max}${tanni}`;
  }
  const rarityMin = setting.rarityMin || filterDefault.rarityMin;
  const rarityMax = setting.rarityMax || filterDefault.rarityMax;
  if (rarityMin !== filterDefault.rarityMin ||
      rarityMax !== filterDefault.rarityMax) {
    const valueText = createRangeText(rarityMin, rarityMax, filterDefault.rarityMin, filterDefault.rarityMax);
    textArray.push('レアリティ:' + valueText);
  }
  const skillTurnMin = setting.skillTurnMin || filterDefault.skillTurnMin;
  const skillTurnMax = setting.skillTurnMax || filterDefault.skillTurnMax;
  if (skillTurnMin !== filterDefault.skillTurnMin ||
      skillTurnMax !== filterDefault.skillTurnMax) {
    const valueText = createRangeText(skillTurnMin, skillTurnMax, filterDefault.skillTurnMin, filterDefault.skillTurnMax);
    textArray.push('Sターン:' + valueText);
  }
  const skillBoostMin = setting.hasOwnProperty('skillBoostMin') ? setting.skillBoostMin : filterDefault.skillBoostMin;
  const skillBoostMax = setting.hasOwnProperty('skillBoostMax') ? setting.skillBoostMax : filterDefault.skillBoostMax;
  if (skillBoostMin !== filterDefault.skillBoostMin ||
      skillBoostMax !== filterDefault.skillBoostMax) {
    const valueText = createRangeText(skillBoostMin, skillBoostMax, filterDefault.skillBoostMin, filterDefault.skillBoostMax);
    textArray.push('スキブ:' + valueText);
  }
  const timeExtensionMin = setting.hasOwnProperty('timeExtensionMin') ? setting.timeExtensionMin : filterDefault.timeExtensionMin;
  if (timeExtensionMin !== filterDefault.timeExtensionMin) {
    textArray.push(`指延長:${timeExtensionMin}秒以上`);
  }

  if (setting.assist !== undefined) {
    textArray.push('アシスト:' + constData.booleanTable[setting.assist]);
  }

  return textArray;
}

/** フィルタリング設定の内容を表現したテキストを作成する。 */
export function filterSettingText (setting) {
  return filterSettingTextArray(setting).join(' ');
}

/** モンスター絞り込みの設定を行うコンポーネント。 */
export default {
  name: 'MonsterFilterSetting',
  mixins: [
    RouteQueryWrapper
  ],
  queries: {
    name: {
      type: String,
      computed: true
    },
    attr: {
      type: Array,
      computed: true
    },
    subAttr: {
      type: Array,
      computed: true
    },
    type: {
      type: Array,
      computed: true
    },
    awaken: {
      type: Array,
      computed: true
    },
    assist: {
      type: Number,
      computed: true
    },
    rarityMin: {
      type: Number,
      default: filterDefault.rarityMin,
      computed: true
    },
    rarityMax: {
      type: Number,
      default: filterDefault.rarityMax,
      computed: true
    },
    skillTurnFilterStr: {
      type: String,
      default: '1-99',
      queryKey: 'skillTurn',
      computed: true
    },
    skillBoostFilterStr: {
      type: String,
      default: '0-9',
      queryKey: 'skillBoost',
      computed: true
    },
    timeExtensionMin: {
      type: Number,
      default: filterDefault.timeExtensionMin,
      computed: true
    }
  },
  props: {
    'value': {
      type: Object,
      default: () => {}
    },
    /** 名前の入力欄を非表示にするかどうか。 */
    'hideName': {
      type: Boolean,
      default: false
    }
  },
  data: function () {
    return {
      /** フィルタリング設定領域を表示するかどうか。 */
      isVisibleFilter: false,
      /** フィルタリング設定領域の表示／非表示を切り替えるトリガーの下部が開いた状態かどうか。 */
      isOpenFilterTrigger: false,
      /** フィルタリング設定領域がすべて表示されている状態かどうか。 */
      isFullOpenFilterTrigger: false,
      /** 表示するモンスターに対するフィルタ。 */
      filter: getFilterDefault(),
      /** フォームの変更とそれによる query の変更の巡回によって起こる更新イベントの多重送信を防ぐオブジェクト。 */
      multiSendBlocker: new MultiSendBlocker(1),
      /** ブラウザの横幅がフィルタリング設定領域を全画面で多い表示するものかどうか。 */
      isBrowserWidthSmall: false,
      /** フィルタリング設定領域を全画面で表示したときの、全体の縦スクロール位置。 */
      tempScrollTop: 0
    };
  },
  computed: {
    attributeTable () { return constData.attributeTable; },
    typeTable () { return constData.typeTable; },

    name: {
      get: function () { return this.filter.name; },
      set: function (v) { this.filter.name = v; }
    },
    attr: {
      get: function () { return this.filter.attr; },
      set: function (v) { this.filter.attr = v; }
    },
    subAttr: {
      get: function () { return this.filter.subAttr; },
      set: function (v) { this.filter.subAttr = v; }
    },
    type: {
      get: function () { return this.filter.type; },
      set: function (v) { this.filter.type = v; }
    },
    awaken: {
      get: function () { return this.filter.awaken; },
      set: function (v) { this.filter.awaken = v; }
    },
    assist: {
      get: function () { return this.filter.assist; },
      set: function (v) { this.filter.assist = v; }
    },
    rarityMin: {
      get: function () { return this.filter.rarityMin; },
      set: function (v) { this.filter.rarityMin = v; }
    },
    rarityMax: {
      get: function () { return this.filter.rarityMax; },
      set: function (v) { this.filter.rarityMax = v; }
    },
    timeExtensionMin: {
      get: function () { return this.filter.timeExtensionMin; },
      set: function (v) { this.filter.timeExtensionMin = v; }
    },

    /** その他絞り込み部分のフィルタリング設定をもとに作成したテキスト。 */
    filterSettingTextArray () {
      const array = filterSettingTextArray(this.filter);
      if (/^名前に/.test(array[0])) { array.shift(); }
      return array;
    },
    /** スキルターンの絞り込み設定の最小値と最大値を - でつないだもの。 */
    skillTurnFilterStr: {
      get: function () {
        return this.filter.skillTurnMin + '-' + this.filter.skillTurnMax;
      },
      set: function (val) {
        if (/(\d+)-(\d+)/.test(val)) {
          this.filter.skillTurnMin = RegExp.$1 | 0;
          this.filter.skillTurnMax = RegExp.$2 | 0;
        } else {
          this.filter.skillTurnMin = filterDefault.skillTurnMin;
          this.filter.skillTurnMax = filterDefault.skillTurnMax;
        }
      }
    },
    /** スキルブーストの絞り込み設定の最小値と最大値を - でつないだもの。 */
    skillBoostFilterStr: {
      get: function () {
        return this.filter.skillBoostMin + '-' + this.filter.skillBoostMax;
      },
      set: function (val) {
        if (/(\d+)-(\d+)/.test(val)) {
          this.filter.skillBoostMin = RegExp.$1 | 0;
          this.filter.skillBoostMax = RegExp.$2 | 0;
        } else {
          this.filter.skillBoostMin = filterDefault.skillBoostMin;
          this.filter.skillBoostMax = filterDefault.skillBoostMax;
        }
      }
    },
    /** 設定領域を全画面で表示しているかどうか。 */
    isFullOverSettingArea: function () {
      return this.isBrowserWidthSmall && this.isFullOpenFilterTrigger;
    }
  },
  watch: {
    '$routeQueryWrapper_routeQueryObject': function () {
      this.$emit('input', this.filter);
    },
    'filter.rarityMin': function () {
      if (this.filter.rarityMax < this.filter.rarityMin) {
        this.filter.rarityMax = this.filter.rarityMin;
      }
    },
    'filter.rarityMax': function () {
      if (this.filter.rarityMax < this.filter.rarityMin) {
        this.filter.rarityMin = this.filter.rarityMax;
      }
    },
    'filter.skillTurnMin': function () {
      if (this.filter.skillTurnMax < this.filter.skillTurnMin) {
        this.filter.skillTurnMax = this.filter.skillTurnMin;
      }
    },
    'filter.skillTurnMax': function () {
      if (this.filter.skillTurnMax < this.filter.skillTurnMin) {
        this.filter.skillTurnMin = this.filter.skillTurnMax;
      }
    },
    'filter.skillBoostMin': function () {
      if (this.filter.skillBoostMax < this.filter.skillBoostMin) {
        this.filter.skillBoostMax = this.filter.skillBoostMin;
      }
    },
    'filter.skillBoostMax': function () {
      if (this.filter.skillBoostMax < this.filter.skillBoostMin) {
        this.filter.skillBoostMin = this.filter.skillBoostMax;
      }
    },
    isFullOverSettingArea: function (newValue) {
      if (newValue) {
        this.tempScrollTop = document.scrollingElement.scrollTop;
        document.scrollingElement.scrollTop = 0;
      } else {
        document.scrollingElement.scrollTop = this.tempScrollTop;
      }
      this.setDisableScroll(newValue);
    }
  },
  mounted: function () {
    window.addEventListener('resize', this.checkBrowserWidthSmall);
    this.checkBrowserWidthSmall();
  },
  beforeDestroy: function () {
    window.removeEventListener('resize', this.checkBrowserWidthSmall);
    if (this.isFullOpenFilterTrigger) {
      this.setDisableScroll(false);
    }
  },
  methods: {
    /**
     * ページ全体のスクロールを無効にするかどうかを設定する。
     * 引数に true を指定するとスクロールが無効になり、 false を指定するとスクロールが有効になる。
     */
    setDisableScroll: function (b) {
      document.body.className = b ? 'noScroll' : '';
    },
    /** 現在のウィンドウサイズが、設定領域を全画面表示するものかどうかを確認する。 */
    checkBrowserWidthSmall: function () {
      this.isBrowserWidthSmall = window.matchMedia('(max-width: 575px)').matches;
    },
    /** 指定要素の現在の高さを style に設定する。親要素がない場合は指定された ID の要素に一時的に登録して計測する。 */
    setStyleHeight: function (elm, dummyParentId) {
      let dummyParent;
      const hasParent = !!elm.parentNode;
      if (!hasParent) {
        dummyParent = document.getElementById(dummyParentId);
        dummyParent.appendChild(elm);
      }
      elm.style.height = elm.clientHeight + 'px';
      if (!hasParent) { dummyParent.removeChild(elm); }
    },
    /** style に設定されている高さを空にする。 */
    clearStyleHeight: function (elm) {
      elm.style.height = '';
    },
    /** フィルタリング設定を空にする。 */
    clearFilter: function () {
      for (const key in this.filter) {
        const defaultValue = filterDefault[key];
        if (typeof defaultValue === 'object') {
          if (Array.isArray(defaultValue)) {
            this.filter[key] = defaultValue.concat();
          } else {
            this.filter[key] = Object.assign({}, defaultValue);
          }
        } else {
          this.filter[key] = defaultValue;
        }
      }
    }
  }
};
</script>

<style lang="scss">
@media (max-width: 575px) {
  // 設定フォームを全画面表示している際に裏をスクロールさせないための設定。
  body.noScroll {
    position: fixed;
  }
}
</style>

<style lang="scss" scoped>
  .inlineBlock {
    display: inline-block;
  }

  #filter {
    margin-bottom: 4px;
  }

  #filterTrigger {
    border: 1px solid #ced4da;
    border-radius: 4px;
    padding: 4px 4px 2px 4px;
    background: #FFF;
    cursor: pointer;

    &.open {
      border-bottom-style: none;
      border-radius: 4px 4px 0 0;
    }

    svg {
      fill: #000;
    }
  }

  #filterForm {
    border: 1px solid #ced4da;
    border-radius: 0 4px 4px 4px;
    background: #FFF;
    margin-top: -2px;
    padding: 8px 4px 4px 4px;
    overflow: hidden;

    .formMenu, .formBottomMenu {
      display: none;
    }
  }

  .settingText {
    margin-top: 0.5em;
  }

  .timeExtension input[type="number"] {
    width: 3em;
  }

  .filter-enter-active {
    animation: filter-in .3s;
  }
  .filter-leave-active {
    animation: filter-in .3s reverse;
  }
  @keyframes filter-in {
    0% {
      height: 0em;
    }
  }

@media (max-width: 575px) {
  #filterForm {
    position: fixed;
    z-index: 1050;
    left: 0;
    top: 0;
    height: 100%;
    margin: 0;
    padding: 1em;
    padding-top: 0em;
    padding-bottom: 3em;
    border: none;
    border-radius: 0;
    overflow-y: scroll;
    -webkit-overflow-scrolling: touch;
    
    .innerButtons {
      margin-bottom: 1em;
      * {
        display: none;
      }
    }
    .formMenu {
      display: block;
      position: sticky;
      left: -1rem;
      top: 0;
      width: calc(100% + 2em);
      margin: 0;
      margin-left: -1em;
      border-bottom: 1px solid #c9cccf;
      z-index: 1;
      text-align: right;
      background: #e9ecef;

      .formMenuTitle {
        text-align: center;
        line-height: 2.5em;
        margin-bottom: -2.5em;
      }
    }
    
    .formBottomMenu {
      display: block;
      position: sticky;
      left: -1rem;
      height: 3em;
      top: 100%;
      bottom: 3em;
      width: calc(100% + 2em);
      margin: 0;
      margin-left: -1em;
      margin-bottom: -3em;
      padding: 0.5em;
      border-top: 1px solid #c9cccf;
      z-index: 1;
      background: #e9ecef;
      text-align: right;

      button {
        margin-left: 0.5em;
        min-width: 5em;
      }
    }
  }

  @keyframes filter-in {
    0% {
      top: 100%;
    }
  }
}

</style>
