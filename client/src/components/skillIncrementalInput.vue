<template>
  <div class="dropdown show">
    <input :value="value" :id="id" @input="$emit('input', $event.target.value); showPopup($event.target);" @focus="showPopup($event.target);" class="form-control dropdown-toggle" :placeholder="placeholder" data-toggle="dropdown" :required="required" minLength="1" maxLength="50">
    <div class="dropdown-menu" style="height: auto; max-height: 200px; overflow-x: hidden;">
      <a v-for="skill in filteredSkillTable" class="dropdown-item" tabindex="-1" @click="$emit('select-no', skill.no)" href="javascript:void(0)" :key="`skill${skill.no}`">
        {{ skill.name }}<br>
        <span style="font-size: 80%;">{{ skill.description }}</span>
      </a>
    </div>
  </div>
</template>

<script>
import $ from 'jquery';
export default {
  name: 'SkillIncrementalInput',
  props: {
    'id': {
      type: String,
      default: undefined
    },
    'value': {
      type: String,
      default: '0'
    },
    'skillTable': {
      type: Object,
      required: true
    },
    'placeholder': {
      type: String,
      default: ''
    },
    'required': {
      type: Boolean,
      default: true
    }
  },

  computed: {
    filteredSkillTable: function () {
      // 文字が入力されていない場合は表示しない。
      if (this.value.length < 1) { return {}; }
      const obj = {};
      for (const key in this.skillTable) {
        const value = this.skillTable[key];
        if (value.name.indexOf(this.value) !== -1) {
          obj[key] = value;
        }
      }
      return obj;
    }
  },
  methods: {
    showPopup: function (target) {
      if (!$(target).siblings('.dropdown-menu').hasClass('show')) {
        $(target).dropdown('toggle');
      }
      $(target).dropdown('update');
    }
  }
};
</script>
