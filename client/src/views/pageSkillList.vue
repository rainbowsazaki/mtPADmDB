<template>
  <div>
    <h2>{{ targetName }}一覧</h2>

    <form @submit="$event.preventDefault();">
      <div class="input-group mb-3">
        <input type="text" class="form-control" :placeholder="targetName + '検索'" v-model="searchWord">
      </div>
      <div class="form-group row">
        <label for="Password" class="col-sm-2 col-form-label">効果指定</label>
        <div class="col-sm-10">
          <select class="form-control" v-model="skillType">
            <option value="（なし）">（なし）</option>
            <template v-for="(group, n) in skillTypeSearchArray">
              <optgroup :label="group.label" :key="`group${n}`">
                <option v-for="(setting, m) in group.settings" :value="setting[0]" :key="`setting${m}`">{{ setting[0] }}</option>
              </optgroup>
            </template>
          </select>
        </div>
      </div>
    </form>

    <monster-filter-setting hide-name v-model="monsterFilterSetting" />

    <div><tweet-button /></div>
    <pagination item-count="11" :page="page" :page-count="pageCount" />
    
    <div class="row skillList" :class="{ leaderSkill: isLeaderSkill }">
      <template v-for="(skill, n) in skillArrayInPage">
        <div v-if="skill.hit && (n === 0 || skill.isGroupHead)" class="col-md-12" :key="`skillHeader${n}`">
          <h3 class="decoHeader">{{ skill.hit }}</h3>
        </div>
        <div class="col-md-6" :key="`skillList${n}`">
          <div class="box">
            <div class="skillName">
              <router-link style="display: inline-block; width: 100%;" :to="{ name: detailsPageName, params: { no: skill.no }}">
                {{ skill.name }}
                <span v-if="skill.minTurn" class="skillTurn">{{ (skill.minTurn) }}ターン</span>
              </router-link>
            </div>
            <div class="skillDescription">
              <div class="stretch">{{ skill.description }}</div>
            </div>
            <ul class="list-inline monsterUsingSkillIcons">
              <li v-for="(monsterNo, m) in monsterNosUsingThisSkill(skill.no)" class="list-inline-item" :key="`hasMonster${m}`">
                <monster-icon v-if="m < monsterIconCountMax" :no="monsterNo" width="2em" height="2em" />
                <span v-else>…</span>
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
import { escapeRegExp, toAimaiSearch, stretchElement } from '../mtpadmdb.js';
import { getFilterDefault, getFilterFunction, filterSettingText } from '../components/monsterFilterSetting.vue';
import RouteQueryWrapper from '../components/mixins/routeQueryWrapper.js';

/**
 * スキル一覧のコンポーネント。
 */
