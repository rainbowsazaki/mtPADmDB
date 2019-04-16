<template>
  <div>
    <div v-if="!entries">読み込み中...</div>
    <div v-else-if="entries.length === 0">まだコメントはありません。</div>
    <div v-else>
      <div
        v-for="(entry, i) in entries"
        :key="`entry${i}`"
        class="entry"
      >
        {{ entry.message }} - <span class="name">{{ entry.name || '名無し' }}</span><span class="timestamp">({{ entry.timestamp }})</span>
        <router-link v-if="allPage" class="link" :to="{ path: entry.pageUrl }"> {{ entry.pageTitle }}</router-link>
      </div>
    </div>
    <div v-if="!readOnly" class="input">
      <form onsubmit="return false;" @submit="submit">
        <div class="form-row align-items-center">
          <div class="col-3 input-group-sm">
            <input v-model="name" class="form-control" placeholder="名前（省略可）">
          </div>
          <div class="col-9 input-group-sm">
            <input v-model="message" class="form-control" style="width: calc(100% - 4.3em - 10px); float: left;" placeholder="本文">
            <button type="submit" class="btn btn-primary btn-sm" style="width: 4.3em; float: right;" :disabled="multiSendBlocker.isSending">{{ multiSendBlocker.isSending ? '送信中' :'送信' }}</button>
          </div>
        </div>
      </form>
    </div>
  </div>

</template>

<script>
import axios from 'axios';
import { MultiSendBlocker } from '../mtpadmdb.js';

/** コメントの投稿及び表示を行うコンポーネントです。 */
export default {
  name: 'CommentList',
  props: {
    /** すべてのページのコメントを表示するかどうか。 */
    'allPage': {
      type: Boolean,
      require: true
    },
    /** 書き込みログの表示のみにするかどうか。 */
    'readOnly': {
      type: Boolean
    }
  },
  data: function () {
    return {
      /** 取得した書き込み情報。 */
      entries: undefined,
      /** 多重送信を防ぐオブジェクト。 */
      multiSendBlocker: new MultiSendBlocker(),
      /** 入力中の名前。 */
      name: '',
      /** 入力中のコメント本文。 */
      message: ''
    };
  },
  watch: {
    '$route.path': function () {
      this.entries = undefined;
      this.fetch();
    }
  },
  created: function () {
    this.fetch();
  },
  methods: {
    /** 入力中の書き込みを削除する。 */
    clearInput: function () {
      this.message = '';
    },
    /** 書き込みを取得する。 */
    fetch: function () {
      const params = {
        pageUrl: this.$route.path,
        limit: 30
      };
      if (this.allPage) {
        params.pageUrl = undefined;
      }
      axios.get('./bbs.cgi', { params: params })
        .then(response => {
          this.entries = response.data;
        });
    },
    /** 書き込んだ内容を送信する。 */
    submit: function () {
      // 多重送信防止処理
      if (this.multiSendBlocker.isSending) { return; }
      this.multiSendBlocker.set();

      this.$store.commit('setMessages', ['送信中...']);
      const pageTitle = document.title;
      const params = {
        pageUrl: this.$route.path,
        pageTitle: pageTitle,
        name: this.name,
        message: this.message
      };
      axios.post('./bbs.cgi', params)
        .then(response => {
          if (response.data.result === 'error') {
            this.$store.commit('setErrors', response.data.errors);
          } else {
            this.$store.commit('setMessages', ['書き込みに成功しました。']);
            this.clearInput();
            this.fetch();
          }
          // レスポンス来なかったときの復帰処理を止める。
          // 再度送信可能にする。
          this.multiSendBlocker.reset();
        }).catch(response => {
          this.$store.commit('setErrors', ['失敗しました。']);
          // レスポンス来なかったときの復帰処理を止める。
          // 再度送信可能にする。
          this.multiSendBlocker.reset();
        });
    }
  }
};
</script>

<style lang="scss" scoped>
.entry {
  margin-bottom: 0.2em;
  .name {
    font-size: 80%;
    color: rgba(0, 0, 0, 0.7);
  }
  .timestamp {
    padding-left: 0.5em;
    font-size: 70%;
    color: rgba(0, 0, 0, 0.7);
  }
  .link {
    font-size: 70%;
  }
}

</style>
