<template>
  <div>
    <h2>{{ targetName }}一覧</h2>

    <form @submit="$event.preventDefault(); search();">
      <div class="input-group mb-3">
        <input type="text" class="form-control" :placeholder="targetName + '検索'" v-model="searchWord">
      </div>
      <div class="form-group row">
        <label for="Password" class="col-sm-2 col-form-label">効果指定</label>
        <div class="col-sm-10">
          <select class="form-control" v-model="skillTypeSearchIndex">
            <option :value="-1">（なし）</option>
            <option
              v-for="(searchWordPair, index) in skillTypeSearchArray"
              :value="index"
              :key="`type_${index}`"
            >
              {{ searchWordPair[0] }}
            </option>
          </select>
        </div>
      </div>
    </form>

    <monster-filter-setting hide-name v-model="monsterFilterSetting" />

    <div><tweet-button /></div>
    <pagination item-count="11" :page="page" :page-count="pageCount" />
    
    <div class="row skillList" style="margin-bottom: 1rem;">
      <template v-for="(skill, n) in skillArrayInPage">
        <div v-if="skill.hit && (n === 0 || skill.isGroupHead)" class="col-md-12" :key="`skillHeader${n}`">
          <h3>{{ skill.hit }}</h3>
        </div>
        <div class="col-md-6" :key="`skillList${n}`">
          <div class="box">
            <div class="skillName">
              <router-link :to="{ name: detailsPageName, params: { no: skill.no }}">{{ skill.name }}</router-link>
              <span v-if="skill.baseTurn && skill.maxLevel" class="skillTurn">{{ (skill.baseTurn - skill.maxLevel + 1) }}ターン</span>
            </div>
            <div class="skillDescription">{{ skill.description }}</div>
            <ul class="list-inline monsterUsingSkillIcons">
              <li v-for="(monsterNo, m) in monsterNosUsingThisSkill(skill.no)" class="list-inline-item" :key="`hasMonster${m}`">
                <monster-icon v-if="imageTable" :no="monsterNo" :monster-table="monsterTable" :image-table="imageTable" width="2em" height="2em" />
                <span v-else-if="m == monsterIconCountMax">…</span>
              </li>
            </ul>
          </div>
        </div>
      </template>
    </div>

    <pagination item-count="11" :page="page" :page-count="pageCount" />
  </div>
</template>

<script>
import { escapeRegExp, toAimaiSearch } from '../mtpadmdb.js';
import { getFilterDefault, getFilterFunction } from '../components/monsterFilterSetting.vue';

/**
 * スキル一覧のコンポーネント。
 */
