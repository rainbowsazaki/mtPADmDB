<template>
  <div class="form-row">
    <div class="col-md-4">
      <div class="input-group">
        <monster-icon v-if="imageTable" :no="value" :monster-table="monsterTable" :image-table="imageTable" width="38px" height="38px" />
        <div class="input-group-prepend">
          <span class="input-group-text">No.</span>
        </div>
        <input
          :id="id" type="number" class="form-control"
          :value="value"
          @input="updateValue(parseInt($event.target.value));" min="1" max="9999"
        >
      </div>
    </div>
    <div class="col-md-8">
      <monster-incremental-input
        :value="value"
        @input="updateValue($event);" :monster-table="monsterTable" :image-table="imageTable"
      />
    </div>
  </div>
</template>

<script>
import MonsterIncrementalInput from './monsterIncrementalInput.vue';

export default {
  name: 'MonsterIncrementalSearch',
  components: {
    'monster-incremental-input': MonsterIncrementalInput
  },
  props: {
    'id': {
      type: String,
      default: undefined
    },
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
    };
  },
  methods: {
    updateValue: function (value) {
      this.$emit('input', value);
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
