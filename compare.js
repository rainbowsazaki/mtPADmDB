
/** 
 * モンスター同士の比較を行うページのコンポーネント。
 */
var componentCompare = {
  name: "pageCompare",
  pageTitle: function () { return 'モンスター情報比較' },
  template: `
<div>
  <h2>モンスター情報比較</h2>
  <h3>比較対象指定</h3>
  <div class="row">
    <div class="col-md-6" v-for="n in 2">
      <monster-incremental-search v-model="targets[n - 1]" :monster-table="monsterTable" :image-table="imageTable"></monster-incremental-search>
    </div>
  </div>
  <button class="btn btn-primary" @click="updateCompareMonster">比較対象を更新する。</button>

  <template v-if="isEnableMonsterDatas">
  <h3>比較表</h3>
  <table class="table table-bordered table-sm">
    <tr class="thead-light">
      <th></th>
      <td v-for="data in monsterDatas" style="width: 40%;">
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
        <span v-else v-for="type in data.types" v-if="type !== 0">
          <img v-if="type !== null" :src="\`./image/type/\${type}.png\`" alt="" style="width:1.5em; height: 1.5em;">
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
        <li v-for="awaken in data.awakens">
          <img v-if="awaken !== 0" :src="'./image/awaken/' + awaken + '.png'" style="width: 1.5em; height: 1.5em;" :title="awakenTable[awaken].name + '\\n\\n' + awakenTable[awaken].description" />
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
      <td v-for="data in monsterDatas" class="text-right">{{data.maxParam.hp | nullToUndefined}}</td>
    </tr>
    <tr class="thead-light">
      <th>攻撃</th>
      <td v-for="data in monsterDatas" class="text-right">{{data.maxParam.attack | nullToUndefined}}</td>
    </tr>
    <tr class="thead-light">
      <th>回復</th>
      <td v-for="data in monsterDatas" class="text-right">{{data.maxParam.recovery | nullToUndefined}}</td>
    </tr>
    <template v-if="hasOverLimit">
      <tr class="thead-light">
        <th :colspan="monsterDatas.length + 1">限界突破時</th>
      </tr>
      <tr class="thead-light">
        <th>HP</th>
        <td v-for="data in monsterDatas" class="text-right">{{data.overLimitParam.hp | nullToUndefined}}</td>
      </tr>
      <tr class="thead-light">
        <th>攻撃</th>
        <td v-for="data in monsterDatas" class="text-right">{{data.overLimitParam.attack | nullToUndefined}}</td>
      </tr>
      <tr class="thead-light">
        <th>回復</th>
        <td v-for="data in monsterDatas" class="text-right">{{data.overLimitParam.recovery | nullToUndefined}}</td>
      </tr>
    </template>
  </table>
  </template>

  <h4>スキル</h4>
  <table class="table table-bordered table-sm">
    <template v-for="data in monsterDatas">
      <tr class="thead-light">
        <th rowspan="2" style="width: 3em;"><monster-icon :no="data.no" :monsterTable="monsterTable" :imageTable="imageTable" width="3em" height="3em" /></th>
        <td v-if="data.skill == null">不明</td>
        <td v-else>
          {{skillTable[data.skill].name}}
          <span style="font-size: 80%; float:right;">(最短ターン:<span v-if="skillTable[data.skill].baseTurn && skillTable[data.skill].maxLevel">{{skillTable[data.skill].baseTurn - skillTable[data.skill].maxLevel + 1}}</span><span v-else>不明</span>)</span>
        </td>
      </tr>
      <tr v-if="data.skill"><td style="font-size: 90%; padding-left: 1em; white-space: pre;">{{skillTable[data.skill].description}}</td></tr>
      <tr v-else><td></td></tr>
    </template>
  </table>

  <h4>リーダースキル</h4>
  <table class="table table-bordered table-sm">
    <template v-for="data in monsterDatas">
      <tr class="thead-light">
        <th rowspan="2" style="width: 3em;"><monster-icon :no="data.no" :monsterTable="monsterTable" :imageTable="imageTable" width="3em" height="3em" /></th>
        <td v-if="data.leaderSkill == null">不明</td>
        <td v-else>
          {{leaderSkillTable[data.leaderSkill].name}}
        </td>
      </tr>
      <tr v-if="data.leaderSkill"><td style="font-size: 90%; padding-left: 1em; white-space: pre;">{{leaderSkillTable[data.leaderSkill].description}}</td></tr>
      <tr v-else><td></td></tr>
    </template>
  </table>
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
  },

  filters: {
    /** パラメータが null の場合に 不明 と表示するためのフィルタ */
    nullToUndefined: function (val) {
      return (val === null) ? '不明' : val;
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
      return (this.monsterDatas.indexOf(null) == -1);
    },
    /** 限界突破可能なモンスターがいるかどうかを取得する。 */
    hasOverLimit: function () {
      return this.monsterDatas.find((o) => o.overLimit == 1);
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
      this.monsterDatas = [];
      if (this.$route.params.nos) {
        for (var i = 0; i < this.targets.length; i++) {
          this._load(i, this.targets[i]);
        }
      }
    },

    _load: function (index, monsterNo) {
      var path = `./monsterJson/${monsterNo}.json`;

      this.$store.commit('setMessages', [ 'モンスター情報取得中' ]);
      axios.get(path).then(
        response => {
          var data = $.extend(true, {}, constData.monsterClearData, response.data);
          if (!data.superAwakens) { data.superAwakens = []; }
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
      if (!this.canAddPlus) { return [] }
      var killerNoSet = new Set();
      for (var type of monsterData.types) {
        for (var killerNo of this.typeTable[type].senzaiKiller) {
          killerNoSet.add(killerNo);
        }
      }
      return Array.from(killerNoSet).sort(((a, b) => a - b ));

    },
  }
};


