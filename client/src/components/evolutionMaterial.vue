<template>
  <div>
    <div v-if="evoInfo.kiseki" class="kisekiHeader">
      <monster-icon :no="evoInfo.kiseki" width="2.3em" height="2.3em" />
    </div>
    <evolution-materials style="font-size: 85%;" :target-no="evoInfo.no" />
    <div style="padding-left: 1em; position: relative;">
      <evolution-material v-for="materialInfo in evoInfo.materials || []" :evo-info="materialInfo" :key="`material${materialInfo.no}`" />
      <template v-if="evoInfo.evo">
        <div v-if="evoInfo.materials && evoInfo.materials.length" class="evoLine" />
        <div class="evoArrow" />
        <evolution-material :evo-info="evoInfo.evo" />
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
    },
    /** 進化関係を示す矢印の上側に伸ばす線が必要かどうか。 */
    isNeedEvoLine () {
      const materials = this.evoInfo.materials;
      return materials && materials.length;
    }
  },
  mounted: function () {
    if (!this.hasEvolution) {
      this.totalMaterialCounts[this.materialTargetMonsterData.no || this.no] = 1;
      this.$emit('onTotalMaterialCounts', this.totalMaterialCounts);
    }
    this.udpateEvoLine();
  },
  methods: {
    /** 進化関係を示す矢印の上側を伸ばす要素のサイズを調整する。 */
    udpateEvoLine () {
      if (!this.isNeedEvoLine) { return; }
      const elm = this.$el.getElementsByClassName('evoLine')[0];
      if (!elm) { return; }
      const offsetTop = elm.offsetTop;
      if (!offsetTop) { return; }
      const fontSizePx = window.getComputedStyle(elm).getPropertyValue('font-size');
      const fontSize = fontSizePx.match(/(\d+)/)[0];
      // サイズ変更などで間が開く可能性を考慮して、少し長めにする。
      elm.style.height = (offsetTop / fontSize + 1) + 'em';
      elm.style.top = 0;
    },
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

$arrowLineWidth: 0.18em;
$arrowColor: #f90;
$arrowMarginLeft: 0.2em;

.evoLine {
  position: absolute;
  left: $arrowMarginLeft;
  border-left: $arrowLineWidth solid $arrowColor;
}

.evoArrow {
  $width: 0.8em;

  position: relative;
  float: left;
  width: $width - $arrowMarginLeft;
  height: 2.6em;
  margin-left: -$width + $arrowMarginLeft - 0.2em;
  border-color: $arrowColor;
  border-width: $arrowLineWidth;
  border-style: none none solid solid;
  border-radius: 0 0 0 0.3em;

  &::after {
    content: '';
    position: absolute;
    bottom: -0.38em;
    right: -0.5em;

    border: 0.3em solid transparent;
    border-left: 0.3em solid $arrowColor;
  }
}
</style>
