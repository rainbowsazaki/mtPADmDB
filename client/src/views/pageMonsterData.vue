<template>
  <div>
    <div v-if="isHistory" class="alert alert-primary" role="alert">
      {{ monsterData.datetime }} 時点のデータです
    </div>

    <div v-if="!isHistory"><tweet-button v-if="monsterData.no" /></div>
    <div class="row">
      <div class="col-md-6">
        <div id="monsterInfo" style="color: #FFF; line-height: 1.3em; font-family: 'M PLUS 1p', sans-serif; text-shadow: 0.1em 0.1em 0 rgba(0,0,0, 0.5); background: #000; border: 1px solid black; margin-bottom: 1rem;" :style="{ 'font-size': `${infoFontSize}px` }">
          <div style="background: linear-gradient(#798320, #394a14); border: 0.1em #b1ba39 solid; border-left: none; margin-top: 1em; margin-right: 5em; padding: 0.1em 0em 0.2em 4.4em; line-height: 1.1em; border-radius: 0 0.5em 0.5em 0;">
            <span style="display: inline-block; width: 6.5em;">No.{{ monsterData.no }}</span><span style="color: #EE0; -webkit-text-stroke: 0.05em #660;"><template v-for="n in monsterData.rare">★</template></span><br>
            {{ monsterData.name }}
          </div>
          <div style="position: relative; height: 17em;">
            <div class="monsterImage" style="height: 100%;">
              <img v-if="monsterData.no" :src="monsterImagePath" :key="`monsterImage${monsterData.no}`">
            </div>

            <div style="position: absolute; left: 0.4em; top: 0.4em; color: white;">
              <template v-for="(type, n) in monsterData.types">
                <span v-if="type !== 0" :key="`typeNo${n}`" style="margin-right: 0.2em;">
                  <img v-if="type !== null" :src="`./image/type/${type}.png`" alt="" style="width:1.3em; height: 1.35em; margin-right: 0.1em;">{{ typeTable[type].name }}
                </span>
              </template>
            </div>
            <div style="position: absolute; right: 0.7em; top: 0.2em;">
              <span v-if="monsterData.awakens[0] === 0" />
              <span v-else-if="monsterData.awakens[0] === null">？</span>
              <ul v-else style="list-style: none; margin: 0; padding: 0;">
                <li v-for="(awaken, n) in monsterData.awakens" style="line-height: 1.8em;" :key="`awakenNo${n}`">
                  <img v-if="awaken !== 0" :src="'./image/awaken/' + awaken + '.png'" style="width: 1.25em; height: 1.25em;" :title="awakenTable[awaken].name + '\n\n' + awakenTable[awaken].description">
                </li>
              </ul>
            </div>
            <div v-if="monsterData.overLimit === 1 && monsterData.superAwakens.length" style="position: absolute; right: 2.5em; top: 0.2em;">
              <ul style="list-style: none; margin: 0; padding: 0;">
                <li v-for="superAwaken in monsterData.superAwakens" style="line-height:1.8em;" :key="`superAwaken${superAwaken}`">
                  <img v-if="superAwaken !== null" :src="'./image/awaken/' + superAwaken + '.png'" style="width: 1.25em; height: 1.25em;" :title="awakenTable[superAwaken].name + '\n\n' + awakenTable[superAwaken].description">
                  <span v-else>不明</span>
                </li>
              </ul>
            </div>
          </div>

          <div style="border: #fddb70 solid 0.1em; background: linear-gradient(#a07b44, #382717); padding: 0.3em; padding-bottom: 0.55em; border-radius: 0.5em 0.5em;">
            <monster-icon no-link style="float: left; margin: 0.1em;" :no="monsterData.no" width="4.15em" height="4.15em" />
            <dl class="paramater" style="margin-left: 0.2em; margin-bottom: 0.4em; width: calc(45% - 4.2em - 0.2em); float: left;">
              <dt>HP:</dt><dd>{{ monsterData.maxParam.hp | addComma }}</dd>
              <dt>攻撃:</dt><dd>{{ monsterData.maxParam.attack | addComma }}</dd>
              <dt>回復:</dt><dd>{{ monsterData.maxParam.recovery | addComma }}</dd>
            </dl>
            <div style="margin-left: 47%;">
              <div style="float: right; border: 0.2em solid #563e22; background: #2f2b28; box-shadow: 0 0.2em 0.1em 0.03em rgba(0,0,0,0.4) inset; margin: 0.2em 0.1em; padding: 0 0.1em; border-radius: 0.4em 0.4em;">
                コスト:<span style="display: inline-block; width: 2.5em; text-align: right;">{{ monsterData.cost || '不明' }}</span>
              </div>
              <div style="white-space: pre; padding-top: 1.45em;">
                <div :style="{ color: (monsterData.overLimit === 1) ? '#0FF' : ''}">最大Lv.{{ monsterData.maxLevel || '不明' }}</div>
                <div>経験値:{{ monsterData.maxExp || '不明' | addComma }}</div>
              </div>
            </div>

            <div class="skill" style="clear: both;">
              <div class="skillHeader">
                <div class="skillLogo">
                  <div style="color: #acbcdd; background: linear-gradient(#ffffff, #3270a3); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
                    スキル
                  </div>
                </div>
                <div style="float: left;">
                  <span v-if="!skillDetails.name" style="color: #85bcfd;">不明</span>
                  <router-link v-else style="color: #85bcfd;" :to="{ name: 'skillDetails', params: { no: skillDetails.no }}">{{ skillDetails.name }}</router-link>
                </div>
                <div v-if="skillDetails.baseTurn >= 1" style="text-align: right;">
                  Lv.1 ターン:{{ skillDetails.baseTurn }}
                  最大Lv.<span v-if="skillDetails.maxLevel">{{ skillDetails.maxLevel }} ターン:{{ skillDetails.baseTurn - skillDetails.maxLevel + 1 }}</span><span v-else>不明</span>
                </div>
              </div>
              <div class="skillDescription" style="background: #b1aaa0; clear: both;">{{ skillDetails.description }}</div>
            </div>

            <div class="skill">
              <div class="skillHeader">
                <div class="skillLogo">
                  <div style="color: #fdaa66; background: linear-gradient(#feffa2, #d75b39); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
                    リーダースキル
                  </div>
                </div>
                <div>
                  <span v-if="!leaderSkillDetails.name" style="color: #82ff81;">不明</span>
                  <router-link v-else style="color: #82ff81;" :to="{ name: 'leaderSkillDetails', params: { no: leaderSkillDetails.no }}">{{ leaderSkillDetails.name }}</router-link>
                </div>
              </div>
              <div class="skillDescription" style="background: #d0cc82;" v-html="leaderSkillDescriptionHtml" />
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-6">
        <table class="table table-bordered table-sm">
          <tr class="thead-light">
            <th colspan="2">アシスト</th>
            <td colspan="2">{{ booleanTable[monsterData.assist] }}</td>
          </tr>
          
          <tr class="thead-light"><th colspan="4">振れる潜在キラー</th></tr>
          <tr>
            <td colspan="4">
              <span v-if="monsterData.types[0] === null">不明</span>
              <ul v-else-if="senzaiKillerNos.length" style="list-style: none; margin: 0px; padding: 0px;">
                <li v-for="senzaiKillerType in senzaiKillerNos" style="display: inline-block" :key="`killer${senzaiKillerType}`">
                  <img :src="`./image/senzaiKiller/${senzaiKillerType}.png`" :alt="`${typeTable[senzaiKillerType].name}キラー`" style="width: auto; height: 24px;">
                </li>
              </ul>
              <span v-else>振れる潜在キラーはありません。</span>
            </td>
          </tr>
          <template v-if="hasMaxParam">
            <tr class="thead-light"><th colspan="2">レベル最大時</th><th v-if="canAddPlus">+297</th><th>＋換算</th></tr>
            <tr-param v-for="paramType in ['hp', 'attack', 'recovery']" :is-visible297="canAddPlus" :type="paramType" :value="monsterData.maxParam[paramType]" :key="paramType" />
            <tr><td /><td v-if="canAddPlus" /><th class="text-right">＋合計</th><td class="text-right">{{ plusCountParam.total.toFixed(1) | addComma }}</td></tr>
          </template>
          <tr v-else class="thead-light"><th colspan="4">レベル最大時パラメータ不明</th></tr>
          <template v-if="monsterData.overLimit === 1">
            <template v-if="hasOverLimitParam">
              <tr class="thead-light"><th colspan="2">レベル110（限界突破）時</th><th v-if="canAddPlus">+297</th><th>＋換算</th></tr>
              <tr-param v-for="paramType in ['hp', 'attack', 'recovery']" :is-visible297="canAddPlus" :type="paramType" :value="monsterData.overLimitParam[paramType]" :key="`overlimit_${paramType}`" />
              <tr><td /><td v-if="canAddPlus" /><th class="text-right">＋合計</th><td class="text-right">{{ plusCountOverlimitParam.total.toFixed(1) | addComma }}</td></tr>
            </template>
            <tr v-else class="thead-light"><th colspan="4">限界突破時パラメータ不明</th></tr>
          </template>
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
            <router-link :to="{ name: 'evolutionMaterial', params: { no: monsterData.no } }">
              作成に必要な全モンスター一覧へ
            </router-link>
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
          <router-link :to="{ name: 'evolutionMaterial', params: { no: evolution.no } }">
            作成に必要な全モンスター一覧へ
          </router-link>
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
import { mtpadmdb, constData, leaderSkillDescriptionToDecoratedHtml, checkCanMixMonster } from '../mtpadmdb.js';
import TrParam from './../components/monsterDataTrParam.vue';

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
  middleOfBreadcrumbs: function () {
    return {
      text: 'モンスター一覧',
      link: { name: 'monsterList' }
    };
  },
  components: {
    TrParam
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

      /** モンスター情報表示部分のフォントサイズ。 */
      infoFontSize: 8,
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
        'maxExp', 'maxLevel', 'maxParam', 'skill', 'leaderSkill', 'assist', 'overLimit',
        'overLimitParam', 'superAwakens', 'evolutionType', 'evolution',
        'hp', 'attack', 'recovery',
        'baseNo', 'materials'
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

    /** リーダースキルの効果を装飾したHTMLを取得する。 */
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
      return checkCanMixMonster(this.monsterData);
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
  mounted: function () {
    this.updateInfoFontSize();
    window.addEventListener('resize', this.updateInfoFontSize);
  },
  beforeDestroy: function () {
    window.removeEventListener('resize', this.updateInfoFontSize);
  },
  methods: {
    /** モンスター情報表示領域のフォントサイズを、領域の横幅をもとに更新する。 */
    updateInfoFontSize: function () {
      this.infoFontSize = document.getElementById('monsterInfo').clientWidth * 0.0375;
    },
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

@import url('https://fonts.googleapis.com/css?family=M+PLUS+1p:700,900');

.paramAlert {
  color: rgba(224, 0, 0, 0.8);
}

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
    width: auto;
    height: 100%;
    display: block;
    margin: 0 auto;
  }
}

dl.paramater {
  margin: 0;
  line-height: 1.4em;
  * {
    font-size: 1.3em;
  }

  dt {
    float: left;
  }
  dd {
    margin: 0;
    text-align: right;
  }
}

div.skill {
  width: 100%;
  overflow: hidden;
  border: #9b733f 0.1em solid;
  background: #39180f;
  border-radius: 0.4em 0.4em;
  margin-top: 0.4em;

  div.skillHeader {
    height: 1.6em;
    padding: 0.15em;
    box-shadow: 0 0.2em 0.1em 0.03em rgba(0,0,0,0.6) inset;

    div.skillLogo {
      margin: 0em 0.28em 0em 0em;
      padding: 0em 0.12em;
      line-height: 1.1em;
      border: #9b733f 0.1em solid;
      background: #774433;
      overflow: hidden;
      float: left;
      text-shadow: none;
      border-radius: 0.4em 0.4em;
      -webkit-text-stroke: 0.08em #000;
      font-weight: 900;
    }
  }

  div.skillDescription {
    height: 2.55em;
    padding: 0.25em 0.15em;
    line-height: 1.1em;
    color: #000;
    background: #FFE;
    white-space: pre;
    text-shadow: none;
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
