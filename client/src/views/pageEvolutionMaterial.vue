<template>
  <div>
    <evolution-material :no="Number(no)" @onTotalMaterialCounts="onTotalMaterialCounts" />
    <h3>必要総数</h3>
    <ul class="list-group" style="max-width: 600px;">
      <li v-for="materialCountInfo in sortedMaterialList" class="list-group-item d-flex justify-content-between align-items-center" :key="`materialCount_${materialCountInfo.no}`">
        <span>
          <monster-icon :no="Number(materialCountInfo.no)" :monster-table="monsterTable" :image-table="imageTable" width="2em" height="2em" />
          {{ (monsterTable[materialCountInfo.no] || { name:'（不明）' }).name }}
        </span>
        <span class="badge badge-primary badge-pill">×{{ materialCountInfo.count }}</span>
      </li>
    </ul>
  </div>
</template>

<script>
import evolutionMaterial from '../components/evolutionMaterial.vue';

export default {
  components: {
    'evolutionMaterial': evolutionMaterial
  },
  props: {
    /** 表示するモンスターの番号。 */
    no: {
      type: [String, Number],
      required: true
    }
  },
  data: function () {
    return {
      /**
       * 対象モンスターを作成するのに必要な進化元・素材の数の配列。
       * [ { no: モンスター番号, count: 必要個数 }, ... ]
       */
      sortedMaterialList: []
    };
  },
  computed: {
    /** モンスター情報のテーブル。 */
    monsterTable () { return this.$store.state.monsterTable; },
    /** モンスター画像情報のテーブル。 */
    imageTable () { return this.$store.state.imageTable; }
  },
  methods: {
    /** 必要素材数を受け取るメソッド。 */
    onTotalMaterialCounts (obj) {
      const array = [];
      for (const no in obj) {
        array.push({ no: no, count: obj[no] });
      }
      this.sortedMaterialList = array;
    }
  }
};
</script>
