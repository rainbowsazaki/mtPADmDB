<template>
  <div>
    <div><tweet-button /></div>
    <p>
      みんなで協力してパズドラモンスターのデータベースを作り、作成されたJSONデータを自由に使用できる形で公開しようという試みです。
    </p>
    <div v-if="monsterCount === 0">データの読み込み中です ...</div>
    <div v-else>現在の登録数：{{ monsterCount }}種類</div>
    <monster-list />
    <h2 class="h4">コメント</h2>
    <comment-list />
  </div>
</template>

<script>

const MonsterList = () => import('../components/monsterList.vue');
import MixinForPage from '../components/mixins/forPage.js';

/**
 * トップページコンポーネント
 */
export default {
  name: 'PageTop',
  pageTitle: undefined,
  components: {
    'monster-list': MonsterList
  },
  mixins: [MixinForPage],
  computed: {
    monsterTable () { return this.$store.state.monsterTable; },
    monsterCount () { return Object.keys(this.monsterTable).length; }
  }
};
</script>
