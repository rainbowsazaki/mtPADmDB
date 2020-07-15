import Vue from 'vue';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';
import $ from 'jquery';
const jQuery = $;
import Bootstrap from 'bootstrap'; // eslint-disable-line no-unused-vars

import App from './App.vue';
import router from './router';
import store from './store';

import './auth';

Vue.config.productionTip = false;

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
import AwakenIcon from './components/awakenIcon.vue';
import MonsterIcon from './components/monsterIcon.vue';
const MonsterIncrementalSearch = () => import('./components/monsterIncrementalSearch.vue');
const Pagination = () => import('./components/pagination.vue');
const SkillIncrementalInput = () => import('./components/skillIncrementalInput.vue');
const AwakenSelect = () => import('./components/awakenSelect.vue');
const AttrSelect = () => import('./components/attrSelect.vue');
const CommentList = () => import('./components/commentList.vue');
const SlideUpToggle = () => import('./components/slideUpToggle.vue');

Vue.component('awaken-icon', AwakenIcon);
Vue.component('monster-icon', MonsterIcon);
Vue.component('monster-incremental-search', MonsterIncrementalSearch);
Vue.component('pagination', Pagination);
Vue.component('skill-incremental-input', SkillIncrementalInput);
Vue.component('tweet-button', TweetButton);
Vue.component('awaken-select', AwakenSelect);
Vue.component('attr-select', AttrSelect);
Vue.component('comment-list', CommentList);
Vue.component('slide-up-toggle', SlideUpToggle);

// ルーターのインスタンスをrootとなるVueインスタンスに渡します
new Vue({
  router: router,
  store: store,
  data: { breadcrumbs: [] },
  render: h => h(App)
}).$mount('#app');
