<template>
  <div id="app" v-cloak>
    <nav class="navbar navbar-expand-lg navbar-light bg-light fixed-top" style="box-shadow: 0px 0px 4px rgba(0,0,0,0.6);">
      <router-link class="navbar-brand" :to="{ name: 'top' }">mtPADmDB</router-link>
      <button type="button" class="navbar-toggler" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="ナビゲーションの切替">
        <span class="navbar-toggler-icon" />
      </button>
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav">
          <li v-for="(navi, n) in navis" class="nav-item" @click="hideNavi" :key="`navi${n}`">
            <router-link class="nav-link" :class="{ active: $route.path === navi.to }" :to="navi.to">{{ navi.text }}</router-link>
          </li>
          <li v-if="this.$store.getters.isAdmin" class="nav-item" @click="hideNavi">
            <router-link class="nav-link" :to="{ name: 'admin' }">admin</router-link>
          </li>
        </ul>
      </div>
    </nav>
    
    <div class="container">
      <div style="position:fixed; z-index: 2;">
        <transition-group name="error">
          <div v-for="error in errors" :key="error" class="alert alert-warning alert-dismissible fade show" role="alert">
            <strong>注意!</strong> {{ error }}
            <button type="button" @click="$store.commit('deleteError', error)" class="close" aria-label="閉じる">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
        </transition-group>
        <transition-group name="message">
          <div v-for="message in messages" :key="message" class="alert alert-success alert-dismissible fade show" role="alert">
            {{ message }}
          </div>
        </transition-group>
      </div>
      
      <nav v-if="$root.breadcrumbs" aria-label="パンくずリスト">
        <ol class="breadcrumb">
          <li aria-current="page" class="breadcrumb-item home active">
            <router-link to="/"><i class="fas fa-home" /></router-link>
          </li>
          <li v-for="breadcrumb in $root.breadcrumbs" :aria-current="breadcrumb.link ? '' : 'page '" class="breadcrumb-item" :class="{ active: !breadcrumb.link }" :key="breadcrumb.text">
            <router-link v-if="breadcrumb.link" :to="breadcrumb.link">{{ breadcrumb.text }}</router-link>
            <template v-else>{{ breadcrumb.text }}</template>
          </li>
        </ol>
      </nav>
      <h1 :class="{ h6: $route.path !== '/' }">{{ constData.title }}</h1>
      <router-view v-if="$store.state.monsterTable" />
      <div style="margin-top:2rem; display: flex; justify-content: space-around; flex-wrap: wrap;">
        <div class="amazlet-box" style="margin-bottom:0px;"><div class="amazlet-image" style="float:left;margin:0px 12px 1px 0px;"><a href="http://www.amazon.co.jp/exec/obidos/ASIN/B082TQG54Y/myfavoriteday-22/ref=nosim/" name="amazletlink" target="_blank"><img src="https://images-fe.ssl-images-amazon.com/images/I/61CJvpufJEL._SL280_.jpg" alt="モンスターメモリー パズドラ モンスターメモリーカード 影刻の時龍契士・ミル カード5枚セット" style="border: none;"></a></div><div class="amazlet-info" style="line-height:120%; margin-bottom: 10px"><div class="amazlet-name" style="margin-bottom:10px;line-height:120%"><a href="http://www.amazon.co.jp/exec/obidos/ASIN/B082TQG54Y/myfavoriteday-22/ref=nosim/" name="amazletlink" target="_blank">モンスターメモリー パズドラ モンスターメモリーカード 影刻の時龍契士・ミル カード5枚セット</a><div class="amazlet-powered-date" style="font-size:80%;margin-top:5px;line-height:120%">posted with <a href="http://www.amazlet.com/" title="amazlet" target="_blank">amazlet</a></div></div><div class="amazlet-detail">ガンホー・オンライン・エンターテイメント株式会社</div><div class="amazlet-sub-info" style="float: left;"><div class="amazlet-link" style="margin-top: 5px"><a href="http://www.amazon.co.jp/exec/obidos/ASIN/B082TQG54Y/myfavoriteday-22/ref=nosim/" name="amazletlink" target="_blank">Amazon.co.jpで詳細を見る</a></div></div></div></div>

        <iframe src="https://rcm-fe.amazon-adsystem.com/e/cm?o=9&p=12&l=ur1&category=manga_anime&f=ifr&linkID=41a55731f8138e9b3d31a0f8071aa622&t=myfavoriteday-22&tracking_id=myfavoriteday-22" width="300" height="250" scrolling="no" border="0" marginwidth="0" style="border:none;" frameborder="0" />
        <iframe style="width:120px;height:240px;" marginwidth="0" marginheight="0" scrolling="no" frameborder="0" src="//rcm-fe.amazon-adsystem.com/e/cm?lt1=_blank&bc1=000000&IS2=1&bg1=FFFFFF&fc1=000000&lc1=0000FF&t=myfavoriteday-22&language=ja_JP&o=9&p=8&l=as4&m=amazon&f=ifr&ref=as_ss_li_til&asins=B01CDP1DMS&linkId=2fde5a6504e57a723c17da60307b4591" />
        <iframe style="width:120px;height:240px;" marginwidth="0" marginheight="0" scrolling="no" frameborder="0" src="//rcm-fe.amazon-adsystem.com/e/cm?lt1=_blank&bc1=000000&IS2=1&bg1=FFFFFF&fc1=000000&lc1=0000FF&t=myfavoriteday-22&language=ja_JP&o=9&p=8&l=as4&m=amazon&f=ifr&ref=as_ss_li_til&asins=4047333301&linkId=969a4d654c0891806ec194ae22c2d35d" />
        <iframe style="width:120px;height:240px;" marginwidth="0" marginheight="0" scrolling="no" frameborder="0" src="//rcm-fe.amazon-adsystem.com/e/cm?lt1=_blank&bc1=000000&IS2=1&bg1=FFFFFF&fc1=000000&lc1=0000FF&t=myfavoriteday-22&language=ja_JP&o=9&p=8&l=as4&m=amazon&f=ifr&ref=as_ss_li_til&asins=B0719QSRBV&linkId=22637bfb9546ec8a94a8a1e112a30b16" />
        <iframe style="width:120px;height:240px;" marginwidth="0" marginheight="0" scrolling="no" frameborder="0" src="//rcm-fe.amazon-adsystem.com/e/cm?lt1=_blank&bc1=000000&IS2=1&bg1=FFFFFF&fc1=000000&lc1=0000FF&t=myfavoriteday-22&language=ja_JP&o=9&p=8&l=as4&m=amazon&f=ifr&ref=as_ss_li_til&asins=B07FF4FPPV&linkId=c6edf491b7d7333cf8ffebd9a0d9b039" />
        <iframe src="https://rcm-fe.amazon-adsystem.com/e/cm?o=9&p=12&l=ez&f=ifr&linkID=5a51c15ab2d8aa050ab44ea27a3c1e7a&t=myfavoriteday-22&tracking_id=myfavoriteday-22" width="300" height="250" scrolling="no" border="0" marginwidth="0" style="border:none;" frameborder="0" />
      </div>
    </div>
  </div>
