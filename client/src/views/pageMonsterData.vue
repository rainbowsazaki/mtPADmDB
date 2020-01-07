<template>
  <div v-if="!monsterData">
    <div v-if="!isHistory" class="prevNext">
      <router-link v-if="no > 1" class="prev" :to="createMoveMonsterNoByObject(-1)">＜ No.{{ Number(no) - 1 }} {{ getMonsterName(Number(no) - 1 ) }}</router-link>
      <router-link v-if="no < 9999" fclass="next" :to="createMoveMonsterNoByObject(1)">No.{{ Number(no) + 1 }} {{ getMonsterName(Number(no) + 1 ) }} ＞</router-link>
      <template v-else>&nbsp;</template>
    </div>
    指定されたモンスターのデータは存在しません。
  </div>
  <div v-else>
    <div v-if="isHistory" class="alert alert-primary" role="alert">
      {{ monsterData.datetime }} 時点のデータです
    </div>
    <div v-if="!isHistory" class="prevNext">
      <router-link v-if="no > 1" class="prev" :to="createMoveMonsterNoByObject(-1)">＜ No.{{ Number(no) - 1 }} {{ getMonsterName(Number(no) - 1 ) }}</router-link>
      <router-link v-if="no < 9999" fclass="next" :to="createMoveMonsterNoByObject(1)">No.{{ Number(no) + 1 }} {{ getMonsterName(Number(no) + 1 ) }} ＞</router-link>
      <template v-else>&nbsp;</template>
    </div>

    <div v-if="!isHistory"><tweet-button v-if="monsterData.no" /></div>
    <div v-if="!isHistory" class="lastUpdate">
      最終更新:{{ monsterData.datetime }}
    </div>

    <div class="row">
      <div class="col-md-6">
        <monster-info :monster-data="monsterData" />
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

    <div v-if="evoInfo.evo">
      <h3 class="h4 decoHeader">進化系統</h3>
      <div v-if="monsterData.evolutionType !== 0" class="mt-1 p-1">
        <router-link :to="{ name: 'evolutionMaterial', params: { no: monsterData.no } }">
          {{ monsterData.name }}の作成に必要な全モンスター一覧へ
        </router-link>
      </div>
      <evolution-material :evo-info="evoInfo" />
    </div>
    <div v-else-if="rareStoneExchangeMonsters">
      <h3 class="h4 decoHeader">交換元モンスター</h3>
      <monster-icon v-for="monster in rareStoneExchangeMonsters" :no="monster" width="3em" height="3em" :key="`monster${monster}`" />
    </div>
    
    <div v-if="materialUseMonstersDisp">
      <h3 class="h4 decoHeader">このモンスターを素材にして進化するモンスター ({{ materialUseMonstersAll.length }})</h3>
      <monster-icon v-for="useMonster in materialUseMonstersDisp" :no="useMonster" width="3em" height="3em" :key="`useMonster${useMonster}`" />
      <span v-if="!isMaterialsDispAll"> ... </span>
      <button v-if="!isMaterialsDispAll" class="btn btn-sm btn-outline-secondary" @click="isMaterialsDispAll = true;">すべてを表示する</button>
    </div>
    
    <div v-if="!isHistory">
      <h3 class="h4 decoHeader">コメント</h3>
      <comment-list />
    </div>
    <div v-if="isShowEvaluationLinks" class="evaluationLink">
      <h3 class="h4 decoHeader">外部サイトのモンスター評価ページへのリンク</h3>
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
      <h3 class="h4 decoHeader">編集コメント</h3>
      <div>{{ monsterData.comment }}</div>
    </div>
    <div>
      <h3 class="h4 decoHeader">JSON</h3>
      <div class="row">
        <div class="col-12">
          <textarea readonly v-model="monsterDataJson" class="json" />
        </div>
      </div>
    </div>
    <div style="margin-top: 1rem;">
      <h3 class="h4 decoHeader">編集履歴</h3>
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
    <div class="editButtons">
      <router-link v-if="isHistory" :to="{ name:'monsterHistoryEdit', params: { id: $route.params.id }}" class="btn btn-sm btn-secondary">履歴をもとに編集する</router-link>
      <router-link v-else :to="{ name:'monsterEditUpdate', params: { no: monsterData.no }}" class="btn btn-sm btn-secondary">編集する</router-link>
      <router-link :to="{ name:'monsterPictureUpdate', params: { no: monsterData.no }}" class="btn btn-sm btn-secondary">モンスター画像投稿</router-link>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { mtpadmdb, constData, checkCanMixMonster } from '../mtpadmdb.js';
import MonsterInfo from './../components/monsterInfo.vue';
import TrParam from './../components/monsterDataTrParam.vue';
import EvolutionMaterials from './../components/monsterDataEvolutionMaterials.vue';
import EvolutionMaterial from '../components/evolutionMaterial.vue';

/**
 * モンスター情報ページコンポーネント
 */