export default {
  name: 'PageSkillList',
  pageTitle: function () { return this.pageTitle; },
  middleOfBreadcrumbs: function () {
    if (!this.searchWord) { return undefined; }
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
      {
        label: '攻撃',
        settings: [
          ['１体ダメージ', '/敵1体に(.*倍)の.*攻撃。/'],
          ['全体ダメージ', '/敵全体に(.*倍)の.*攻撃。/'],
          ['恨みダメージ', '/残りHPが少ないほど(.*?)。/'],
          ['固定ダメージ', '/(敵.+?)の?固定/'],
          ['割合ダメージ', '/敵のHPが(\\d+％)/'],
          ['最大HP割合ダメージ', '/敵の(最大HP\\d+％分)/']
        ]
      },
      {
        label: 'ドロップ変換',
        settings: [
          ['ドロップリフレッシュ', 'ランダムでドロップを入れ替える。'],
          ['陣（全ドロップ変化）', '/全ドロップを(.+?)に変化。/'],
          ['ランダム生成', '/ランダムで(.+?ドロップを\\d+個(:?ずつ))/'],
          ['確定陣', '/ランダムで(.+?ドロップを(:?10|15)個ずつ)生成/'],
          ['横1列変換', '/横\\d+列を(.*ドロップ)に変化/'],
          ['縦1列変換', '/縦\\d+列を(.*ドロップ)に変化/'],
          ['正方形変換', '/正方形に(.+ドロップ)を/'],
          ['十字型変換', '/十字型に(.+ドロップ)を/'],
          ['L字型変換', '/L字型に(.+ドロップ)を/'],
          ['外周変換', '/盤面外周を(.+ドロップ)/']
        ]
      },
      {
        label: '回復',
        settings: [
          ['HP回復', '/(HP.?(\\d+回復)|(最大HP\\d+％分)のHP回復|HP[^。]*(全回復))/'],
          ['HP自動回復', '/(\\d+ターンの間、最大HPの?\\d+％分)回復。/'],
          ['バインド状態回復', '/バインド[^。]*状態を(.*?回復)/'],
          ['覚醒無効状態回復', '/覚醒無効[^。]*状態を(.*?回復)/'],
          ['消せないドロップ状態回復', '/消せないドロップ[^。]*状態を(.*?回復)/']
        ]
      },
      {
        label: 'エンハンス',
        settings: [
          ['タイプエンハ', '/の間、(.*タイプ)の攻撃力が[\\d.]+倍/'],
          ['属性エンハ', '/の間、(.*属性)の攻撃力が[\\d.]+倍/'],
          ['覚醒エンハ', '/の間、チーム内の(.+)の.*攻撃力/'],
          ['回復力エンハ', '/回復力.*?が.*?([\\d\\.]+倍)/'],
          ['回復力減少', '/回復力.*?が(.+減|0)/']
        ]
      },
      {
        label: '自分対象補助',
        settings: [
          ['コンボ加算', '/[\\n。】](\\d+ターンの間、\\d+コンボ加算)/'],
          ['落ちコンしなくなる', '/[\\n。】](\\d+ターン)の間、落ちコンしなくなる/'],
          ['ドロップ強化', '/[\\n。】](.*?ドロップ)(の攻撃力)?を強化/'],
          ['ロック', '/[\\n。】](.+?)をロック/'],
          ['ロック解除', '/ロック(状態)?を解除/'],
          ['ダメージ減', '/\\d+ターンの間、受ける(ダメージを[^、。]*)/'],
          ['ダメージ無効化', '/(\\d+ターンの間、(受ける|.*属性の?)ダメージを無効化)/'],
          ['全体攻撃化', '/\\d+ターンの間、攻撃が全体攻撃に/'],
          ['自傷', '/(HPが.+)が、/'],
          ['ヘイスト', '/味方スキルが((ランダムで\\d+〜)?\\d+ターン)溜/'],
          ['操作延長', '/操作(?:時間)?[がを]?(.+?)。/'],
          ['CTW', '/[\\n。】](\\d+秒間)、時を止めて/'],
          ['反撃', '/攻撃を受けると(.属性で.*?反撃)/'],
          ['目覚め', '/(\\d+ターンの間、.*?ドロップが少し落ちやすくなる)。/'],
          ['強化ドロップが落ちてくる', '/(\\d+ターン)の間、強化ドロップが.+?落ちてくる/'],
          ['特定色のみ落ちてくる', '/(\\d+ターンの間、.*ドロップのみ)落ちてくる。/'],
          ['自属性変化', '/(\\d+ターンの間、自分の属性が.+?属性に変化)/'],
          ['リーダーチェンジ', 'リーダーと入れ替わ'],
          ['変身', 'に変身する']
        ]
      },
      {
        label: '敵対象補助',
        settings: [
          ['威嚇系', '/(\\d+ターン)遅/'],
          ['防御力減', '/敵の防御力が(.*?)(:?になる)?。/'],
          ['毒', '/を(.*?毒)にする/'],
          ['敵属性変化', '/敵全体が(.*属性に変化)。/'],
          ['吸収無効化', '/(\\d+ターンの間、.*吸収を無効化)/'],
          ['ダメージ無効貫通', '/(\\dターン)の間、ダメージ無効を貫通する/']
        ]
      }
    ],
    [
      {
        label: '条件',
        settings: [
          ['HP条件', '/HP(\\d+％以[上下]|満タン)/'],
          ['多色', '/[\\n。】](.*同時攻撃)/'],
          ['コンボ', '/[\\n。】](\\d*コンボ.*?)で/'],
          ['指定色コンボ', '/[\\n。】](.*の\\d*コンボ.*?)で/'],
          ['強化5個消し', '強化ドロップを含めて5個消'],
          ['ｎ個以上つなげて消す', '/[\\n。】]((.*を)?\\d+個以?上?)つなげ(:?る|て消す)と/'],
          ['十字消し', '/[\\n。】](.*十字消し)/'],
          ['L字消し', '/[\\n。】](.*L字消し)/'],
          ['回復条件', '/回復ドロップで(\\d+万?以上回復)すると/'],
          ['残りドロップ数', '/パズル後の残りドロップ数が(\\d+)個以下で/'],
          ['マルチプレイ強化', '/マルチプレイ時、(.*?)。/'],
          ['特定モンスター', '/チームに.*いると/'],
          ['サブ指定', '/チームのサブを(.*のみ)で組むと/']
        ]
      },
      {
        label: '軽減',
        settings: [
          ['無条件ダメージ軽減', '/[\\n。】](受けるダメージを.*?)[。、]/'],
          ['属性ダメージ軽減', '/[\\n。】](.*属性)の敵から受けるダメージを.*[。、]/'],
          ['条件付きダメージ軽減系', '/[\\n。】]([^\\nら]+ダメージ.*?減)/']
        ]
      },
      {
        label: '補助',
        settings: [
          ['操作時間延長', '/ドロップ操作(?:時間)?[\\D]*(\\d+.*?)。/'],
          ['追い打ち', '/(攻撃力×\\d+?倍)の追い打ち/'],
          ['固定追い打ち', '/(固定\\d+万?ダメージ)/'],
          ['自動回復', '/ドロップを消した時、(.*?)のHPを回復/'],
          ['コンボ加算', '/(\\dコンボ加算)/'],
          ['反撃', '/受けると、(.*反撃)/'],
          ['根性', 'ふんばることがある']
        ]
      },
      {
        label: 'リザルト変更',
        settings: [
          ['ランク経験値アップ', '/ランク経験値が(.+?)。/'],
          ['入手コインアップ', '/入手コインが(.+?)[、。]/'],
          ['タマゴドロップ率アップ', '/タマゴドロップ率が(.+?)[（。]/']
        ]
      },
      {
        label: 'ルール変更',
        settings: [
          ['操作時間固定', '/操作時間(\\d+秒)/'],
          ['7×6マス', '7×6マス'],
          ['落ちコンなし', '落ちコンなし'],
          ['ｎ個以下で消せない', '/ドロップを(.+?個以下で消せない)/']
        ]
      }
    ]
  ],
  mixins: [
    RouteQueryWrapper
  ],
  /** $route.query ラッパー設定 */
  queries: {
    /** 検索ワード。 */
    searchWord: {
      type: String
    },
    /** 使用するスキルタイプ名。 */
    skillType: {
      type: String,
      default: '（なし）'
    },
    /** 表示するページ。 */
    page: {
      type: Number,
      default: 1
    }
  },
  data: function () {
    return {
      /** リーダースキルの表示かどうか。 */
      isLeaderSkill: false,
      /** 検索設定が変更されたときに表示ページ指定をリセットするかどうか。 */
      pageResetFlag: false,
      /** １ページに表示するデータの個数。 */
      inPageCount: 50,
      /** 一覧上の一つのスキルに表示する、スキルを持っているモンスターの表示数上限。 */
      monsterIconCountMax: 10,

      /** 特定条件を満たすモンスターが持つスキルのみを表示するためのモンスター条件のフィルタ。 */
      monsterFilterSetting: getFilterDefault()
    };
  },
  computed: {
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
      const monsterTable = this.monsterTable;
      for (const skillNo in nosTable) {
        const filteredNos = nosTable[skillNo].filter(monsterNo => filterFunc(monsterTable[monsterNo]));
        if (filteredNos.length) { filteredNosTable[skillNo] = filteredNos; }
      }
      return filteredNosTable;
    },
    /** 所持しているモンスターが存在するスキルテーブルの値を配列にしたもの。 */
    skillArray () {
      const skillToMonsterNosTable = this.skillToMonsterNosTable;
      return Object.values(this.skillTable).filter((skill) => skill.no in skillToMonsterNosTable);
    },
    /** 使用するスキルタイプ検索情報。 */
    skillTypeSearchInfo: function () {
      const skillType = this.skillType;
      let result = null;
      if (skillType !== undefined) {
        this.skillTypeSearchArray.forEach(typeGroup => {
          if (result) { return; }
          result = typeGroup.settings.find(typeInfo => {
            return typeInfo[0] === skillType;
          });
        });
      }
      return result;
    },
    /** 検索条件を満たすデータの配列。 */
    searchedSkillArray () {
      let searchWord = this.searchWord || '';
      // スキルタイプ検索情報の追加。
      if (this.skillTypeSearchInfo) {
        searchWord = this.skillTypeSearchInfo[1] + ' ' + searchWord;
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
    /** 現在のページで表示するデータの配列。 */
    skillArrayInPage () {
      return this.searchedSkillArray.slice((this.page - 1) * this.inPageCount, this.page * this.inPageCount);
    },
    /** ページタイトル。 */
    pageTitle: function () {
      let typeName = '';
      if (this.skillTypeSearchInfo) { typeName = ' ' + this.skillTypeSearchInfo[0]; }

      let title;
      if (!this.searchWord) {
        title = this.targetName + '一覧' + typeName;
      } else {
        title = this.targetName + '検索' + typeName + ' ' + this.searchWord;
      }
      const fst = filterSettingText(this.monsterFilterSetting);
      if (fst) {
        title += ' 対象モンスター ' + fst;
      }
      return title;
    }
  },
  watch: {
    '$route': 'checkIsLeaderSkill',
    searchedSkillArray: 'resetPage',
    pageTitle: '$_mixinForPage_updateTitle'
  },
  created: function () {
    this.checkIsLeaderSkill();
    // created が終わって、その時点で予約？されている処理が終わったら、それ以降の絞り込み条件変更時にページリセットを行う。
    setTimeout(() => { this.pageResetFlag = true; }, 0);
  },
  updated: function () {
    this.stretch();
  },
  mounted: function () {
    this.stretch();
    window.addEventListener('resize', this.stretch);
  },
  beforeDestroy: function () {
    window.removeEventListener('resize', this.stretch);
  },
  methods: {
    /**
     * リーダースキルの表示かどうかを判定する。
     * computed を使用すると $route が変更されたときに dirty flag がセットされて、
     * これを利用している computed などがすべて再計算されて遅くなるので data に。
     */
    checkIsLeaderSkill: function () {
      this.isLeaderSkill = (this.$route.name === 'leaderSkillList');
    },
    /** 効果文を、領域の横幅に合わせて縮小する。 */
    stretch: function () {
      const elms = document.getElementsByClassName('stretch');
      for (const elm of elms) {
        stretchElement(elm);
      }
    },
    /** 先頭ページへ移動する。表示条件が変更されたときに呼び出す。 */
    resetPage: function () {
      if (this.pageResetFlag) { this.page = 1; }
    },
    /** このスキルを持つモンスターの番号の配列を取得する。 */
    monsterNosUsingThisSkill: function (no) {
      const ary = (this.skillToMonsterNosTable[no] || []).slice().reverse();
      if (ary.length > this.monsterIconCountMax) { ary.length = this.monsterIconCountMax + 1; }
      return ary;
    }
  }
};
</script>

