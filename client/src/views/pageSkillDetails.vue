<template>
  <div>
    <div v-if="isHistory" class="alert alert-primary" role="alert">
      {{ skillDetails.datetime }} 時点のデータです
    </div>
    <h2 class="h6">{{ targetName }}{{ isHistory ? '履歴' : '' }}詳細</h2>
    <template v-if="!isEditing">
      <h3>{{ skillDetails.name }}</h3>
      <div><tweet-button /></div>
      <template v-if="!isLeaderSkill">
        <h4 class="p-2 mt-3 bg-light">ターン</h4>
        <div>Lv.1 ターン:<span v-if="skillDetails.baseTurn">{{ skillDetails.baseTurn }}</span><span v-else>不明</span></div>
        <div v-if="skillDetails.maxLevel">最大Lv.{{ skillDetails.maxLevel }} ターン:<span v-if="skillDetails.baseTurn">{{ minTurn }}</span><span v-else>不明</span></div>
        <div v-else>最大lv.不明</div>
      </template>
      <h4 class="p-2 mt-3 bg-light">説明</h4>
      <div v-if="skillDetails.description" style="white-space: pre;" v-html="getLeaderSkillDescriptionHtml(skillDetails)">{{ skillDetails.description }}</div>
      <div v-else style="color: rgba(0, 0, 0, 0.5)">（なし）</div>
      <h4 class="p-2 mt-3 bg-light">{{ targetName }}所持モンスター</h4>
      <scoped-style>
        li { margin: 0; padding: 0; padding: 2.4px; }
      </scoped-style>
      <ul v-if="existsMonsterUsingThisSkill" class="list-inline">
        <li v-for="monsterNo in monsterNosUsingThisSkill" class="list-inline-item" :key="`monster${monsterNo}`">
          <router-link :to="{ name: 'monsterDetails', params: { no: monsterNo }}">
            <monster-icon v-if="imageTable" :no="monsterNo" :monster-table="monsterTable" :image-table="imageTable" width="3em" height="3em" />
          </router-link>
        </li>
      </ul>
      <div v-else>なし</div>
      <hr>
      <button type="button" class="btn btn-secondary" @click="startEdit">{{ isHistory ? '履歴をもとに編集する': '編集する' }}</button>
    </template>

    <form v-else onsubmit="return false;" @submit="submit">
      <table class="table table-bordered table-sm">
        <tr>
          <th colspan="12">名称</th>
        </tr>
        <tr>
          <td colspan="12">
            <input v-model="editData.name" class="form-control dropdown-toggle" required minLength="1" maxLength="50">
          </td>
        </tr>
        <template v-if="!isLeaderSkill">
          <tr>
            <th colspan="4">SLv1時ターン</th>
            <th colspan="4">最大SLv</th>
            <th colspan="4">最短ターン</th>
          </tr>
          <tr>
            <td colspan="4">
              <input type="number" class="form-control" id="inputSkillBaseTurn" v-model.number="editData.baseTurn" min="1" max="199">
            </td>
            <td colspan="4">
              <div class="input-group">
                <div class="input-group-prepend">
                  <span class="input-group-text">SLv.</span>
                </div>
                <input type="number" class="form-control" id="inputSkillMaxLevel" v-model.number="editData.maxLevel" min="1" max="99">
              </div>
            </td>
            <td colspan="4">{{ (minimumSkillTurn) ? minimumSkillTurn + 'ターン' : '-' }}</td>
          </tr>
        </template>
        <tr>
          <th colspan="12">説明</th>
        </tr>
        <tr>
          <td colspan="12">
            <textarea class="form-control" id="textareaSkillDescription" rows="2" v-model="editData.description" maxLength="200" />
          </td>
        </tr>
        <tr class="thead-light">
          <th colspan="12">編集コメント（任意）</th>
        </tr>
        <tr>
          <td colspan="12">
            編集理由などを書いてください。（例：説明を更新）
            <textarea class="form-control" id="textareaComment" rows="3" v-model="editData.comment" minLength="0" maxLength="1000" />
          </td>
        </tr>
        <tr>
          <td v-for="n in 12" style="width:8.33333%; padding: 0; border: none;" :key="`margin${n}`" />
        </tr>
      </table>
      <button type="button" class="btn btn-secondary" :disabled="isSubmitted" @click="endEdit">キャンセル</button>
      <button type="submit" class="btn btn-primary" :disabled="isSubmitted">{{ isSubmitted ? '送信中' :'送信する' }}</button>
    </form>

    <div style="margin-top: 1rem;">
      <h3 class="h4">編集履歴</h3>
      <button v-if="!histories" class="btn btn-primary" @click="loadHistories" :disabled="isLoadingHistory">
        {{ isLoadingHistory ? '読み込み中…' : '編集履歴を確認する' }}
      </button>
      <ul v-if="histories">
        <li v-for="history in histories" :key="`history${history.id}`">
          <component :is="isShowHistory(history) ? 'span' : 'router-link'" :to="{ name: historyRouteName, params: { id: history.id } }">
            {{ history.datetime }} -
            <span v-if="history.comment">{{ history.comment }}</span>
            <span v-else style="opacity: 0.6;">（コメントなし）</span>
          </component>
          <span v-if="isShowHistory(history)">（表示中）</span><span v-if="isActiveHistory(history)">（現在のデータ）</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { mtpadmdb, leaderSkillDescriptionToDecoratedHtml, gtagProductionOnly } from '../mtpadmdb.js';
