import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home.vue'

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
      component: componentMonsterList,
      props: true
    },
    {
      path: '/edit',
      component: componentMonsterEdit,
      props: true
    },
    {
      path: '/:no/edit/',
      component: componentMonsterEdit,
      props: true
    },
    {
      path: '/pic',
      component: componentPic,
      props: true
    },
    {
      path: '/:no/pic',
      component: componentPic,
      props: true
    },
    {
      path: '/about',
      component: componentAbout
    },
    {
      path: '/history',
      component: componentHistory,
      props: true
    },

    {
      path: '/history/:id',
      name: 'history',
      component: componentMonsterData,
      props: true
    },
    {
      path: '/history/:id/edit/',
      name: 'historyEdit',
      component: componentMonsterEdit,
      props: true
    },
    
    {
      path: '/compare',
      component: componentCompare,
      props: true
    },
    {
      path: '/compare/:nos',
      name: 'compare',
      component: componentCompare,
      props: true
    },
    {
      path: '/compare/:no1/:no2',
      name: 'compare',
      component: componentCompare
    },
    {
      path: '/skill',
      name: 'skillList',
      component: componentSkillList
    },
    {
      path: '/skill/:no',
      name: 'skillDetails',
      component: componentSkillDetails
    },
    {
      path: '/skillHistory/:id',
      name: 'skillDetailsHistory',
      component: componentSkillDetails
    },
    {
      path: '/leaderSkill',
      name: 'leaderSkillList',
      component: componentSkillList
    },
    {
      path: '/leaderSkill/:no',
      name: 'leaderSkillDetails',
      component: componentSkillDetails
    },
    {
      path: '/leaderSkillHistory/:id',
      name: 'leaderSkillDetailsHistory',
      component: componentSkillDetails
    },
    
    {
      path: '/:no',
      name: 'monsterDetails',
      component: componentMonsterData,
      props: true
    }
  ]
});