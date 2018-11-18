<template>

  <div>
    <p>※文字を入力するところで値が不明の場合は空欄にしておいてください。</p>
    <form onsubmit="return false;" @submit="submit">
      <table class="table table-bordered table-sm">
        <tr>
          <td colspan="12">
            <div class="form-row">
              <div class="form-group col-md-4">
                <div class="input-group">
                  <div class="input-group-prepend">
                    <span class="input-group-text">No.</span>
                  </div>
                  <input type="number" class="form-control" id="inputNo" v-model.number="monsterData.no" required min="1" max="9999">
                </div>
              </div>
              <div class="form-group col-md-8">
                <input type="text" class="form-control" id="inputMonsterName" placeholder="モンスター名" v-model="monsterData.name" required minLength="1" maxLength="50">
              </div>
            </div>
          </td>
        </tr>
        <tr class="thead-light"><th colspan="12">タイプ</th></tr>
        <tr>
          <td v-for="n in 3" colspan="4" :key="n">
            <select class="custom-select" :id="'selectType' + n" v-model.number="monsterData.types[n - 1]">
              <option v-for="(type, key) in typeTable" :disabled="key === ((n === 1) ? '0' : 'null')" :value="key" :key="key" v-once>{{type.name}}</option>
            </select>
          </td>
        </tr>
        <tr class="thead-light">
          <th colspan="3">属性</th>
          <th colspan="3">複属性</th>
          <th colspan="3">レア</th>
          <th colspan="3">コスト</th>
        </tr>
        <tr>
            <td colspan="3">
                <select class="custom-select" id="selectAttribute0" v-model.number="monsterData.attributes[0]">
                  <option v-for="(attribute, key) in attributeTable" :disabled="key === '0'" :value="key" :key="key" v-once>{{attribute}}</option>
                </select></td>
            <td colspan="3">
                <select class="custom-select" id="selectAttribute1" v-model.number="monsterData.attributes[1]">
                  <option v-for="(attribute, key) in attributeTable" :disabled="key === 'null'" :value="key" :key="key" v-once>{{attribute}}</option>
                </select></td>
            <td colspan="3">
              <div class="input-group">
                <div class="input-group-prepend">
                  <span class="input-group-text" style="padding: 0.375rem; font-size: 80%;">★</span>
                </div>
                <input type="number" class="form-control" id="inputRare" v-model.number="monsterData.rare" min="1" max="99">
              </div>
            </td>
            <td colspan="3">
              <input type="number" class="form-control" id="inputCost" v-model.number="monsterData.cost" min="1" max="999">
            </td>
        </tr>
        <tr class="thead-light">
          <th colspan="4">最大レベル</th>
          <th colspan="4">最大レベルに必要な経験値</th>
          <th colspan="4">アシスト</th>
        </tr>
        <tr>
          <td colspan="4">
            <div class="input-group">
              <div class="input-group-prepend">
                <span class="input-group-text">Lv.</span>
              </div>
              <input type="number" class="form-control" id="inputMaxLevel" v-model.number="monsterData.maxLevel" min="1" max="99">
            </div>
          </td>
          <td colspan="4">
            <input type="number" class="form-control" id="inputMaxExp" v-model.number="monsterData.maxExp" min="0" max="999999999">
          </td>
          <td colspan="4">
            <select class="custom-select" id="selectAssist" v-model.number="monsterData.assist">
              <option v-for="(type, key) in booleanTable" :value="key" :key="key" v-once>{{type}}</option>
            </select>
          </td>
        </tr>
        <tr class="thead-light">
          <th colspan="12">覚醒</th>
        </tr>
        <tr v-for="n in 9" :key="n">
          <td colspan="12">
            <pd-select v-model.number="monsterData.awakens[n - 1]" :id="`selectAwaken${n}`">
              <template v-for="(awaken, key) in awakenTable" :key="key" v-once>
              <pd-option v-if="n === 1 || key !== 'null'" :value="key" v-once><img :src="(key === '0' || key === 'null') ? undefined : `./image/awaken/${key}.png`" width="24" height="24" v-once /> {{awaken.name}}</pd-option>
              </template>
            </pd-select>
          </td>
        </tr>
        <tr class="thead-light">
          <th colspan="12">レベル最大時パラメータ</th>
        </tr>
        <tr>
          <th colspan="4">HP</th>
          <td colspan="8">
            <input type="number" class="form-control" id="inputMaxHp" v-model.number="monsterData.maxParam.hp" min="1" max="99999">
          </td>
        </tr>
        <tr>
          <th colspan="4">攻撃</th>
          <td colspan="8">
            <input type="number" class="form-control" id="inputMaxAttack" v-model.number="monsterData.maxParam.attack" min="1" max="99999">
          </td>
        </tr>
        <tr>
          <th colspan="4">回復</th>
          <td colspan="8">
            <input type="number" class="form-control" id="inputMaxRecovery" v-model.number="monsterData.maxParam.recovery" min="-9999" max="99999">
          </td>
        </tr>
        <tr class="thead-light">
          <th colspan="12">スキル</th>
        </tr>
        <tr>
          <th colspan="12">名称</th>
        </tr>
        <tr>
          <td colspan="12">
            <skill-incremental-input id="inputSkillName" placeholder="スキル名" @select-no="monsterData.skill = $event;" v-model="skillName" :skill-table="skillTable" :required="skillDescription.length > 0"></skill-incremental-input>
          </td>
        </tr>
        <tr>
          <th colspan="4">SLv1時ターン</th>
          <th colspan="4">最大SLv</th>
          <th colspan="4">最短ターン</th>
        </tr>
        <tr>
          <td colspan="4">
            <input type="number" class="form-control" id="inputSkillBaseTurn" v-model.number="skillBaseTurn" min="1" max="199">
          </td>
          <td colspan="4">
            <div class="input-group">
              <div class="input-group-prepend">
                <span class="input-group-text">SLv.</span>
              </div>
              <input type="number" class="form-control" id="inputSkillMaxLevel" v-model.number="skillMaxLevel" min="1" max="99">
            </div>
          </td>
          <td colspan="4">{{(minimumSkillTurn) ? minimumSkillTurn + 'ターン' : '-' }}</td>
        </tr>
        <tr>
          <th colspan="12">説明</th>
        </tr>
        <tr>
          <td colspan="12">
            <textarea class="form-control" id="textareaSkillDescription" rows="2" v-model="skillDescription" maxLength="200"></textarea>
          </td>
        </tr>
        <tr class="thead-light">
          <th colspan="12">リーダースキル</th>
        </tr>
        <tr>
          <th colspan="12">名称</th>
        </tr>
        <tr>
          <td colspan="12">
            <skill-incremental-input id="inputLeaderSkillname" placeholder="リーダースキル名" @select-no="monsterData.leaderSkill = $event;" v-model="leaderSkillName" :skill-table="leaderSkillTable" :required="leaderSkillDescription.length > 0"></skill-incremental-input>
          </td>
        </tr>
        <tr class="">
          <th colspan="12">説明</th>
        </tr>
        <tr>
          <td colspan="12">
            <textarea class="form-control" id="textareaLeaderSkillDescription" rows="2" v-model="leaderSkillDescription" maxLength="200"></textarea>
          </td>
        </tr>
        <tr class="thead-light">
          <th colspan="12">限界突破</th>
        </tr>
        <tr>
          <td colspan="12">
            <select class="custom-select" id="selectOverLimit" v-model.number="monsterData.overLimit">
              <option v-for="(type, key) in booleanTable" :value="key" :key="key" v-once>{{type}}</option>
            </select>
          </td>
        </tr>
        <template v-if="monsterData.overLimit === 1">
          <tr class="thead-light">
            <th colspan="12">限界突破時パラメータ</th>
          </tr>
          <tr>
            <th colspan="4">HP</th>
            <td colspan="8">
              <input type="number" class="form-control" id="inputOverLimitHp" v-model.number="monsterData.overLimitParam.hp" min="1" max="99999">
            </td>
          </tr>
          <tr>
            <th colspan="4">攻撃</th>
            <td colspan="8">
              <input type="number" class="form-control" id="inputOverLimitAttack" v-model.number="monsterData.overLimitParam.attack" min="1" max="99999">
            </td>
          </tr>
          <tr>
            <th colspan="4">回復</th>
            <td colspan="8">
              <input type="number" class="form-control" id="inputOverLimitRecovery" v-model.number="monsterData.overLimitParam.recovery" min="-9999" max="99999">
            </td>
          </tr>
          <tr class="thead-light">
            <th colspan="12">超覚醒</th>
          </tr>
          <tr>
            <td colspan="12">
              <span class="col-md-12 form-check" style="display:inline-block;" >
                <input class="form-check-input" type="checkbox" :value="null" v-model="monsterData.superAwakens" id="superAwakenNull">
                <label class="form-check-label" for="superAwakenNull">
                  不明
                </label>
              </span>
              <span v-for="(awaken, key) in awakenTable" v-if="key !== '0' && key !== 'null'" class="col-md-3 form-check" style="display:inline-block;" :key="key">
                <input class="form-check-input" type="checkbox" :value="key" v-model.number="monsterData.superAwakens" :id="'superAwaken' + key" :disabled="isUnknownSuperAwaken">
                <label class="form-check-label" :for="'superAwaken' + key">
                  <img v-if="key !== 'null'" :src="'./image/awaken/' + key + '.png'" width="24" height="24" />{{awaken.name}}
                </label>
              </span>
            </td>
          </tr>
        </template>
        <tr class="thead-light">
          <th colspan="12">このモンスターへの進化形式</th>
        </tr>
        <tr>
          <td colspan="12"> 
            <select class="custom-select" id="evolutionType" v-model.number="monsterData.evolutionType">
              <option v-for="(type, key) in evolutionTypeTable" :value="key" :key="key" v-once>{{type}}</option>
            </select>
          </td>
        </tr>
        <template v-if="monsterData.evolutionType !== 0 && monsterData.evolutionType !== null && monsterData.evolutionType !== 'null'">
          <tr class="thead-light">
            <th colspan="12">進化前キャラ</th>
          </tr>
          <tr>
            <td colspan="12">
              <monster-incremental-search id="inputEvolutionBaseNo" v-model.number="monsterData.evolution.baseNo" :monster-table="monsterTable" :image-table="imageTable"></monster-incremental-search>
            </td>
          </tr>
          <tr class="thead-light">
            <th colspan="12">素材</th>
          </tr>
          <tr v-for="n in 5">
            <td colspan="12">
              <monster-incremental-search :id="`inputEvolutionMaterial${n}`" v-model.number="monsterData.evolution.materials[n - 1]" :monster-table="monsterTable" :image-table="imageTable" :key="n"></monster-incremental-search>
            </td>
          </tr>
        </template>
        <tr class="thead-light">
          <th colspan="12">編集コメント（任意）</th>
        </tr>
        <tr>
          <td colspan="12">
            編集理由などを書いてください。（例：パラメータの更新）
            <textarea class="form-control" id="textareaComment" rows="3" v-model="monsterData.comment" minLength="0" maxLength="1000"></textarea>
          </td>
        </tr>
        <tr>
          <td v-for="n in 12" style="width:8.33333%; padding: 0; border: none;"></td>
        </tr>    
      </table>  
      <button type="submit" class="btn btn-primary" :disabled="isSubmitted">{{isSubmitted ? '送信中' :'送信する'}}</button>
    </form>
  </div>
