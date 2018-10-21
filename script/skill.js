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
    <div v-for="skill in skillArrayInPage" class="col-md-6">
      <div style="border: 1px solid #dee2e6; margin-bottom:-1px; padding: 4.8px;">
        <div>{{skill.name}}</div>
        <div style="font-size: 90%; min-height: 3em; padding-left: 1em; white-space: pre; overflow:scroll;">{{skill.description}}</div>
      </div>
    </div>
  </div>

  <pagination :page="page" :pageCount="pageCount" />
</div>`
};
