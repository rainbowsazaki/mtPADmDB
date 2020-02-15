<template>
  <div>
    <monster-filter-setting v-model="filterSetting" />

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
          </router-link>
          <div class="favIcon" :class="{ selected: $store.state.monsterFavorites[data.no], toggled: favoriteToggled[data.no] }" @click.stop="flipMonsterFavorite(data.no);">
            ★
          </div>
        </div>
      </div>
    </div>

    <pagination item-count="11" :page="page" :page-count="pageCount" />
  </div>
</template>

<script>

import { constData } from '../mtpadmdb.js';
import MonsterFilterSetting, { getFilterDefault, filterMonsterDataArray, filterSettingText } from '../components/monsterFilterSetting.vue';
import RouteQueryWrapper from '../components/mixins/routeQueryWrapper.js';

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
      filterSetting: getFilterDefault()
    };
  },
  computed: {
    monsterTable () { return this.$store.state.monsterTable; },
    imageTable () { return this.$store.state.imageTable; },
    attrColors () { return constData.attrColors; },
    
    pageCount () { return ((this.filteredMonsterTableArray.length + this.inPageCount - 1) / this.inPageCount) | 0; },

    /** フィルタリングを行ったモンスターデータの配列。 */
    filteredMonsterTableArray: function () {
      return filterMonsterDataArray(this.filterSetting, this.$store.getters.monsterDataArray);
    },
    monsterTableInPage () {
      return this.filteredMonsterTableArray.slice((this.page - 1) * this.inPageCount, this.page * this.inPageCount);
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
    filteredMonsterTableArray: function () {
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
      const newData = (nowData) ? undefined : true;
      this.$store.commit('setMonsterFavorite', { no: no, data: newData });
      this.favoriteToggled[no] = true;
    }
  }
};
</script>

<style lang="scss" scoped>
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
