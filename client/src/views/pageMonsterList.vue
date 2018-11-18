<template>

  <div>
    <h1>みんなで作るパズドラモンスターデータベース</h1>
    <div><tweet-button /></div>

    <div v-if="isLoadingMonsterList">データの読み込み中です ...</div>
    <div v-else>現在の登録数：{{monsterCount}}種類</div>
    
    <form @submit="$event.preventDefault(); search();">
      <div class="input-group mb-3">
        <input type="text" class="form-control" placeholder="モンスター名検索" v-model="searchWord">
        <div class="input-group-append">
          <button type="submit" class="btn btn-outline-secondary">検索</button>
        </div>
      </div>
    </form>
    <pagination :page="page" :pageCount="pageCount" />

    <div class="row">
      <div v-for="data in monsterTableInPage" class="col-md-6" style="padding-bottom: 2px; margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
        <router-link :to="'/' + data.no">
          <monster-icon :no="data.no" :monsterTable="monsterTable" :imageTable="imageTable" width="3em" height="3em"
          /><div style="display: inline-block; padding-left: 4px; vertical-align:bottom; height: 3em;">
            <span style="font-size: 80%;">No.{{data.no}}</span><br>
            {{data.name}}
          </div>
        </router-link>
      </div>
    </div>

    <pagination :page="page" :pageCount="pageCount" />

  </div>
</template>

<script>

import { constData, escapeRegExp } from '../mtpadmdb.js';

/**
 * モンスター一覧ページコンポーネント
 */
export default {
  name: 'pageMonsterList',
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
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