<style lang="scss" scoped>
.skillList {
  margin-bottom: 1rem;

  .box {
    background: #B1AAAF;
    border-radius: 0.4em;
    margin-bottom: 3px;
  }
  .skillDescription {
    z-index: 2;
    position: relative;

    border: #9b733f 0.111em solid;
    border-top: none;
    border-radius: 0 0 0.4em 0.4em;
    
    font-size: 90%;
    min-height: 3.8em;
    white-space: pre;
    
    padding: 5.8px;
    box-shadow: 0 0 2px 0 rgba(0,0,0,0.4);
  }
  .monsterUsingSkillIcons {
    z-index: 1;
    position: relative;
    border: 1px solid black;
    border-radius: 0 0 0.4em 0.4em;
    min-height: 2.6rem;
    overflow: scroll;
    white-space: nowrap;
    margin: 0;
    margin-top: -10px;
    padding: 4.8px;
    padding-top: 14.8px;
  }

  h3 {
    font-size: 1.25rem;
    margin-top: 1rem;
  }

  .skillName {
    position: relative;
    background: #39180f;

    border: #9b733f 0.1em solid;
    border-bottom: none;
    border-radius: 0.4em 0.4em 0 0;
    padding: 4.8px;
    box-shadow: 0 0.2em 0.1em 0.03em rgba(0, 0, 0, 0.6) inset;

    .skillTurn {
      color: #ffffff;
      position: absolute;
      font-size: 80%;
      right: 4.8px;
      bottom: 4.8px;
    }
  }

  $skillBgColor: #B1AAAF;
  $leaderSkillBgColor: #d0cc82;
  $bgColorLigntnPercent: 15%;
  $borderDarkenPercent: 25%;

  .box {
    background: lighten($skillBgColor, $bgColorLigntnPercent);
  }
  .skillDescription {
    background: $skillBgColor;
  }
  .monsterUsingSkillIcons {
    border-color: darken($skillBgColor, $borderDarkenPercent);
  }
  .skillName a {
      color: #85bcfd;
  }

  &.leaderSkill {
    .box {
      background: lighten($leaderSkillBgColor, $bgColorLigntnPercent);
    }
    .skillDescription {
      background: $leaderSkillBgColor;
    }
    .monsterUsingSkillIcons {
      border-color: darken($leaderSkillBgColor, $borderDarkenPercent);
    }
    .skillName a {
        color: #82ff81;
    }
  }
}
</style>
