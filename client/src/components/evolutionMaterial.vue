<template>
  <div v-if="hasEvolution">
    <monster-icon :no="no" width="2.5em" height="2.5em" />
    <template v-if="stoneBaseMonsterData">
      ← <monster-icon :no="stoneBaseMonsterData.no" width="2.5em" height="2.5em" />
    </template>
    {{ materialTargetMonsterData.name }}

    <table class="table table-bordered table-sm">
      <tr>
        <th>進化元</th>
        <th>素材</th>
      </tr>
      <tr>
        <td>
          <monster-icon :no="materialTargetMonsterData.evolution.baseNo" width="2.5em" height="2.5em" />
        </td>
        <td>
          <template v-for="(material, i) in materialTargetMonsterData.evolution.materials">
            <monster-icon v-if="material" :no="material" width="2.5em" height="2.5em" :key="`material_${i}`" />
          </template>
        </td>
      </tr>
    </table>
    <div style="margin-left: 0.5rem">
      <evolution-material :no="materialTargetMonsterData.evolution.baseNo" @onTotalMaterialCounts="onTotalMaterialCounts" />
      <template v-for="(material, i) in materialTargetMonsterData.evolution.materials">
        <evolution-material v-if="material" :no="material" @onTotalMaterialCounts="onTotalMaterialCounts" :key="`material_${i}`" />
      </template>
    </div>
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
  data: function () {
    return {
      /** このモンスターを作成するのに必要な元モンスター・素材の総数。キーがモンスター番号で値が必要数。 */
      totalMaterialCounts: {},
      /** このモンスターの元モンスター・必要素材から、そzれぞれの必要素材がが送られてきた回数。 */
      returnedMeterialCountsCount: 0
    };
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
    },
    /** 進化後のモンスターかどうか。 */
    hasEvolution () {
      return this.materialTargetMonsterData.evolution && this.materialTargetMonsterData.evolution.baseNo;
    }
  },
  mounted: function () {
    if (!this.hasEvolution) {
      this.totalMaterialCounts[this.materialTargetMonsterData.no || this.no] = 1;
      this.$emit('onTotalMaterialCounts', this.totalMaterialCounts);
    }
  },
  methods: {
    /** 必要素材数を受け取るメソッド。 */
    onTotalMaterialCounts (obj) {
      for (const key in obj) {
        this.totalMaterialCounts[key] = (this.totalMaterialCounts[key] || 0) + obj[key];
      }
      this.returnedMeterialCountsCount++;
      
      let count = 1;
      for (const material of this.materialTargetMonsterData.evolution.materials) {
        if (material) { count++; }
      }
      if (this.returnedMeterialCountsCount === count) {
        this.$emit('onTotalMaterialCounts', this.totalMaterialCounts);
      }
    }
  }
};
</script>