/**
 * スキル詳細のコンポーネント。
 */
export default {
  name: 'PageSkillDetails',
  pageTitle: function () {
    if (this.isHistory) { return `${this.targetName}履歴詳細 ${this.skillDetails.name} (${this.skillDetails.datetime})`; }
    return `${this.targetName}詳細 ${this.skillDetails.name}`;
  },
  middleOfBreadcrumbs: function () {
    if (this.isLeaderSkill) {
      return {
        text: 'リーダースキル一覧',
        link: { name: 'leaderSkillList' }
      };
    } else {
      return {
        text: 'スキル一覧',
        link: { name: 'skillList' }
      };
    }
  },
  props: {
    no: {
      type: [String, Number],
      default: null
    },
    id: {
      type: [String, Number],
      default: null
    }
  },
  data: function () {
    return {
      /** 編集モードかどうか。 */
      isEditing: false,
      /** 編集中データ。 */
      editData: {},
      /** 送信中かどうか。 */
      isSubmitted: false,

      /** 履歴情報の読み込み中かどうか。 */
      isLoadingHistory: false,
      /** 履歴情報 */
      histories: null,
      skillDetailsHistory: null
    };
  },
  computed: {
    /** リーダースキルの表示かどうか。 */
    isLeaderSkill () { return this.$route.name.indexOf('leaderSkill') !== -1; },
    /** 現在の条件で表示する情報の名前。 */
    targetName () { return (this.isLeaderSkill) ? 'リーダースキル' : 'スキル'; },
    /** モンスター情報のテーブル。 */
    monsterTable () { return this.$store.state.monsterTable; },
    /** モンスター画像情報のテーブル。 */
    imageTable () { return this.$store.state.imageTable; },
    /** スキルテーブル。 */
    skillTable () { return this.isLeaderSkill ? this.$store.state.leaderSkillTable : this.$store.state.skillTable; },
    /** 現在のページで表示するスキルの情報。 */
    skillDetails: function () {
      if (this.isHistory) {
        return this.skillDetailsHistory;
      } else {
        return this.skillTable[this.no] || { name: '' };
      }
    },
    /** 最小ターン */
    minTurn: function () {
      return this.skillDetails.baseTurn - this.skillDetails.maxLevel + 1;
    },
    /** スキル番号をキーとして、スキルを持っているモンスター番号の配列を格納したオブジェクト。 */
    skillToMonsterNosTable: function () {
      return (this.isLeaderSkill) ? this.$store.getters.leaderSkillToMonsterNosTable : this.$store.getters.skillToMonsterNosTable;
    },
    /** このスキルを持つモンスターの番号の配列。 */
    monsterNosUsingThisSkill: function () {
      return this.skillToMonsterNosTable[this.skillDetails.no] || [];
    },
    /** このスキルを持つモンスターが存在するかどうか。 */
    existsMonsterUsingThisSkill: function () {
      return this.monsterNosUsingThisSkill.length > 0;
    },
    /** スキルレベル最大時の（最短の）スキルターン */
    minimumSkillTurn: function () {
      if (!this.editData.baseTurn || !this.editData.maxLevel) { return NaN; }
      const turn = this.editData.baseTurn - this.editData.maxLevel + 1;
      if (turn < 0) { return NaN; }
      return turn;
    },
    /** 編集履歴の表示かどうか。 */
    isHistory: function () {
      return (this.$route.name.indexOf('History') !== -1);
    },
    historyRouteName: function () {
      return (this.isLeaderSkill) ? 'leaderSkillDetailsHistory' : 'skillDetailsHistory';
    }
  },
  watch: {
    skillDetails: '$_mixinForPage_updateTitle',
    '$route': 'update'
  },
  mounted: function () { this.update(); },
  methods: {
    /** 現在のルートに合わせて表示内容を更新する。 */
    update: function () {
      if (this.isHistory) {
        this.skillDetailsHistory = null;
        // 履歴一覧情報がある場合は、その一覧からリンクしてきた可能性が高いのでそこからデータの取得を試みる。
        if (this.histories) {
          this.skillDetailsHistory = this.histories.find((o) => o.id === this.id);
        }
        // データがない場合はサーバーから取得する。
        if (!this.skillDetailsHistory) {
          mtpadmdb.api('skillHistory', { isLeaderSkill: this.isLeaderSkill ? 1 : 0, id: this.id },
            (response) => {
              this.skillDetailsHistory = response.data[0];
            });
          this.skillDetailsHistory = {};
        }
      }
      // プロパティの初期化
      this.isEditing = false;
      this.histories = null;
      this.isLoadingHistory = false;
      this.isSubmitted = false;
    },

    /** リーダースキル情報を元に、リーダースキルの説明文をゲーム内の表記と同等の表示になるように装飾した HTML を作成する。 */
    getLeaderSkillDescriptionHtml: function (leaderSkillData) {
      return leaderSkillDescriptionToDecoratedHtml(leaderSkillData.description);
    },
    /** 編集モードを開始する。 */
    startEdit: function () {
      this.editData = Object.assign({ comment: '' }, this.skillDetails);
      this.isEditing = true;
    },
    /** 編集モードを終了する。 */
    endEdit: function () {
      this.isEditing = false;
      this.isSubmitted = false;
    },
    /** 編集結果を送信する。 */
    submit: function () {
      // 多重送信防止処理
      if (this.isSubmitted) { return; }
      this.isSubmitted = true;
      // 何かしらあってレスポンスが帰ってこなかった場合に再送信できるように２０秒後に復帰させる。
      const timeoutId = setTimeout(() => { this.isSubmitted = false; }, 20 * 1000);

      this.$store.commit('clearErrors');
      this.$store.commit('setMessages', ['送信中...']);

      mtpadmdb.api('updateSkill', {
        isLeaderSkill: this.isLeaderSkill,
        updateData: this.editData
      }, (response) => {
        // レスポンス来なかったときの復帰処理を止める。
        clearTimeout(timeoutId);

        // Google Analiticsにイベントを送信。
        let action = 'skillDataPost';
        if (this.no) { action = 'skillDataUpdate'; }
        gtagProductionOnly('event', action, {
          'event_category': 'monsterData',
          'event_label': `No.${this.editData.no}`
        });
        this.endEdit();
      }, (response) => {
        // レスポンス来なかったときの復帰処理を止める。
        clearTimeout(timeoutId);
        // 再度送信可能にする。
        this.isSubmitted = false;
      });
    },
    /** 履歴リストを取得する。 */
    loadHistories: function () {
      const skillNo = (this.isHistory) ? this.skillDetails.no : this.no;
      if (skillNo === undefined) { return; }
      this.isLoadingHistory = true;
      mtpadmdb.api('skillHistory', { isLeaderSkill: this.isLeaderSkill ? 1 : 0, no: skillNo },
        (response) => {
          this.histories = response.data;
        });
    },
    /** 指定された履歴情報が今有効なデータかどうかを取得する。 */
    isActiveHistory: function (history) {
      return history.state === 1;
    },
    /** 指定された履歴情報が現在表示している */
    isShowHistory: function (history) {
      if (this.isHistory) {
        return history.id === parseInt(this.id);
      } else {
        return this.isActiveHistory(history);
      }
    }
  }
};
</script>
