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
            <div style="display: inline-block; margin-bottom: 24px; padding: 4px; border: solid #CCC 1px;">
              <span v-for="i in 9" :key="`selectedAwaken_${i}`">
                <img style="width: 24px; height: 24px; margin-right: 6px;" :class="{ cursor: selectedAwaken[i - 1] ? 'pointer' : undefined }" :src="selectedAwaken[i - 1] ? `./image/awaken/${selectedAwaken[i - 1]}.png` : undefined" @click="removeAwaken(i - 1);" :key="selectedAwaken[i - 1] ? i : '0'">
              </span>
            </div>
            <div>
              <template v-for="(n, i) in awakenSortList">
                <span v-if="n != 0" :key="`awakenList_${i}`">
                  <img style="width: 24px; height: 24px; margin: 0 12px 12px 0; cursor: pointer;" :src="`./image/awaken/${n}.png`" @click="addAwaken(n);">
                </span>
                <br v-else :key="`awakenList_${i}`">
              </template>
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
  name: '',
  attr: [],
  subAttr: [],
  type: [],
  skillTurnMin: 1,
  skillTurnMax: 99
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
  if (setting.skillTurnMin !== filterDefault.skillTurnMin ||
      setting.skillTurnMax !== filterDefault.skillTurnMax) {
    functionArray.push(d => {
      const skill = commonData.skillTable[d.skill];
      if (!skill) { return false; }
      const minTurn = skill.baseTurn - skill.maxLevel + 1;
      return minTurn >= setting.skillTurnMin && minTurn <= setting.skillTurnMax;
    });
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
      /** 選択中の覚醒。 */
      selectedAwaken: [],
      /** 表示するモンスターに対するフィルタ。 */
      filter: {
        /** モンスター名。 */
        name: '',
        /** 主属性。 */
        attr: [],
        /** 複属性。 */
        subAttr: [],
        /** タイプ */
        type: [],
        /** スキルターンの最小値。 */
        skillTurnMin: 1,
        /** スキルターンの最大値。 */
        skillTurnMax: 99
      }
    };
  },
  computed: {
    attributeTable () { return constData.attributeTable; },
    typeTable () { return constData.typeTable; },
    /** ゲーム内の覚醒フィルタでの覚醒の並び順を示すテーブル。 0 は改行。 */
    awakenSortList () {
      return [
        4, 5, 6, 7, 8, 1, 49, 57, 0,
        14, 15, 16, 17, 18, 2, 50, 58, 0,
        22, 23, 24, 25, 26, 3, 51, 59, 0,
        9, 10, 20, 11, 12, 13, 52, 60, 0,
        19, 21, 27, 28, 29, 30, 53, 61, 0,
        32, 31, 33, 34, 35, 36, 54, 62, 0,
        37, 38, 39, 40, 41, 42, 55, 63, 0,
        43, 44, 45, 46, 47, 48, 56, 64
      ];
    },
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
    'skillTurnFilterStr': function () {
      this.updateRouteQuery({ 'skillTurn': this.skillTurnFilterStr });
      this.emitInput();
    },
    '$route.query.skillTurn': function (newValue) {
      this.skillTurnFilterStr = newValue;
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
      this.$router.push({ path: this.$route.path, params: this.$route.params, query: margedQuery });
    },
    /** 配列をカンマで結合した値を使用してルートのクエリーを変更する。 */
    updateRouteQueryFromArray: function (name, array) {
      const obj = {};
      obj[name] = array.length ? array.slice().sort().join(',') : undefined;
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
      return isArray ? (value.length > 0) : value;
    },
    /** フィルタリング設定を空にする。 */
    clearFilter: function () {
      this.selectedAwaken = [];

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
    },
    /** 選択中の覚醒を追加する。 */
    addAwaken: function (no) {
      if (this.selectedAwaken.length >= 9) { return; }
      this.selectedAwaken.push(no);
    },
    /** 選択中の覚醒から、指定したインデックスのものを削除する。 */
    removeAwaken: function (index) {
      this.selectedAwaken.splice(index, 1);
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
