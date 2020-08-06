<template>
  <div>
    <monster-filter-setting v-model="filterSetting" />

    <slide-up-toggle class="sortTypeSelect" v-model="isOpenSortType">
      <template slot="trigger" slot-scope="slotProps">
        並び替え：{{ sortInfoTable[sortType][0] }}
        <svg viewBox="0 0 100 100" width="1em" height="1em">
          <path v-if="slotProps.isOpened" d="M50 0 L10 75 L90 75 Z" />
          <path v-else d="M50 75 L10 0 L90 0 Z" />
        </svg>
      </template>
      <template v-slot:head slot="head">並び替え：{{ sortInfoTable[sortType][0] }}</template>

      <template slot="default" slot-scope="slotProps">
        <div class="items sortOrder">
          <label>
            <input type="radio" class="decoToggle sortTypeRadio" v-model="sortOrder" value="asc" @click="if (slotProps.isFullOverlay) { closeSortTypeSelect(); }">
            <div class="item">
              <span>昇順 ▲</span>
            </div>
          </label>
          <label>
            <input type="radio" class="decoToggle sortTypeRadio" v-model="sortOrder" value="desc" @click="if (slotProps.isFullOverlay) { closeSortTypeSelect(); }">
            <div class="item">
              <span>降順 ▼</span>
            </div>
          </label>
        </div>
        <hr>
        <div class="items sortType">
          <label v-for="(info, key) in sortInfoTable" :key="key">
            <input type="radio" class="decoToggle sortTypeRadio" v-model="sortType" :value="key" @click="if (slotProps.isFullOverlay) { closeSortTypeSelect(); }">
            <div class="item">
              <span :class="`scale${info[0].length}char`">{{ info[0] }}</span>
            </div>
          </label>
        </div>
      </template>

      <template v-slot:tail slot="foot">
        <button class="btn btn-primary btn-sm" type="button" @click="closeSortTypeSelect();">閉じる</button>
      </template>
    </slide-up-toggle>

    <pagination item-count="11" :page="page" :page-count="pageCount" />

    <div class="row">
      <div v-for="data in monsterTableInPage" class="col-md-6" :key="`monster${data.no}`">
        <div class="listItem">
          <router-link :to="{ name: 'monsterDetails', params: { no: data.no }}">
            <monster-icon
              no-link :no="data.no" :monster-table="monsterTable" :image-table="imageTable" width="3em" height="3em"
            /><div class="monsterName">
              <div class="monsterNo">No.{{ data.no }}</div>
              <div>{{ data.name }}</div>
            </div>
            <div v-if="sortInfo[2]" class="sortValue">
              {{ sortInfo[2] }}:{{ sortValueTable[data.no] === null ? '不明' : sortValueTable[data.no] }}
            </div>
          </router-link>
          <div class="favIcon" :class="{ selected: $store.state.monsterFavorites[data.no] === 1, evolution: $store.state.monsterFavorites[data.no] === 2, toggled: favoriteToggled[data.no] }" @click.stop="flipMonsterFavorite(data.no);">
            ★
          </div>
        </div>
      </div>
    </div>

    <pagination item-count="11" :page="page" :page-count="pageCount" />
  </div>
</template>

<script>

import { constData, commonData } from '../mtpadmdb.js';
import MonsterFilterSetting, { getFilterDefault, filterMonsterDataArray, filterSettingText } from '../components/monsterFilterSetting.vue';
import RouteQueryWrapper from '../components/mixins/routeQueryWrapper.js';

const skillTable = commonData.skillTable;
/** モンスターデータを元に、そのモンスターの最短スキルターン数を返す。 */
function GetSkillMinTurn (monsterData) {
  const skillData = skillTable[monsterData.skill];
  if (!skillData) { return null; }
  return skillData.minTurn;
}

/** モンスターデータを元に、そのモンスターのパラメータをプラス血換算した値を返す。 */
function GetParamPlus (monsterData) {
  const param = monsterData.maxParam;
  if (param.hp === null || param.attack === null || param.recovery === null) { return null; }
  return (param.hp / 10 + param.attack / 5 + param.recovery / 3).toFixed(1);
}

/** モンスターのソートの情報。 {ソートID: [ソート種類名, ソート値作成関数, ソート値表示時項目名]} */
const sortInfoTable = {
  no: ['モンスター番号', null],
  cost: ['コスト', d => d.cost, 'コスト'],
  rare: ['レアリティ', d => d.rare, 'レアリティ'],
  hp: ['HP', d => d.maxParam.hp, 'HP'],
  attack: ['攻撃', d => d.maxParam.attack, '攻撃'],
  recovery: ['回復', d => d.maxParam.recovery, '回復'],
  plus: ['＋換算', GetParamPlus, '＋換算'],
  skillTurn: ['スキルターン', GetSkillMinTurn, 'スキルターン']
};