export default {
  name: 'PageSkillList',
  pageTitle: function () {
    const skillTypeSearch = this.skillTypeSearchArray[this.skillTypeSearchIndex];
    let typeName = '';
    if (skillTypeSearch) { typeName = ' ' + skillTypeSearch[0]; }

    if (!this.$route.query.searchWord) { return this.targetName + '一覧' + typeName; }
    return this.targetName + '検索' + typeName + ' ' + this.$route.query.searchWord;
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
  /** スキルタイプ検索情報。1つ目はスキル、2つ名はリーダースキル用。 */
  skillTypeSearchArrays: [
    [
      ['威嚇系', '/(\\d+ターン)遅/'],
      ['１体ブレス', '/敵1体に(.*倍)の.*攻撃。/'],
      ['全体ブレス', '/敵全体に(.*倍)の.*攻撃。/'],
      ['固定ダメージ', '/(敵.+?)の?固定/'],
      ['ヘイスト', '/味方スキルが(\\d+ターン)溜まる/'],
      ['陣（全ドロップ変化）', '/全ドロップを(.+?)に変化。/'],
      ['操作延長', '/操作(?:時間)[がを]?(.+?)。/'],
      ['CTW', '/[\\n。】](\\d+秒間)、時を止めて/'],
      ['バインド回復', '/バインド状態(?:と覚醒無効状態)?を(.*?回復)/'],
      ['覚醒無効状態回復', '/覚醒無効状態を(.*?回復)/'],
      ['タイプエンハ', '/の間、(.*タイプ)の攻撃力が[\\d.]+倍/'],
      ['属性エンハ', '/の間、(.*属性)の攻撃力が[\\d.]+倍/'],
      ['覚醒エンハ', '/の間、チーム内の(.+)の.*攻撃力/'],
      ['回復力エンハ', '/回復力.*?が.*?([\\d\\.]+倍)/'],
      ['吸収無効化', '/(\\d+ターンの間、.*吸収を無効化)/'],
      ['ダメージ無効貫通', '/(\\dターン)の間、ダメージ無効を貫通する/'],
      ['ロック', '/[\\n。】](.+?)をロック/'],
      ['ロック解除', 'ロック状態を解除'],
      ['ダメージ減', '/\\d+ターンの間、受ける(ダメージを[^、。]*)/'],
      ['横1列変換', '/横\\d+列を(.*ドロップ)に変化/'],
      ['縦1列変換', '/縦\\d+列を(.*ドロップ)に変化/'],
      ['正方形変換', '/正方形に(.+ドロップ)を/'],
      ['十字型変換', '/十字型に(.+ドロップ)を/'],
      ['L字型変換', '/L字型に(.+ドロップ)を/'],
      ['コンボ加算', '/(\\d+ターンの間、\\d+コンボ加算)される/'],
      ['落ちコンしなくなる', '/(\\d+ターン)の間、落ちコンしなくなる/']
    ],
    [
      ['無条件ダメージ軽減', '/[\\n。】](受けるダメージを.*?)[。、]/'],
      ['属性ダメージ軽減', '/[\\n。】](.*属性)の敵から受けるダメージを.*[。、]/'],
      ['条件付きダメージ軽減系', '/[\\n。】]([^\\nら]+ダメージ.*?減)/'],
      ['属性同時攻撃', '/[\\n。】](.*同時攻撃)/'],
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

      /** 使用するスキルタイプ検索情報のインデックス。 */
      skillTypeSearchIndex: -1,
      /** 特定条件を満たすモンスターが持つスキルのみを表示するためのモンスター条件のフィルタ。 */
      monsterFilterSetting: getFilterDefault()
    };
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
    /**
     * スキル番号をキーとして、スキルを持っているモンスター番号の配列を格納したオブジェクト。
     * モンスターに対する絞り込し指定がある場合は、その条件を満たすものだけを対象とする。
     */
    skillToMonsterNosTable: function () {
      const nosTable = (this.isLeaderSkill) ? this.$store.getters.leaderSkillToMonsterNosTable : this.$store.getters.skillToMonsterNosTable;
      const filterFunc = getFilterFunction(this.monsterFilterSetting);
      if (filterFunc.isAll) { return nosTable; }
      const filteredNosTable = {};
      for (const skillNo in nosTable) {
        const filteredNos = nosTable[skillNo].filter(monsterNo => filterFunc(this.monsterTable[monsterNo]));
        if (filteredNos.length) { filteredNosTable[skillNo] = filteredNos; }
      }
      return filteredNosTable;
    },
    /** 所持しているモンスターが存在するスキルテーブルの値を配列にしたもの。 */
    skillArray () {
      return Object.values(this.skillTable).filter((skill) => skill.no in this.skillToMonsterNosTable);
    },
    /** 検索条件を満たすデータの配列。 */
    searchedSkillArray () {
      let searchWord = this.$route.query.searchWord || '';
      const skillTypeSearch = this.skillTypeSearchArray[this.skillTypeSearchIndex];
      if (skillTypeSearch) {
        searchWord = skillTypeSearch[1] + ' ' + searchWord;
      }

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
        // それ以外はそのままの文字列として検索するため、正規表現用にエスケープしてからあいまい検索させる正規表現に変更する。
        return toAimaiSearch(escapeRegExp(word));
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
    /** スキルタイプ検索情報の配列。 */
    skillTypeSearchArray: function () {
      return this.$options.skillTypeSearchArrays[this.isLeaderSkill ? 1 : 0];
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
  watch: {
    '$route': [
      'updateSearchWordFromUrl',
      '$_mixinForPage_updateTitle'
    ],
    searchWord: 'search',
    skillTypeSearchIndex: 'changeSkillType'
  },
  created: function () {
    this.updateSearchWordFromUrl();
  },
  methods: {
    /** URLで指定された検索ワードで searchWord を更新する。 */
    updateSearchWordFromUrl: function () {
      this.searchWord = this.$route.query.searchWord;
      this.skillTypeSearchIndex = this.$route.query.skillType;
      if (this.skillTypeSearchIndex === undefined) { this.skillTypeSearchIndex = -1; }
    },
    /** searchWord の文字列を使用して検索を行う。 */
    search: function () {
      const query = Object.assign({}, this.$route.query, { searchWord: this.searchWord || undefined });
      this.$router.push({ path: this.$router.path, query: query });
    },
    /** skillTypeSearchIndex の値を元に表示するスキルタイプの種類を変更する。 */
    changeSkillType: function () {
      let skillType = this.skillTypeSearchIndex;
      // -1 の場合は 無し なので、非表示にするために undefined にする。
      if (skillType === -1) { skillType = undefined; }
      const query = Object.assign({}, this.$route.query, { skillType: skillType });
      this.$router.push({ path: this.$router.path, query: query });
    },
    /** このスキルを持つモンスターの番号の配列を取得する。 */
    monsterNosUsingThisSkill: function (no) {
      return (this.skillToMonsterNosTable[no] || []).slice().reverse();
    }
  }
};
</script>

<style lang="scss" scoped>
.skillList {
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

  .skillName {
    position: relative;

    .skillTurn {
      position: absolute;
      font-size: 80%;
      right: 0;
      bottom: 0;
    }
  }
}
</style>
