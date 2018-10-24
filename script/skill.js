/*global escapeRegExp */

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
    /** スキルテーブルの値を配列にしたもの。 */
    skillArray () {
      const array = [];
      for (const key in this.skillTable) {
        array.push(this.skillTable[key]);
      }
      return array;
    },
    /** 検索条件を満たすデータの配列。 */
    searchedSkillArray () {
      const searchWord = this.$route.query.searchWord;
      if (!searchWord) { return this.skillArray; }
      const searchWords = searchWord.split(/\s+/g);
      // (?=.*hogehoge) が連続していて ^ と .*$ で挟まれた正規表現で、肯定先読みを利用した AND 検索になるとのこと。
      const regexp = new RegExp('^(?=.*' + searchWords.map(escapeRegExp).join(')(?=.*') + ').*$', 's');
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
    </scoped-style>

    <div v-for="skill in skillArrayInPage" class="col-md-6">
      <div class="box">
        <div><router-link :to="{ name: detailsPageName, params: { no: skill.no }}">{{skill.name}}</router-link></div>
        <div class="skillDescription">{{skill.description}}</div>
      </div>
    </div>
  </div>

  <pagination :page="page" :pageCount="pageCount" />
</div>`
};

/**
 * スキル詳細のコンポーネント。
 */
window.componentSkillDetails = {
  name: 'skillList',
  pageTitle: function () { return this.skillDetails.name || 'スキル詳細'; },
  middleOfBreadcrumbs: function () {
    return {
      text: 'スキル一覧',
      link: { name: 'skillList' }
    };
  },
  watch: {
    skillDetails: '$_mixinForPage_updateTitle'
  },
  computed: {
    /** モンスター情報のテーブル。 */
    monsterTable () { return this.$store.state.monsterTable; },
    /** モンスター画像情報のテーブル。 */
    imageTable () { return this.$store.state.imageTable; },
    /** スキルテーブル。 */
    skillTable () { return this.$store.state.skillTable; },
    /** 現在のページで表示するスキルの情報。 */
    skillDetails: function () {
      return this.skillTable[this.$route.params.no] || {};
    },
    /** 最小ターン */
    minTurn: function () {
      return this.skillDetails.baseTurn - this.skillDetails.maxLevel + 1;
    },
    /** このスキルを持つモンスターの番号の配列。 */
    monsterNosUsingThisSkill: function () {
      return this.$store.getters.skillToMonsterNosTable[this.skillDetails.no] || [];
    }
  },
  data: function () {
    return {
    };
  },
  template: `
<div>
  <h2>スキル詳細</h2>
  <h3>{{skillDetails.name}}</h3>
  <h4>ターン</h4>
  <div>Lv.1 ターン:<span v-if="skillDetails.baseTurn">{{skillDetails.baseTurn}}</span><span v-else>不明</span></div>
  <div v-if="skillDetails.maxLevel">最大Lv.{{skillDetails.maxLevel}} ターン:<span v-if="skillDetails.baseTurn">{{minTurn}}</span><span v-else>不明</span></div>
  <div v-else>最大lv.不明</div> 
  <h4>説明</h4>
  <div v-if="skillDetails.description" style="white-space: pre;">{{skillDetails.description}}</div>
  <div v-else style="color: rgba(0, 0, 0, 0.5)">（なし）</div>
  <h4>スキル所持モンスター</h4>
  <scoped-style>
    ul { padding: 0; }
    li { padding-right: 4.8px; }
  </scoped-style>
  <ul style="list-inline">
    <li v-for="monsterNo in monsterNosUsingThisSkill" class="list-inline-item">
      <router-link :to="{ name: 'monsterDetails', params: { no: monsterNo }}">
        <monster-icon v-if="imageTable" :no="monsterNo" :monsterTable="monsterTable" :imageTable="imageTable" width="3em" height="3em" />
      </router-link>
    </li>
  </ul>

</div>
  `
};
