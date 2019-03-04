<template>

  <div>
    <h2>モンスター一覧</h2>
    <div><tweet-button /></div>

    <div v-if="isLoadingMonsterList">データの読み込み中です ...</div>
    <div v-else>現在の登録数：{{ monsterCount }}種類</div>
    
    <monster-list />

  </div>
</template>

<script>

const MonsterList = () => import('../components/monsterList.vue');

/**
 * モンスター一覧ページコンポーネント
 */
export default {
  name: 'PageMonsterList',
  pageTitle: 'モンスター一覧',
  components: {
    'monster-list': MonsterList
  },
  data: function () {
    return {
    };
  },
  computed: {
    monsterTable () { return this.$store.state.monsterTable; },

    monsterCount () { return Object.keys(this.monsterTable).length; },
    /** モンスター一覧情報を読込中かどうか。 現在の実装だとデータ未登録の場合、ずっと読み込み中判定となる。 */
    isLoadingMonsterList () { return this.monsterCount === 0; },

  },
  created: function () {
    this.$store.commit('fetchCommonData');
  }
};
</script>
