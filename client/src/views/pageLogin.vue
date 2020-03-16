<template>
  <div>
    <template v-if="isLoginStart === undefined">
      ログイン確認中...
    </template>
    <template v-else-if="isLoginStart">
      <h2>ログアウト</h2>
      <div v-if="isLogined" class="loginButton">
        <button class="btn btn-primary" @click="signOut">ログアウトする</button>
      </div>
      <div v-else class="loginButton">ログアウトしました。</div>
    </template>
    <template v-else>
      <h2>ログイン</h2>
      <div v-if="!isLogined" class="loginButton">
        <button class="btn btn-primary" @click="signIn">Twitter アカウントでログイン</button>
      </div>
      <div v-else class="loginButton">
        ログインしました。
      </div>
      <h3 class="decoHeader">ログインすることでできること</h3>
      <h4>お気に入りモンスターをサーバーに記録</h4>
      <p>ログインしていない場合はお気に入りモンスターはブラウザごとのストレージに記録しているため、別のブラウザや端末間で共有や引き継ぎをすることができません。</p>
      <p>ログインすることでアカウントごとにサーバーに記録するようになり、同じアカウントでログインすることで別ブラウザ・別端末からも同じデータを使用することができるようになります。</p>
    </template>
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
    return (this.isLoginStart) ? 'ログアウト' : 'ログイン';
  },
  mixins: [MixinForPage],
  data: function () {
    return {
      /** ページにアクセスした時点でログインしていたかどうか。 */
      isLoginStart: undefined
    };
  },
  computed: {
    /** ログインしているアカウントの情報。 */
    accountData: function () {
      return this.$store.state.accountData;
    },
    /** ログインしているかどうか。 */
    isLogined: function () {
      const accountData = this.accountData;
      return accountData && !!accountData.uid;
    }
  },
  watch: {
    'isLoginStart': '$_mixinForPage_updateTitle',
    'accountData': function () {
      // コンポーネント作成時点でログイン確認が終わっていなかった場合用の処理。
      // ログイン確認が終わって accountData にオブジェクトが入った直後には aid などに値が入っていないようなので、少し間をおいて取得する。
      if (this.isLoginStart === undefined) {
        setTimeout(() => this.checkLoginStart(), 10);
      }
    }
  },
  created: function () {
    this.checkLoginStart();
  },
  methods: {
    /** ページ開始時にログインしているかどうかを確認する。 */
    checkLoginStart () {
      // 確認済みの場合は処理を行わない。
      if (this.isLoginStart === undefined && this.accountData) {
        this.isLoginStart = this.isLogined;
      }
    },
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
