<template>
  <div>
    <monster-filter-setting v-model="filterSetting" />

    <pagination item-count="11" :page="page" :page-count="pageCount" />

    <div class="row">
      <div v-for="data in monsterTableInPage" class="col-md-6" :key="`monster${data.no}`">
        <div class="listItem">
          <router-link :to="{ name: 'monsterDetails', params: { no: data.no }}">
            <monster-icon
              no-link :no="data.no" :monster-table="monsterTable" :image-table="imageTable" width="3em" height="3em"
            /><div class="monsterName">
              <div class="monsterNo">No.{{ data.no }}</div>
              <div>{{ data.name }}</div>
            </div>
          </router-link>
        </div>
      </div>
    </div>

    <pagination item-count="11" :page="page" :page-count="pageCount" />
  </div>
</template>

<script>

import { constData } from '../mtpadmdb.js';
import { getFilterDefault, filterMonsterDataArray, filterSettingText } from '../components/monsterFilterSetting.vue';

/** モンスター一覧表示のコンポーネント */
export default {
  name: 'MonsterList',
  data: function () {
    return {
      inPageCount: 50,
      /** 表示するモンスターに対するフィルタ。 */
      filterSetting: getFilterDefault()
    };
  },
  computed: {
    monsterTable () { return this.$store.state.monsterTable; },
    imageTable () { return this.$store.state.imageTable; },
    attrColors () { return constData.attrColors; },
    
    pageCount () { return ((this.filteredMonsterTableArray.length + this.inPageCount - 1) / this.inPageCount) | 0; },
    page () { return (this.$route.query.page * 1) || 1; },

    monsterTableArray: function () {
      const array = [];
      for (const key in this.monsterTable) {
        array.push(this.monsterTable[key]);
      }
      return array;
    },
    /** フィルタリングを行ったモンスターデータの配列。 */
    filteredMonsterTableArray: function () {
      return filterMonsterDataArray(this.filterSetting, this.monsterTableArray);
    },
    monsterTableInPage () {
      return this.filteredMonsterTableArray.slice((this.page - 1) * this.inPageCount, this.page * this.inPageCount);
    },
    /** フィルタリング設定の内容を表したテキスト。 */
    filterSettingText () {
      return filterSettingText(this.filterSetting);
    }
  },
  watch: {
    filterSettingText: function () {
      this.$emit('changeFilterSettingText', this.filterSettingText);
    },
    filteredMonsterTableArray: function () {
      // ページリセット予約
      this.$nextTick(() => {
        const query = Object.assign({}, this.$route.query, { page: undefined });
        this.$router.push({ name: this.$route.name, params: this.$route.params, query: query });
      });
    }
  },
  created: function () {
    this.$store.commit('fetchCommonData');
  }
};
</script>

<style lang="scss" scoped>
.listItem {
  padding-bottom: 2px;
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  border: #fddb70 solid 0.1em;
  border-radius: 0.4em;
  margin-bottom: 2px;
  padding: 1px;
  background: linear-gradient(#c49632, #e7bb5c 20%, #e7bb5c 40%, #a07b44 40%, #885727);
  
  text-shadow: 1px 1px 0 rgba(0,0,0, 0.5);

  box-shadow:
    0 0 0px 1px rgba(0, 0, 0, 0.5),

    0 4px 2px -2px rgba(255, 255, 255, 0.5) inset,
    -3px 0 2px -2px rgba(255, 255, 255, 0.5) inset,
    0 -2px 2px -2px rgba(255, 255, 255, 0.5) inset,
    
    0 -4px 2px -2px rgba(0, 0, 0, 0.3) inset;

  a {
    display: inline-block;
    width: 100%;
    color: #ffffff;
  }
  .monsterName {
    display: inline-block;
    padding-left: 4px;
    vertical-align:bottom;
    height: 3em;

    .monsterNo {
      font-size: 80%;
      margin-bottom: 2px;
    }
  }
}

</style>
