<template>
  <div is="style" />
</template>

<script>
/** 親要素および親要素の子要素にのみ適用されるスタイル情報要素のコンポーネントです。 */
export default {
  name: 'scopedStyle',
  common: { inc: 0 },
  mounted: function () {
    const className = 'scopedStyle' + this.$options.common.inc++;
    this.$el.parentNode.classList.add(className);
    this.$el.textContent = this.$slots.default[0].text.replace(/([^\}]+\{)/g, `.${className} $1`);
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
