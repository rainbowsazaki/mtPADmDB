<template>
  <div>
    <div v-if="evoInfo.kiseki" class="kisekiHeader">
      <monster-icon :no="evoInfo.kiseki" width="2.3em" height="2.3em" />
    </div>
    <evolution-materials style="font-size: 85%;" :target-no="evoInfo.no" />
    <div style="padding-left: 1em; position: relative;">
      <evolution-material v-for="materialInfo in evoInfo.materials || []" :evo-info="materialInfo" :key="`material${materialInfo.no}`" />
      <div v-if="evoInfo.evo" class="evoArrow" />
      <evolution-material v-if="evoInfo.evo" :evo-info="evoInfo.evo" />
    </div>
  </div>
</template>

<script>
import EvolutionMaterial from '../components/evolutionMaterial.vue';
import EvolutionMaterials from './../components/monsterDataEvolutionMaterials.vue';

export default {
  name: 'EvolutionMaterial',
  components: {
    EvolutionMaterial,
    EvolutionMaterials
  },
  props: {
    /** 進化情報。 */
    evoInfo: {
      type: Object,
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

<style lang="scss" scoped>
.kisekiHeader {
  margin: 0.2em 0;
}

.evoArrow {
  $width: 0.8em;
  $overHeight: 0em;
  $lineWidth: 0.18em;

  position: relative;
  float: left;
  width: $width - 0.2em;
  height: $overHeight + 2.6em;
  margin-left: -$width;
  margin-right: 0.2em;
  margin-top: -$overHeight;
  border-color: #f90;
  border-width: 0.18em;
  border-style: none none solid solid;
  border-radius: 0 0 0 0.3em;

  &::after {
    content: '';
    position: absolute;
    bottom: -0.38em;
    right: -0.5em;

    border: 0.3em solid transparent;
    border-left: 0.3em solid #f90;
  }
}
</style>
