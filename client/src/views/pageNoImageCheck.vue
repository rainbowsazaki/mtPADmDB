<template>

  <div>
    <h2>画像なしモンスターチェック</h2>
    <div class="monsterInfo" v-for="noImageMonster in noImageMonsterTable" :key="`no${noImageMonster.no}`">
      <router-link :to="{ name: 'monsterDetails', params: { no: noImageMonster.no } }">
        No.{{ noImageMonster.no }} {{ noImageMonster.name }}
      </router-link>
      <router-link class="editLink" :to="{ name: 'monsterPictureUpdate', params: { no: noImageMonster.no} }">投稿</router-link>
    </div>
  </div>
</template>

<script>
import MixinForPage from '../components/mixins/forPage.js';

/**
 * 画像なしモンスターチェックコンポーネント
 */
export default {
  name: 'PagNoImageCheck',
  pageTitle: function () { return '画像なしモンスターチェック'; },
  mixins: [MixinForPage],
  computed: {
    /** モンスター情報のテーブル。 */
    monsterTable () { return this.$store.state.monsterTable; },
    /** モンスター画像情報のテーブル。 */
    imageTable () { return this.$store.state.imageTable; },
    /** 空の情報を持つモンスターの番号及び空の情報のキーの配列。 */
    noImageMonsterTable () {
      const imageTable = this.imageTable;
      const monsterTable = this.monsterTable;
      return this.$store.getters.monsterDataArray.filter(d => {
        return !(d.no in imageTable) && monsterTable[d.no].name !== '???';
      });
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
}
</style>
