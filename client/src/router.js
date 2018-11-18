import Vue from 'vue'
import Router from 'vue-router'
import PageAbout from './views/pageAbout.vue';
import PageCompare from './views/pageCompare.vue';
import PageHistory from './views/pageHistory.vue';
import PageMonsterData from './views/pageMonsterData.vue';
import PageMonsterEdit from './views/pageMonsterEdit.vue';
import PageMonsterList from './views/pageMonsterList.vue';
import PagePic from './views/pagePic.vue';
import PageSkillDetails from './views/pageSkillDetails.vue';
import PageSkillList from './views/pageSkillList.vue';

import { getRouterBase } from './mtpadmdb.js';

Vue.use(Router)

export default new Router({
  mode: 'history',
  base: getRouterBase(),
  // 各ルートにコンポーネントをマッピングします
  // コンポーネントはVue.extend() によって作られたコンポーネントコンストラクタでも
  // コンポーネントオプションのオブジェクトでも構いません
  routes: [
    {
      path: '/',
      component: PageMonsterList,
      props: true
    },
    {
      path: '/edit',
      component: PageMonsterEdit,
      props: true
    },
    {
      path: '/:no/edit/',
      component: PageMonsterEdit,
      props: true
    },
    {
      path: '/pic',
      component: PagePic,
      props: true
    },
    {
      path: '/:no/pic',
      component: PagePic,
      props: true
    },
    {
      path: '/about',
      component: PageAbout
    },
    {
      path: '/history',
      component: PageHistory,
      props: true
    },

    {
      path: '/history/:id',
      name: 'history',
      component: PageMonsterData,
      props: true
    },
    {
      path: '/history/:id/edit/',
      name: 'historyEdit',
      component: PageMonsterEdit,
      props: true
    },
    
    {
      path: '/compare',
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
      path: '/compare/:no1/:no2',
      name: 'compare',
      component: PageCompare
    },
    {
      path: '/skill',
      name: 'skillList',
      component: PageSkillList
    },
    {
      path: '/skill/:no',
      name: 'skillDetails',
      component: PageSkillDetails
    },
    {
      path: '/skillHistory/:id',
      name: 'skillDetailsHistory',
      component: PageSkillDetails
    },
    {
      path: '/leaderSkill',
      name: 'leaderSkillList',
      component: PageSkillList
    },
    {
      path: '/leaderSkill/:no',
      name: 'leaderSkillDetails',
      component: PageSkillDetails
    },
    {
      path: '/leaderSkillHistory/:id',
      name: 'leaderSkillDetailsHistory',
      component: PageSkillDetails
    },
    
    {
      path: '/:no',
      name: 'monsterDetails',
      component: PageMonsterData,
      props: true
    }
  ]
});