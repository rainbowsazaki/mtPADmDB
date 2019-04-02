<template>
  <div>
    <div v-if="isHistory" class="alert alert-primary" role="alert">
      {{ monsterData.datetime }} 時点のデータです
    </div>
    <div class="row">
      <div class="col-12">
        <h2>No. {{ monsterData.no }} {{ monsterData.name }}</h2>
      </div>
    </div>
    <div v-if="!isHistory"><tweet-button v-if="monsterData.no" /></div>
    <div class="row">
      <div class="col-md-6">
        <div class="monsterImage">
          <img v-if="monsterData.no" :src="monsterImagePath" :key="`monsterImage${monsterData.no}`">
        </div>
        <table class="table table-bordered table-sm">
          <tr class="thead-light">
            <th colspan="2">タイプ</th><th>属性</th>
          </tr>
          <tr>
            <td colspan="2"><template v-for="(type, n) in monsterData.types"><span v-if="type !== 0" class="slash-join" :key="`typeNo${n}`"><img v-if="type !== null" :src="`./image/type/${type}.png`" alt="" style="width:24px; height: 24px;">{{ typeTable[type].name }}</span></template></td>
            <td>
              <span v-if="monsterData.attributes[0] === null">不明</span>
              <template v-for="(attr, n) in monsterData.attributes"><img v-if="attr !== 0 && attr !== null" style="width: 24px; height: 24px;" :src="`./image/attribute/${attr}.png`" :key="`attrNo${n}`"></template>
            </td>
          </tr>
          <tr class="thead-light">
            <th>コスト</th><th>レア</th><th>アシスト</th>
          </tr>
          <tr>
            <td v-if="monsterData.cost" class="text-right">{{ monsterData.cost }}</td>
            <td v-else>不明</td>
            <td v-if="monsterData.rare" class="text-right">{{ monsterData.rare }}</td>
            <td v-else>不明</td>
            <td>{{ booleanTable[monsterData.assist] }}</td>
          </tr>
          
          <tr class="thead-light">
            <th>最大レベル</th><th>必要経験値</th><th>限界突破</th>
          </tr>
          <tr>
            <td v-if="monsterData.maxLevel" class="text-right">{{ monsterData.maxLevel }}</td>
            <td v-else>不明</td>
            <td v-if="monsterData.maxExp !== null" class="text-right">{{ monsterData.maxExp | addComma }}</td>
            <td v-else>不明</td>
            <td>{{ booleanTable[monsterData.overLimit] }}</td>
          </tr>
          <tr class="thead-light"><th colspan="3">覚醒</th></tr>
          <tr><td colspan="3">
            <span v-if="monsterData.awakens[0] === 0">なし</span>
            <span v-else-if="monsterData.awakens[0] === null">不明</span>
            <ul v-else style="list-style: none; margin: 0px; padding: 0px; display: flex; justify-content: space-between;">
              <li v-for="(awaken, n) in monsterData.awakens" style="flex-grow: 1; width: 24px;" :key="`awakenNo${n}`">
                <img v-if="awaken !== 0" :src="'./image/awaken/' + awaken + '.png'" style="width: 24px; height: 24px;" :title="awakenTable[awaken].name + '\n\n' + awakenTable[awaken].description">
              </li>
            </ul>
          </td></tr>
          <template class="row" v-if="monsterData.overLimit === 1 && monsterData.superAwakens.length">
            <tr class="thead-light"><th colspan="3">超覚醒</th></tr>
            <tr><td colspan="3">
              <ul style="list-style: none; margin: 0px; padding: 0px; display: flex;">
                <li v-for="superAwaken in monsterData.superAwakens" style="margin-right: 2px;" :key="`superAwaken${superAwaken}`">
                  <img v-if="superAwaken !== null" :src="'./image/awaken/' + superAwaken + '.png'" width="24" height="24" :title="awakenTable[superAwaken].name + '\n\n' + awakenTable[superAwaken].description">
                  <span v-else>不明</span>
                </li>
              </ul>
            </td></tr>
          </template>
          <template>
            <tr class="thead-light"><th colspan="3">振れる潜在キラー</th></tr>
            <tr>
              <td colspan="3">
                <span v-if="monsterData.types[0] === null">不明</span>
                <ul v-else-if="senzaiKillerNos.length" style="list-style: none; margin: 0px; padding: 0px;">
                  <li v-for="senzaiKillerType in senzaiKillerNos" style="display: inline-block" :key="`killer${senzaiKillerType}`">
                    <img :src="`./image/senzaiKiller/${senzaiKillerType}.png`" :alt="`${typeTable[senzaiKillerType].name}キラー`" style="width: auto; height: 24px;">
                  </li>
                </ul>
                <span v-else>振れる潜在キラーはありません。</span>
              </td>
            </tr>
          </template>
        </table>
      </div>
      <div class="col-md-6">
        <table class="table table-bordered table-sm">
          <template v-if="hasMaxParam">
            <tr class="thead-light"><th colspan="2">レベル最大時</th><th v-if="canAddPlus">+297</th><th>＋換算</th></tr>
            <tr><th style="width:auto;">HP</th><td style="width: 25%;" class="text-right">{{ monsterData.maxParam.hp }}</td><td v-if="canAddPlus" style="width:25%;" class="text-right">{{ monsterData.maxParam.hp + 10 * 99 }}</td><td style="width: 25%;" class="text-right">{{ plusCountParam.hp.toFixed(1) }}</td></tr>
            <tr><th>攻撃</th><td class="text-right">{{ monsterData.maxParam.attack }}</td><td v-if="canAddPlus" class="text-right">{{ monsterData.maxParam.attack + 5 * 99 }}</td><td class="text-right">{{ plusCountParam.attack.toFixed(1) }}</td></tr>
            <tr><th>回復</th>
              <td class="text-right" :style="{ color: monsterData.maxParam.recovery < 0 ? 'rgba(224, 0, 0, 0.8)' : undefined }">{{ monsterData.maxParam.recovery }}</td>
              <td v-if="canAddPlus" class="text-right" :style="{ color: monsterData.maxParam.recovery + 3 * 99 < 0 ? 'rgba(224, 0, 0, 0.8)' : undefined }">{{ monsterData.maxParam.recovery + 3 * 99 }}</td>
              <td class="text-right">{{ plusCountParam.recovery.toFixed(1) }}</td>
            </tr>
            <tr><td /><td v-if="canAddPlus" /><th class="text-right">＋合計</th><td class="text-right">{{ plusCountParam.total.toFixed(1) }}</td></tr>
          </template>
          <tr v-else class="thead-light"><th colspan="4">レベル最大時パラメータ不明</th></tr>
          <template v-if="monsterData.overLimit === 1">
            <template v-if="hasOverLimitParam">
              <tr class="thead-light"><th colspan="2">レベル110（限界突破）時</th><th v-if="canAddPlus">+297</th><th>＋換算</th></tr>
              <tr><th>HP</th><td class="text-right">{{ monsterData.overLimitParam.hp }}</td><td v-if="canAddPlus" class="text-right">{{ monsterData.overLimitParam.hp + 10 * 99 }}</td><td class="text-right">{{ plusCountOverlimitParam.hp.toFixed(1) }}</td></tr>
              <tr><th>攻撃</th><td class="text-right">{{ monsterData.overLimitParam.attack }}</td><td v-if="canAddPlus" class="text-right">{{ monsterData.overLimitParam.attack + 5 * 99 }}</td><td class="text-right">{{ plusCountOverlimitParam.attack.toFixed(1) }}</td></tr>
              <tr><th>回復</th>
                <td class="text-right" :style="{ color: monsterData.overLimitParam.recovery < 0 ? 'rgba(224, 0, 0, 0.8)' : undefined }">{{ monsterData.overLimitParam.recovery }}</td>
                <td v-if="canAddPlus" class="text-right" :style="{ color: monsterData.overLimitParam.recovery + 3 * 99 < 0 ? 'rgba(224, 0, 0, 0.8)' : undefined }">{{ monsterData.overLimitParam.recovery + 3 * 99 }}</td>
                <td class="text-right">{{ plusCountOverlimitParam.recovery.toFixed(1) }}</td></tr>
              <tr><td /><td v-if="canAddPlus" /><th class="text-right">＋合計</th><td class="text-right">{{ plusCountOverlimitParam.total.toFixed(1) }}</td></tr>
            </template>
            <tr v-else class="thead-light"><th colspan="4">限界突破時パラメータ不明</th></tr>
          </template>
        </table>

        <table class="table table-bordered table-sm">
          <tr class="thead-light"><th>スキル</th></tr>
          <tr v-if="!skillDetails.name"><td>不明</td></tr>
          <tr v-if="skillDetails.name"><td>
            <router-link :to="{ name: 'skillDetails', params: { no: skillDetails.no }}">{{ skillDetails.name }}</router-link>
            <span v-if="skillDetails.baseTurn >= 1" style="font-size: 80%; float:right;">(Lv.1 ターン:{{ skillDetails.baseTurn }} 最大Lv.<span v-if="skillDetails.maxLevel">{{ skillDetails.maxLevel }} ターン:{{ skillDetails.baseTurn - skillDetails.maxLevel + 1 }}</span><span v-else>不明</span>)</span>
          </td></tr>
          <tr v-if="skillDetails.name"><td style="font-size: 90%; padding-left: 1em; white-space: pre;">{{ skillDetails.description }}</td></tr>

          <tr class="thead-light"><th>リーダースキル</th></tr>
          <tr v-if="!leaderSkillDetails.name"><td>不明</td></tr>
          <tr v-if="leaderSkillDetails.name"><td>
            <router-link :to="{ name: 'leaderSkillDetails', params: { no: leaderSkillDetails.no }}">{{ leaderSkillDetails.name }}</router-link>
          </td></tr>
          <tr v-if="leaderSkillDetails.name"><td style="font-size: 90%; padding-left: 1em; white-space: pre;" v-html="leaderSkillDescriptionHtml" /></tr>
        </table>
      </div>
    </div>

    <div v-if="monsterData.evolutionType !== 0">
      <h3 class="h4">このモンスターへの進化</h3>
      <table class="table table-bordered table-sm">
        <tr class="thead-light"><th colspan="2">{{ evolutionTypeTable[monsterData.evolutionType] }}</th></tr>
        <template v-if="monsterData.evolutionType !== null">
          <tr><td colspan="2">
            <template v-if="monsterData.evolution.baseNo">
              <monster-icon no-link :no="monsterData.no" :monster-table="monsterTable" :image-table="imageTable" width="2em" height="2em" />
              ←
              <router-link :to="{ name:'monsterDetails', params: { no: monsterData.evolution.baseNo }}">
                <monster-icon no-link :no="monsterData.evolution.baseNo" :monster-table="monsterTable" :image-table="imageTable" width="3em" height="3em" />
                No. {{ monsterData.evolution.baseNo }} {{ monsterTable[monsterData.evolution.baseNo] && monsterTable[monsterData.evolution.baseNo].name }}
              </router-link>
            </template>
            <span v-else>進化元不明</span>
          </td></tr>
          <tr class="thead-light"><th style="width: 3em;">素材</th><td>
            <ul v-if="monsterData.evolution.materials[0]" style="width: 100%; list-style: none; margin: 0px; padding: 0px; display:flex;">
              <template v-for="(material, n) in monsterData.evolution.materials">
                <li v-if="material" style="margin-right: 2px;" :key="`materialNo${n}`">
                  <router-link :to="{ name:'monsterDetails', params: { no: material }}">
                    <monster-icon :no="material" :monster-table="monsterTable" :image-table="imageTable" width="3em" height="3em" />
                  </router-link>
                </li>
              </template>
            </ul>
            <span v-else>不明</span>
          </td></tr>
          <tr><td colspan="2">
            <router-link :to="{ name: 'compare', params: { nos: `${monsterData.evolution.baseNo},${monsterData.no}` } }">
              進化前と進化後のパラメータ比較へ
            </router-link>
          </td></tr>
        </template>
      </table>
    </div>
    <div v-if="evolutionTable[monsterData.no]">
      <h3 class="h4">このモンスターからの進化</h3>
      <table v-for="(evolution, n) in evolutionTable[monsterData.no]" class="table table-bordered table-sm" :key="`evolutionNo${n}`">
        <tr class="thead-light"><th colspan="2">{{ evolutionTypeTable[evolution.type] }}</th></tr>
        <tr><td colspan="2">
          <monster-icon no-link :no="monsterData.no" :monster-table="monsterTable" :image-table="imageTable" width="2em" height="2em" />
          →
          <router-link v-if="evolution.no" :to="{ name:'monsterDetails', params: { no: evolution.no }}">
            <monster-icon no-link :no="evolution.no" :monster-table="monsterTable" :image-table="imageTable" width="3em" height="3em" />
            No. {{ evolution.no }} {{ monsterTable[evolution.no] && monsterTable[evolution.no].name }}
          </router-link>
        </td></tr>
        <tr class="thead-light"><th style="width: 3em;">素材</th><td>
          <ul v-if="evolution.materials[0]" style="width: 100%; list-style: none; margin: 0px; padding: 0px; display:flex;">
            <template v-for="(material, m) in evolution.materials">
              <li v-if="material" style="margin-right: 2px;" :key="`materialNo${m}`">
                <router-link :to="{ name:'monsterDetails', params: { no: material }}">
                  <monster-icon :no="material" :monster-table="monsterTable" :image-table="imageTable" width="3em" height="3em" />
                </router-link>
              </li>
            </template>
          </ul>
          <span v-else>不明</span>
        </td></tr>
        <tr><td colspan="2">
          <router-link :to="{ name: 'compare', params: { nos: `${monsterData.no},${evolution.no}` } }">
            進化前と進化後のパラメータ比較へ
          </router-link>
        </td></tr>
      </table>
      <router-link
        v-if="evolutionTable[monsterData.no].length >= 2" class="btn btn-secondary btn-sm" style="margin-bottom: 1em;"
        :to="{ name: 'compare', params: { nos: evolutionTable[monsterData.no].map(e => e.no).join(',') } }"
      >
        進化後{{ evolutionTable[monsterData.no].length }}種類のパラメータ比較へ
      </router-link>
    </div>
    <div class="editButtons">
      <router-link v-if="isHistory" :to="{ name:'monsterHistoryEdit', params: { id: $route.params.id }}" class="btn btn-primary">履歴をもとに編集する</router-link>
      <router-link v-else :to="{ name:'monsterEditUpdate', params: { no: monsterData.no }}" class="btn btn-primary">編集する</router-link>
      <router-link :to="{ name:'monsterPictureUpdate', params: { no: monsterData.no }}" class="btn btn-primary">モンスター画像投稿</router-link>
    </div>
    <div v-if="!isHistory">
      <h3 class="h4">コメント</h3>
      <comment-list />
    </div>
    <div v-if="isShowEvaluationLinks" class="evaluationLink">
      <h3 class="h4">外部サイトのモンスター評価ページへのリンク</h3>
      <div v-if="!evaluationOfMonsterLinks">読み込み中...</div>
      <div v-else-if="evaluationOfMonsterLinks.length === 0">なし</div>
      <ul v-else class="list-unstyled">
        <li v-for="link in evaluationOfMonsterLinks" :key="link.link">
          <a target="_blank" :href="link.link">{{ link.title }}
            <ul class="list-unstyled ml-3">
              <li>{{ link.formattedUrl }}</li>
            </ul>
          </a>
        </li>
      </ul>
    </div>
    <div v-if="monsterData.comment">
      <h3 class="h4">編集コメント</h3>
      <div>{{ monsterData.comment }}</div>
    </div>
    <div>
      <h3 class="h4">JSON</h3>
      <div class="row">
        <div class="col-12">
          <textarea readonly v-model="monsterDataJson" class="json" />
        </div>
      </div>
    </div>
    <div style="margin-top: 1rem;">
      <h3 class="h4">編集履歴</h3>
      <button v-if="!histories" class="btn btn-primary" @click="loadHistories" :disabled="isLoadingHistory">
        {{ isLoadingHistory ? '読み込み中…' : '編集履歴を確認する' }}
      </button>
      <ul v-if="histories">
        <li v-for="history in histories" :key="`history${history.id}`">
          <component :is="isShowHistory(history) ? 'span' : 'router-link'" :to="{ name:'monsterHistory', params: { id: history.id }}">
            {{ history.datetime }} -
            <span v-if="history.comment">{{ history.comment }}</span>
            <span v-else style="opacity: 0.6;">（コメントなし）</span>
          </component>
          <span v-if="isShowHistory(history)">（表示中）</span><span v-if="isActiveHistory(history)">（現在のデータ）</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { mtpadmdb, constData, leaderSkillDescriptionToDecoratedHtml } from '../mtpadmdb.js';

