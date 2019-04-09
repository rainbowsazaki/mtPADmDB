<template>
  <div>
    <h2>{{ pageTitle }}</h2>
    <tweet-button v-if="monsterData.no" />
    <div class="icons">
      <span v-for="materialCountInfo in sortedMaterialList" :key="`materialCount_${materialCountInfo.no}`">
        <span v-for="i in materialCountInfo.count" :key="`materialCount_${materialCountInfo.no}_${i}`">
          <monster-icon :no="Number(materialCountInfo.no)" :monster-table="monsterTable" :image-table="imageTable" width="2rem" height="2rem" />
        </span>
      </span>
    </div>
    <h3>個々の進化素材</h3>
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
  name: 'PageEvolutionMaterial',
  pageTitle: function () { return this.pageTitle; },
  breadcrumbsTitle: '作成に必要なモンスター',
  middleOfBreadcrumbs: function () {
    return [
      {
        text: 'モンスター一覧',
        link: { name: 'monsterList' }
      },
      {
        text: `No.${this.no} ${this.monsterData.name}`,
        link: { name: 'monsterDetails', params: { no: this.no }}
      }
    ];
  },
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
    imageTable () { return this.$store.state.imageTable; },
    /** 対象のモンスターの情報。 */
    monsterData () { return this.monsterTable[this.no] || {}; },
    /** ページのタイトル。 */
    pageTitle: function () {
      return `No.${this.no || this.monsterData.no} ${this.monsterData.name} の作成に必要なモンスター`;
    }
  },
  methods: {
    /** 必要素材数を受け取るメソッド。 */
    onTotalMaterialCounts (obj) {
      const array = [];
      for (const no in obj) {
        array.push({ no: no, count: obj[no] });
      }
      // 指定された番号のモンスターが進化のための素材となるモンスターかどうかを取得する。
      const isMaterial = (no) => {
        const type = this.monsterTable[no].types[0];
        // 進化系と強化系を素材系タイプとみなす。
        return type === 9 || type === 11;
      };
      array.sort((a, b) => isMaterial(a.no) - isMaterial(b.no));
      this.sortedMaterialList = array;
    }
  }
};
</script>

<style lang="scss" scoped>
div.icons {
  max-width: 20rem;
  margin-bottom: 1rem;
}
</style>
