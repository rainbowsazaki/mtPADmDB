<template>
  <div>
    <div v-if="evoInfo.kiseki" class="kisekiHeader">
      <monster-icon :no="evoInfo.kiseki" width="2.3em" height="2.3em" />
    </div>
    <evolution-materials style="font-size: 85%;" :highlight="evoInfo.target" :target-no="evoInfo.no" />
    <div style="padding-left: 1em; position: relative;">
      <evolution-material v-for="materialInfo in evoInfo.materials || []" :evo-info="materialInfo" :key="`material${materialInfo.no}`" />
      <template v-if="Array.isArray(evoInfo.evo)">
        <template v-for="(evo, n) in evoInfo.evo">
          <div v-if="isNeedEvoLine && n === evoInfo.evo.length - 1" class="evoLine" :key="`line-${evo.no}`" />
          <div class="evoArrow" :key="`arrow-${evo.no}`" />
          <evolution-material :evo-info="evo" :key="`materials-${evo.no}`" />
        </template>
      </template>
      <template v-else-if="evoInfo.evo">
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
  computed: {
    /** 進化関係を示す矢印の上側に伸ばす線が必要かどうか。 */
    isNeedEvoLine () {
      const evoInfo = this.evoInfo;
      if (evoInfo.evo && evoInfo.evo.length > 1) { return true; }
      const materials = this.evoInfo.materials;
      return materials && materials.length;
    }
  },
  mounted: function () {
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
