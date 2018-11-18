<template>
  <a class="dropdown-item pd-option" href="javascript:void(0);" @click="click" :data-value="value" style="width: 8em; overflow-x: hidden; display: inline-flex; padding: 4px;">
    <slot></slot>
  </a>
</template>

<script>
export default {
  name: 'pdOption',
  props: {
    value: {
      type: String,
      required: true
    }
  },

  methods: {
    click: function () {
      this.$parent.$emit('clickOption', [this.value]);
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
