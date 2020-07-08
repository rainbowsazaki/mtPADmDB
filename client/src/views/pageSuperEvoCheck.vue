<template>

  <div>
    <h2>{{ title }}</h2>
    <div class="monsterInfo" v-for="nullMonster in nullMonsterInfos" :key="`no${nullMonster.no}`">
      <div class="icon">
        <monster-icon :no="nullMonster.no" width="2em" height="2em" />
      </div>
      <div>
        <div class="monsterName">
          <router-link :to="{ name: 'monsterDetails', params: { no: nullMonster.no } }">
            No.{{ nullMonster.no }} {{ targetTable[nullMonster.no].name }}
          </router-link>
          <router-link class="editLink" :to="{ name: 'monsterEdit', params: { no: nullMonster.no} }">編集</router-link>
          <div>
            {{ evolutionTypeTable[nullMonster.baseEvolutionType] }} to
            {{ evolutionTypeTable[nullMonster.evolutionType] }}
          </div>
        </div>
        
      </div>
    </div>
  </div>
</template>

<script>
import { constData } from '../mtpadmdb.js';
import MixinForPage from '../components/mixins/forPage.js';

/**
 * モンスター一覧ページコンポーネント
 */
export default {
  name: 'PageNullCheck',
  pageTitle: function () { return '超〇〇進化チェック'; },
  mixins: [MixinForPage],

  data: function () {
    return {
    };
  },
  computed: {
    /** ページのタイトル。 */
    title () { return '超〇〇進化チェック'; },
    /** 確認対象の情報のテーブル。 */
    targetTable () { return this.$store.state.monsterTable; },

    evolutionTypeTable () { return constData.evolutionTypeTable; },
    /** 空の情報を持つモンスターの番号及び空の情報のキーの配列。 */
    nullMonsterInfos () {
      const monsterTable = this.targetTable;
      const array = [];
      Object.values(monsterTable).forEach(d => {
        // 進化元のモンスターの進化形態が究極・転生かどうかを確認する。
        const baseNo = d.evolution && d.evolution.baseNo;
        const baseData = monsterTable[baseNo];
        if (!baseData) { return; }
        if (baseData.evolutionType !== 2 && baseData.evolutionType !== 3) { return; }

        // 転生・ドット・アシスト・超転生・超究極
        const table = { 3: true, 4: true, 5: true, 6: true, 7: true };
        if (table[d.evolutionType]) { return; }

        array.push({ 
          no: d.no,
          baseEvolutionType: baseData.evolutionType,
          evolutionType: d.evolutionType
        });
      });
      return array;
    }
  }
};
</script>

<style lang="scss" scoped>

.monsterInfo {

  margin-bottom: 8px;
  padding: 4px;
  box-shadow: #0003 0px 0px 6px;
  border-radius: 4px;

  .editLink {
    float: right;
    margin-right: 4px;
    opacity: 0.4;

    &:hover {
      opacity: 1;
    }
  }

  .icon {
    float: left;
    padding: 0.25em;
  }

  .monsterName {
    min-height: 1.5em;
  }

  .itemNames {
    min-height: 1.5em;
  }
}
</style>
