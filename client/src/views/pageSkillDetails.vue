<template>
  <div>
    <div v-if="isHistory" class="alert alert-primary" role="alert">
      {{ skillDetails.datetime }} 時点のデータです
    </div>
    <h2 class="h6">{{ targetName }}{{ isHistory ? '履歴' : '' }}詳細</h2>
    <template v-if="!isEditing">
      <h3>{{ skillDetails.name }}</h3>
      <div><tweet-button /></div>
      <h4 class="decoHeader mt-3">説明</h4>
      <template v-if="!isLeaderSkill">
        <div class="mb-2">
          Lv.1 ターン: <span v-if="skillDetails.baseTurn">{{ skillDetails.baseTurn }}</span><span v-else>不明</span>
          <span class="textMax">最大</span>Lv.{{ maxLevel || '不明' }} ターン: {{ skillDetails.minTurn || '不明' }}
        </div>
      </template>
      <div class="stretch">
        <div v-if="skillDetails.description" style="white-space: pre;" v-html="getLeaderSkillDescriptionHtml(skillDetails)">{{ skillDetails.description }}</div>
        <div v-else style="color: rgba(0, 0, 0, 0.5)">（なし）</div>
      </div>

      <h4 class="decoHeader mt-3">所持モンスター</h4>
      <ul v-if="existsMonsterUsingThisSkill" class="monsters list-inline">
        <li v-for="monsterNo in monsterNosUsingThisSkillDisp" class="list-inline-item" :key="`monster${monsterNo}`">
          <monster-icon v-if="imageTable" :no="monsterNo" :monster-table="monsterTable" :image-table="imageTable" width="3em" height="3em" />
        </li>
        <span v-if="!isUsingDispAll"> ... </span>
        <button v-if="!isUsingDispAll" class="btn btn-sm btn-outline-secondary" @click="isUsingDispAll = true;">すべてを表示する</button>
      </ul>
      <div v-else>なし</div>

      <h4 class="decoHeader mt-3">コメント</h4>
      <comment-list />

      <h4 class="decoHeader mt-3">JSON</h4>
      <textarea readonly v-model="skillDataJson" class="json" />

      <h4 class="decoHeader mt-3">編集履歴</h4>
      <div>
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

      <button type="button" class="mt-3 btn btn-sm btn-secondary" @click="startEdit">{{ isHistory ? '履歴をもとに編集する': '編集する' }}</button>

    </template>

    <form v-else onsubmit="return false;" @submit="submit">
      <table class="table table-bordered table-sm">
        <tr>
          <td style="padding: 0;">
            <edit-skill class="thead-light" style="width: 100%; margin: -1px;" :skill-details="editData" :leader-skill="isLeaderSkill" />
          </td>
        </tr>
        <tr class="thead-light">
          <th>編集コメント（任意）</th>
        </tr>
        <tr>
          <td>
            編集理由などを書いてください。（例：効果を更新）
            <textarea class="form-control" id="textareaComment" rows="3" v-model="editData.comment" minLength="0" maxLength="1000" />
          </td>
        </tr>
      </table>
      <button type="button" class="btn btn-outline-secondary" :disabled="multiSendBlocker.isSending" @click="endEdit">キャンセル</button>
      <button type="submit" class="ml-2 btn btn-primary" :disabled="multiSendBlocker.isSending">{{ multiSendBlocker.isSending ? '送信中' :'送信する' }}</button>
    </form>
  </div>
</template>

