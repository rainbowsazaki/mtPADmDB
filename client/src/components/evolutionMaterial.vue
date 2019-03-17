<template>
  <div>
    <monster-icon :no="no" :monster-table="monsterTable" :image-table="imageTable" width="2em" height="2em" />
    <table v-if="monsterData.evolution.baseNo" class="table table-bordered">
      <tr>
        <td>
          <evolution-material :no="monsterData.evolution.baseNo" />
        </td>
        <template v-for="(material, i) in monsterData.evolution.materials">
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
    monsterData () { return this.monsterTable[this.no] || {}; }
  }
};
</script>
