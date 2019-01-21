<template>

  <div id="filter" style="margin-bottom: 4px;">
    <span id="filterTrigger" :class="{ open: isOpenFilterTrigger }" @click="isVisibleFilter = !isVisibleFilter">
      絞り込み
      <svg viewBox="0 0 100 100" width="1em" height="1em">
        <path v-if="isVisibleFilter" d="M50 0 L10 75 L90 75 Z" style="fill:black;" />
        <path v-else d="M50 75 L10 0 L90 0 Z" style="fill:black;" />
      </svg>
    </span>
    <transition name="filter"
                @before-enter="setStyleHeight($event, 'filter'); isOpenFilterTrigger = true;"
                @after-enter="clearStyleHeight($event);"
                @before-leave="setStyleHeight($event);"
                @after-leave="isOpenFilterTrigger = false;"
    >
      <form id="filterForm" v-if="isVisibleFilter">
        <div class="form-group row">
          <label class="col-sm-2 col-form-label">モンスター名</label>
          <div class="col-sm-10">
            <input type="text" class="form-control" placeholder="モンスター名検索" v-model="filter.name">
          </div>
        </div>
        <div class="form-group row">
          <label class="col-sm-2 col-form-label">主属性</label>
          <div class="col-sm-10">
            <template v-for="(attrName, attr) in attributeTable">
              <span style="margin-right: 0.5rem;" :key="`attr${attr}`" :style="{ visibility: attr === '0' ? 'hidden' : 'visible' }">
                <input :disabled="attr === '0'" type="checkbox" class="imageCheckBox" v-model="filter.attr" :value="attr" :id="`check_mainAttr_${attr}`">
                <label :for="`check_mainAttr_${attr}`">
                  <img v-if="attr !== '0' && attr !== 'null'" style="width: 24px; height: 24px;" :src="`./image/attribute/${attr}.png`">
                  <span v-else>{{ attrName }}</span>
                </label>
              </span>
            </template>
          </div>
        </div>
        <div class="form-group row">
          <label class="col-sm-2 col-form-label">複属性</label>
          <div class="col-sm-10">
            <template v-for="(attrName, attr) in attributeTable">
              <span style="margin-right: 0.5rem;" :key="`attr${attr}`">
                <input type="checkbox" class="imageCheckBox" v-model="filter.subAttr" :value="attr" :id="`check_subAttr_${attr}`">
                <label :for="`check_subAttr_${attr}`">
                  <img v-if="attr !== '0' && attr !== 'null'" style="width: 24px; height: 24px;" :src="`./image/attribute/${attr}.png`">
                  <span v-else>{{ attrName }}</span>
                </label>
              </span>
            </template>
          </div>
        </div>
        <div class="form-group row">
          <label class="col-sm-2 col-form-label">タイプ</label>
          <div class="col-sm-10">
            <template v-for="(typeInfo, type) in typeTable">
              <span v-if="type !== '0'" style="margin-right: 0.5rem" :key="`type${type}`">
                <input type="checkbox" class="imageCheckBox" v-model="filter.type" :value="type" :id="`type_${type}`">
                <label :for="`type_${type}`">
                  <img v-if="type !== 'null'" style="width: 24px; height: 24px;" :src="`./image/type/${type}.png`">
                  <span v-else>{{ typeInfo.name }}</span>
                </label>
              </span>
            </template>
          </div>
        </div>
        <div class="form-group row">
          <label class="col-sm-2 col-form-label">スキルターン</label>
          <div class="col-sm-10">
            <input type="range" v-model.number="filter.skillTurnMin" min="1" max="99" step="1">
            <input type="number" v-model.number="filter.skillTurnMin" required min="1" max="99">以上
          </div>
          <label class="col-sm-2 col-form-label" />
          <div class="col-sm-10">
            <input type="range" v-model.number="filter.skillTurnMax" min="1" max="99" step="1">
            <input type="number" v-model.number="filter.skillTurnMax" required min="1" max="99">以下
          </div>
        </div>
        <div class="form-group row">
          <label class="col-sm-2 col-form-label">覚醒</label>
          <div class="col-sm-10">
            <awaken-select v-model="filter.awaken" />
          </div>
        </div>
        <div class="form-group row">
          <label class="col-sm-2 col-form-label">アシスト</label>
          <div class="col-sm-10">
            <div class="custom-control custom-radio custom-control-inline">
              <input type="radio" id="radioAssistAll" name="radioAssist" :value="undefined" v-model.number="filter.assist" class="custom-control-input">
              <label class="custom-control-label" for="radioAssistAll">すべて</label>
            </div>
            <div class="custom-control custom-radio custom-control-inline">
              <input type="radio" id="radioAssistOk" name="radioAssist" value="1" v-model.number="filter.assist" class="custom-control-input">
              <label class="custom-control-label" for="radioAssistOk">○</label>
            </div>
            <div class="custom-control custom-radio custom-control-inline">
              <input type="radio" id="radioAssistNg" name="radioAssist" value="0" v-model.number="filter.assist" class="custom-control-input">
              <label class="custom-control-label" for="radioAssistNg">×</label>
            </div>
          </div>
        </div>
        <button class="btn btn-secondary btn-sm" type="button" @click="clearFilter">クリア</button>
      </form>
    </transition>
  </div>
