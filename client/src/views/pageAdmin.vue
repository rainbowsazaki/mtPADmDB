<template>
  <div v-if="!accountData">
    ログイン確認...
  </div>
  <div v-else-if="accountData.uid">
    <button class="btn btn-primary" @click="signOut">サインアウト</button>
    <h2>管理ページリンク</h2>
    <ul>
      <li><router-link :to="{ name: 'monsterHistoryList' }">モンスター編集履歴</router-link></li>
      <li><router-link :to="{ name: 'comment' }">新着コメント</router-link></li>
      <li><router-link :to="{ name: 'kisekiCheck' }">希石チェック</router-link></li>
    </ul>
    <div>
      {{ accountData }}
    </div>
  </div>
  <div v-else>
    <button class="btn btn-primary" @click="signIn">Twitter アカウントでサインイン</button>
  </div>
</template>

<script>

import { signIn, signOut } from '../auth';

/**
 * 管理者ページコンポーネント
 */
export default {
  name: 'PageAdmin',
  pageTitle: '管理者ページ',

  computed: {
    /** ログインしているアカウントの情報。 */
    accountData: function () {
      return this.$store.state.accountData;
    }
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
