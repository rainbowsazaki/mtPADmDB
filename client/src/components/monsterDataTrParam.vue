<template>
  <tr v-if="value !== null" :class="`column${columnCount}`">
    <th>{{ info.name }}</th>
    <td class="text-right" :class="{ paramAlert: value < 0 }">{{ value | addComma }}</td>
    <td v-if="isVisible297" class="text-right" :class="{ paramAlert: value + info.plusValue * 99 < 0 }">{{ value + info.plusValue * 99 | addComma }}</td>
    <td v-if="isVisible297 && hasSkillVoice" class="text-right" :class="{ paramAlert: value + info.plusValue * 99 < 0 }">{{ ((value * 1.1 + 0.5) | 0) + info.plusValue * 99 | addComma }}</td>
    <td class="text-right" :class="{ paramAlert: value < 0 }">{{ (value / info.plusValue).toFixed(1) | addComma }}</td>
  </tr>
  <tr v-else :class="`column${columnCount}`">
    <th>{{ info.name }}</th>
    <td class="text-right unknownParam">不明</td>
    <td v-if="isVisible297" class="text-right unknownParam">不明</td>
    <td v-if="isVisible297 && hasSkillVoice" class="text-right unknownParam">不明</td>
    <td class="text-right unknownParam">不明</td>
  </tr>
</template>

<script>

/** モンスター情報ページのパラメータ表示の tr 要素として使用するコンポーネント。 */
export default {
  name: 'MonsterDataTrParam',
  props: {
    /** パラメータの種類。 'hp' or 'attack' or 'recovery' */
    type: {
      type: String,
      required: true
    },
    /** パラメータの値。 */
    value: {
      type: [String, Number],
      default: null
    },
    /** +297 時の値を表示するかどうか。 */
    isVisible297: {
      type: Boolean,
      deault: true
    },
    /** 覚醒『スキルボイス』を持っているかどうか。 */
    hasSkillVoice: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    /** 現在の設定に基づいた、カラム数。 */
    columnCount: function () {
      let count = 3;
      if (this.isVisible297) {
        count++;
        if (this.hasSkillVoice) { count++; }
      }
      return count;
    },
    /** 指定されたパラメータ種類の、表示や計算などに使用する情報。 */
    info: function () {
      return {
        'hp': {
          name: 'HP',
          plusValue: 10
        },
        'attack': {
          name: '攻撃',
          plusValue: 5
        },
        'recovery': {
          name: '回復',
          plusValue: 3
        }
      }[this.type] || { name: '', plusValue: 0 };
    }
  }
};
</script>

<style lang="scss" scoped>
  th {
    width: auto;
  }

  td {
    width: 25%;
  }

  tr.column5 td {
    width: 20%;
  }

  .unknownParam {
    color: rgba(0, 0, 0, 0.6);
  }

  .paramAlert {
    color: rgba(224, 0, 0, 0.8);
  }
</style>

