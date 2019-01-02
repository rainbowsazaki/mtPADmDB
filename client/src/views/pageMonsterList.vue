<template>

  <div>
    <h2>モンスター一覧</h2>
    <div><tweet-button /></div>

    <div v-if="isLoadingMonsterList">データの読み込み中です ...</div>
    <div v-else>現在の登録数：{{ monsterCount }}種類</div>
    
    <form @submit="$event.preventDefault(); search();">
      <div class="input-group mb-3">
        <input type="text" class="form-control" placeholder="モンスター名検索" v-model="searchWord">
        <div class="input-group-append">
          <button type="submit" class="btn btn-outline-secondary">検索</button>
        </div>
      </div>
    </form>

    <monster-filter-setting v-model="filterSetting" />

    <pagination :page="page" :page-count="pageCount" />

    <div class="row">
      <div v-for="data in monsterTableInPage" class="col-md-6" style="padding-bottom: 2px; margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" :key="`monster${data.no}`">
        <router-link :to="'/' + data.no">
          <monster-icon
            :no="data.no" :monster-table="monsterTable" :image-table="imageTable" width="3em" height="3em"
          /><div style="display: inline-block; padding-left: 4px; vertical-align:bottom; height: 3em;">
            <span style="font-size: 80%;">No.{{ data.no }}</span><br>
            {{ data.name }}
          </div>
        </router-link>
      </div>
    </div>

    <pagination :page="page" :page-count="pageCount" />

  </div>
</template>

<script>

import { constData, escapeRegExp } from '../mtpadmdb.js';
import { filterMonsterDataArray } from '../components/monsterFilterSetting.vue';

/**
 * モンスター一覧ページコンポーネント
 */
export default {
  name: 'PageMonsterList',
  pageTitle: null,
  data: function () {
    return {
      searchWord: '',
      inPageCount: 50,
      /** 表示するモンスターに対するフィルタ。 */
      filterSetting: {
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
    monsterTable () { return this.$store.state.monsterTable; },
    imageTable () { return this.$store.state.imageTable; },
    attrColors () { return constData.attrColors; },

    monsterCount () { return this.monsterTableArray.length; },
    /** モンスター一覧情報を読込中かどうか。 現在の実装だとデータ未登録の場合、ずっと読み込み中判定となる。 */
    isLoadingMonsterList () { return this.monsterCount === 0; },
    pageCount () { return ((this.filteredMonsterTableArray.length + this.inPageCount - 1) / this.inPageCount) | 0; },
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
    /** フィルタリングを行ったモンスターデータの配列。 */
    filteredMonsterTableArray: function () {
      return filterMonsterDataArray(this.filterSetting, this.searchedMonsterTableArray);
    },
    monsterTableInPage () {
      return this.filteredMonsterTableArray.slice((this.page - 1) * this.inPageCount, this.page * this.inPageCount);
    }
  },
  created: function () {
    this.$store.commit('fetchCommonData');
    this.searchWord = this.$route.query.searchWord;
  },
  methods: {

    search: function () {
      this.$router.push({ path: this.$router.path, query: { searchWord: this.searchWord }});
    }

  }
};
</script>
