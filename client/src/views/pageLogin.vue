<template>
  <div v-if="!accountData">
    ログイン確認中...
  </div>
  <div v-else-if="accountData.uid">
    <h2>ログアウト</h2>
    <div class="loginButton">
      <button class="btn btn-primary" @click="signOut">ログアウトする</button>
    </div>
  </div>
  <div v-else>
    <h2>ログイン</h2>
    <div class="loginButton">
      <button class="btn btn-primary" @click="signIn">Twitter アカウントでログイン</button>
    </div>
    <h3 class="decoHeader">ログインすることでできること</h3>
    <h4>お気に入りモンスターをサーバーに記録</h4>
    <p>ログインしていない場合はお気に入りモンスターはブラウザごとのストレージに記録しているため、別のブラウザや端末間で共有や引き継ぎをすることができません。</p>
    <p>ログインすることでアカウントごとにサーバーに記録するようになり、同じアカウントでログインすることで別ブラウザ・別端末からも同じデータを使用することができるようになります。</p>
  </div>
</template>

<script>

import { signIn, signOut } from '../auth';
import MixinForPage from '../components/mixins/forPage.js';

/**
 * ログインページコンポーネント
 */
export default {
  name: 'PageLogin',
  pageTitle: function () {
    return (this.isLogined) ? 'ログアウト' : 'ログイン';
  },
  mixins: [MixinForPage],
  computed: {
    /** ログインしているアカウントの情報。 */
    accountData: function () {
      return this.$store.state.accountData;
    },
    /** ログインしているかどうか。 */
    isLogined: function () {
      return !!this.accountData.uid;
    }
  },
  watch: {
    'isLogined': '$_mixinForPage_updateTitle'
  },
  methods: {
    /** ログイン処理。 */
    signIn: function () {
      signIn();
    },
    /** ログアウト処理。 */
    signOut: function () {
      signOut();
    }
  }
};
</script>

<style lang="scss" scoped>
.loginButton {
  margin: 1em 0;
}
</style>
