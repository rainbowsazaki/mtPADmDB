<template>
  <table>
    <tr>
      <th colspan="3">名称</th>
    </tr>
    <tr>
      <td colspan="3">
        <skill-incremental-input
          v-if="monsterData" :placeholder="placeholderText"
          @select-no="monsterData[noPropName] = $event;" v-model="skillName"
          :skill-table="skillTable" :required="skillDescription.length > 0"
        />
        <input v-else v-model="skillName" class="form-control" required minLength="1" maxLength="50">
      </td>
    </tr>
    <tr v-if="!leaderSkill">
      <th style="width: calc(100% / 3);">SLv1時ターン</th>
      <th style="width: calc(100% / 3);">最短ターン</th>
      <th style="width: calc(100% / 3);">最大SLv</th>
    </tr>
    <tr v-if="!leaderSkill">
      <td>
        <input type="number" class="form-control" v-model.number="skillBaseTurn" min="1" max="199">
      </td>
      <td>
        <input type="number" class="form-control" v-model.number="skillMinTurn" min="1" max="99">
      </td>
      <td>{{ skillMaxLevel ? 'SLv.' + skillMaxLevel : '-' }}</td>
    </tr>
    <tr>
      <th colspan="3">効果</th>
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
    /** スキル編集対象のモンスターの情報。 skillDetails とのいずれかを指定する。 */
    monsterData: {
      type: Object,
      default: null
    },
    /** 編集対象のスキル情報。 monsterData とのいずれかを指定する。 */
    skillDetails: {
      type: Object,
      default: () => {}
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
      return (this.monsterData) ? this.monsterData[this.detailsPropName] : this.skillDetails;
    },
    /** 編集対象のスキルの名前。 */
    skillName: {
      get: function () { return this.targetSkillDetails.name; },
      set: function (value) {
        this.targetSkillDetails.name = value;
        this.clearSkillNo();
      }
    },
    /** 編集対象のスキルの効果。 */
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
    skillMaxLevel: function () {
      if (!this.targetSkillDetails.baseTurn || !this.targetSkillDetails.minTurn) { return NaN; }
      const maxLevel = this.targetSkillDetails.baseTurn - this.targetSkillDetails.minTurn + 1;
      if (maxLevel < 0) { return NaN; }
      return maxLevel;
    },
    /** スキルレベル最大時のターン数。 */
    skillMinTurn: {
      get: function () { return this.targetSkillDetails.minTurn; },
      set: function (value) {
        console.log(this.targetSkillDetails);
        this.targetSkillDetails.minTurn = value;
        this.clearSkillNo();
      }
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
      if (!this.monsterData) { return; }
      this.monsterData[this.noPropName] = 0;
    },
    /** スキル番号を元にスキル詳細情報を設定し直す。 */
    setDetailsFromNo: function () {
      if (!this.monsterData) { return; }
      const no = this.monsterData[this.noPropName];
      if (no !== 0) {
        this.monsterData[this.detailsPropName] = Object.assign({ name: '', description: '' }, this.skillTable[no]);
        delete this.targetSkillDetails.no;
      }
    }
  }

};
</script>

