<template>
  <tr>
    <th colspan="4">{{ info.name }}</th>
    <td colspan="8">
      <input type="number" class="form-control" v-model.number="nowValue" :min="info.min" :max="info.max">
    </td>
  </tr>
</template>

<script>
export default {
  name: 'TrParam',
  props: {
    /** パラメータの種類。 'hp' or 'attack' or 'recovery' */
    type: {
      type: String,
      required: true
    },
    /** パラメータの初期値。 */
    value: {
      type: [String, Number],
      default: null
    }
  },
  data: function () {
    return {
      /** パラメータの現在の値。 */
      nowValue: 0
    };
  },
  computed: {
    /** 指定されたパラメータ種類の、表示や計算などに使用する情報。 */
    info: function () {
      return {
        'hp': {
          name: 'HP',
          min: 1,
          max: 99999
        },
        'attack': {
          name: '攻撃',
          min: 1,
          max: 99999
        },
        'recovery': {
          name: '回復',
          min: -99999,
          max: 99999
        }
      }[this.type] || { name: '', min: 0, max: 1 };
    }
  },
  watch: {
    value: 'setNowValueFromValue',
    nowValue: function () {
      this.$emit('input', this.nowValue);
    }
  },
  created: function () {
    this.setNowValueFromValue();
  },
  methods: {
    /** value プロパティの値を元に nowValue の値を更新する。 */
    setNowValueFromValue: function () {
      if (this.value || this.value === 0) {
        this.nowValue = Number(this.value);
      } else {
        this.nowValue = null;
      }
    }
  }
};
</script>

