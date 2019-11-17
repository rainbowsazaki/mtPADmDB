<template>
  <div>
    <div v-if="evoInfo.kiseki" class="kisekiHeader">
      <monster-icon :no="evoInfo.kiseki" width="2.3em" height="2.3em" />
    </div>
    <evolution-materials style="font-size: 85%;" :highlight="evoInfo.target" :target-no="evoInfo.no" :exchange="evoInfo.isExchange" />
    <div class="wrapper">
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
  common: {
    /** ページ内にある進化関係を示す矢印の上側を伸ばす要素全てのサイズを調整する。 */
    updateEvoLine: function () {
      this.isReservedUpdateEvoLine = false;

      const elms = document.getElementsByClassName('evoLine');
      for (const n in elms) {
        const elm = elms[n];
        const offsetTop = elm.offsetTop;
        if (!offsetTop) { return; }
        const fontSizePx = window.getComputedStyle(elm).getPropertyValue('font-size');
        const fontSize = fontSizePx.match(/(\d+)/)[0];
        // サイズ変更などで間が開く可能性を考慮して、少し長めにする。
        elm.style.height = (offsetTop / fontSize + 1) + 'em';
        elm.style.top = 0;
      }
    },
    /** 進化関係を示す矢印の上側の伸ばす要素のサイズの調整を予約する。 */
    reserveUpdateEvoLine: function () {
      // 予約済みなら実行しない。
      if (this.isReservedUpdateEvoLine) { return; }
      this.isReservedUpdateEvoLine = true;
      setTimeout(() => this.updateEvoLine(), 1);
    },
    /** reserveUpdateEvoLine() による予約が行われているかどうか。 */
    isReservedUpdateEvoLine: false
  },

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
    if (this.isNeedEvoLine) {
      this.$options.common.reserveUpdateEvoLine();
    }
  }
};
</script>

<style lang="scss" scoped>
.kisekiHeader {
  margin: 0.2em 0;
}

$indent: 1.2em;
$arrowLineWidth: 0.18em;
$arrowColor: #f90;
$arrowMarginLeft: 0.2em;
$arrowMarginRight: 0.4em;
.wrapper {
  padding-left: $indent;
  position: relative;
}

.evoLine {
  position: absolute;
  left: $arrowMarginLeft;
  border-left: $arrowLineWidth solid $arrowColor;
  padding: 1px; // レンダリングの関係か、先の太さが矢印と異なることがまれにあったが、padding を指定したらなくなった。
}

.evoArrow {
  $width: $indent - $arrowMarginRight;

  position: relative;
  float: left;
  width: $width - $arrowMarginLeft;
  height: 2.6em;
  margin-left: -$indent + $arrowMarginLeft;
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
