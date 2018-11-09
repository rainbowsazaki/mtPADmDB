/*global mtpadmdb escapeRegExp leaderSkillDescriptionToDecoratedHtml gtagProductionOnly */

/**
 * スキル一覧のコンポーネント。
 */
window.componentSkillList = {
  name: 'skillList',
  pageTitle: function () {
    if (!this.$route.query.searchWord) { return this.targetName + '一覧'; }
    return this.targetName + '検索 ' + (this.$route.query.title || this.$route.query.searchWord);
  },
  middleOfBreadcrumbs: function () {
    if (!this.$route.query.searchWord) { return undefined; }
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
  /** 検索テンプレート情報。1つ目はスキル、2つ名はリーダースキル用。 */
  searchTemplateArrays: [
    [
      ['威嚇系', '/(\\d+ターン)遅/'],
      ['１体ブレス', '/敵1体に(.*倍)の.*攻撃。/'],
      ['全体ブレス', '/敵全体に(.*倍)の.*攻撃。/'],
      ['固定ダメージ', '/(敵.+?)の?固定/'],
      ['ヘイスト', '/味方スキルが(\\d+ターン)溜まる/'],
      ['陣（全ドロップ変化）', '/全ドロップを(.+?)に変化。/'],
      ['操作延長', '/操作(?:時間)[がを]?(.+?)。/'],
      ['バインド回復', '/バインド状態(?:と覚醒無効状態)?を(.*?回復)/'],
      ['覚醒無効状態回復', '/覚醒無効状態を(\\d+ターン)回復/'],
      ['タイプエンハ', '/の間、(.*タイプ)の攻撃力が[\\d.]+倍/'],
      ['属性エンハ', '/の間、(.*属性)の攻撃力が[\\d.]+倍/'],
      ['覚醒エンハ', '/の間、チーム内の(.+)の.*攻撃力/'],
      ['吸収無効化', '/(\\d+ターンの間、.*吸収を無効化)/'],
      ['ロック', '/[\\n。】](.+?)をロック/'],
      ['ロック解除', 'ロック状態を解除'],
      ['ダメージ減', '/\\d+ターンの間、受ける(ダメージを[^、。]*)/'],
      ['横1列変換', '/横\\d+列を(.*ドロップ)に変化/'],
      ['縦1列変換', '/縦\\d+列を(.*ドロップ)に変化/'],
      ['コンボ加算', '/(\\d+ターンの間、\\d+コンボ加算)される/'],
      ['落ちコンしなくなる', '/(\\d+ターン)の間、落ちコンしなくなる/']
    ],
    [
      ['無条件ダメージ軽減', '/[\\n。】](受けるダメージを.*?)[。、]/'],
      ['属性ダメージ軽減', '/[\\n。】](.*属性)の敵から受けるダメージを.*[。、]/'],
      ['条件付きダメージ軽減系', '/[\\n。】]([^\\nら]+ダメージ.*?減)/'],
      ['属性同時攻撃', '/[\\n。】](.*(属性|色)同時攻撃)/'],
      ['コンボ条件', '/[\\n。】](\\d*コンボ.*?)で/'],
      ['指定色コンボ', '/[\\n。】](.*の\\d*コンボ.*?)で/'],
      ['根性', 'ふんばることがある'],
      ['追い打ち', '/(攻撃力×\\d+?倍)の追い打ち/'],
      ['操作時間延長', '/ドロップ操作(?:時間)?[\\D]*(\\d+.*?)。/'],
      ['操作時間固定', '/操作時間(\\d+秒固定)/'],
      ['経験値アップ', '/ランク経験値が(.+?)。/']
    ]
  ],
  data: function () {
    return {
      /** 検索ワード。 */
      searchWord: '',
      /** １ページに表示するデータの個数。 */
      inPageCount: 50,
      /** 一覧上の一つのスキルに表示する、スキルを持っているモンスターの表示数上限。 */
      monsterIconCountMax: 10,
    };
  },
  created: function () {
    this.updateSearchWordFromUrl();
  },
  watch: {
    '$route': [
      'updateSearchWordFromUrl',
      '$_mixinForPage_updateTitle'
    ]
  },
  computed: {
    /** リーダースキルの表示かどうか。 */
    isLeaderSkill () { return this.$route.name === 'leaderSkillList'; },
    /** 現在の条件で表示する情報の名前。 */
    targetName () { return (this.isLeaderSkill) ? 'リーダースキル' : 'スキル'; },
    /** 現在の条件で表示するデータの詳細ページのルート名。 */
    detailsPageName () { return (this.isLeaderSkill) ? 'leaderSkillDetails' : 'skillDetails'; },
    /** モンスター情報のテーブル。 */
    monsterTable () { return this.$store.state.monsterTable; },
    /** モンスター画像情報のテーブル。 */
    imageTable () { return this.$store.state.imageTable; },
    /** スキルテーブル。 */
    skillTable () { return (this.isLeaderSkill) ? this.$store.state.leaderSkillTable : this.$store.state.skillTable; },
    /** スキル番号をキーとして、スキルを持っているモンスター番号の配列を格納したオブジェクト。 */
    skillToMonsterNosTable: function () {
      return (this.isLeaderSkill) ? this.$store.getters.leaderSkillToMonsterNosTable : this.$store.getters.skillToMonsterNosTable;
    },
    /** 所持しているモンスターが存在するスキルテーブルの値を配列にしたもの。 */
    skillArray () {
      return Object.values(this.skillTable).filter((skill) => skill.no in this.skillToMonsterNosTable);
    },
    /** 検索条件を満たすデータの配列。 */
    searchedSkillArray () {
      const searchWord = this.$route.query.searchWord;
      if (!searchWord) { return this.skillArray; }
      const searchWords = searchWord.split(/\s+/g);
      /* 検索ワードに後方参照指定のある正規表現として扱うものが含まれているかどうか。 */
      let isSortRegExpSearch = false;
      /** 検索ワードが正規表現扱いか確認して適切に処理する。 */
      const checkSearchWord = (word) => {
        // スラッシュで囲まれている場合は中身をそのまま正規表現として扱う。
        if (word.match(/^\/(.*)\/$/)) {
          const useWord = RegExp.$1;
          // 直前がバックスラッシュでなく、直後が ?: でない括弧があるかどうかの確認。
          isSortRegExpSearch |= /(^|[^\\])\([^(\?\:)]/.test(useWord);
          return useWord;
        }
        // それ以外はそのままの文字列として検索するため正規表現用にエスケープする。
        return escapeRegExp(word);
      };
      // (?=.*hogehoge) が連続していて ^ と .*$ で挟まれた正規表現で、肯定先読みを利用した AND 検索になるとのこと。
      const regexp = new RegExp('^(?=.*' + searchWords.map(checkSearchWord).join(')(?=.*') + ').*$', 's');
      if (isSortRegExpSearch) {
        /** 文字列の昇順比較関数。 */
        const strcmp = (a, b) => {
          if (a < b) { return -1; }
          if (a > b) { return 1; }
          return 0;
        };
        // 正規表現の後方参照の結果を hit プロパティに入れた状態のオブジェクトの配列を、 hit プロパティでソートして返す。
        const array = this.skillArray.map((skill) => {
          if (!(skill.name + '\n' + skill.description).match(regexp)) { return undefined; }
          return Object.assign({ hit: RegExp.$1 }, skill);
        }).filter(o => o).sort((a, b) => parseFloat(a.hit) - parseFloat(b.hit) || strcmp(a.hit, b.hit));
        // グループ名が切り替わった先頭のオブジェクトに印をつけておく。
        let lastGroupName = '';
        for (const i in array) {
          if (array[i].hit !== lastGroupName) {
            array[i].isGroupHead = true;
            lastGroupName = array[i].hit;
          }
        }
        return array;
      }
      return this.skillArray.filter((skill) => {
        return regexp.test(skill.name + '\n' + skill.description);
      });
    },
    /** 検索のテンプレート情報の配列。 */
    searchTemplateArray: function () {
      return this.$options.searchTemplateArrays[this.isLeaderSkill ? 1 : 0];
    },
    /** 現在の条件を満たすデータを最後を表示するのに必要なページ数。 */
    pageCount () { return ((this.searchedSkillArray.length + this.inPageCount - 1) / this.inPageCount) | 0; },
    /** 現在表示中のページ番号。 */
    page () { return (this.$route.query.page * 1) || 1; },
    /** 現在のページで表示するデータの配列。 */
    skillArrayInPage () {
      return this.searchedSkillArray.slice((this.page - 1) * this.inPageCount, this.page * this.inPageCount);
    }
  },
  methods: {
    /** URLで指定された検索ワードで searchWord を更新する。 */
    updateSearchWordFromUrl: function () {
      this.searchWord = this.$route.query.searchWord;
    },
    /** searchWord の文字列を使用して検索を行う。 */
    search: function () {
      this.$router.push({ path: this.$router.path, query: { searchWord: this.searchWord }});
    },
    /** このスキルを持つモンスターの番号の配列を取得する。 */
    monsterNosUsingThisSkill: function (no) {
      return (this.skillToMonsterNosTable[no] || []).slice().reverse();
    }
  },
  template: `
<div>
  <h2>{{targetName}}一覧</h2>

  <form @submit="$event.preventDefault(); search();">
    <div class="input-group mb-3">
      <input type="text" class="form-control" :placeholder="targetName + '検索'" v-model.lazy="searchWord">
      <div class="input-group-append">
        <button type="submit" class="btn btn-outline-secondary">検索</button>
      </div>
    </div>
    <div>
      <router-link v-for="searchWordPair in searchTemplateArray" class="ml-2" :to="{ query: { title: searchWordPair[0], searchWord: searchWordPair[1] }}">
        {{searchWordPair[0]}}
      </router-link>
    </div>
  </form>
  <div><tweet-button /></div>
  <pagination :page="page" :pageCount="pageCount" />
  
  <div class="row" style="margin-bottom: 1rem;">
    <scoped-style>
      .box {
        border: 1px solid #dee2e6;
        margin-bottom: -1px;
        padding: 4.8px;
      }
      .skillDescription {
        font-size: 90%;
        min-height: 3em;
        padding-left: 1em;
        white-space: pre;
        overflow: scroll;
      }
      .monsterUsingSkillIcons {
        min-height: 1.5rem;
        padding-left: 0.9rem;
        overflow: scroll;
        white-space: nowrap;
        margin: 0;
      }
      h3 {
        font-size: 1.25rem;
        margin-top: 1rem;
      }
    </scoped-style>

    <template v-for="(skill, n) in skillArrayInPage">
    <div v-if="skill.hit && (n === 0 || skill.isGroupHead)" class="col-md-12">
      <h3>{{skill.hit}}</h3>
    </div>
    <div class="col-md-6">
      <div class="box">
        <div><router-link :to="{ name: detailsPageName, params: { no: skill.no }}">{{skill.name}}</router-link></div>
        <div class="skillDescription">{{skill.description}}</div>
        <ul class="list-inline monsterUsingSkillIcons">
          <li v-for="(monsterNo, n) in monsterNosUsingThisSkill(skill.no)" class="list-inline-item">
            <router-link v-if="n < monsterIconCountMax" :to="{ name: 'monsterDetails', params: { no: monsterNo }}">
              <monster-icon v-if="imageTable" :no="monsterNo" :monsterTable="monsterTable" :imageTable="imageTable" width="2em" height="2em" />
            </router-link>
            <span v-else v-if="n == monsterIconCountMax">…</span>
          </li>
        </ul>
      </div>
    </div>
    </template>
  </div>

  <pagination :page="page" :pageCount="pageCount" />
</div>`
};

/**
 * スキル詳細のコンポーネント。
 */
window.componentSkillDetails = {
  name: 'skillList',
  pageTitle: function () { return `${this.targetName}詳細 ${this.skillDetails.name}`; },
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
  watch: {
    skillDetails: '$_mixinForPage_updateTitle'
  },
  computed: {
    /** リーダースキルの表示かどうか。 */
    isLeaderSkill () { return this.$route.name === 'leaderSkillDetails'; },
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
      return this.skillTable[this.$route.params.no] || { name: '' };
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
      histories: null
    };
  },
  methods: {
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
        if (this.$route.params.no) { action = 'skillDataUpdate'; }
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
      this.isLoadingHistory = true;
      mtpadmdb.api('skillHistory', { isLeaderSkill: this.isLeaderSkill, no: this.$route.params.no },
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
        return history.id === this.$route.params.id;
      } else {
        return this.isActiveHistory(history);
      }
    }
  },
  template: `
<div>
  <h2 class="h6">{{targetName}}詳細</h2>
  <template v-if="!isEditing">
    <h3>{{skillDetails.name}}</h3>
    <div><tweet-button /></div>
    <template v-if="!isLeaderSkill">
      <h4 class="p-2 mt-3 bg-light">ターン</h4>
      <div>Lv.1 ターン:<span v-if="skillDetails.baseTurn">{{skillDetails.baseTurn}}</span><span v-else>不明</span></div>
      <div v-if="skillDetails.maxLevel">最大Lv.{{skillDetails.maxLevel}} ターン:<span v-if="skillDetails.baseTurn">{{minTurn}}</span><span v-else>不明</span></div>
      <div v-else>最大lv.不明</div>
    </template>
    <h4 class="p-2 mt-3 bg-light">説明</h4>
    <div v-if="skillDetails.description" style="white-space: pre;" v-html="getLeaderSkillDescriptionHtml(skillDetails)">{{skillDetails.description}}</div>
    <div v-else style="color: rgba(0, 0, 0, 0.5)">（なし）</div>
    <h4 class="p-2 mt-3 bg-light">{{targetName}}所持モンスター</h4>
    <scoped-style>
      li { margin: 0; padding: 0; padding: 2.4px; }
    </scoped-style>
    <ul v-if="existsMonsterUsingThisSkill" class="list-inline">
      <li v-for="monsterNo in monsterNosUsingThisSkill" class="list-inline-item">
        <router-link :to="{ name: 'monsterDetails', params: { no: monsterNo }}">
          <monster-icon v-if="imageTable" :no="monsterNo" :monsterTable="monsterTable" :imageTable="imageTable" width="3em" height="3em" />
        </router-link>
      </li>
    </ul>
    <div v-else>なし</div>
    <hr>
    <button type="button" class="btn btn-secondary" @click="startEdit">編集する</button>
  </template>

  <form v-else onsubmit="return false;" @submit="submit">
    <table class="table table-bordered table-sm">
      <tr>
        <th colspan="12">名称</th>
      </tr>
      <tr>
        <td colspan="12">
          <input v-model="editData.name" class="form-control dropdown-toggle" required minLength="1" maxLength="50" />
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
          <td colspan="4">{{(minimumSkillTurn) ? minimumSkillTurn + 'ターン' : '-' }}</td>
        </tr>
      </template>
      <tr>
        <th colspan="12">説明</th>
      </tr>
      <tr>
        <td colspan="12">
          <textarea class="form-control" id="textareaSkillDescription" rows="2" v-model="editData.description" maxLength="200"></textarea>
        </td>
      </tr>
      <tr class="thead-light">
        <th colspan="12">編集コメント（任意）</th>
      </tr>
      <tr>
        <td colspan="12">
          編集理由などを書いてください。（例：説明を更新）
          <textarea class="form-control" id="textareaComment" rows="3" v-model="editData.comment" minLength="0" maxLength="1000"></textarea>
        </td>
      </tr>
      <tr>
        <td v-for="n in 12" style="width:8.33333%; padding: 0; border: none;"></td>
      </tr>
    </table>
    <button type="button" class="btn btn-secondary" :disabled="isSubmitted" @click="endEdit">キャンセル</button>
    <button type="submit" class="btn btn-primary" :disabled="isSubmitted">{{isSubmitted ? '送信中' :'送信する'}}</button>
  </form>

  <div style="margin-top: 1rem;">
    <h3 class="h4">編集履歴</h3>
    <button v-if="!histories" class="btn btn-primary" @click="loadHistories" :disabled="isLoadingHistory">
      {{isLoadingHistory ? '読み込み中…' : '編集履歴を確認する'}}
    </button>
    <ul v-if="histories">
      <li v-for="history in histories">
        <component :is="isShowHistory(history) ? 'span' : 'router-link'" :to="{ name: historyRouteName, params: { id: history.id } }">
          {{history.datetime}} - 
          <span v-if="history.comment">{{history.comment}}</span>
          <span v-else style="opacity: 0.6;">（コメントなし）</span>
        </component>
        <span v-if="isShowHistory(history)">（表示中）</span><span v-if="isActiveHistory(history)">（現在のデータ）</span>
      </li>
    </ul>
  </div>
</div>
  `
};
