<template>
  <div>
    <h2>コメント一覧</h2>
    <comment-list all-page read-only />
  </div>
</template>

<script>
import MixinForPage from '../components/mixins/forPage.js';
/**
 * コメント履歴ページコンポーネント
 */
export default {
  name: 'PageCommentList',
  pageTitle: function () {
    return 'コメント一覧';
  },
  mixins: [MixinForPage],
  data: function () {
    return {
    };
  }
};
</script>
