<template>
  <div>
    <h2>画像投稿履歴一覧</h2>
    <table class="table table-sm">
      <tr v-for="history in histories" :key="`history${history.id}`">
        <td>
          {{ history.datetime }}
        </td>
        <td>
          <img :src="`./monsterIconsLog/icon_${history.no}_${history.id}.jpg`" style="width: 3em; height: 3em;">
          <img :src="`./monsterImagesLog/${history.no}_${history.id}.jpg`" style="width: auto; height: 3em;">
          <router-link :to="{ name: 'monsterDetails', params: { no: history.no }}">
            No.{{ history.no }} {{ monsterName(history.no) }}
          </router-link>
        </td>
        <td><span v-if="isActiveHistory(history)">（現在のデータ）</span></td>
      </tr>
    </table>
  </div>
</template>

<script>
import { mtpadmdb } from '../mtpadmdb.js';
/**
 * モンスター画像投稿履歴ページコンポーネント
 */
export default {
  name: 'PageHistory',
  pageTitle: function () {
    return '画像投稿履歴一覧';
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
      mtpadmdb.api('monsterImageHistory', {},
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
      return (this.monsterTable[no] || { name: '（登録なし）' }).name;
    }
  }
};
</script>