</template>

<script>
import $ from 'jquery';
import store from './store';
import { constData, gtagProductionOnly } from './mtpadmdb.js';

export default {
  store,
  data: function () {
    return {
    };
  },
  computed: {
    errors: function () { return this.$store.state.errors; },
    messages: function () { return this.$store.state.messages; },
    navis: function () { return constData.navis; },
    constData: function () { return constData; }
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

<style lang="scss">
body {
  color: rgba(0, 0, 0, 0.8);
}

[v-cloak] {
  display: none;
}

.breadcrumb {
  overflow-x: scroll;
  flex-wrap: nowrap;
  white-space: nowrap;

  .breadcrumb-item {
    overflow: hidden;
    text-overflow: ellipsis;
    
    &.home {
      min-width: 1.15em;
    }

    +.breadcrumb-item {
      min-width: 5em;

      &::before {
        font-family: "Font Awesome 5 Free";
        font-weight: 900;
        content: '\f105';
        padding: 0 0.2em 0 0.0em;
        color: silver;
      }
    }
  }
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

.decoHeader {
  color: #ffffff;
  background: linear-gradient(#798320, #394a14);
  border: 0.1em #b1ba39 solid;
  border-left-width: 0.05em;
  padding: 0.2em 0.2em;
  border-radius: 0 0.5em 0.5em 0;
}

input[type="checkbox"].decoCheckbox {
  position: relative;
  visibility: hidden;

  &::before, &::after {
    visibility: visible;

    display: inline-block;
    border-radius: 0.3em;
    height: 1.5em;
  }

  &::before {
    content: 'OFF';
    text-shadow: 0.1em 0.1em 0 #000c;
    line-height: 1.4em;
    color: #aaa;
    background: #44311d;
    width: 4em;
    border: 0.05em solid;
    border-color: #664927 #3e2c08 #332011;
    box-shadow: 0 0.1em 0.1em 0 #0008 inset;
    text-align: center;
    transition: all 500ms 0s ease;
  }

  &::after {
    content: '';
    position: absolute;
    top: 0px;
    left: calc(4em - 1.0em);
    border: 0.1em solid #795633;
    border-color: #c28e5f #795633 #2e1f07;
    background: #845e3c;
    width: 1.0em;
    transition: all 300ms 0s ease;
  }

  &:checked {
    &::before {
      content: 'ON';
      color: #fff;
    }
    &::after {
      left: 0;
    }
  }
}


input.decoToggle {
  display: none;
  + * {
    color: #9f9f9f;
    text-shadow: 0.1em 0.1em 0 #000c;
    background: #422f1e;
    border: 0.1em solid;
    border-color: #61472f #3c2b19 #171004;
    border-radius: 0.3em;
    padding: 0.2em 0.2em;
    user-select: none;
  }

  &:checked + * {
    color: #fff;
    background: #845e3c;
    border-color: #c28e5f #795633 #2e1f07;
  }
}

.amazlet-box {
  border: 1px solid #AEE;
  padding: 8px;
  width: 300px;
  height: 350px;
}
.amazlet-detail {
  font-size: 78%;
}

</style>