</template>

<script>
import { constData, commonData, escapeRegExp } from '../mtpadmdb.js';

/** filterの初期値。 */
const filterDefault = {
  name: undefined,
  attr: [],
  subAttr: [],
  type: [],
  awaken: [],
  skillTurnMin: 1,
  skillTurnMax: 99,
  assist: undefined
};

/** 指定されたフィルタリング設定に基づき、モンスター情報を判定する関数を作成する。 */
export function getFilterFunction (setting) {
  const functionArray = [];
  if (setting.name) {
    const searchWords = setting.name.split(/\s+/g);
    // (?=.*hogehoge) が連続していて ^ と .*$ で挟まれた正規表現で、肯定先読みを利用した AND 検索になるとのこと。
    const regexp = new RegExp('^(?=.*' + searchWords.map(escapeRegExp).join(')(?=.*') + ').*$', 's');
    functionArray.push(d => { return regexp.test(d.name); });
  }
  if (setting.attr.length > 0) {
    const filterObj = {};
    for (const attr of setting.attr) { filterObj[attr] = true; }
    functionArray.push(d => filterObj[d.attributes[0]]);
  }
  if (setting.subAttr.length > 0) {
    const filterObj = {};
    for (const attr of setting.subAttr) { filterObj[attr] = true; }
    functionArray.push(d => filterObj[d.attributes[1]]);
  }
  if (setting.type.length > 0) {
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
  if (setting.skillTurnMin !== filterDefault.skillTurnMin ||
      setting.skillTurnMax !== filterDefault.skillTurnMax) {
    functionArray.push(d => {
      const skill = commonData.skillTable[d.skill];
      if (!skill) { return false; }
      const minTurn = skill.baseTurn - skill.maxLevel + 1;
      return minTurn >= setting.skillTurnMin && minTurn <= setting.skillTurnMax;
    });
  }
  if (setting.assist !== undefined) {
    functionArray.push(d => d.assist === setting.assist);
  }
  // フィルタリングがない場合は常に true を返す関数を返す。
  if (functionArray.length === 0) {
    return d => true;
  }
  return d => functionArray.every(f => f(d));
}

/** フィルタリング設定を使用してモンスター情報の配列から、フィルタリング情報の条件を満たすもののみ取り出した配列を作成する。 */
export function filterMonsterDataArray (setting, target) {
  const func = getFilterFunction(setting);
  return target.filter(d => func(d.data || d));
}

/** モンスター絞り込みの設定を行うコンポーネント。 */
export default {
  name: 'MonsterFilterSetting',
  props: {
    'value': {
      type: Object,
      default: () => {}
    }
  },
  data: function () {
    return {
      /** フィルタリング設定領域を表示するかどうか。 */
      isVisibleFilter: false,
      /** フィルタリング設定領域の表示／非表示を切り替えるトリガーの下部が開いた状態かどうか。 */
      isOpenFilterTrigger: false,
      /** 表示するモンスターに対するフィルタ。 */
      filter: {
        /** モンスター名。 */
        name: undefined,
        /** 主属性。 */
        attr: [],
        /** 複属性。 */
        subAttr: [],
        /** タイプ */
        type: [],
        /** 覚醒 */
        awaken: [],
        /** スキルターンの最小値。 */
        skillTurnMin: 1,
        /** スキルターンの最大値。 */
        skillTurnMax: 99,
        /** アシスト可不可 */
        assist: undefined
      }
    };
  },
  computed: {
    attributeTable () { return constData.attributeTable; },
    typeTable () { return constData.typeTable; },
    /** スキルターンの絞り込み設定の最小値と最大値を - でつないだもの。 */
    skillTurnFilterStr: {
      get: function () {
        if (this.filter.skillTurnMin === filterDefault.skillTurnMin &
            this.filter.skillTurnMax === filterDefault.skillTurnMax) { return undefined; }
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
    }
  },
  watch: {
    'filter': function () {
      this.emitInput();
    },
    'filter.name': function () {
      this.updateRouteQuery({ name: this.filter.name });
      this.emitInput();
    },
    '$route.query.name': function () {
      this.queryToFilter('name');
    },
    'filter.attr': function () {
      this.updateRouteQueryFromArray('attr', this.filter.attr);
      this.emitInput();
    },
    '$route.query.attr': function () {
      this.queryToFilter('attr');
    },
    'filter.subAttr': function () {
      this.updateRouteQueryFromArray('subAttr', this.filter.subAttr);
      this.emitInput();
    },
    '$route.query.subAttr': function () {
      this.queryToFilter('subAttr');
    },
    'filter.type': function () {
      this.updateRouteQueryFromArray('type', this.filter.type);
      this.emitInput();
    },
    '$route.query.type': function () {
      this.queryToFilter('type');
    },
    'filter.awaken': function () {
      this.updateRouteQueryFromArray('awaken', this.filter.awaken);
      this.emitInput();
    },
    '$route.query.awaken': function () {
      this.queryToFilter('awaken');
    },
    'skillTurnFilterStr': function () {
      this.updateRouteQuery({ 'skillTurn': this.skillTurnFilterStr });
      this.emitInput();
    },
    '$route.query.skillTurn': function (newValue) {
      this.skillTurnFilterStr = newValue;
    },
    'filter.assist': function () {
      this.updateRouteQuery({ assist: this.filter.assist });
      this.emitInput();
    },
    '$route.query.assist': function () {
      this.queryToFilter('assist');
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
    }
  },
  created: function () {
    let isSetFilter = false;
    isSetFilter |= this.queryToFilter('name');
    isSetFilter |= this.queryToFilter('attr');
    isSetFilter |= this.queryToFilter('subAttr');
    isSetFilter |= this.queryToFilter('type');
    isSetFilter |= this.queryToFilter('awaken');
    isSetFilter |= this.queryToFilter('assist');
    this.skillTurnFilterStr = this.$route.query.skillTurn;
    isSetFilter |= (this.skillTurnFilterStr !== undefined);
    
    if (isSetFilter) {
      this.isVisibleFilter = this.isOpenFilterTrigger = true;
    }
  },
  methods: {
    /** input イベントを発火して現在の設定を送る。 */
    emitInput: function () {
      this.$emit('input', this.filter);
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
    /** ルートのクエリーを更新する。 */
    updateRouteQuery: function (changeQuery) {
      const margedQuery = Object.assign({}, this.$route.query, changeQuery);
      this.$router.replace({ path: this.$route.path, params: this.$route.params, query: margedQuery });
    },
    /** 配列をカンマで結合した値を使用してルートのクエリーを変更する。 */
    updateRouteQueryFromArray: function (name, array) {
      const obj = {};
      obj[name] = array.length ? array.slice().sort((a, b) => a - b).join(',') : undefined;
      this.updateRouteQuery(obj);
    },
    /** 指定した名前のルートクエリーを元に同名のオブジェクトデータを変更する。 */
    queryToData: function (name) {
      this[name] = this.$route.query[name];
      return (this[name] !== undefined);
    },
    /** 特定のルートクエリーを使用して、フィルタリング設定を変更する。 */
    queryToFilter: function (name) {
      let value;
      const query = this.$route.query[name];
      const isArray = Array.isArray(this.filter[name]);
      if (isArray) {
        value = query ? query.split(',') : [];
      } else {
        value = query;
      }
      this.filter[name] = value;
      return isArray ? (value.length > 0) : value !== undefined;
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

<style scoped>
  #filterTrigger {
    border: 1px solid #AAC;
    border-radius: 8px;
    padding: 4px 4px 2px 4px;
    background: #FFF;
    cursor: pointer;
  }

  #filterTrigger.open {
    border-bottom-style: none;
    border-radius: 8px 8px 0 0;
  }

  #filterForm {
    border: 1px solid #AAC;
    border-radius: 0 8px 8px 8px;
    background: #FFF;
    margin-top: -2px;
    padding: 8px 4px 4px 4px;
  }

  input.imageCheckBox { display: none; }
  input.imageCheckBox + label {
    filter: opacity(50%) grayscale(95%);
  }

  input.imageCheckBox:checked + label {
    filter: opacity(100%) grayscale(0%);
  }

  input.imageCheckBox + label span {
    border: 1px solid #999;
    border-radius: 0.5em;
    background: #eee;
    padding: 0.25rem;
  }

  #filterForm {
    overflow: hidden;
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

</style>
