import Vue from 'vue';
import Vuex from 'vuex';
import axios from 'axios';
import $ from 'jquery';
import * as firebase from 'firebase/app';
import 'firebase/storage';

import { mtpadmdb, constData, commonData } from './mtpadmdb.js';

Vue.use(Vuex);

export default new Vuex.Store({
  state: commonData,
  getters: {
    /** モンスター情報の配列。 */
    monsterDataArray: state => {
      return Object.values(state.monsterTable);
    },
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
    },
    /** モンスター番号をキーとして、そのモンスターを素材にして進化するモンスターの番号の配列を格納したテーブル。 */
    materialUseMonstersTable: state => {
      const ret = {};
      for (const key in state.monsterTable) {
        const monsterData = state.monsterTable[key];
        const evolution = monsterData.evolution;
        if (!evolution) { continue; }
        const materials = evolution.materials;
        if (!materials) { continue; }
        materials.forEach(mat => {
          const a = ret[mat] || (ret[mat] = []);
          const no = Number(key);
          if (a[a.length - 1] !== no) {
            a.push(no);
          }
        });
      }
      return ret;
    },
    /** 希石へ交換できるモンスター番号をキーとして交換後のモンスター番号を格納したオブジェクト。 */
    exchangeToRareStoneTable: state => {
      const monsterTable = state.monsterTable;
      const kisekiNameTable = {};
      for (const key in monsterTable) {
        const d = monsterTable[key];
        if (d.types[0] === 9 && d.name.match(/^(.*)の希石/)) {
          kisekiNameTable[RegExp.$1] = d.no;
        }
      }
      const obj = {};
      for (const key in monsterTable) {
        const d = monsterTable[key];
        if (!d.awakens || !d.awakens[0]) { continue; }
        const no = kisekiNameTable[d.name];
        if (no) {
          obj[d.no] = no;
        }
      }
      for (const key in constData.rareStoneExchangeTable) {
        const kisekiNo = Number(key);
        constData.rareStoneExchangeTable[kisekiNo].forEach(no => {
          obj[no] = kisekiNo;
        });
      }
      return obj;
    },
    /** 管理者権限のアカウントでログインしているかどうか。 */
    isAdmin: state => {
      const accountData = state.accountData;
      if (!accountData) { return false; }
      const providerData = accountData.providerData;
      if (!providerData) { return false; }
      const adminUids = [
        '14495068', // rainbowsazaki
        '1040124896972394496' // mtPADmDB
      ];
      return providerData[0].providerId === 'twitter.com' && adminUids.includes(providerData[0].uid);
    }
  },
  mutations: {
    fetchCommonData: function (state) {
      // 最後に読み込んだ時間から 5分以上経過していた場合に読み込みを実効する。
      const nowMs = (new Date()).getTime();
      if (state.lastLoadCommonDataTime + 5 * 60 * 1000 > nowMs) { return; }

      const option = {
        headers: {
          'Cache-Control': 'no-cache',
          'Expires': '-1'
        }
      };

      // モンスター情報と画像情報はモンスター一覧ページをいち早く表示するために他と分けて読み込み処理を行う。
      axios.get('./listJson/monster_list_full.json', option)
        .then(responce => {
          for (const monsterNo in responce.data) {
            const data = responce.data[monsterNo];
            const awakenCount = {};
            for (const awaken of data.awakens) {
              awakenCount[awaken] = (awakenCount[awaken] || 0) + 1;
            }
            data.awakenCount = awakenCount;
          }
          state.monsterTable = responce.data;
        });
      axios.get('./listJson/image_list.json', option)
        .then(responce => {
          state.imageTable = responce.data;
        });

      axios.all([
        axios.get('./listJson/skill_list.json', option),
        axios.get('./listJson/leader_skill_list.json', option),
        axios.get('./listJson/evolution_list.json', option)
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
        const data = $.extend(true, {}, constData.monsterClearData);
        Object.assign(data, response.data);
        if (data.superAwakens === null) { data.superAwakens = [null]; }
        state.monsterData = data;
        
        if (typeof param.callback === 'function') { param.callback(); }
      }, (response) => {
        let errorMessage = '';
        if (param.historyId) {
          errorMessage = `モンスター編集履歴 ID:${param.historyId} の情報が見つかりませんでした。`;
        } else {
          errorMessage = `モンスター No.${param.no} の情報が見つかりませんでした。`;
        }
        this.commit('setErrors', [errorMessage]);
      });
    },
    /** ログインしているアカウントの情報を更新する。 */
    updateUserAccount: function (state, accountData) {
      state.accountData = accountData;
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
    /** モンスターのお気に入り情報変更する。
     * @param params.no 変更対象のモンスター番号。
     * @param params.data 変更後のデータ。
     */
    setMonsterFavorite: function (state, params) {
      if (params.data === undefined) {
        Vue.delete(state.monsterFavorites, params.no);
      } else {
        Vue.set(state.monsterFavorites, params.no, params.data);
      }
      this.commit('saveFavorite');
    },

    saveFavorite: function (state) {
      const favMonsters = Object.keys(state.monsterFavorites);
      const jsonText = JSON.stringify({ version: 1, data: favMonsters });
      if (!state.accountData) {
        localStorage.setItem('favorites', jsonText);
      } else {
        const storage = firebase.storage();
        const ref = storage.ref(`users/${state.accountData.uid}/favorite.json`);
        ref.putString(jsonText).then(function (snapshot) {
          console.log('Uploaded a raw string!');
        });
      }
    },
    loadFavorite: function (state) {
      function setFavMonsters (favMonsters) {
        if (favMonsters.version === 1) {
          const obj = {};
          favMonsters.data.forEach(d => { obj[d] = true; });
          state.monsterFavorites = obj;
        }
      }

      function loadFromLocalStrage () {
        const favMonstersJson = localStorage.getItem('favorites');
        if (favMonstersJson) {
          const favMonsters = JSON.parse(favMonstersJson);
          setFavMonsters(favMonsters);
        }
      }

      if (!state.accountData) {
        loadFromLocalStrage();
      } else {
        const storage = firebase.storage();
        const ref = storage.ref(`users/${state.accountData.uid}/favorite.json`);
        ref.getDownloadURL().then(function (url) {
          const axiosObj = axios.get(url);
          axiosObj.then(response => {
            setFavMonsters(response.data);
          }).catch(response => {
            console.log('favorite download error.');
          });
        }).catch(function (error) {
          // A full list of error codes is available at
          // https://firebase.google.com/docs/storage/web/handle-errors
          switch (error.code) {
          case 'storage/object-not-found':
            // File doesn't exist
            break;
          case 'storage/unauthorized':
            // User doesn't have permission to access the object
            break;
          case 'storage/canceled':
            // User canceled the upload
            break;
          case 'storage/unknown':
            // Unknown error occurred, inspect the server response
            break;
          }
          // ローカルストレージからの読み込みを試みる。
          loadFromLocalStrage();
        });
        return;
      }
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
