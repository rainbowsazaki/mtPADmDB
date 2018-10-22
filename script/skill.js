/*global */

/**
 * スキル一覧のコンポーネント。
 */
window.componentSkillList = {
  name: 'skillList',
  pageTitle: function () { return 'スキル一覧'; },
  data: function () {
    return {
      /** １ページに表示するデータの個数。 */
      inPageCount: 50
    };
  },
  computed: {
    /** スキルテーブル。 */
    skillTable () { return this.$store.state.skillTable; },
    /** 検索条件を満たすデータの配列。 */
    searchedSkillArray () {
      const array = [];
      for (const key in this.skillTable) {
        array.push(this.skillTable[key]);
      }
      return array;
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
  template: `
<div>
  <h2>スキル一覧</h2>

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
        <div><router-link :to="{ name: 'skillDetails', params: { no: skill.no }}">{{skill.name}}</router-link></div>
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
    /** スキルテーブル。 */
    skillTable () { return this.$store.state.skillTable; },
    /** 現在のページで表示するスキルの情報。 */
    skillDetails: function () {
      return this.skillTable[this.$route.params.no] || {};
    },
    /** 最小ターン */
    minTurn: function () {
      return this.skillDetails.baseTurn - this.skillDetails.maxLevel + 1;
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
</div>
  `
};
