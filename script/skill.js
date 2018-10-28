/*global escapeRegExp leaderSkillDescriptionToDecoratedHtml */

/**
 * スキル一覧のコンポーネント。
 */
window.componentSkillList = {
  name: 'skillList',
  pageTitle: function () { return this.targetName + '一覧'; },
  data: function () {
    return {
      /** 検索ワード。 */
      searchWord: '',
      /** １ページに表示するデータの個数。 */
      inPageCount: 50
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
          if (!(skill.name + '<>' + skill.description).match(regexp)) { return undefined; }
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
        return regexp.test(skill.name + '<>' + skill.description);
      });
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
    }
  },
  template: `
<div>
  <h2>{{targetName}}一覧</h2>

  <form @submit="$event.preventDefault(); search();">
    <div class="input-group mb-3">
      <input type="text" class="form-control" :placeholder="targetName + '検索'" v-model="searchWord">
      <div class="input-group-append">
        <button type="submit" class="btn btn-outline-secondary">検索</button>
      </div>
    </div>
  </form>
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
  pageTitle: function () { return this.skillDetails.name || `${this.targetName}詳細`; },
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
      return this.skillTable[this.$route.params.no] || {};
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
    }
  },
  data: function () {
    return {
    };
  },
  methods: {
    /** リーダースキル情報を元に、リーダースキルの説明文をゲーム内の表記と同等の表示になるように装飾した HTML を作成する。 */
    getLeaderSkillDescriptionHtml: function (leaderSkillData) {
      return leaderSkillDescriptionToDecoratedHtml(leaderSkillData.description);
    }
  },
  template: `
<div>
  <h2 class="h6">{{targetName}}詳細</h2>
  <h3>{{skillDetails.name}}</h3>
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
</div>
  `
};
