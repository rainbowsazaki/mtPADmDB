<template>
  <div v-if="!accountData">
    ログイン確認...
  </div>
  <div v-else-if="accountData.uid">
    <button class="btn btn-primary" @click="signOut">サインアウト</button>
    <h2>管理ページリンク</h2>
    <ul>
      <li><router-link :to="{ name: 'monsterHistoryList' }">モンスター編集履歴</router-link></li>
      <li><router-link :to="{ name: 'monsterImageHistory' }">モンスター画像投稿履歴一覧</router-link></li>
      <li><router-link :to="{ name: 'skillHistory' }">スキル編集履歴一覧</router-link></li>
      <li><router-link :to="{ name: 'leaderSkillHistory' }">リーダースキル編集履歴一覧</router-link></li>
      <li><router-link :to="{ name: 'comment' }">新着コメント</router-link></li>
      <li><router-link :to="{ name: 'kisekiCheck' }">希石チェック</router-link></li>
      <li><router-link :to="{ name: 'nullCheck' }">空情報ありモンスターデータチェック</router-link></li>
      <li><router-link :to="{ name: 'nullSkillCheck' }">空情報ありスキルデータチェック</router-link></li>
      <li><router-link :to="{ name: 'superEvoCheck' }">超〇〇進化モンスターデータチェック</router-link></li>
      <li><router-link :to="{ name: 'noImageCheck' }">画像なしモンスターチェック</router-link></li>
    </ul>
    <ul>
      <li><a href="javascript:void(0);" @click="monsterImageArchiveCheck">モンスター画像アーカイブ</a></li>
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
import MixinForPage from '../components/mixins/forPage.js';

/**
 * 管理者ページコンポーネント
 */
export default {
  name: 'PageAdmin',
  pageTitle: '管理者ページ',
  mixins: [MixinForPage],
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
    },
    /** モンスター画像のアーカイブ処理を実行するページを、確認を行ってから別タブで表示する。 */
    monsterImageArchiveCheck: function () {
      if (confirm('モンスター画像のアーカイブ化を実行しますか？')) {
        window.open('/monster_image_archive.cgi');
      }
    }
  }
};
</script>
