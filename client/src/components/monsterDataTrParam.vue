<template>
  <tr>
    <th style="width: auto;">{{ info.name }}</th>
    <td style="width: 25%;" class="text-right">{{ value }}</td>
    <td v-if="isVisible297" style="width:25%;" class="text-right">{{ value + info.plusValue * 99 }}</td>
    <td style="width: 25%;" class="text-right">{{ (value / info.plusValue).toFixed(1) }}</td>
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
    }
  },
  computed: {
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

