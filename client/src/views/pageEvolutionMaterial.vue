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
    <h3 class="decoHeader">個々の進化素材</h3>
    <evolution-material :evo-info="evoInfo" />
    <h3 class="decoHeader">必要モンスター一覧</h3>
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
  breadcrumbsTitle: '作成に必要な全モンスター一覧',
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
    /** 表示するモンスターの進化情報をツリー形式で格納したオブジェクト。
     * {
     *   no: 表示するモンスターの番号。
     *   kiseki: 希石化して使用する場合の希石の番号。ベースのモンスターに入れておく。
     *   materials: このモンスターに進化させるのに必要な素材の進化情報配列。
     *              中身はevoInfoと同じ構造のオブジェクト。
     *   evo: 進化後のモンスターの進化情報。中身はevoInfoと同じ構造のオブジェクト。
     * }
     */
      evoInfo: {},
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
      return `No.${this.no || this.monsterData.no} ${this.monsterData.name} の作成に必要な全モンスター一覧`;
    }
  },
  watch: {
    no: 'createEvoInfo'
  },
  created: function () {
    this.createEvoInfo();
  },
  methods: {
    /** 表示するモンスターの進化情報をツリー形式で格納したオブジェクトを作成する。 */
    createEvoInfo () {
      const needMaterialCounts = {};
      function AddNeedMaterials (no) {
        if (needMaterialCounts[no]) {
          needMaterialCounts[no]++;
        } else {
          needMaterialCounts[no] = 1;
        }
      }
      const monsterTable = this.monsterTable;
      const monsterArray = Object.values(monsterTable);

      function func (monsterNo, evoObj, kiseki) {
        let monsterData = monsterTable[monsterNo];
        if (!monsterData) {
          if (monsterNo !== null) { AddNeedMaterials(monsterNo); }
          return null;
        }
        const obj = { no: monsterNo };
        if (/^(.+)の希石$/.test(monsterData.name)) {
          const baseName = RegExp.$1;
          const baseData = monsterArray.find(d => d.name === baseName);
          if (baseData) {
            monsterData = baseData;
            kiseki = monsterNo;
            obj.no = baseData.no;
          }
        }
        if (monsterData.types[0] > 8) {
          AddNeedMaterials(obj.no);
          if (kiseki) {
            obj.kiseki = kiseki;
            return obj;
          }
          return null;
        }

        if (evoObj) { obj.evo = evoObj; }
        if (!monsterData.evolution.baseNo) {
          AddNeedMaterials(obj.no);
          if (kiseki) { obj.kiseki = kiseki; }
          return obj;
        }

        const needMaterials = monsterData.evolution.materials.map(d => func(d)).filter(d => d);
        if (needMaterials.length) { obj.materials = needMaterials; }
        return func(monsterData.evolution.baseNo, obj, kiseki);
      }
      this.evoInfo = func(this.no);

      const array = Object.keys(needMaterialCounts).map(
        no => ({ no: Number(no), count: needMaterialCounts[no] })
      );
      // 指定された番号のモンスターが進化のための素材となるモンスターかどうかを取得する。
      const baseMonsterNo = this.evoInfo.no;
      const createSortValue = (no) => {
        const monsterData = this.monsterTable[no];
        if (!monsterData) { return 999999; }
        let sortRank = 1;
        // ベースモンスターは最初に。
        if (no === baseMonsterNo) {
          sortRank = 0;
        } else {
          const type = monsterData.types[0];
          // 進化系と強化系を素材系タイプとみなして後ろ側に。
          if (type === 9 || type === 11) {
            sortRank = 2;
          // 売却用（虹メダル）は最後に
          } else if (type === 12) {
            sortRank = 3;
          }
        }
        return sortRank * 100000 + no;
      };
      array.sort((a, b) => createSortValue(a.no) - createSortValue(b.no));
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
