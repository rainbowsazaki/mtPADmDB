<template>
  <div>
    <h2>{{ rankingSetting.title }}ランキング</h2>
    <p>※このサイトに登録されているモンスターでのランキングです。</p>
    <table class="table table-bordered table-sm">
      <tr class="thead-light">
        <th />
        <th>名前</th>
        <th v-for="(column, n) in rankingSetting.columns" :key="`column${n}`">{{ column.name }}</th>
      </tr>
      <tr v-for="(data, n) in rankInfos.slice(0, 20)" class="thead-light" :key="`monster${data.data.no}`">
        <th class="text-right">{{ n + 1 }}</th>
        <td>
          <router-link :to="{ name: 'monsterDetails', params: { no: data.data.no }}">
            <monster-icon :no="data.data.no" :monster-table="monsterTable" :image-table="imageTable" width="2em" height="2em" />
            {{ data.data.name }}
          </router-link>
        </td>
        <td v-for="(column, m) in data.columns" class="text-right" :key="`column${m}`">{{ column }}</td>
      </tr>
    </table>
  </div>
</template>

<script>

/**
 * モンスターのパラメータなどのランク付けを行うページのコンポーネント。
 */
export default {
  name: 'PageRanking',
  pageTitle: function () {
    return this.rankingSetting.title + 'ランキング';
  },
  data: function () {
    return {
      rankingSetting: {
        title: '最大レベル時HP',
        columns: [
          { name: 'HP', func: data => data.maxParam.hp },
          { name: '攻撃', func: data => data.maxParam.attack },
          { name: '回復', func: data => data.maxParam.recovery }
        ],
        sortColumn: 0
      }
    };
  },
  computed: {
    monsterTable () { return this.$store.state.monsterTable; },
    imageTable () { return this.$store.state.imageTable; },

    rankInfos () {
      const rankInfos = [];
      for (const key in this.monsterTable) {
        const data = this.monsterTable[key];
        rankInfos.push({ columns: this.rankingSetting.columns.map(o => o.func(data)), data: data });
      }
      const sortColumn = this.rankingSetting.sortColumn;
      rankInfos.sort((a, b) => b.columns[sortColumn] - a.columns[sortColumn]);
      return rankInfos;
    }
  }
};

</script>