/**
 * モンスター情報ページコンポーネント
 */
export default {
  name: 'PageMonsterData',
  pageTitle: function () {
    let str = `No.${this.no || this.monsterData.no} ${this.monsterData.name}`;
    if (this.isHistory) { str += ` (${this.monsterData.datetime})`; }
    return str;
  },
  props: {
    no: {
      type: [String, Number],
      default: null
    },
    id: {
      type: [String, Number],
      default: null
    }
  },
  data: function () {
    return {
      booleanTable: constData.booleanTable,
      typeTable: constData.typeTable,
      attributeTable: constData.attributeTable,
      evolutionTypeTable: constData.evolutionTypeTable,
      awakenTable: constData.awakenTable,

      /** モンスター評価ページへのリンク情報の配列 */
      evaluationOfMonsterLinks: null,
      /** 履歴情報の読み込み中かどうか。 */
      isLoadingHistory: false,
      /** 履歴情報 */
      histories: null
    };
  },
  computed: {
    monsterTable: function () { return this.$store.state.monsterTable; },
    skillTable: function () { return this.$store.state.skillTable; },
    leaderSkillTable: function () { return this.$store.state.leaderSkillTable; },
    evolutionTable: function () { return this.$store.state.evolutionTable; },
    imageTable: function () { return this.$store.state.imageTable; },
    monsterData: function () {
      return this.isHistory ? this.$store.state.monsterData : this.monsterTable[this.no];
    },
    /** モンスター情報をJSONテキスト化したもの。 */
    monsterDataJson: function () {
      const keys = [
        'no', 'name', 'attributes', 'cost', 'rare', 'types', 'awakens',
        'maxExp', 'maxLevel', 'skill', 'leaderSkill', 'assist', 'overLImit',
        'overLimitParam', 'superAwakens', 'evolutionType', 'evolution'
      ];
      return JSON.stringify(this.monsterData, keys, 4);
    },

    monsterImagePath: function () {
      const no = this.monsterData.no;
      const imageData = this.imageTable[no];
      if (!imageData) { return './monsterImages/notFound.jpg'; }
      return `./monsterImagesLog/${no}_${imageData.id}.jpg`;
    },
    skillDetails: function () {
      let skillDetails = {};
      if (this.monsterData.skill !== 0) {
        const target = this.skillTable[this.monsterData.skill];
        if (target) {
          skillDetails = target;
        }
      }
      return skillDetails;
    },
    leaderSkillDetails: function () {
      let leaderSkillDetails = {};
      if (this.monsterData.leaderSkill !== 0) {
        const target = this.leaderSkillTable[this.monsterData.leaderSkill];
        if (target) {
          leaderSkillDetails = target;
        }
      }
      return leaderSkillDetails;
    },

    /** リーダースキル説明文を装飾したHTMLを取得する。 */
    leaderSkillDescriptionHtml: function () {
      return leaderSkillDescriptionToDecoratedHtml(this.leaderSkillDetails.description);
    },

    /** このモンスターに振れる潜在キラーの番号を配列を取得する。 */
    senzaiKillerNos: function () {
      // 合成できないものは潜在覚醒を降ることができないので無し。
      if (!this.canAddPlus) { return []; }
      const killerNoSet = new Set();
      for (const type of this.monsterData.types) {
        for (const killerNo of this.typeTable[type].senzaiKiller) {
          killerNoSet.add(killerNo);
        }
      }
      return Array.from(killerNoSet).sort((a, b) => a - b);
    },

    /** プラスが振れるキャラクターかどうかを返す。 */
    canAddPlus: function () {
      // 素材系のタイプの場合はプラス合成不可と判断する。
      // レベルアップの可能なキャラの場合はプラスを降ることも可能だが需要もないだろうから無視。
      const type = this.monsterData.types[0];
      return !((type >= 9 && type <= 12) || type === 99);
    },
    /** 現在表示しているのがモンスター評価ページのリストを表示する情報かどうかを返す。 */
    isShowEvaluationLinks: function () {
      return !this.isHistory && this.canAddPlus;
    },

    /** 最大レベル時のパラメータが登録されているかどうかを取得する。 */
    hasMaxParam: function () {
      const maxParam = this.monsterData.maxParam;
      return (maxParam.hp !== null || maxParam.attack !== null || maxParam.recovery !== null);
    },
    /** 限界突破時のパラメータが登録されているかどうかを取得する。 */
    hasOverLimitParam: function () {
      const maxParam = this.monsterData.overLimitParam;
      return (maxParam.hp !== null || maxParam.attack !== null || maxParam.recovery !== null);
    },

    /** 最大レベル時のパラメータのプラス換算値 */
    plusCountParam: function () {
      return this.culcPlusCountParam(this.monsterData.maxParam);
    },
    /** 限界突破時のパラメータのプラス換算値 */
    plusCountOverlimitParam: function () {
      return this.culcPlusCountParam(this.monsterData.overLimitParam);
    },
    /** 編集履歴の表示かどうか。 */
    isHistory: function () {
      return (this.$route.name === 'monsterHistory');
    }
  },
  watch: {
    '$route': function () {
      this.fetchData();
    },
    'monsterData': ['$_mixinForPage_updateTitle', 'updateEvaluationOfMonsterLinks']
  },
  created: function () {
    this.fetchData();
    this.updateEvaluationOfMonsterLinks();
  },
  methods: {
    fetchData: function () {
      this.$store.state.monsterData = constData.monsterClearData;
      this.histories = null;
      this.isLoadingHistory = false;

      // 現在のデータの取得の場合は読み込み処理は行わず、monsterTable 内から取得する処理が computed の monsterData で行われる。

      if (this.isHistory) {
        const param = {
          callback: () => {
            this.$_mixinForPage_updateTitle();
          },
          historyId: this.id
        };
        this.$store.commit('loadMonsterData', param);
      }
      this.$store.commit('fetchCommonData');
    },
    
    /** パラメータをプラス換算に変換する。 */
    culcPlusCountParam: function (param) {
      const obj = {
        hp: param.hp / 10,
        attack: param.attack / 5,
        recovery: param.recovery / 3
      };
      obj.total = obj.hp + obj.attack + obj.recovery;
      return obj;
    },
    /** モンスター評価ページへのリンク情報を更新する。 */
    updateEvaluationOfMonsterLinks: function () {
      this.evaluationOfMonsterLinks = null;
      if (this.isShowEvaluationLinks && this.monsterData.name) {
        axios.get('evaluation_of_monster_links.cgi', {
          params: { name: this.monsterData.name }
        }).then(response => {
          // 何らかの問題があってテキストが帰ってきた場合の対策。
          if (response.data.length > 100) {
            this.evaluationOfMonsterLinks = [];
          } else {
            this.evaluationOfMonsterLinks = response.data;
          }
        }).catch(response => {
          this.evaluationOfMonsterLinks = [];
        });
      }
    },
    /** 履歴リストを取得する。 */
    loadHistories: function () {
      this.isLoadingHistory = true;
      mtpadmdb.api('monsterHistory', { no: this.monsterData.no },
        (response) => {
          this.histories = response.data;
        });
    },

    /** 指定された履歴情報が今有効なデータかどうかを取得する。 */
    isActiveHistory: function (history) {
      return history.state === 1;
    },
    /** 指定された履歴情報が現在表示している */
    isShowHistory: function (history) {
      if (this.isHistory) {
        return history.id === parseInt(this.id);
      } else {
        return this.isActiveHistory(history);
      }
    }
  }
};

</script>

<style lang="scss" scoped>

.editButtons {
  margin-top: 1rem;

  a {
    margin-right: 0.5rem;
  }
}

h3 {
  margin-top: 1rem;
}

div.monsterImage {
  background: black url('../assets/image/monsterBack.jpeg');
  background-size: auto 100%;
  background-position: center;
  background-repeat: no-repeat;

  img {
    width: 100%;
    height: auto;
    max-width: 400px;
    display: block;
    margin: 0 auto;
  }
}

.evaluationLink {
  a { display: block; }
  li li { color: #060; font-size: 90%; }
  li { margin-bottom: 0.5em; }
}

textarea.json {
  width: 100%;
  height: 8em;
}
</style>
