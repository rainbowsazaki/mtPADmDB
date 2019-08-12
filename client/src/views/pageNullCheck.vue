<template>

  <div>
    <h2>空データ一覧</h2>
    <div v-for="nullMonster in nullMonsterInfos" :key="`no${nullMonster.no}`">
      <monster-icon :no="nullMonster.no" style="width: 2em; height: auto;" />
      <router-link :to="{ name: 'monsterDetails', params: { no: nullMonster.no } }">
        No.{{ nullMonster.no }} {{ monsterTable[nullMonster.no].name }}
        {{ nullMonster.names }}
      </router-link>
    </div>
  </div>
</template>

<script>

/**
 * モンスター一覧ページコンポーネント
 */
export default {
  name: 'PageNullCheck',
  pageTitle: '空データチェック',

  data: function () {
    return {
    };
  },
  computed: {
    monsterTable () { return this.$store.state.monsterTable; },
    /** 空の情報を持つモンスターの番号及び空の情報のキーの配列。 */
    nullMonsterInfos () {
      function nullCheck (d) {
        if (d === null) { return true; }
        // 配列やオブジェクトは要素を確認する。
        if (typeof d === 'object') {
          if (Array.isArray(d)) {
            // 配列は、確保している長さよりデータが少ない場合に余白が null になっているものがあるので、
            // 0番目のもののみ確認する。
            return nullCheck(d[0]);
          } else {
            return Object.values(d).some(nullCheck);
          }
        }
        return false;
      }

      const array = [];
      Object.values(this.monsterTable).forEach(d => {
        // 内容が空の項目のキーの配列。
        const nullKeys = Object.keys(d).filter(key => {
          // 進化種類が無しや不明の場合は進化情報はない。
          if (key === 'evolution' && !d.evolutionType) {
            return false;
          }
          /** 限界突破が不明やなしの場合は限界突破時パラメータや超覚醒はない。 */
          if ((key === 'overLimitParam' || key === 'superAwakens') && !d.overLimit) {
            return false;
          }

          return nullCheck(d[key]);
        });

        const key2NameTable = {
          'attributes': '属性',
          'cost': 'コスト',
          'rare': 'レアリティ',
          'types': 'タイプ',
          'awakens': '覚醒',
          'maxExp': '必要経験値',
          'maxLevel': '最大レベル',
          'maxParam': '最大パラメータ',
          'skill': 'スキル',
          'leaderSkill': 'リーダースキル',
          'assist': 'アシスト可不可',
          'overLimit': '限界突破可不可',
          'overLimitParam': '限界突破時最大パラメータ',
          'superAwakens': '超覚醒',
          'evolutionType': '進化形式',
          'evolution': '進化情報'
        };
        const names = nullKeys.map(d => key2NameTable[d] || d);

        if (nullKeys.length) {
          array.push({
            no: d.no,
            keys: nullKeys,
            names: names
          });
        }
      });
      return array;
    }
  }
};
</script>
