<template>
  <div>
    <monster-icon :no="no" :monster-table="monsterTable" :image-table="imageTable" width="2em" height="2em" />
    <template v-if="stoneBaseMonsterData">
      ← <monster-icon :no="stoneBaseMonsterData.no" :monster-table="monsterTable" :image-table="imageTable" width="2em" height="2em" />
    </template>
    <table v-if="materialTargetMonsterData.evolution.baseNo" class="table table-bordered">
      <tr>
        <td>
          <evolution-material :no="materialTargetMonsterData.evolution.baseNo" />
        </td>
        <template v-for="(material, i) in materialTargetMonsterData.evolution.materials">
          <td v-if="material" :key="`material_${i}`">
            <evolution-material :no="material" />
          </td>
        </template>
      </tr>
    </table>
  </div>
</template>

<script>
import EvolutionMaterial from '../components/evolutionMaterial.vue';

export default {
  name: 'EvolutionMaterial',
  components: {
    'EvolutionMaterial': EvolutionMaterial
  },
  props: {
    /** 表示するモンスターの番号。 */
    no: {
      type: Number,
      required: true
    }
  },
  computed: {
    /** モンスター情報のテーブル。 */
    monsterTable () { return this.$store.state.monsterTable; },
    /** モンスター画像情報のテーブル。 */
    imageTable () { return this.$store.state.imageTable; },
    /** 表示対象のモンスターの情報。 */
    monsterData () { return this.monsterTable[this.no] || {}; },
    /** 特定モンスターの希石の場合は、元となるモンスターの情報。そうでない場合は undefined 。 */
    stoneBaseMonsterData () {
      if (!/^(.*)の希石$/.test(this.monsterData.name)) {
        return undefined;
      }
      const baseName = RegExp.$1;
      return Object.values(this.monsterTable).find(d => d.name === baseName);
    },
    /** 素材確認の対象となるモンスターの情報。希石の元のモンスターか、指定モンスターそのもの。 */
    materialTargetMonsterData () {
      return this.stoneBaseMonsterData || this.monsterData;
    }
  }
};
</script>
