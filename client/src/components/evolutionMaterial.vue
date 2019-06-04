<template>
  <div v-if="hasEvolution">
    <div style="margin-bottom: 0.5em;">
      <div class="beforeMonster">
        <monster-icon :no="no" width="2.7em" height="2.7em" />
        <template v-if="stoneBaseMonsterData">
          ← <monster-icon :no="stoneBaseMonsterData.no" width="2.7em" height="2.7em" />
        </template>
        {{ materialTargetMonsterData.name }}
      </div>
      <evolution-materials minimum style="font-size: 90%;" :type="materialTargetMonsterData.evolutionType" :before-no="materialTargetMonsterData.no" :target-no="materialTargetMonsterData.evolution.baseNo" :materials="materialTargetMonsterData.evolution.materials" />
    </div>
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
import EvolutionMaterials from './../components/monsterDataEvolutionMaterials.vue';

export default {
  name: 'EvolutionMaterial',
  components: {
    'EvolutionMaterial': EvolutionMaterial,
    EvolutionMaterials
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

<style lang="scss" scoped>
div.baseAndMaterials {
  margin: 0.25rem 0 1rem;

  .baseMonster {
    margin-right: 0.25rem;
  }
  .materialMonster {
    margin-right: 1px;
  }
}

div.beforeMonster {
  background: linear-gradient(#f6e6be, #f6d69e);
  border: 1px solid #706050;
  width: 16.04em;
  padding: 0.2em 0.2em 1.1em 0.2em;
  margin-bottom: -1em;
  border-radius: 6px;
}
</style>
