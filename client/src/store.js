import Vue from 'vue';
import Vuex from 'vuex';
import axios from 'axios';
import $ from 'jquery';

import { mtpadmdb, constData, commonData } from './mtpadmdb.js';

Vue.use(Vuex)

export default new Vuex.Store({
  state: commonData,
  getters: {
    /** スキル番号をキーとして、スキルを持っているモンスター番号の配列を格納したオブジェクトを取得する。 */
    skillToMonsterNosTable: state => {
      const obj = {};
      for (const prop in state.monsterTable) {
        const monsterData = state.monsterTable[prop];
        const skill = monsterData.skill;
        if (!obj[skill]) { obj[skill] = []; }
        obj[skill].push(monsterData.no);
      }
      return obj;
    },
    /** リーダースキル番号をキーとして、リーダースキルを持っているモンスター番号の配列を格納したオブジェクトを取得する。 */
    leaderSkillToMonsterNosTable: state => {
      const obj = {};
      for (const prop in state.monsterTable) {
        const monsterData = state.monsterTable[prop];
        const leaderSkill = monsterData.leaderSkill;
        if (!obj[leaderSkill]) { obj[leaderSkill] = []; }
        obj[leaderSkill].push(monsterData.no);
      }
      return obj;
    }
  },
  mutations: {
    fetchCommonData: function (state) {
      // 最後に読み込んだ時間から 5分以上経過していた場合に読み込みを実効する。
      const nowMs = (new Date()).getTime();
      if (state.lastLoadCommonDataTime + 5 * 60 * 1000 > nowMs) { return; }

      // モンスター情報と画像情報はモンスター一覧ページをいち早く表示するために他と分けて読み込み処理を行う。
      axios.get('./listJson/monster_list_full.json')
        .then(responce => {
          state.monsterTable = responce.data;
        });
      axios.get('./listJson/image_list.json')
        .then(responce => {
          state.imageTable = responce.data;
        });

      axios.all([
        axios.get('./listJson/skill_list.json'),
        axios.get('./listJson/leader_skill_list.json'),
        axios.get('./listJson/evolution_list.json')
      ]).then(axios.spread((
        skillListResponse,
        leaderSkillListResponse,
        evolutionListResponse
      ) => {
        state.skillTable = skillListResponse.data;
        state.leaderSkillTable = leaderSkillListResponse.data;
        state.evolutionTable = evolutionListResponse.data;
      }));

      state.lastLoadCommonDataTime = nowMs;
    },
    
    loadMonsterData: function (state, param) {
      let mode, params;
      if (param.historyId) {
        mode = 'monsterHistoryDetails';
        params = {
          id: param.historyId
        };
      } else {
        mode = 'monsterDetails';
        params = {
          no: param.no
        };
      }

      this.commit('setMessages', ['モンスター情報取得中']);
      
      mtpadmdb.api(mode, params, (response) => {
        const data = $.extend(true, {}, constData.monsterClearData, response.data);
        if (!data.superAwakens) { data.superAwakens = []; }
        state.monsterData = data;
        
        if (typeof param.callback === 'function') { param.callback(); }
      }, (response) => {
        let errorMessage = '';
        if (param.historyId) {
          errorMessage = `モンスター編集履歴 ID:${param.historyId} の情報が見つかりませんでした。`;
        } else {
          errorMessage = `モンスター No.${param.no} の情報が見つかりませんでした。`;
        }
        this.commit('setErrors', [errorMessage]);
      });
    },

    addMonsterData: function (state, monsterData) {
      Object.assign(state.monsterTable, monsterData);
    },
    addSkillData: function (state, skillData) {
      Object.assign(state.skillTable, skillData);
    },
    addLeaderSkillData: function (state, leaderSkillData) {
      Object.assign(state.leaderSkillTable, leaderSkillData);
    },
    addImageData: function (state, imageData) {
      Object.assign(state.imageTable, imageData);
    },

    setErrors: function (state, errors) {
      state.errors = errors;
    },
    setMessages: function (state, messages) {
      state.messages = messages;
      setTimeout(() => {
        state.messages = [];
      }, 3000);
    },
    clearErrors: function (state) {
      state.errors = [];
    },
    clearMessages: function (state) {
      state.messages = [];
    },
    deleteError: function (state, error) {
      state.errors = state.errors.filter(n => n !== error);
    },
    deleteMessage: function (state, message) {
      state.messages = state.messages.filter(n => n !== message);
    }
  }
});