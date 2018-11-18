<template>
  <div id="app" v-cloak>
    <nav class="navbar navbar-expand-lg navbar-light bg-light fixed-top" style="box-shadow: 0px 0px 4px rgba(0,0,0,0.6);">
      <router-link class="navbar-brand" to="/">mtPADmDB</router-link>
      <button type="button" class="navbar-toggler" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="ナビゲーションの切替">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav">
          <li v-for="navi in navis" class="nav-item" @click="hideNavi">
            <router-link class="nav-link" :class="{ active: $route.path === navi.to }" :to="navi.to">{{navi.text}}</router-link>
          </li>
        </ul>
      </div>
    </nav>
    
    <div class="container">
      <div style="position:fixed; z-index: 2;">
        <transition-group name="error">
          <div v-for="error in errors" :key="error" class="alert alert-warning alert-dismissible fade show" role="alert">
            <strong>注意!</strong>　{{error}}
            <button type="button" @click="$store.commit('deleteError', error)" class="close" aria-label="閉じる">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
        </transition-group>
        <transition-group name="message">
          <div v-for="message in messages" :key="message" class="alert alert-success alert-dismissible fade show" role="alert">
            {{message}}
          </div>
        </transition-group>
      </div>
      
      <nav aria-label="パンくずリスト">
        <ol class="breadcrumb">
          <li v-for="breadcrumb in breadcrumbs" :aria-current="breadcrumb.link ? '' : 'page '" class="breadcrumb-item" :class="{ active: !breadcrumb.link }">
            <router-link v-if="breadcrumb.link" :to="breadcrumb.link" >{{breadcrumb.text}}</router-link>
            <template v-else>{{breadcrumb.text}}</template>
          </li>
        </ol>
      </nav>
      <router-view v-if="$store.state.monsterTable"></router-view>
      <div style="margin-top:2rem; display: flex; justify-content: space-between; flex-wrap: wrap;">
        <iframe style="width:120px;height:240px;" marginwidth="0" marginheight="0" scrolling="no" frameborder="0" src="//rcm-fe.amazon-adsystem.com/e/cm?lt1=_blank&bc1=000000&IS2=1&bg1=FFFFFF&fc1=000000&lc1=0000FF&t=myfavoriteday-22&language=ja_JP&o=9&p=8&l=as4&m=amazon&f=ifr&ref=as_ss_li_til&asins=B01CDP1DMS&linkId=2fde5a6504e57a723c17da60307b4591"></iframe>
        <iframe style="width:120px;height:240px;" marginwidth="0" marginheight="0" scrolling="no" frameborder="0" src="//rcm-fe.amazon-adsystem.com/e/cm?lt1=_blank&bc1=000000&IS2=1&bg1=FFFFFF&fc1=000000&lc1=0000FF&t=myfavoriteday-22&language=ja_JP&o=9&p=8&l=as4&m=amazon&f=ifr&ref=as_ss_li_til&asins=4047333301&linkId=969a4d654c0891806ec194ae22c2d35d"></iframe>
        <iframe style="width:120px;height:240px;" marginwidth="0" marginheight="0" scrolling="no" frameborder="0" src="//rcm-fe.amazon-adsystem.com/e/cm?lt1=_blank&bc1=000000&IS2=1&bg1=FFFFFF&fc1=000000&lc1=0000FF&t=myfavoriteday-22&language=ja_JP&o=9&p=8&l=as4&m=amazon&f=ifr&ref=as_ss_li_til&asins=B0719QSRBV&linkId=22637bfb9546ec8a94a8a1e112a30b16"></iframe>
        <iframe style="width:120px;height:240px;" marginwidth="0" marginheight="0" scrolling="no" frameborder="0" src="//rcm-fe.amazon-adsystem.com/e/cm?lt1=_blank&bc1=000000&IS2=1&bg1=FFFFFF&fc1=000000&lc1=0000FF&t=myfavoriteday-22&language=ja_JP&o=9&p=8&l=as4&m=amazon&f=ifr&ref=as_ss_li_til&asins=B07FF4FPPV&linkId=c6edf491b7d7333cf8ffebd9a0d9b039"></iframe>
      </div>
    </div>
  </div>
</template>

<script>
import { constData, gtagProductionOnly } from './mtpadmdb.js';

export default {
  data: {
    breadcrumbs: []
  },
  computed: {
    errors: function () { return this.$store.state.errors; },
    messages: function () { return this.$store.state.messages; },
    navis: function () { return constData.navis; }
  },
  watch: {
    '$route': function () {
      this.sendGa();
      // 元のページでのエラー表示を消す。
      this.$store.commit('clearErrors');
    }
  },
  created: function () {
    this.$store.commit('fetchCommonData');
  },
  mounted: function () {
    this.sendGa();
  },
  methods: {
    /** Google Analytics のページビュートラッキングを送信する。 */
    sendGa: function () {
      // タイトルを変更させるために少しあとに実行する。
      setTimeout(() => {
        gtagProductionOnly('config', 'UA-124771141-1', {
          'page_location': location.href
        });
      }, 1);
    },

    hideNavi: function () {
      if ($('#navbarNav').hasClass('show')) {
        $('button.navbar-toggler').click();
      }
    }
  }
};
</script>

<style>
body {
  color: rgba(0, 0, 0, 0.8);
}

[v-cloak] {
  display: none;
}
.breadcrumb-item+.breadcrumb-item::before {
  content: ">";
}
.slash-join +.slash-join::before {
  display: inline-block;
  padding: 0 0.4rem;
  content: "/";
}

.message-enter-active, .message-leave-active, .error-leave-active {
  transition: opacity .3s
}
.message-enter { opacity: 0; }
.message-leave, .error-leave { opacity: 1; }
.message-leave-to, .error-leave-to { opacity: 0; }

.error-enter-active {
  animation: Blink3 1s;
}
@keyframes Blink3 {
    0% { opacity: 0; }
    20% { opacity: 1; }
    40% { opacity: 0; }
    60% { opacity: 1; }
    80% { opacity: 0; }
}
</style>
