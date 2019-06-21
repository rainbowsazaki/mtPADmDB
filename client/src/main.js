import Vue from 'vue';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';
import $ from 'jquery';
const jQuery = $;
import Bootstrap from 'bootstrap'; // eslint-disable-line no-unused-vars

import App from './App.vue';
import router from './router';
import store from './store';

Vue.config.productionTip = false;

import { constData } from './mtpadmdb.js';

axios.interceptors.request.use(function (config) {
  config.headers['X-Requested-With'] = 'XMLHttpRequest';
  config.headers['Cache-Control'] = 'no-cache';
  config.headers['Expires'] = '-1';

  return config;
}, function (err) {
  return Promise.reject(err);
});

jQuery.fn.scrollParentShowThis = function () {
  if (this.length === 0) { return this; }
  
  const offsetParent = this.offsetParent();
  const scrollTop = offsetParent.scrollTop();
  const scrollHeight = offsetParent.height();
  
  const nowTop = this.position().top;
  const nowBottom = nowTop + this.height();
  if (nowTop < 0) {
    offsetParent.scrollTop(scrollTop + nowTop);
  }
  if (nowBottom > scrollHeight) {
    offsetParent.scrollTop(scrollTop + nowBottom - scrollHeight);
  }
  return this;
};

// 数字をカンマ区切りにする。
Vue.filter('addComma', function (val) {
  if (!val) { return val; }
  const arr = String(val).split('.');
  arr[0] = arr[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,');
  return arr.join('.');
});

import TweetButton from './components/tweetButton.vue';
import MonsterIcon from './components/monsterIcon.vue';
const MonsterIncrementalSearch = () => import('./components/monsterIncrementalSearch.vue');
const Pagination = () => import('./components/pagination.vue');
const PdOption = () => import('./components/pdOption.vue');
const PdSelect = () => import('./components/pdSelect.vue');
const ScopedStyle = () => import('./components/scopedStyle.vue');
const SkillIncrementalInput = () => import('./components/skillIncrementalInput.vue');
const MonsterFilterSetting = () => import('./components/monsterFilterSetting.vue');
const AwakenSelect = () => import('./components/awakenSelect.vue');
const AttrSelect = () => import('./components/attrSelect.vue');
const CommentList = () => import('./components/commentList.vue');

Vue.component('monster-icon', MonsterIcon);
Vue.component('monster-incremental-search', MonsterIncrementalSearch);
Vue.component('pagination', Pagination);
Vue.component('pd-option', PdOption);
Vue.component('pd-select', PdSelect);
Vue.component('scoped-style', ScopedStyle);
Vue.component('skill-incremental-input', SkillIncrementalInput);
Vue.component('tweet-button', TweetButton);
Vue.component('monster-filter-setting', MonsterFilterSetting);
Vue.component('awaken-select', AwakenSelect);
Vue.component('attr-select', AttrSelect);
Vue.component('comment-list', CommentList);

// ページ用のコンポーネントで使用する処理のミックスイン
Vue.mixin({
  created: function () {
    this.$_mixinForPage_updateTitle();
  },
  methods: {
    // ページタイトルの更新。
    $_mixinForPage_updateTitle: function () { // eslint-disable-line camelcase
      if ('pageTitle' in this.$options) {
        let pageTitle = this.$options.pageTitle;
        if (typeof pageTitle === 'function') {
          pageTitle = pageTitle.call(this);
        }
        if (pageTitle) {
          document.title = `${pageTitle} - ${constData.title}`;
        }

        // パンくずリスト
        let breadcrumbsTitle = this.$options.breadcrumbsTitle;
        if (typeof breadcrumbsTitle === 'function') {
          breadcrumbsTitle = breadcrumbsTitle.call(this);
        }
        // パンくずリストタイトルの指定がない場合はページタイトルを使用する。
        if (!breadcrumbsTitle) { breadcrumbsTitle = pageTitle; }
        if (breadcrumbsTitle) {
          let breadcrumbs = [
            { text: 'ホーム', link: '/' }
          ];
          let middleOfBreadcrumbs = this.$options.middleOfBreadcrumbs;
          if (typeof middleOfBreadcrumbs === 'function') {
            middleOfBreadcrumbs = middleOfBreadcrumbs.call(this);
          }
          if (middleOfBreadcrumbs) {
            breadcrumbs = breadcrumbs.concat(middleOfBreadcrumbs);
          }
          breadcrumbs.push({ text: breadcrumbsTitle });

          this.$root.breadcrumbs = breadcrumbs;
        } else {
          document.title = constData.title;
          // パンくずリスト
          this.$root.breadcrumbs = [
            { text: 'ホーム' }
          ];
        }
      }
    }
  }
});

// ルーターのインスタンスをrootとなるVueインスタンスに渡します
new Vue({
  router: router,
  store: store,
  data: { breadcrumbs: [] },
  render: h => h(App)
}).$mount('#app');
