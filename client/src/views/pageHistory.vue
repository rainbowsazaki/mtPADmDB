<template>
  <div>
    <table class="table table-sm">
      <tr v-for="history in histories" :key="`history${history.id}`">
        <td>
          <router-link :to="{ name:'monsterHistory', params: { id: history.id }}">{{ history.datetime }}</router-link>
        </td>
        <td><router-link :to="{ name: 'monsterDetails', params: { no: history.no }}">
          <monster-icon no-link :no="history.no" :monster-table="monsterTable" :image-table="imageTable" width="2em" height="2em" />
          No.{{ history.no }} {{ monsterName(history.no) }}
        </router-link></td>
        <td>
          <span v-if="history.comment">{{ history.comment }}</span>
          <span v-else style="opacity: 0.6;">（コメントなし）</span>
        </td>
        <td><span v-if="isActiveHistory(history)">（現在のデータ）</span></td>
      </tr>
    </table>
  </div>
</template>

<script>
import { mtpadmdb } from '../mtpadmdb.js';
/**
 * モンスター情報変更履歴ページコンポーネント
 */
export default {
  name: 'PageHistory',
  pageTitle: function () {
    return '履歴一覧';
  },
  data: function () {
    return {
      /** 履歴情報 */
      histories: null
    };
  },
  computed: {
    monsterTable: function () { return this.$store.state.monsterTable; },
    imageTable: function () { return this.$store.state.imageTable; },

    /** 編集履歴の表示かどうか。 */
    isHistory: function () {
      return (this.$route.name === 'monsterHistory');
    }
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
  }
};
</script>
