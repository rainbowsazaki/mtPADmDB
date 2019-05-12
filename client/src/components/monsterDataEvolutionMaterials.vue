<template>
  <div :class="`type${type}`" style="border: 1px solid black; background: #960;">
    <div style="display: inline-block; background:#F90; padding: 0.1em;">
      <div class="typeName" style="-webkit-background-clip: text;">{{ evolutionTypeTable[type] }}</div>
      <div>
        <monster-icon :no="targetNo" width="3.6em" height="3.6em" />
      </div>
    </div>
    <div style="display: inline-block; vertical-align:top; padding-top: 0.5em; padding-left: 0.3em;">
      <div style="border: 0.1em solid #900; background: #C60; margin-bottom: 0.1em;">{{ monsterTable[targetNo] && monsterTable[targetNo].name }}</div>
      <ul v-if="materials[0]" style="width: 14em; list-style: none; margin: 0px; padding: 0px; display:flex; justify-content: space-between;">
        <template v-for="(material, n) in materials">
          <li v-if="material" style="" :key="`materialNo${n}`">
            <router-link :to="{ name:'monsterDetails', params: { no: material }}">
              <monster-icon :no="material" :monster-table="monsterTable" :image-table="imageTable" width="2.7em" height="2.7em" />
            </router-link>
          </li>
        </template>
      </ul>
      <span v-else>不明</span>
    </div>
  </div>
</template>

<script>
import { constData } from '../mtpadmdb.js';

/** モンスター情報ページの進化素材情報を表示するコンポーネント。 */
export default {
  name: 'MonsterDataEvolutionMaterials',
  props: {
    /** 進化形式を示す番号。 */
    type: {
      type: Number,
      default: 99
    },
    /** 進化後（or 進化前）のモンスターの番号。 */
    targetNo: {
      type: Number,
      default: null
    },
    /** 進化素材の番号が入った配列。 */
    materials: {
      type: Array,
      required: true
    }
  },
  computed: {
    evolutionTypeTable: function () { return constData.evolutionTypeTable; },
    monsterTable: function () { return this.$store.state.monsterTable; },
    evolutionTable: function () { return this.$store.state.evolutionTable; }
  }
};
</script>

<style lang="scss" scoped>
.typeName {
  font-size: 0.9em;
  line-height: 1em;
  margin: 0.25em 0;
  color: #FFF;
  background: #FFF;
  -webkit-text-fill-color: transparent;
  font-weight: bold;

  $shadowBlur: 0.4px;
  $shadowColor: rgba(0,0,0,1);
  filter:
    drop-shadow(0px 0px $shadowBlur $shadowColor)
    drop-shadow(0px 0px $shadowBlur $shadowColor)
    drop-shadow(0px 0px $shadowBlur $shadowColor)
    drop-shadow(0px 0px $shadowBlur $shadowColor);
}

</style>

