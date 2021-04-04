<template>

  <div>
    <h2>{{ title }}</h2>
    <table class="table monsterInfo">
      <tr>
        <th colspan="2">モンスター</th>
        <th v-for="name in paramNames" :key="`th_${name}`">{{ name }}</th>
      </tr>
      <tr v-for="nullMonster in errorMonsterInfos" :key="`no${nullMonster.no}`">
        <th class="icon">
          <monster-icon :no="nullMonster.no" width="2em" height="2em" />
        </th>
        <td class="monsterName">
          <router-link :to="{ name: 'monsterDetails', params: { no: nullMonster.no } }">
            No.{{ nullMonster.no }} {{ targetTable[nullMonster.no].name }}
          </router-link>
        </td>
        <td v-for="name in paramNames" :key="`param_${name}`">{{ nullMonster.rate[name] }}</td>
      </tr>
    </table>
  </div>
</template>

<script>
import { constData } from '../mtpadmdb.js';
import MixinForPage from '../components/mixins/forPage.js';

/**
 * モンスター一覧ページコンポーネント
 */
export default {
  name: 'PageOverLimitParamCheck',
  pageTitle: function () { return this.title; },
  mixins: [MixinForPage],

  data: function () {
    return {
    };
  },
  computed: {
    /** ページのタイトル。 */
    title () { return '限界突破パラメータレートチェック'; },
    /** 確認対象の情報のテーブル。 */
    targetTable () { return this.$store.state.monsterTable; },
    paramNames () { return ['hp', 'attack', 'recovery']; },

    evolutionTypeTable () { return constData.evolutionTypeTable; },
    /** 限界突破パラメータが誤っている疑惑のモンスターの番号及び限界突破レート。 */
    errorMonsterInfos () {
      const monsterTable = this.targetTable;
      const array = [];
      Object.values(monsterTable).forEach(d => {
        if (!d.overLimit) { return; }

        function calcRate (base, overlimit) {
          const TANNI = 1000;
          return Math.round(overlimit / base * TANNI) / TANNI;
        }
        // それぞれのレートを求めつつ、最も値の大きいもののレートを取得する。
        const names = this.paramNames;
        const rate = {};
        let maxValue = 0;
        let maxRate = 0;
        names.forEach(name => {
          rate[name] = calcRate(d.maxParam[name], d.overLimitParam[name]);
          if (maxValue < d.maxParam[name]) {
            maxValue = d.maxParam[name];
            maxRate = rate[name];
          }
        });
        // レベル最大時パラメータのすべての項目にレートをかけると限界突破時の値と一致するか確認する。
        // 小数の掛け算の計算誤差でX.5となるべきところがX.499…となって四捨五入が正しく行われないことがあるので、レートに小さい数を加算して対処する。
        // （掛け算のあとに加算すると、負数で-n.5となったときに、絶対値を大きくするべきところが小さくなってしまう）
        const isEqualRate = names.every(name => Math.round(d.maxParam[name] * (maxRate + 0.0000000001)) === d.overLimitParam[name]);
        if (!isEqualRate) {
          array.push({
            no: d.no,
            rate: rate,
            maxRate
          });
        }
      });
      return array;
    }
  }
};
</script>

<style lang="scss" scoped>
th.icon {
  width: 2em;
}
</style>
