<template>
  <tr>
    <th :colspan="hasSkillVoice ? 3 : 4" class="subHead">{{ info.name }}</th>
    <td :colspan="hasSkillVoice ? 3 : 4">
      <input type="number" class="form-control" v-model.number="nowValue" :min="info.min" :max="info.max">
    </td>
    <td :colspan="hasSkillVoice ? 3 : 4">
      <input type="number" class="form-control" v-model.number="plus99Value" :min="info.min" :max="info.max + info.plusValue * 99">
    </td>
    <td v-if="hasSkillVoice" colspan="3">
      <input type="number" class="form-control" v-model.number.lazy="skillVoicePlus99Value" :min="info.min" :max="info.max * 1.1 + 1 + info.plusValue * 99">
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
    },
    /** 覚醒『スキルボイス』を持っているかどうか。 */
    hasSkillVoice: {
      type: Boolean,
      default: false
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
          max: 99999,
          plusValue: 10
        },
        'attack': {
          name: '攻撃',
          min: 1,
          max: 99999,
          plusValue: 5
        },
        'recovery': {
          name: '回復',
          min: -99999,
          max: 99999,
          plusValue: 3
        }
      }[this.type] || { name: '', min: 0, max: 1, plusValue: 0 };
    },
    /** 現在の設定値にプラスを99振ったときの値。 */
    plus99Value: {
      get: function () { return (typeof (this.nowValue) === 'number') ? this.nowValue + this.info.plusValue * 99 : null; },
      set: function (value) { if (typeof (value) === 'number') { this.nowValue = value - this.info.plusValue * 99; } }
    },
    /** 現在の設定値にスキルボイスの効果をかけてプラスを99振ったときの値。 */
    skillVoicePlus99Value: {
      get: function () { return (typeof (this.nowValue) === 'number') ? ((this.nowValue * 1.1 + 0.5) | 0) + this.info.plusValue * 99 : null; },
      set: function (value) { this.nowValue = ((value - this.info.plusValue * 99) / 1.1 + 0.5) | 0; }
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
        if (this.nowValue !== '') { this.nowValue = null; }
      }
    }
  }
};
</script>

<style lang="scss" scoped>
th.subHead {
  vertical-align: middle;
}
</style>