/** モンスター一覧表示のコンポーネント */
export default {
  name: 'MonsterList',
  components: { MonsterFilterSetting },
  mixins: [
    RouteQueryWrapper
  ],
  /** $route.query ラッパー設定 */
  queries: {
    // 表示するページ
    page: {
      type: Number,
      default: 1
    },
    /** ソートの種類とソートの向きを _ でつないだもの。 */
    sortType: {
      type: String,
      computed: {
        get: function () {
          return this.sortType + '_' + this.sortOrder;
        },
        set: function (value) {
          const ret = value.match(/^(.*)_(asc|desc)$/);
          if (!ret) { this.sortType = value; }
          this.sortType = ret[1];
          this.sortOrder = ret[2];
        }
      },
      propName: 'sortType_',
      default: 'no_asc'
    }
  },
  data: function () {
    return {
      /** 現在のページを表示してからお気に入りの切り替えが行われたかどうか。 */
      favoriteToggled: {},
      inPageCount: 50,
      /** 検索設定が変更されたときに表示ページ指定をリセットするかどうか。 */
      pageResetFlag: false,
      /** 表示するモンスターに対するフィルタ。 */
      filterSetting: getFilterDefault(),
      /** ソート指定選択領域を表示しているかどうか。 */
      isOpenSortType: false,
      /** ソート情報の入ったテーブル。 */
      sortInfoTable: sortInfoTable,
      /** モンスターのソートの種類ID。 */
      sortType: 'no',
      /** ソートの向き。 'asc': 昇順 'dec' - 降順 */
      sortOrder: 'asc'
    };
  },
  computed: {
    monsterTable () { return this.$store.state.monsterTable; },
    imageTable () { return this.$store.state.imageTable; },
    attrColors () { return constData.attrColors; },
    
    pageCount () { return ((this.sortedMonsterTableDataArray.length + this.inPageCount - 1) / this.inPageCount) | 0; },

    /** ソートするための情報。 */
    sortInfo () { return this.sortInfoTable[this.sortType] || []; },
    /** モンスター番号をキーとした、ソート対象の値のテーブル。 */
    sortValueTable: function () {
      if (!this.sortInfo[1]) { return null; }
      const sortValueFunc = this.sortInfo[1];
      const obj = {};
      const monsterTable = this.monsterTable;
      for (const key in monsterTable) {
        obj[key] = sortValueFunc(monsterTable[key]);
      }
      return obj;
    },

    /** フィルタリングを行ったモンスターデータの配列。 */
    filteredMonsterTableArray: function () {
      return filterMonsterDataArray(this.filterSetting, this.$store.getters.monsterDataArray);
    },
    /** ソートを行ったモンスターデータの配列。 */
    sortedMonsterTableDataArray: function () {
      if (this.sortType === 'no') {
        if (this.sortOrder === 'asc') {
          return this.filteredMonsterTableArray;
        }
        return this.filteredMonsterTableArray.slice().reverse();
      }
      const sortValueTable = this.sortValueTable;
      if (!sortValueTable) { return this.filteredMonsterTableArray; }
      let sortFunc;
      if (this.sortOrder === 'asc') {
        sortFunc = (a, b) => sortValueTable[a.no] - sortValueTable[b.no];
      } else {
        sortFunc = (b, a) => sortValueTable[a.no] - sortValueTable[b.no];
      }
      return this.filteredMonsterTableArray.slice().sort(sortFunc);
    },
    monsterTableInPage () {
      return this.sortedMonsterTableDataArray.slice((this.page - 1) * this.inPageCount, this.page * this.inPageCount);
    },
    /** フィルタリング設定の内容を表したテキスト。 */
    filterSettingText () {
      return filterSettingText(this.filterSetting);
    }
  },
  watch: {
    filterSettingText: function () {
      this.$emit('changeFilterSettingText', this.filterSettingText);
    },
    sortedMonsterTableDataArray: function () {
      // ページリセット
      if (this.pageResetFlag) { this.page = 1; }
    },
    page: function () {
      this.favoriteToggled = {};
    }
  },
  created: function () {
    this.$store.commit('fetchCommonData');
    // created が終わって、その時点で予約？されている処理が終わったら、それ以降の絞り込み条件変更時にページリセットを行う。
    this.$nextTick(() => { this.pageResetFlag = true; });
  },
  methods: {
    /** 指定したモンスターのお気に入りの状態を反転させる。 */
    flipMonsterFavorite: function (no) {
      const nowData = this.$store.state.monsterFavorites[no];
      const newData = (nowData === 1) ? undefined : 1;
      this.$store.commit('setMonsterFavorite', { no: no, data: newData });
      this.favoriteToggled[no] = true;
    },

    /** ソート選択領域の表示を閉じる。 */
    closeSortTypeSelect: function () {
      this.isOpenSortType = false;
    }
  }
};
</script>

