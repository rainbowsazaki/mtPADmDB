<template>
  <div>
    <h2>希石チェック</h2>
    <svg style="display:none;">
      <defs>
        <path id="svgMaru" d="M437.022,74.978C390.764,28.686,326.636-0.008,256.009,0C185.372-0.008,121.245,28.686,74.987,74.978
          C28.686,121.236-0.008,185.372,0,256c-0.008,70.628,28.686,134.764,74.987,181.022c46.258,46.292,110.385,74.995,181.022,74.978
          c70.628,0.016,134.755-28.686,181.013-74.978C483.322,390.764,512.018,326.628,512,256
          C512.018,185.372,483.322,121.236,437.022,74.978z M408.344,408.335c-39.052,39.019-92.787,63.1-152.335,63.116
          c-59.564-0.016-113.292-24.098-152.353-63.116C64.646,369.283,40.566,315.564,40.557,256c0.009-59.564,24.089-113.3,63.099-152.344
          c39.061-39.027,92.788-63.091,152.353-63.099c59.548,0.008,113.283,24.072,152.335,63.099
          c39.019,39.044,63.091,92.78,63.108,152.344C471.435,315.564,447.363,369.283,408.344,408.335z" style="fill: rgb(58, 171, 210);"
        />
        <polygon id="svgBatu" points="512,52.535 459.467,0.002 256.002,203.462 52.538,0.002 0,52.535 203.47,256.005 0,459.465 52.533,511.998
          256.002,308.527 459.467,511.998 512,459.475 308.536,256.005" style="fill: rgb(223, 86, 86);"
        />
      </defs>
    </svg>

    <ul class="list-group">
      <li v-for="item in list" class="list-group-item" :key="`kiseki${item.kiseki.no}`">
        <span class="icons">
          <svg version="1.1" class="maruBatu" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="-100 -100 712 712" xml:space="preserve">
            <g>
              <use v-if="item.base" xlink:href="#svgMaru" x="0" y="0" />
              <use v-else xlink:href="#svgBatu" x="0" y="0" />
            </g>
          </svg>

          <monster-icon :no="item.kiseki.no" width="2em" height="2em" />
          <template v-if="item.base">
            →
            <monster-icon :no="item.base.no" width="2em" height="2em" />
          </template>
        </span>
        {{ item.kiseki.name }}
      </li>
    </ul>
  </div>
</template>

<script>
import MixinForPage from '../components/mixins/forPage.js';
/**
 * 希石元モンスター存在確認ページコンポーネント
 */
export default {
  name: 'PageKiseki',
  pageTitle: '希石チェック',
  mixins: [MixinForPage],
  computed: {
    monsterTable: function () { return this.$store.state.monsterTable; },
    list: function () {
      const monsterTableArray = this.$store.getters.monsterDataArray;
      const regExpKiseki = /^(.+)の希石$/;
      return monsterTableArray.map((d) => {
        if (!regExpKiseki.test(d.name)) { return undefined; }
        const baseMonsterData = monsterTableArray.find((dd) => dd.name === RegExp.$1);
        return { kiseki: d, base: baseMonsterData };
      }).filter((d) => d).sort((a, b) => (!!a.base === !!b.base) ? a.kiseki.no - b.kiseki.no : Number((a.base || { no: 0 }).no) - Number((b.base || { no: 0 }).no));
    }
  }
};

</script>

<style lang="scss" scoped>

span.icons {
  width: 8em;
  display: inline-block;

  svg.maruBatu {
    width: 2em;
    height: 2em;
  }
}
</style>
