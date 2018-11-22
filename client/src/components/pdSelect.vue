<template>
  <div class="dropdown pd-select" style="width: 100%">
    <div class="custom-select" tabindex="0" data-toggle="dropdown" v-html="html">{{ html }}</div>
    <div class="dropdown-menu" style="height: auto; max-height: 200px; overflow-x: hidden; -webkit-overflow-scrolling: touch; width: 100%;">
      <slot />
    </div>
  </div>
</template>

<script>
import $ from 'jquery';
export default {
  name: 'PdSelect',
  props: {
    'value': {
      type: [Number, String],
      default: 0
    }
  },
  data: function () {
    return {
      html: ''
    };
  },
  watch: {
    value: 'changeDisp'
  },
  mounted: function () {
    $(this.$el).on('shown.bs.dropdown', () => {
      $(this.$el).children('div.dropdown-menu').children('.active').focus().scrollParentShowThis();
    });
    this.$on('clickOption', this.clickOption);
    this.changeDisp(this.value);
  },
  methods: {
    clickOption: function (option) {
      this.$emit('input', option[0]);
      $(this.$el).children(0).focus();
    },
    changeDisp: function (value) {
      // html要素上では null の値はなく文字列になっているため、値が null の場合は文字列にする。
      value = (value === null) ? 'null' : value.toString();
      $(this.$el).children('.dropdown-menu').children('.pd-option').each((index, elem) => {
        if (elem.getAttribute('data-value') === value) {
          $(elem).addClass('active');
          this.html = $(elem).html();
        } else {
          $(elem).removeClass('active');
        }
      });
    }
  }
};
</script>