<style lang="scss" scoped>

.sortTypeSelect {
  margin-bottom: 1em;
  $item-width: 5em;
  $item-margin: 0.5em;
  $item-total-width: $item-width + $item-margin * 2;

  .items {
    display: inline-block;
    position: relative;
    left: 50%;
    transform: translateX(-50%);

    &.sortOrder {
      width: $item-total-width * 2;
    }
    &.sortType {
      width: $item-total-width * 3;
    }

    .item {
      width: $item-width;
      margin: 0 $item-margin;

      @mixin scaleXchar ($length: 1) {
        display: inline-block;
        position: relative;
        white-space: nowrap;
        left: 50%;
        transform: translateX(-50%) scaleX(4.5 / $length);
      }
      .scale5char {
        @include scaleXchar(5);
      }
      .scale6char {
        @include scaleXchar(6);
      }
      .scale7char {
        @include scaleXchar(7);
      }
    }
  }
}

.listItem {
  padding-bottom: 2px;
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  border: #fddb70 solid 0.1em;
  border-radius: 0.4em;
  margin-bottom: 2px;
  padding: 1px;
  background: linear-gradient(#c49632, #e7bb5c 20%, #e7bb5c 40%, #a07b44 40%, #885727);
  
  text-shadow: 1px 1px 0 rgba(0,0,0, 0.5);

  box-shadow:
    0 0 0px 1px rgba(0, 0, 0, 0.5),

    0 4px 2px -2px rgba(255, 255, 255, 0.5) inset,
    -3px 0 2px -2px rgba(255, 255, 255, 0.5) inset,
    0 -2px 2px -2px rgba(255, 255, 255, 0.5) inset,
    
    0 -4px 2px -2px rgba(0, 0, 0, 0.3) inset;

  a {
    display: inline-block;
    width: 100%;
    color: #ffffff;
  }
  .monsterName {
    display: inline-block;
    padding-left: 4px;
    vertical-align:bottom;
    height: 3em;

    .monsterNo {
      font-size: 80%;
      margin-bottom: 2px;
    }
  }

  .sortValue {
    position: absolute;
    $font-size-rate: 0.8;
    right: 1.3em / $font-size-rate;
    top: 0;
    font-size: 100% * $font-size-rate;
    line-height: 1.8em / $font-size-rate;
  }

  .favIcon {
    position: absolute;
    $font-size-rate: 1.2;
    right: 1em / $font-size-rate;
    bottom: 0;
    width: 2.5em / $font-size-rate;
    padding-left: 0.5em / $font-size-rate;
    font-size: 100% * $font-size-rate;
    text-align: center;
    line-height: 2.5em / $font-size-rate;
    cursor: pointer;
    user-select: none;

    text-shadow: none;
    filter: drop-shadow(0.1em 0.1em 0 rgba(0,0,0, 0.5));
    color: #999;
    background: linear-gradient(#aaa 30%, #888 80%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;

    &.toggled {
      animation: favoriteClearAnimation 0.3s ease 0s 1 normal none running;
    }
    
    &.selected {
      color: #ff0;
      background: linear-gradient(#ff0 30%, #fb0 80%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;

      &.toggled {
        animation: favoriteSelectAnimaton 0.3s ease 0s 1 normal none running;
      }
    }

    &.evolution {
      background-image: linear-gradient(#aaa 30%, #999 55%, #fd0 70%, #fb0 80%);
    }

    @keyframes favoriteSelectAnimaton {
      $light_shadow_color: #ff9;
      10% {
        transform: scale(0.8);
        filter: drop-shadow(0 0 0em $light_shadow_color);
      }
      90% {
        filter: drop-shadow(0 0 1em $light_shadow_color);
      }
      99% {
        filter: drop-shadow(0 0 2em rgba($light_shadow_color, 0));
      }
      100% {
        transform: none;
        filter: none;
      }
    }
    @keyframes favoriteClearAnimation {
      10% {
        transform: scale(0.8);
      }
      100% {
        transform: scale(1);
      }
    }

  }
}

</style>