<script>
import { mtpadmdb, leaderSkillDescriptionToDecoratedHtml, MultiSendBlocker, gtagProductionOnly, stretchElement } from '../mtpadmdb.js';
import EditSkill from './../components/editSkill.vue';
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
  components: {
    EditSkill
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
      /** 多重送信を防ぐオブジェクト。 */
      multiSendBlocker: new MultiSendBlocker(),

      /** 履歴情報の読み込み中かどうか。 */
      isLoadingHistory: false,
      /** 履歴情報 */
      histories: null,
      skillDetailsHistory: null,
      /** このスキルを持つモンスターのアイコンをすべて表示するかどうか。 */
      isUsingDispAll: false
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
    /** 最大レベル。 */
    maxLevel: function () {
      if (!this.skillDetails.baseTurn || !this.skillDetails.minTurn) { return null; }
      return this.skillDetails.baseTurn - this.skillDetails.minTurn + 1;
    },
    /** スキル番号をキーとして、スキルを持っているモンスター番号の配列を格納したオブジェクト。 */
    skillToMonsterNosTable: function () {
      return (this.isLeaderSkill) ? this.$store.getters.leaderSkillToMonsterNosTable : this.$store.getters.skillToMonsterNosTable;
    },
    /** このスキルを持つモンスターの番号の配列。 */
    monsterNosUsingThisSkillAll: function () {
      return this.skillToMonsterNosTable[this.skillDetails.no] || [];
    },
    /** このスキルを持つモンスターの番号の表示する分の配列。 */
    monsterNosUsingThisSkillDisp: function () {
      let array = this.monsterNosUsingThisSkillAll;
      if (array && !this.isUsingDispAll) {
        array = array.slice(0, 10);
      }
      return array;
    },
    /** このスキルを持つモンスターが存在するかどうか。 */
    existsMonsterUsingThisSkill: function () {
      return this.monsterNosUsingThisSkillAll.length > 0;
    },
    /** 編集履歴の表示かどうか。 */
    isHistory: function () {
      return (this.$route.name.indexOf('History') !== -1);
    },
    historyRouteName: function () {
      return (this.isLeaderSkill) ? 'leaderSkillDetailsHistory' : 'skillDetailsHistory';
    },
    /** スキル情報をJSONテキスト化したもの。 */
    skillDataJson: function () {
      const keys = [
        'no', 'name', 'baseTurn', 'minTurn', 'description'
      ];
      return JSON.stringify(this.skillDetails, keys, 4);
    }
  },
  watch: {
    skillDetails: '$_mixinForPage_updateTitle',
    '$route': 'update'
  },
  mounted: function () {
    this.update();
    this.stretch();
    window.addEventListener('resize', this.stretch);
  },
  beforeDestroy: function () {
    window.removeEventListener('resize', this.stretch);
  },
  updated: function () {
    this.stretch();
  },
  methods: {
    /** 効果文を、領域の横幅に合わせて縮小する。 */
    stretch: function () {
      const elms = document.getElementsByClassName('stretch');
      for (const elm of elms) {
        stretchElement(elm);
      }
    },
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
      this.multiSendBlocker.reset();
      this.isUsingDispAll = this.monsterNosUsingThisSkillAll && this.monsterNosUsingThisSkillAll.length <= 10;
    },

    /** リーダースキル情報を元に、リーダースキルの効果をゲーム内の表記と同等の表示になるように装飾した HTML を作成する。 */
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
      this.multiSendBlocker.reset();
    },
    /** 編集結果を送信する。 */
    submit: function () {
      // 多重送信防止処理
      if (this.multiSendBlocker.isSending) { return; }
      this.multiSendBlocker.set();

      this.$store.commit('clearErrors');
      this.$store.commit('setMessages', ['送信中...']);

      mtpadmdb.api('updateSkill', {
        isLeaderSkill: this.isLeaderSkill,
        updateData: this.editData
      }, (response) => {
        // レスポンス来なかったときの復帰処理を止める。
        this.multiSendBlocker.reset();

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
        // 再度送信可能にする。
        this.multiSendBlocker.reset();
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

<style lang="scss" scoped>

.textMax {
  color: #00cccc;
  margin-left: 1em;
}

  .monsters li {
    margin: 0;
    padding: 0;
    padding: 2.4px;
  }

textarea.json {
  width: 100%;
  height: 8em;
}
</style>
