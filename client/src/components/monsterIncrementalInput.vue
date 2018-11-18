<template>
  <div class="dropdown show">
    <input v-model="filter" placeholder="モンスター名で検索" class="form-control dropdown-toggle" @input="showPopup($event.target);" data-toggle="dropdown">
    <div class="dropdown-menu" style="height: auto; max-height: 200px; overflow-x: hidden;">
      <a v-for="value in filteredMonsterTable" class="dropdown-item" @click="updateValue(value.no)" href="javascript:void(0)">
        <monster-icon v-if="imageTable" :no="value.no" :monsterTable="monsterTable" :imageTable="imageTable" width="1.6em" height="1.6em" />
        {{value.name}}
      </a>
    </div>
  </div>
</template>

<script>
import $ from 'jquery';
import BootstrapVue from 'bootstrap-vue'
export default {
  name: 'monsterIncrementalInput',
  props: {
    'value': {
      type: Number,
      default: null
    },
    'monsterTable': {
      type: Object,
      required: true
    },
    'imageTable': {
      type: Object,
      default: undefined
    }
  },
  data: function () {
    return {
      filter: ''
    };
  },
  computed: {
    filteredMonsterTable: function () {
      // 文字が入力されていない場合は表示しない。
      if (this.filter.length < 1) { return {}; }
      const obj = {};
      for (const key in this.monsterTable) {
        const value = this.monsterTable[key];
        if (value && value.name && value.name.indexOf(this.filter) !== -1) {
          obj[key] = value;
        }
      }
      return obj;
    }
  },
  watch: {
    value: function () {
      this.updateFilter();
    },
    monsterTable: function () {
      if (this.filter === '') { this.updateFilter(); }
    }
  },
  mounted: function () {
    this.updateFilter();
  },
  methods: {
    updateFilter: function () {
      this.filter = (this.monsterTable[this.value] || { name: '' }).name;
    },

    updateValue: function (value) {
      this.filter = (this.monsterTable[value] || { name: '' }).name;
      this.$emit('input', value);
    },
    showPopup: function (target) {
      if (!$(target).siblings('.dropdown-menu').hasClass('show')) {
        $(target).dropdown('toggle');
      }
      $(target).dropdown('update');
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
