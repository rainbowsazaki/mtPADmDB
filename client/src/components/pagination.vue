<template>
  <nav>
    <ul class="pagination pagination-sm justify-content-center">
      <li class="page-item" :class="{ disabled: page <= 1 }">
        <router-link class="page-link" :to="createToObj(page - 1)" append aria-label="前">
          <span aria-hidden="true">&laquo;</span>
          <span class="sr-only">前</span>
        </router-link>
      </li>
      
      <li v-for="n in paginationNos" :class="{ 'page-item': 1, 'active': n === page }" style="min-width: 2.2em; text-align: center;" :key="n">
        <router-link v-if="n !== page" class="page-link" style="padding:.25rem .2rem;" :to="createToObj(n)" append>{{n}}</router-link>
        <span v-else class="page-link" style="padding:.25rem .35rem;">{{n}}</span>
      </li>

      <li class="page-item" :class="{ disabled: page >= pageCount }">
        <router-link class="page-link" :to="createToObj(page + 1)" append aria-label="次">
          <span aria-hidden="true">&raquo;</span>
          <span class="sr-only">次</span>
        </router-link>
      </li>
    </ul>
  </nav>
</template>

<script>
/**
 * ページ送りのコンポーネント
 */
export default {
  name: 'pagination',
  props: {
    'page': {
      type: Number,
      default: 0
    },
    'pageCount': {
      type: Number,
      required: true
    },
    'itemCount': {
      type: Number,
      default: 7
    }
  },
  data: function () {
    return {
    };
  },
  computed: {
    itemCountReal () { return Math.min(this.itemCount, this.pageCount); },
    itemCountHarf () { return (this.itemCountReal / 2) | 0; },
    paginationStart () {
      return (this.page > this.pageCount - this.itemCountHarf)
        ? this.pageCount - this.itemCountReal + 1
        : Math.max(1, this.page - this.itemCountHarf);
    },
    paginationEnd () {
      return (this.page <= this.itemCountHarf)
        ? this.itemCountReal
        : Math.min(this.pageCount, this.page + this.itemCountHarf);
    },

    paginationNos () {
      const array = [];
      for (let i = this.paginationStart; i <= this.paginationEnd; i++) {
        array.push(i);
      }
      return array;
    }
  },
  methods: {
    createToObj: function (pageNo) {
      const query = Object.assign({}, this.$route.query);
      query.page = pageNo;

      return {
        path: this.$route.path,
        params: this.$route.params,
        query: query
      };
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