export default {
  name: 'PageMonsterData',
  pageTitle: function () {
    let str = `No.${this.no || this.monsterData.no} ${(this.monsterData || { name: '' }).name}`;
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
    MonsterInfo,
    TrParam,
    EvolutionMaterials,
    EvolutionMaterial
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
      histories: null,
      /** 進化素材として使用するモンスターのアイコンをすべて表示するかどうか。 */
      isMaterialsDispAll: false
    };
  },
  computed: {
    monsterTable: function () { return this.$store.state.monsterTable; },
    evolutionTable: function () { return this.$store.state.evolutionTable; },
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
      if (!this.monsterData) { return false; }
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
    },
    /** 表示するモンスターの進化系統情報をツリー形式で格納したオブジェクト。
     * {
     *   no: 表示するモンスターの番号。
     *   evo: 進化後のモンスターの進化情報の配列。中身はevoInfoと同じ構造のオブジェクト。
     *   target: 進化系統を表示する対象のモンスターかどうか。
     * }
     */
    evoInfo () {
      const targetNo = this.monsterData.no;
      // ベースモンスターを求める。
      let baseNo = targetNo;
      // この希石への交換元モンスターが１種類のみの場合は、そのモンスターの進化系統を表示する。
      const rareStoneTable = this.rareStoneExchangeMonsters;
      if (rareStoneTable && rareStoneTable.length === 1) {
        baseNo = rareStoneTable[0];
      }
      const monsterTable = this.monsterTable;
      const duplicationCheckTable = {};
      while (1) {
        duplicationCheckTable[baseNo] = true;
        const monsterData = monsterTable[baseNo];
        if (!monsterData) { break; }
        const baseNo_ = monsterData.evolution.baseNo;
        if (!baseNo_ || duplicationCheckTable.hasOwnProperty(baseNo_)) { break; }
        baseNo = baseNo_;
      }
      // 再帰で進化後を巡っていってツリー構造を作成する。
      const evolutionTable = this.evolutionTable;
      const func = (no) => {
        const obj = { no: no };
        const evolutionData = evolutionTable[no];
        if (evolutionData) {
          obj.evo = evolutionData.map(d => func(d.no));
        }
        // 希石への交換の情報を組み込む
        const toRareStone = this.$store.getters.exchangeToRareStoneTable[no];
        if (toRareStone) {
          const evo = obj.evo || (obj.evo = []);
          evo.push({ no: toRareStone, isExchange: true, target: (toRareStone === targetNo) });
        }
        if (no === targetNo) { obj.target = true; }
        return obj;
      };
      return func(baseNo);
    },
    /** このモンスターを素材に進化するモンスターの番号の配列。 */
    materialUseMonstersAll () {
      const type = this.monsterData.types[0];
      if (type !== 9 && type !== 11) { return undefined; }
      const array = this.$store.getters.materialUseMonstersTable[this.no];
      // 常に降順ソードで使用するだろうから、受け取った配列そのものに対して並び替えを行う。
      if (array) { array.sort((a, b) => b - a); }
      return array;
    },
    /** モンスターを素材に進化するモンスターの番号の表示する分の配列。 */
    materialUseMonstersDisp () {
      let array = this.materialUseMonstersAll;
      if (array && !this.isMaterialsDispAll) {
        array = array.slice(0, 10);
      }
      return array;
    },
    /** この希石に交換可能なモンスターの番号の配列。 */
    rareStoneExchangeMonsters () {
      if (!this.monsterData.name.match(/^(.*)の希石/)) { return undefined; }
      const baseName = RegExp.$1;
      const hitData = this.$store.getters.monsterDataArray.find(d => d.name === baseName);
      if (hitData) { return [hitData.no]; }
      return constData.rareStoneExchangeTable[this.no];
    }
  },
  watch: {
    '$route': function () {
      this.fetchData();
    },
    no: ['$_mixinForPage_updateTitle', 'updateEvaluationOfMonsterLinks']
  },
  created: function () {
    this.fetchData();
    this.updateEvaluationOfMonsterLinks();
  },
  mounted: function () {
    window.addEventListener('keydown', this.onKeydown);
  },
  beforeDestroy: function () {
    window.removeEventListener('keydown', this.onKeydown);
  },
  methods: {
    /** 指定番号のモンスターの名前を取得する。未登録の場合は '（未登録）' を返す。 */
    getMonsterName: function (no) {
      const data = this.monsterTable[no] || { name: '（未登録）' };
      return data.name;
    },
    /** 指定された値の分、表示するモンスターの番号を前後させるための route 指定オブジェクトを作成する。 */
    createMoveMonsterNoByObject: function (offset) {
      const route = Object.assign({}, this.$route);
      const params = Object.assign({}, route.params);

      params.no = Number(params.no) + offset;
      route.params = params;
      return route;
    },
    /** 指定された値の分、表示するモンスターの番号を前後させる。 */
    moveMonsterNoBy: function (offset) {
      this.$router.push(this.createMoveMonsterNoByObject(offset));
    },
    /** キーボードのキーが押されたときに呼ばれるイベントハンドラ。 */
    onKeydown: function (e) {
      if (e.repeat) { return; }
      const targetName = e.target.tagName;
      if (targetName === 'INPUT' || targetName === 'TEXTAREA' || targetName === 'SELECT') { return; }
      if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) { return; }
      if (this.no > 1 && e.key === 'ArrowLeft') { this.moveMonsterNoBy(-1); }
      if (this.no < 9999 && e.key === 'ArrowRight') { this.moveMonsterNoBy(1); }
    },
    fetchData: function () {
      this.$store.state.monsterData = constData.monsterClearData;
      this.histories = null;
      this.isLoadingHistory = false;
      this.isMaterialsDispAll = this.materialUseMonstersAll && this.materialUseMonstersAll.length <= 10;

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

.prevNext {
  text-align: right;

  .prev {
    float: left;
  }

  * {
    white-space: nowrap;
  }
}

.lastUpdate {
  color: rgba(0, 0, 0, 0.5);
  font-size: 75%;
  text-align: right;
  margin-top: -1.5em;
}

.paramAlert {
  color: rgba(224, 0, 0, 0.8);
}

.editButtons {
  margin-top: 2rem;

  a {
    margin-right: 0.5rem;
  }
}

h3 {
  margin-top: 1rem;
}

.evaluationLink {
  min-height: 36em;

  a { display: block; }
  li li { color: #060; font-size: 90%; }
  li { margin-bottom: 0.5em; }
}

textarea.json {
  width: 100%;
  height: 8em;
}
</style>
