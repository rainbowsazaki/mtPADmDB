
/** 
 * モンスター同士の比較を行うページのコンポーネント。
 */
var componentCompare = {
  name: "pageCompare",
  pageTitle: function () {
    if (!this.isEnableMonsterDatas) { return 'モンスター比較'; }
    return 'モンスター比較 ' + this.targets.map(no => (this.monsterTable[no] || {}).name).join(',');
  },
  template: `
<div>
  <h2>モンスター情報比較</h2>
  <h3>比較対象指定</h3>
  <form @submit="$event.preventDefault(); updateCompareMonster();">
    <div class="row" style="margin-bottom: 4px;">
      <div class="col-md-12" v-for="(target, i) in targets">
        <monster-incremental-search v-model="targets[i]" :monster-table="monsterTable" :image-table="imageTable"></monster-incremental-search>
      </div>
    </div>
    <button type="submit" class="btn btn-primary">{{ isEnableMonsterDatas ? '比較表を更新する' : '比較表を表示する' }}</button>
  </form>

  <template v-if="isEnableMonsterDatas">

  <h3 style="margin-top: 1em;">比較表</h3>
  <div><tweet-button /></div>

  <div style="overflow: auto;">
    <table class="table table-bordered table-sm" style="table-layout: fixed;">
      <tr class="thead-light">
        <th style="width: 5em;"></th>
        <td v-for="data in monsterDatas" style="width: 4.3em;">
          <monster-icon :no="data.no" :monsterTable="monsterTable" :imageTable="imageTable" width="3em" height="3em" />
        </td>
      </tr>
      <tr class="thead-light">
        <th>名前</th>
        <td v-for="data in monsterDatas">{{data.name}}</td>
      </tr>
      <tr class="thead-light">
        <th>タイプ</th>
        <td v-for="data in monsterDatas">
          <span v-if="data.types[0] == null">不明</span>
          <span v-else>
            <img v-for="type in data.types" v-if="type !== 0 && type !== null" :src="\`./image/type/\${type}.png\`" alt="" style="width:1.5em; height: 1.5em;">
          </span>
        </td>
      </tr>
      <tr class="thead-light">
        <th>属性</th>
        <td v-for="data in monsterDatas">
          <span v-if="data.attributes[0] === null">不明</span>
          <img  v-for="attr in data.attributes" v-if="attr != 0 && attr !== null" style="width: 1.5em; height: 1.5em;" :src="\`./image/attribute/\${attr}.png\`">
        </td>
      </tr>

      <tr class="thead-light">
        <th>覚醒</th>
        <td v-for="data in monsterDatas">
        <span v-if="data.awakens[0] === 0">なし</span>
        <span v-else-if="data.awakens[0] === null">不明</span>
        <ul v-else style="list-style: none; margin: 0px; padding: 0px;">
          <li v-for="(count, awaken) in data.awakenObj" v-if="awaken != 0" class="text-nowrap">
            <img v-if="awaken !== 0" :src="'./image/awaken/' + awaken + '.png'" style="width: 1.5em; height: 1.5em;" :title="awakenTable[awaken].name + '\\n\\n' + awakenTable[awaken].description" />
            × {{count}}
          </li>
        </ul>
      </td>
      </tr>
      <tr class="thead-light" v-if="hasOverLimit">
        <th>超覚醒</th>
        <td v-for="data in monsterDatas">
          <span v-for="superAwaken in data.superAwakens">
            <img v-if="superAwaken !== null" :src="'./image/awaken/' + superAwaken + '.png'" style="width: 1.5em; height: 1.5em;" :title="awakenTable[superAwaken].name + '\\n\\n' + awakenTable[superAwaken].description" />
          </span>
        </td>
      </tr>
      <tr class="thead-light">
        <th>潜在キラー</th>
        <td v-for="data in monsterDatas">
          <span v-if="data.types[0] === null">不明</span>
          <ul v-else-if="getSenzaiKillerNos(data).length" style="list-style: none; margin: 0px; padding: 0px;">
            <li v-for="senzaiKillerType in getSenzaiKillerNos(data)" style="display: inline-block">
              <img :src="\`./image/senzaiKiller/\${senzaiKillerType}.png\`" :alt="\`\${typeTable[senzaiKillerType].name}キラー\`"style="width: auto; height: 1.5em;" />
            </li>
          </ul>
          <span v-else>なし</span>
        </td>
      </tr>
      
      <tr class="thead-light">
        <th>HP</th>
        <td v-for="data in monsterDatas" class="text-right">{{data.maxParam.hp | nullToUndefined | addComma }}</td>
      </tr>
      <tr class="thead-light">
        <th>攻撃</th>
        <td v-for="data in monsterDatas" class="text-right">{{data.maxParam.attack | nullToUndefined | addComma }}</td>
      </tr>
      <tr class="thead-light">
        <th>回復</th>
        <td v-for="data in monsterDatas" class="text-right">{{data.maxParam.recovery | nullToUndefined | addComma }}</td>
      </tr>
      <template v-if="hasOverLimit">
        <tr class="thead-light">
          <th :colspan="monsterDatas.length + 1">限界突破時</th>
        </tr>
        <tr class="thead-light">
          <th>HP</th>
          <td v-for="data in monsterDatas" class="text-right">
            <span v-if="data.overLimit">{{data.overLimitParam.hp | nullToUndefined | addComma }}</span>
            <span v-else>−</span>
          </td>
        </tr>
        <tr class="thead-light">
          <th>攻撃</th>
          <td v-for="data in monsterDatas" class="text-right">
            <span v-if="data.overLimit">{{data.overLimitParam.attack | nullToUndefined | addComma }}</span>
            <span v-else>−</span>
          </td>
        </tr>
        <tr class="thead-light">
          <th>回復</th>
          <td v-for="data in monsterDatas" class="text-right">
            <span v-if="data.overLimit">{{data.overLimitParam.recovery | nullToUndefined | addComma }}</span>
            <span v-else>−</span>
          </td>
        </tr>
      </template>
      <template v-if="hasWay || hasComboUp || hasSpComboUp || canA3x3Compare">
        <tr class="thead-light">
          <th :colspan="monsterDatas.length + 1">レベル最大 攻撃+99時 覚醒反映ダメージ （コンボ倍率除く）</th>
        </tr>
        <tr v-if="hasWay" class="thead-light">
          <th>4個消し</th>
          <td v-for="data in monsterDatas" class="text-right">{{ maxAttack(data) * eraseDropCountRate(4) *　wayAttackRate(data) | ceil | nullToUndefined | addComma}}</td>
        </tr>
        <tr v-if="hasLJi" class="thead-light">
          <th>L字消し</th>
          <td v-for="data in monsterDatas" class="text-right">{{ maxAttack(data) * eraseDropCountRate(5) *　lJiAttackRate(data) | ceil | nullToUndefined | addComma}}</td>
        </tr>
        <tr v-if="hasComboUp" class="thead-light">
          <th>3個消し 7コンボ</th>
          <td v-for="data in monsterDatas" class="text-right">{{ maxAttack(data) * eraseDropCountRate(3) *　comboUpAttackRate(data) | ceil | nullToUndefined | addComma}}</td>
        </tr>
        <tr v-if="hasSpComboUp" class="thead-light">
          <th>3個消し 10コンボ</th>
          <td v-for="data in monsterDatas" class="text-right">{{ maxAttack(data) * eraseDropCountRate(3) *　comboUpAttackRate(data) * spComboUpAttackRate(data) | ceil | nullToUndefined | addComma}}</td>
        </tr>
        <tr v-if="hasWay && hasComboUp" class="thead-light">
          <th>4個消し 7コンボ</th>
          <td v-for="data in monsterDatas" class="text-right">{{ maxAttack(data) * eraseDropCountRate(4) *　wayAttackRate(data) * comboUpAttackRate(data) | ceil | nullToUndefined | addComma}}</td>
        </tr>
        <tr v-if="hasWay && hasSpComboUp" class="thead-light">
          <th>4個消し 10コンボ</th>
          <td v-for="data in monsterDatas" class="text-right">{{ maxAttack(data) * eraseDropCountRate(4) *　wayAttackRate(data) * comboUpAttackRate(data) * spComboUpAttackRate(data) | ceil | nullToUndefined | addComma}}</td>
        </tr>
        <tr v-if="hasLJi && hasComboUp" class="thead-light">
          <th>L字消し 7コンボ</th>
          <td v-for="data in monsterDatas" class="text-right">{{ maxAttack(data) * eraseDropCountRate(5) *　lJiAttackRate(data) * comboUpAttackRate(data) | ceil | nullToUndefined | addComma}}</td>
        </tr>
        <tr v-if="hasLJi && hasSpComboUp" class="thead-light">
          <th>L字消し 10コンボ</th>
          <td v-for="data in monsterDatas" class="text-right">{{ maxAttack(data) * eraseDropCountRate(5) *　lJiAttackRate(data) * comboUpAttackRate(data) * spComboUpAttackRate(data) | ceil | nullToUndefined | addComma}}</td>
        </tr>
        <tr v-if="canA3x3Compare" class="thead-light">
          <th>無効貫通</th>
          <td v-for="data in monsterDatas" class="text-right">
            <span v-if="HasA3x3Awaken(data)">{{ maxAttack(data) * eraseDropCountRate(9) *　a3x3AttackRate(data) | ceil | nullToUndefined | addComma}}</span>
            <span v-else>−</span>
          </td>
        </tr>
        <tr v-if="canA3x3Compare && hasComboUp" class="thead-light">
          <th>無効貫通 7コンボ</th>
          <td v-for="data in monsterDatas" class="text-right">
            <span v-if="HasA3x3Awaken(data)">{{ maxAttack(data) * eraseDropCountRate(9) *　a3x3AttackRate(data) * comboUpAttackRate(data) | ceil | nullToUndefined | addComma}}</span>
            <span v-else>−</span>
          </td>
        </tr>
      </template>
      <template v-if="hasWay || canA3x3Compare">
        <tr class="thead-light">
          <th :colspan="monsterDatas.length + 1">レベル最大 攻撃+99時 覚醒反映複合消しダメージ （コンボ倍率除く）</th>
        </tr>
        <tr v-if="hasWay" class="thead-light">
          <th>4+3個消し</th>
          <td v-for="data in monsterDatas" class="text-right">{{ maxAttack(data) * (eraseDropCountRate(4) * wayAttackRate(data) + eraseDropCountRate(3)) | ceil | nullToUndefined | addComma}}</td>
        </tr>
        <tr v-if="hasWay && hasComboUp" class="thead-light">
          <th>4+3個消し 7コンボ</th>
          <td v-for="data in monsterDatas" class="text-right">{{ maxAttack(data) * (eraseDropCountRate(4) * wayAttackRate(data) + eraseDropCountRate(3)) * comboUpAttackRate(data) | ceil | nullToUndefined | addComma}}</td>
        </tr>
        <tr v-if="hasWay && hasSpComboUp" class="thead-light">
          <th>4+3個消し 10コンボ</th>
          <td v-for="data in monsterDatas" class="text-right">{{ maxAttack(data) * (eraseDropCountRate(4) * wayAttackRate(data) + eraseDropCountRate(3)) * comboUpAttackRate(data) * spComboUpAttackRate(data) | ceil | nullToUndefined | addComma}}</td>
        </tr>
        <tr v-if="canA3x3Compare" class="thead-light">
          <th>無効貫通+3個</th>
          <td v-for="data in monsterDatas" class="text-right">
            <span v-if="HasA3x3Awaken(data)">{{ maxAttack(data) * (eraseDropCountRate(9) * a3x3AttackRate(data) + eraseDropCountRate(3)) | ceil | nullToUndefined | addComma}}</span>
            <span v-else>−</span>
          </td>
        </tr>
        <tr v-if="canA3x3Compare && hasComboUp" class="thead-light">
          <th>無効貫通+3個 7コンボ</th>
            <td v-for="data in monsterDatas" class="text-right">
            <span v-if="HasA3x3Awaken(data)">{{ maxAttack(data) * (eraseDropCountRate(9) * a3x3AttackRate(data) + eraseDropCountRate(3)) * comboUpAttackRate(data) | ceil | nullToUndefined | addComma}}</span>
            <span v-else>−</span>
          </td>
        </tr>
      </template>
    </table>
  </div>

  <h4>スキル</h4>
  <table class="table table-bordered table-sm">
    <template v-for="data in monsterDatas">
      <tr class="thead-light">
        <th rowspan="2" style="width: 2em;"><monster-icon :no="data.no" :monsterTable="monsterTable" :imageTable="imageTable" width="2em" height="2em" /></th>
        <td v-if="data.skill == null">不明</td>
        <td v-else>
          {{skillTable[data.skill].name}}
          <span style="font-size: 80%; float:right;">(最短ターン:<span v-if="skillTable[data.skill].baseTurn && skillTable[data.skill].maxLevel">{{skillTable[data.skill].baseTurn - skillTable[data.skill].maxLevel + 1}}</span><span v-else>不明</span>)</span>
        </td>
      </tr>
      <tr v-if="data.skill"><td style="font-size: 90%; padding-left: 1em;">{{skillTable[data.skill].description}}</td></tr>
      <tr v-else><td></td></tr>
    </template>
  </table>

  <h4>リーダースキル</h4>
  <table class="table table-bordered table-sm">
    <template v-for="data in monsterDatas">
      <tr class="thead-light">
        <th rowspan="2" style="width: 2em;"><monster-icon :no="data.no" :monsterTable="monsterTable" :imageTable="imageTable" width="2em" height="2em" /></th>
        <td v-if="data.leaderSkill == null">不明</td>
        <td v-else>
          {{leaderSkillTable[data.leaderSkill].name}}
        </td>
      </tr>
      <tr v-if="data.leaderSkill"><td style="font-size: 90%; padding-left: 1em;">{{leaderSkillTable[data.leaderSkill].description}}</td></tr>
      <tr v-else><td></td></tr>
    </template>
  </table>

  </template>
</div>`,
  data: function () {
    return {
      monsterDatas: [],

      targets: [0, 0],
    };
  }, 
  created: function () { this.load(); },
  watch: {
    "$route": function () { this.load(); },
    monsterTable: "$_mixinForPage_updateTitle",
    isEnableMonsterDatas: "$_mixinForPage_updateTitle",
  },

  filters: {
    /** 少数点以下を切り上げるフィルタ */
    ceil: Math.ceil,
    /** パラメータが null の場合に 不明 と表示するためのフィルタ */
    nullToUndefined: function (val) {
      return (val === null || isNaN(val)) ? '不明' : val;
    }
  },

  computed: {
    monsterTable () { return this.$store.state.monsterTable; },
    skillTable () { return this.$store.state.skillTable; },
    leaderSkillTable () { return this.$store.state.leaderSkillTable; },
    imageTable() { return this.$store.state.imageTable; },
    booleanTable() { return constData.booleanTable; },
    typeTable () { return constData.typeTable; },
    awakenTable () { return constData.awakenTable; },

    /** モンスター情報がすべて存在しているかどうかを取得する。 */
    isEnableMonsterDatas: function () {
      return (this.monsterDatas.length > 0 && this.monsterDatas.indexOf(null) == -1);
    },
    /** 限界突破可能なモンスターがいるかどうかを取得する。 */
    hasOverLimit: function () {
      return this.monsterDatas.find((o) => o.overLimit == 1);
    },

    /** 比較対象の中に２体攻撃を持つモンスターがいるかどうかを取得する。 */
    hasWay: function () {
      return this.HasAwakenMonster(27);
    },
    /** 比較対象の中にL字攻撃を持つモンスターがいるかどうかを取得する。 */
    hasLJi: function () {
      return this.HasAwakenMonster(60);
    },
    /** 比較対象の中にコンボ強化を持つモンスターがいるかどうかを取得する。 */
    hasComboUp: function () {
      return this.HasAwakenMonster(43);
    },
    /** 比較対象の中に超コンボ強化を持つモンスターがいるかどうかを取得する。 */
    hasSpComboUp: function () {
      return this.HasAwakenMonster(61);
    },
    /** 比較対象の中にダメージ無効貫通を持つモンスターがいるかどうかを取得する。 */
    hasA3x3: function () {
      return this.HasAwakenMonster(48);
    },
    /** 比較対象の中にダメージ無効貫通を持つモンスターが２体以上いて比較可能かどうかを取得する。 */
    canA3x3Compare: function () {
      return this.GetAwakenMonsterCount(48) >= 2;
    }
  },

  methods: {
    /** 比較表示するモンスターを現在している番号のものに変更する。 */
    updateCompareMonster: function () {
      if (!this.targets[0] || !this.targets[1]) {
        this.$store.commit('setErrors', [ '対象モンスターが正しく指定されていません。' ]);
        return;
      }
      this.$router.push({ name: 'compare', params: { nos: this.targets.join(',') }});
    },

    load: function () {
      this.targets = (this.$route.params.nos || '').split(/,/g);
      if (this.targets.length < 2) { this.targets.length = 2; }
      this.monsterDatas = [];
      if (this.$route.params.nos) {
        for (var i = 0; i < this.targets.length; i++) {
          this._load(i, this.targets[i]);
        }
      }
      this.$_mixinForPage_updateTitle();
    },

    _load: function (index, monsterNo) {
      var path = `./monsterJson/${monsterNo}.json`;

      Vue.set(this.monsterDatas, index, null);
      this.$store.commit('setMessages', [ 'モンスター情報取得中' ]);
      axios.get(path).then(
        response => {
          var data = $.extend(true, {}, constData.monsterClearData, response.data);
          if (!data.superAwakens) { data.superAwakens = []; }

          data.awakenObj = {};
          for (var awaken of data.awakens) {
            data.awakenObj[awaken] = (data.awakenObj[awaken] || 0) + 1;
          }
          Vue.set(this.monsterDatas, index, data);
          this.$store.commit('clearMessages');
        }
      ).catch(
        error => {
          var errorMessage = `モンスター No.${monsterNo} の情報が見つかりませんでした。`;
          this.$store.commit('clearMessages');
          this.$store.commit('setErrors', [ errorMessage ]);
        }
      );
    },

    getSenzaiKillerNos: function (monsterData) {
      // 合成できないものは潜在覚醒を降ることができないので無し。
      if (!this.canAddPlus(monsterData)) { return [] }
      var killerNoSet = new Set();
      for (var type of monsterData.types) {
        for (var killerNo of this.typeTable[type].senzaiKiller) {
          killerNoSet.add(killerNo);
        }
      }
      return Array.from(killerNoSet).filter(a => a < 9).sort(((a, b) => a - b ));
    },

    /** プラスが振れるキャラクターかどうかを返す。 */
    canAddPlus: function (monsterData) {
      // 素材系のタイプの場合はプラス合成不可と判断する。
      // レベルアップの可能なキャラの場合はプラスを降ることも可能だが需要もないだろうから無視。
      var type = monsterData.types[0];
      return !((type >= 9 && type <= 12) || type == 99);
    },

    /** 比較対象の中に指定された覚醒を持つモンスターが何体いるかを取得する。 */
    GetAwakenMonsterCount: function (awakenNo) {
      return this.monsterDatas.filter((o) => o.awakenObj[awakenNo] > 0).length;
    },
    /** 比較対象の中に指定された覚醒を持つモンスターがいるかどうかを取得する。 */
    HasAwakenMonster: function (awakenNo) {
      return this.monsterDatas.find((o) => o.awakenObj[awakenNo] > 0);
    },

    /** 指定されたモンスターデータがダメージ無効貫通を持っているかどうかを取得する。 */
    HasA3x3Awaken: function (monsterData) {
      return monsterData.awakenObj[48] > 0;
    },

    /** 指定されたモンスターデータの、レベル最大・攻撃+99・攻撃強化覚醒 時の攻撃力を取得する。 */
    maxAttack: function (monsterData) {
      if (monsterData.maxParam.attack == null) { return NaN; }
      return monsterData.maxParam.attack + 495 + (monsterData.awakenObj[2] || 0) * this.awakenTable[2].value;
    },
    /** 削除個数に応じてかかるダメージのレート */
    eraseDropCountRate: function (count) {
      return (count + 1) * 0.25;
    },
    /** 指定されたモンスターデータの、指定された覚醒発動時のレートを算出する。 */
    culcKakuseiRate: function (monsterData, awakenNo) {
      return Math.pow(this.awakenTable[awakenNo].rate, monsterData.awakenObj[awakenNo] | 0);
    },
    /** 指定されたモンスターデータの、２体攻撃発動時の攻撃力レートを取得する。 */
    wayAttackRate: function (monsterData) {
      return this.culcKakuseiRate(monsterData, 27);
    },
    /** 指定されたモンスターデータの、L字攻撃発動時の攻撃力レートを取得する。 */
    lJiAttackRate: function (monsterData) {
      return this.culcKakuseiRate(monsterData, 60);
    },
    /** 指定されたモンスターデータの、コンボ強化発動時の攻撃力レートを取得する。 */
    comboUpAttackRate: function (monsterData) {
      return this.culcKakuseiRate(monsterData, 43);
    },
    /** 指定されたモンスターデータの、超コンボ強化発動時の攻撃力レートを取得する。 */
    spComboUpAttackRate: function (monsterData) {
      return this.culcKakuseiRate(monsterData, 61);
    },
    /** 指定されたモンスターデータの、ダメージ無効貫通発動時の攻撃力レートを取得する。 */
    a3x3AttackRate: function (monsterData) {
      return this.culcKakuseiRate(monsterData, 48);
    },
  }
};

