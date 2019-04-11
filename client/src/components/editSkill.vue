<template>
  <table>
    <tr>
      <th colspan="3">名称</th>
    </tr>
    <tr>
      <td colspan="3">
        <skill-incremental-input
          :placeholder="placeholderText"
          @select-no="monsterData[noPropName] = $event;" v-model="skillName"
          :skill-table="skillTable" :required="skillDescription.length > 0"
        />
      </td>
    </tr>
    <tr v-if="!leaderSkill">
      <th style="width: calc(100% / 3);">SLv1時ターン</th>
      <th style="width: calc(100% / 3);">最大SLv</th>
      <th style="width: calc(100% / 3);">最短ターン</th>
    </tr>
    <tr v-if="!leaderSkill">
      <td>
        <input type="number" class="form-control" v-model.number="skillBaseTurn" min="1" max="199">
      </td>
      <td>
        <div class="input-group">
          <div class="input-group-prepend">
            <span class="input-group-text">SLv.</span>
          </div>
          <input type="number" class="form-control" v-model.number="skillMaxLevel" min="1" max="99">
        </div>
      </td>
      <td>{{ (minimumSkillTurn) ? minimumSkillTurn + 'ターン' : '-' }}</td>
    </tr>
    <tr>
      <th colspan="3">説明</th>
    </tr>
    <tr>
      <td colspan="3">
        <textarea class="form-control" rows="2" v-model="skillDescription" maxLength="200" />
      </td>
    </tr>
  </table>
</template>

<script>

export default {
  props: {
    /** スキル編集対象のモンスターの情報。 */
    monsterData: {
      type: Object,
      required: true
    },
    /** リーダースキルを対象とするかどうか。 */
    leaderSkill: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    /** 登録されているスキルが番号をキーとして入っているテーブル。 */
    skillTable: function () {
      return (this.leaderSkill) ? this.$store.state.leaderSkillTable : this.$store.state.skillTable;
    },

    /** スキル名入力欄のプレースホルダーのテキスト。 */
    placeholderText: function () {
      return (this.leaderSkill) ? 'リーダースキル名' : 'スキル名';
    },
    /** スキル番号のプロパティ名。 */
    noPropName: function () {
      return (this.leaderSkill) ? 'leaderSkill' : 'skill';
    },
    /** 編集対象のスキルの詳細情報オブジェクトのプロパティ名。 */
    detailsPropName: function () {
      return this.noPropName + 'Details';
    },

    /** 編集対象のスキルの詳細情報。 */
    targetSkillDetails: function () {
      return this.monsterData[this.detailsPropName];
    },
    /** 編集対象のスキルの名前。 */
    skillName: {
      get: function () { return this.targetSkillDetails.name; },
      set: function (value) {
        this.targetSkillDetails.name = value;
        this.clearSkillNo();
      }
    },
    /** 編集対象のスキルの説明文。 */
    skillDescription: {
      get: function () { return this.targetSkillDetails.description; },
      set: function (value) {
        this.targetSkillDetails.description = value;
        this.clearSkillNo();
      }
    },
    /** 編集対象のスキルのレベル1時のターン数。 */
    skillBaseTurn: {
      get: function () { return this.targetSkillDetails.baseTurn; },
      set: function (value) {
        this.targetSkillDetails.baseTurn = value;
        this.clearSkillNo();
      }
    },
    /** スキルの最大レベル。 */
    skillMaxLevel: {
      get: function () { return this.targetSkillDetails.maxLevel; },
      set: function (value) {
        this.targetSkillDetails.maxLevel = value;
        this.clearSkillNo();
      }
    },
    /** スキルレベル最大時の（最短の）スキルターン */
    minimumSkillTurn: function () {
      if (!this.targetSkillDetails.baseTurn || !this.targetSkillDetails.maxLevel) { return NaN; }
      const turn = this.targetSkillDetails.baseTurn - this.targetSkillDetails.maxLevel + 1;
      if (turn < 0) { return NaN; }
      return turn;
    }
  },
  watch: {
    'monsterData.skill': function () {
      this.setDetailsFromNo();
    },
    'monsterData.leaderSkill': function () {
      this.setDetailsFromNo();
    }
  },
  methods: {
    /** スキル番号をクリアする。 */
    clearSkillNo: function () {
      this.monsterData[this.noPropName] = 0;
    },
    /** スキル番号を元にスキル詳細情報を設定し直す。 */
    setDetailsFromNo: function () {
      const no = this.monsterData[this.noPropName];
      if (no !== 0) {
        this.monsterData[this.detailsPropName] = $.extend(true, { name: '', description: '' }, this.skillTable[no]);
        delete this.targetSkillDetails.no;
      }
    }
  }

};
</script>