</template>

<script>
/**
 * モンスター情報編集ページコンポーネント
 */
export default {
  name: 'pageMonsterEdit',
  pageTitle: function () {
    if (this.isHistory) { return '履歴をもとに編集'; }
    if (this.$route.params.no) {
      return `編集 No.${this.$route.params.no} ${this.monsterData.name}`;
    } else {
      return '新規登録';
    }
  },
  middleOfBreadcrumbs: function () {
    if (this.isHistory) {
      return {
        text: `No.${this.monsterData.no} ${this.monsterData.name} (${this.monsterData.datetime})`,
        link: `/history/${this.$route.params.id}`
      };
    } else if (this.$route.params.no) {
      return {
        text: `No.${this.$route.params.no} ${this.monsterData.name}`,
        link: `/${this.$route.params.no}`
      };
    } else {
      return undefined;
    }
  },
  props: ['no'],
  data: function () {
    return {
      booleanTable: constData.booleanTable,
      typeTable: constData.typeTable,
      attributeTable: constData.attributeTable,
      evolutionTypeTable: constData.evolutionTypeTable,
      awakenTable: constData.awakenTable,

      monsterData: {},
      /** 送信済みかどうか。 */
      isSubmitted: false
    };
  },

  created: function () {
    this.fetchData();
    window._inputFromJson = (json) => { this.inputFromJson(json); };
  },

  destroyed: function () {
    delete window._inputFromJson;
  },

  watch: {
    '$route.params.no': function () {
      this.fetchData();
    }
  },

  computed: {
    monsterTable: function () { return this.$store.state.monsterTable; },
    skillTable: function () { return this.$store.state.skillTable; },
    leaderSkillTable: function () { return this.$store.state.leaderSkillTable; },
    imageTable: function () { return this.$store.state.imageTable; },

    /** スキルレベル最大時の（最短の）スキルターン */
    minimumSkillTurn: function () {
      if (!this.skillDetails.baseTurn || !this.skillDetails.maxLevel) { return NaN; }
      const turn = this.skillDetails.baseTurn - this.skillDetails.maxLevel + 1;
      if (turn < 0) { return NaN; }
      return turn;
    },

    skillDetails: function () {
      if (this.monsterData.skill !== 0) {
        this.monsterData.skillDetails = $.extend(true, { name: '', description: '' }, this.skillTable[this.monsterData.skill]);
      }
      return this.monsterData.skillDetails;
    },

    skillName: {
      get: function () { return this.skillDetails.name; },
      set: function (value) {
        this.skillDetails.name = value;
        this.monsterData.skill = 0;
      }
    },
    skillBaseTurn: {
      get: function () { return this.skillDetails.baseTurn; },
      set: function (value) {
        this.skillDetails.baseTurn = value;
        this.monsterData.skill = 0;
      }
    },
    skillMaxLevel: {
      get: function () { return this.skillDetails.maxLevel; },
      set: function (value) {
        this.skillDetails.maxLevel = value;
        this.monsterData.skill = 0;
      }
    },
    skillDescription: {
      get: function () { return this.skillDetails.description; },
      set: function (value) {
        this.skillDetails.description = value;
        this.monsterData.skill = 0;
      }
    },

    leaderSkillDetails: function () {
      if (this.monsterData.leaderSkill !== 0) {
        this.monsterData.leaderSkillDetails = $.extend(true, { name: '', description: '' }, this.leaderSkillTable[this.monsterData.leaderSkill]);
      }
      return this.monsterData.leaderSkillDetails;
    },

    leaderSkillName: {
      get: function () { return this.leaderSkillDetails.name; },
      set: function (value) {
        this.leaderSkillDetails.name = value;
        this.monsterData.leaderSkill = 0;
      }
    },
    leaderSkillDescription: {
      get: function () { return this.leaderSkillDetails.description; },
      set: function (value) {
        this.leaderSkillDetails.description = value;
        this.monsterData.leaderSkill = 0;
      }
    },

    /** 編集履歴を元データとした編集かどうか。 */
    isHistory: function () {
      return (this.$route.name === 'historyEdit');
    },

    /** 超覚醒が 不明 かどうか */
    isUnknownSuperAwaken: function () {
      return this.monsterData.superAwakens.indexOf(null) !== -1;
    }
  },
  
  methods: {
    /** 指定されたJSONテキストをもとに情報を設定する。 */
    inputFromJson: function (json) {
      this.monsterData = jQuery.extend(true, {}, this.monsterData, JSON.parse(json));
      this.monsterData.comment = '新規登録';
    },
    fetchData: function () {
      this.monsterData = jQuery.extend(true, {}, constData.monsterClearData);
      this.$_mixinForPage_updateTitle();

      let commitParam = null;
      if (this.isHistory) {
        commitParam = { historyId: this.$route.params.id };
      }
      if (this.$route.params.no) {
        commitParam = { no: this.$route.params.no };
      }
      if (commitParam) {
        commitParam.callback = () => {
          const m = $.extend(true, {}, this.$store.state.monsterData);
          m.leaderSkillDetails = $.extend(true, m.leaderSkillDetails, this.leaderSkillTable[m.skill]);
          m.skillDetails = $.extend(true, m.skillDetails, this.skillTable[m.leaderSkill]);
          m.comment = '';

          this.monsterData = m;
          this.$_mixinForPage_updateTitle();
        };
        this.$store.commit('loadMonsterData', commitParam);
      } else {
        this.monsterData.comment = '新規登録';
      }
      this.$store.commit('fetchCommonData');
    },
    submit: function () {
      // 多重送信防止処理
      if (this.isSubmitted) { return; }
      this.isSubmitted = true;
      // 何かしらあってレスポンスが帰ってこなかった場合に再送信できるように２０秒後に復帰させる。
      const timeoutId = setTimeout(() => { this.isSubmitted = false; }, 20 * 1000);

      this.$store.commit('clearErrors');
      this.$store.commit('setMessages', ['送信中...']);

      // データの整形
      // 超覚醒を昇順ソート
      this.monsterData.superAwakens.sort((a, b) => a - b);

      mtpadmdb.api('updateMonster', this.monsterData, (response) => {
        // レスポンス来なかったときの復帰処理を止める。
        clearTimeout(timeoutId);

        // Google Analiticsにイベントを送信。
        let action = 'monsterDataPost';
        if (this.$route.params.no) { action = 'monsterDataUpdate'; } // 現在のデータを元した編集の場合
        if (this.isHistory) { action = 'monsterDataUpdateFromHistory'; } // 編集履歴をもとにした編集の場合
        gtagProductionOnly('event', action, {
          'event_category': 'monsterData',
          'event_label': `No.${this.monsterData.no}`
        });

        this.$router.push({ path: `/${this.monsterData.no}` });
      }, (response) => {
        // レスポンス来なかったときの復帰処理を止める。
        clearTimeout(timeoutId);
        // 再度送信可能にする。
        this.isSubmitted = false;
      });
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
