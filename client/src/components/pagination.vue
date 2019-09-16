<template>
  <nav>
    <ul class="pagination pagination-sm justify-content-center">
      <li class="page-item" :class="{ disabled: page <= 1 }">
        <router-link class="page-link" :to="createToObj(page - 1)" append aria-label="前">
          <span aria-hidden="true">&laquo;</span>
          <span class="sr-only">前</span>
        </router-link>
      </li>
      
      <li v-for="n in paginationNos" class="numberPage" :class="{ 'page-item': 1, 'active': n === page }" :key="`page${n}`">
        <router-link v-if="n !== page" class="page-link" :to="createToObj(n)" append>{{ n }}</router-link>
        <span v-else class="page-link">{{ n }}</span>
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
  name: 'Pagination',
  /** コンポーネントの各実体で共有するデータのカスタムプロパティ。 */
  common: {
    /** このコンポーネントがマウントされている個数。 */
    mountedCount: 0
  },
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
      type: [Number, String],
      default: 99
    }
  },
  data: function () {
    return {
      /** 要素のサイズをもとに算出したページ切り替えの個数。 */
      computedItemCount: 1,
      /** このオブジェクトでイベントリスナー登録を行ったかどうか。 */
      isAddKeydownEvent: false
    };
  },
  computed: {
    itemCountReal () { return Math.min(this.computedItemCount, this.pageCount); },
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
  mounted: function () {
    this.updateCount();
    window.addEventListener('resize', this.updateCount);
    // keydown のイベントハンドラを複数登録すると一回押しただけで複数回呼び出されるので、最初の1つのみ登録する。
    if (this.$options.common.mountedCount === 0) {
      window.addEventListener('keydown', this.onKeydown);
      this.isAddKeydownEvent = true;
    }
    this.$options.common.mountedCount++;
  },
  beforeDestroy: function () {
    window.removeEventListener('resize', this.updateCount);
    // keydonw のイベントハンドラを登録したもののみ、解除を行う。
    if (this.isAddKeydownEvent) {
      window.removeEventListener('keydown', this.onKeydown);
    }

    this.$options.common.mountedCount--;
  },
  methods: {
    /** キーボードのキーが押されたときに呼ばれるイベントハンドラ。 */
    onKeydown: function (e) {
      if (e.repeat) { return; }
      const targetName = e.target.tagName;
      if (targetName === 'INPUT' || targetName === 'TEXTAREA' || targetName === 'SELECT') { return; }
      if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) { return; }
      if (e.key === 'ArrowLeft') { this.$router.push(this.createToObj(this.page - 1)); }
      if (e.key === 'ArrowRight') { this.$router.push(this.createToObj(this.page + 1)); }
    },
    /** ページ切り替えの表示個数を更新する。 */
    updateCount: function () {
      const elUl = this.$el.children[0];
      let count = ((this.$el.parentNode.clientWidth - elUl.children[0].clientWidth * 2) / elUl.children[1].clientWidth) | 0;
      // 基本的に奇数個にする。
      if (count & 1 === 0) { count -= 1; }
      // ３以上 itemCount 以下にする。
      if (count < 3) { count = 3; }
      if (count > this.itemCount) { count = this.itemCount; }
      if (this.computedItemCount !== count) { this.computedItemCount = count; }
    },
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

<style lang="scss" scoped>
li.numberPage {
  min-width: 2.2em;
  text-align: center;

  a {
    padding:.25rem .2rem;
  }
  span {
    padding:.25rem .35rem;
  }
}
</style>
