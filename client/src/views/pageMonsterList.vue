<template>

  <div>
    <h2>モンスター一覧</h2>
    <div><tweet-button /></div>

    <div v-if="isLoadingMonsterList">データの読み込み中です ...</div>
    <div v-else>現在の登録数：{{ monsterCount }}種類</div>
    
    <monster-list @changeFilterSettingText="onChangeFilterSettingText" />

  </div>
</template>

<script>

const MonsterList = () => import('../components/monsterList.vue');
import MixinForPage from '../components/mixins/forPage.js';

/**
 * モンスター一覧ページコンポーネント
 */
export default {
  name: 'PageMonsterList',
  pageTitle: function () { return this.pageTitle; },
  breadcrumbsTitle: 'モンスター一覧',
  components: {
    'monster-list': MonsterList
  },
  mixins: [MixinForPage],
  data: function () {
    return {
      /** モンスターフィルタリング設定の内容を表したテキスト。 */
      filterSettingText: ''
    };
  },
  computed: {
    monsterTable () { return this.$store.state.monsterTable; },

    monsterCount () { return Object.keys(this.monsterTable).length; },
    /** モンスター一覧情報を読込中かどうか。 現在の実装だとデータ未登録の場合、ずっと読み込み中判定となる。 */
    isLoadingMonsterList () { return this.monsterCount === 0; },
    /** ページタイトル。 */
    pageTitle () {
      let title = 'モンスター一覧';
      if (this.filterSettingText) { title += ' ' + this.filterSettingText; }
      return title;
    }

  },
  watch: {
    pageTitle: function () {
      this.$_mixinForPage_updateTitle();
    }
  },
  created: function () {
    this.$store.commit('fetchCommonData');
  },
  methods: {
    /** モンスターフィルタリング設定の内容を表したテキストが更新されたときに呼ばれるイベントハンドラ。 */
    onChangeFilterSettingText: function (text) {
      this.filterSettingText = text;
    }
  }
};
</script>
