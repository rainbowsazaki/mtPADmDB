import Vue from 'vue';
import Router from 'vue-router';
const PageAbout = () => import('./views/pageAbout.vue');
const PageCompare = () => import('./views/pageCompare.vue');
const PageHistory = () => import('./views/pageHistory.vue');
const PageMonsterData = () => import('./views/pageMonsterData.vue');
const PageMonsterEdit = () => import('./views/pageMonsterEdit.vue');
const PageMonsterList = () => import('./views/pageMonsterList.vue');
const PagePic = () => import('./views/pagePic.vue');
const PageSkillDetails = () => import('./views/pageSkillDetails.vue');
const PageSkillList = () => import('./views/pageSkillList.vue');
const PageRaniking = () => import('./views/pageRanking.vue');

import { getRouterBase } from './mtpadmdb.js';

Vue.use(Router);

export default new Router({
  mode: 'history',
  base: getRouterBase(),
  // 各ルートにコンポーネントをマッピングします
  // コンポーネントはVue.extend() によって作られたコンポーネントコンストラクタでも
  // コンポーネントオプションのオブジェクトでも構いません
  routes: [
    {
      path: '/',
      name: 'top',
      component: PageMonsterList,
      props: true
    },
    {
      path: '/monster',
      name: 'monsterList',
      component: PageMonsterList,
      props: true
    },
    {
      path: '/monster/:no',
      name: 'monsterDetails',
      component: PageMonsterData,
      props: true
    },
    {
      path: '/edit',
      name: 'monsterEdit',
      component: PageMonsterEdit,
      props: true
    },
    {
      path: '/monster/:no/edit',
      name: 'monsterEditUpdate',
      component: PageMonsterEdit,
      props: true
    },
    {
      path: '/pic',
      name: 'monsterPicture',
      component: PagePic,
      props: true
    },
    {
      path: '/monster/:no/pic',
      name: 'monsterPictureUpdate',
      component: PagePic,
      props: true
    },
    {
      path: '/about',
      name: 'about',
      component: PageAbout
    },
    {
      path: '/monster/history',
      name: 'monsterHistoryList',
      component: PageHistory,
      props: true
    },

    {
      path: '/monster/history/:id',
      name: 'monsterHistory',
      component: PageMonsterData,
      props: true
    },
    {
      path: '/monster/history/:id/edit/',
      name: 'monsterHistoryEdit',
      component: PageMonsterEdit,
      props: true
    },
    
    {
      path: '/compare',
      name: 'compareEmpty',
      component: PageCompare,
      props: true
    },
    {
      path: '/compare/:nos',
      name: 'compare',
      component: PageCompare,
      props: true
    },
    {
      path: '/skill',
      name: 'skillList',
      component: PageSkillList,
      props: true
    },
    {
      path: '/skill/:no',
      name: 'skillDetails',
      component: PageSkillDetails,
      props: true
    },
    {
      path: '/skillHistory/:id',
      name: 'skillDetailsHistory',
      component: PageSkillDetails,
      props: true
    },
    {
      path: '/leaderSkill',
      name: 'leaderSkillList',
      component: PageSkillList,
      props: true
    },
    {
      path: '/leaderSkill/:no',
      name: 'leaderSkillDetails',
      component: PageSkillDetails,
      props: true
    },
    {
      path: '/leaderSkillHistory/:id',
      name: 'leaderSkillDetailsHistory',
      component: PageSkillDetails,
      props: true
    },
    {
      path: '/ranking/:id?',
      name: 'ranking',
      component: PageRaniking,
      props: true
    },
    
    { path: '/:no', redirect: '/monster/:no' },
    { path: '/:no/:sub?', redirect: '/monster/:no/:sub' },
    { path: '/history/:no/:sub?', redirect: '/monster/history/:no/:sub' }
  ]
});
