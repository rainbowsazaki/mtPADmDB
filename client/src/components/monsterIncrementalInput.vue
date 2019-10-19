<template>
  <div class="dropdown show">
    <input v-model="filter" placeholder="モンスター名で検索" class="form-control dropdown-toggle" @input="showPopup($event.target);" data-toggle="dropdown">
    <div class="dropdown-menu">
      <a v-for="monsterData in filteredMonsterTable" class="dropdown-item" @click="updateValue(monsterData.no)" href="javascript:void(0)" :key="`monster${monsterData.no}`">
        <monster-icon no-link :no="monsterData.no" width="1.6em" height="1.6em" />
        {{ monsterData.name }}
      </a>
    </div>
  </div>
</template>

<script>
import { getFilterFunction } from '../components/monsterFilterSetting.vue';
import $ from 'jquery';
export default {
  name: 'MonsterIncrementalInput',
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
      const func = getFilterFunction({ name: this.filter });
      return Object.values(this.monsterTable).filter(d => func(d));
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

<style lang="scss" scoped>
.dropdown-menu {
  height: auto;
  max-height: 200px;
  overflow-x: hidden;
}
</style>
