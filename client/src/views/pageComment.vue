<template>
  <div>
    <h2>コメント一覧</h2>
    <comment-list all-page />
  </div>
</template>

<script>
/**
 * コメント履歴ページコンポーネント
 */
export default {
  name: 'PageCommentList',
  pageTitle: function () {
    return 'コメント一覧';
  },
  data: function () {
    return {
    };
  }
};
</script>
