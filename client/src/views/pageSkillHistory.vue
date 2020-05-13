<template>
  <div>
    <h2>{{ title }}</h2>
    <pagination item-count="11" :page="page" :page-count="200" />
    <table class="table table-sm">
      <tr v-for="history in histories" :key="`history${history.id}`">
        <td>
          <router-link :to="{ name: isLeaderSkill ? 'leaderSkillDetailsHistory' : 'skillDetailsHistory', params: { id: history.id }}">
            {{ history.datetime }}
          </router-link>
        </td>
        <td>
          <router-link :to="{ name: isLeaderSkill ? 'leaderSkillDetails' : 'skillDetails', params: { no: history.no }}">
            No.{{ history.no }} {{ skillName(history.no) }}
          </router-link>
        </td>
        <td><span v-if="isActiveHistory(history)">（現在のデータ）</span></td>
      </tr>
    </table>
    <pagination item-count="11" :page="page" :page-count="200" />
  </div>
</template>

<script>
import { mtpadmdb } from '../mtpadmdb.js';
import MixinForPage from '../components/mixins/forPage.js';
import RouteQueryWrapper from '../components/mixins/routeQueryWrapper.js';
/**
 * スキル編集履歴ページコンポーネント
 */
export default {
  name: 'PageSkillHistory',
  pageTitle: function () {
    return this.title;
  },
  mixins: [MixinForPage, RouteQueryWrapper],
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
      /** 履歴情報 */
      histories: null
    };
  },
  computed: {
    /** リーダースキルの表示かどうか。 */
    isLeaderSkill: function () { return this.$route.name.indexOf('leaderSkill') !== -1; },
    /** 登録されているスキルが番号をキーとして入っているテーブル。 */
    skillTable: function () {
      return (this.isLeaderSkill) ? this.$store.state.leaderSkillTable : this.$store.state.skillTable;
    },
    /** ページのタイトル。 */
    title: function () {
      return ((this.isLeaderSkill) ? 'リーダー' : '') + 'スキル編集履歴一覧';
    }
  },
  watch: {
    page: 'loadHistories'
  },
  created: function () {
    this.loadHistories();
  },
  methods: {
    /** 履歴リストを取得する。 */
    loadHistories: function () {
      this.histories = null;
      this.isLoadingHistory = true;
      mtpadmdb.api('skillHistory', { isLeaderSkill: this.isLeaderSkill ? 1 : 0, page: this.page - 1 },
        (response) => {
          this.histories = response.data;
        });
    },

    /** 指定された履歴情報が今有効なデータかどうかを取得する。 */
    isActiveHistory: function (history) {
      return history.state === 1;
    },
    /** 指定された番号のスキルの名前を取得する。 */
    skillName: function (no) {
      return (this.skillTable[no] || { name: '（登録なし）' }).name;
    }
  }
};
</script>
