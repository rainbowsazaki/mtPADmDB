import Vue from 'vue';
import Router from 'vue-router';
const PageTop = () => import('./views/pageTop.vue');
const PageAbout = () => import('./views/pageAbout.vue');
const PageCompare = () => import('./views/pageCompare.vue');
const PageHistory = () => import('./views/pageHistory.vue');
const PageComment = () => import('./views/pageComment.vue');
const PageMonsterData = () => import('./views/pageMonsterData.vue');
const PageMonsterEdit = () => import('./views/pageMonsterEdit.vue');
const PageMonsterList = () => import('./views/pageMonsterList.vue');
const PagePic = () => import('./views/pagePic.vue');
const PageSkillDetails = () => import('./views/pageSkillDetails.vue');
const PageSkillList = () => import('./views/pageSkillList.vue');
const PageRaniking = () => import('./views/pageRanking.vue');

/** router-view 要素のみのコンポーネント。 ネストされたルートの親要素で何も表示しない時用。 */
const RouterViewComponent = {
  render: h => h('router-view')
};

import { getRouterBase } from './mtpadmdb.js';

Vue.use(Router);

export default new Router({
  mode: 'history',
  base: getRouterBase(),
  scrollBehavior: function (to, from, savedPosition) {
    if (to.path === from.path) { return; }
    if (savedPosition) {
      return savedPosition;
    } else {
      return { x: 0, y: 0 };
    }
  },
  // 各ルートにコンポーネントをマッピングします
  // コンポーネントはVue.extend() によって作られたコンポーネントコンストラクタでも
  // コンポーネントオプションのオブジェクトでも構いません
  routes: [
    {
      path: '/',
      name: 'top',
      component: PageTop,
      props: true
    },
    {
      path: '/monster',
      component: RouterViewComponent,
      children: [
        {
          path: '',
          name: 'monsterList',
          component: PageMonsterList,
          props: true
        },
        {
          path: ':no',
          component: RouterViewComponent,
          children: [
            {
              path: '',
              name: 'monsterDetails',
              component: PageMonsterData,
              props: true
            },
            {
              path: 'edit',
              name: 'monsterEditUpdate',
              component: PageMonsterEdit,
              props: true
            },
            {
              path: 'pic',
              name: 'monsterPictureUpdate',
              component: PagePic,
              props: true
            }
          ]
        },
        {
          path: '/history',
          component: RouterViewComponent,
          children: [
            {
              path: '',
              name: 'monsterHistoryList',
              component: PageHistory,
              props: true
            },
            {
              path: ':id',
              component: RouterViewComponent,
              children: [
                {
                  path: '',
                  name: 'monsterHistory',
                  component: PageMonsterData,
                  props: true
                },
                {
                  path: 'edit',
                  name: 'monsterHistoryEdit',
                  component: PageMonsterEdit,
                  props: true
                }
              ]
            }
          ]
        }
      ]
    },

    {
      path: '/comment',
      name: 'comment',
      component: PageComment,
      props: true
    },
    {
      path: '/edit',
      name: 'monsterEdit',
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
      path: '/about',
      name: 'about',
      component: PageAbout
    },
    {
      path: '/compare/:nos?',
      name: 'compare',
      component: PageCompare,
      props: true
    },
    {
      path: '/skill',
      component: RouterViewComponent,
      children: [
        {
          path: '',
          name: 'skillList',
          component: PageSkillList,
          props: true
        },
        {
          path: ':no',
          name: 'skillDetails',
          component: PageSkillDetails,
          props: true
        },
        {
          path: 'history/:id',
          name: 'skillDetailsHistory',
          component: PageSkillDetails,
          props: true
        }
      ]
    },
    {
      path: '/leaderSkill',
      component: RouterViewComponent,
      children: [
        {
          path: '',
          name: 'leaderSkillList',
          component: PageSkillList,
          props: true
        },
        {
          path: ':no',
          name: 'leaderSkillDetails',
          component: PageSkillDetails,
          props: true
        },
        {
          path: 'history/:id',
          name: 'leaderSkillDetailsHistory',
          component: PageSkillDetails,
          props: true
        }
      ]
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
