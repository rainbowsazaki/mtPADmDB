<template>
  <div>
    <p>
      みんなで協力してパズドラモンスターのデータベースを作り、作成されたJSONデータを自由に使用できる形で公開しようという試みです。
    </p>
    <monster-list />
    <h2 class="h4">コメント</h2>
    <comment-list />
  </div>
</template>

<script>

const PageMonsterList = () => import('./pageMonsterList.vue');

/**
 * トップページコンポーネント
 */
export default {
  name: 'PageTop',
  pageTitle: undefined,
  components: {
    'monster-list': PageMonsterList
  }
};
</script>
