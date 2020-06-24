<template>
  <div>
    <h2>モンスターランキング</h2>
    <div>
      <select class="custom-select" :value="id" @change="changeRouteId($event.target.value)">
        <template v-for="(group, n) in $options.rankingSettings">
          <optgroup :label="group.label" :key="`group${n}`">
            <option v-for="setting in group.settings" :value="setting.id" :key="`rankingSetting_${setting.id}`">{{ setting.title }}ランキング</option>
          </optgroup>
        </template>
      </select>
    </div>
    <ul class="list-unstyled">
      <li>
        <label>
          <input type="checkbox" class="decoCheckbox" v-model="useOverLimit" value="1">
          限界突破時のパラメータを使用する
        </label>
      </li>
      <li>
        <label>
          <input type="checkbox" class="decoCheckbox" v-model="useMultiBoost" value="1">
          マルチブースト適用時のパラメータを使用する
        </label>
      </li>
      <li>
        <label>
          <input type="checkbox" class="decoCheckbox" v-model="useSuperAwaken" value="1">
          超覚醒を使用する
        </label>
      </li>
      <li>
        <label :disabled="!isDamageRanking">
          <input type="checkbox" class="decoCheckbox" v-model="useEnemyState" value="1" :disabled="!isDamageRanking">
          敵の属性による補正やキラーを反映する
        </label>
      </li>
    </ul>

    <transition name="fade">
      <dl v-if="useEnemyState && isDamageRanking" class="enemyStateArea">
        <dd>
          <monster-incremental-search v-model="enemyNo" :monster-table="monsterTable" :image-table="imageTable" />
        </dd>
        <dt>敵の属性</dt>
        <dd>
          <attr-select use-clear v-model="enemyAttributes" />
        </dd>
        <dt>敵のタイプ</dt>
        <dd>
          <attr-select mode="type" use-clear v-model="enemyTypes" />
        </dd>
        <dd>
          <ul class="list-unstyled">
            <li>
              <label>
                <input type="checkbox" class="decoCheckbox" v-model="useSenzaiKiller" value="1">
                潜在キラーを使用する
              </label>
            </li>
            <li>
              <label :disabled="!useSenzaiKiller">
                <input type="checkbox" class="decoCheckbox" :disabled="!useSenzaiKiller" v-model="useRelasedSenzaiAwaken" value="1">
                潜在覚醒枠の解放分を使用する
              </label>
            </li>
          </ul>
        </dd>
        <dt class="damageHalf" @click="visibleDamageHalf = !visibleDamageHalf">
          <span class="triggerMark">{{ visibleDamageHalf ? '-' : '+' }}</span>
          ダメージ半減属性・タイプ指定
          <transition-group name="fade">
            <template v-if="!visibleDamageHalf">
              <img v-for="attr in damageHalfAttributes" :key="`attr${attr}`" class="damageHalfIcon" :src="`/image/attribute/${attr}.png`">
              <img v-for="type in damageHalfTypes" :key="`type${type}`" class="damageHalfIcon" :src="`/image/type/${type}.png`">
            </template>
          </transition-group>
        </dt>
        <transition name="fade">
          <dd v-if="visibleDamageHalf">
            <attr-select use-clear checkbox-style v-model="damageHalfAttributes" />
          </dd>
        </transition>
        <transition name="fade">
          <dd v-if="visibleDamageHalf">
            <attr-select mode="type" use-clear checkbox-style v-model="damageHalfTypes" />
          </dd>
        </transition>
      </dl>
    </transition>

    <h3 class="decoHeader">{{ rankingSetting.title }}ランキング</h3>
    <p v-if="rankingSetting.description">{{ rankingSetting.description }}</p>
    <p>※このサイトに登録されているモンスターでのランキングです。</p>

    <monster-filter-setting v-model="filterSetting" />

    <pagination item-count="11" :page="page" :page-count="pageCount" />

    <div><tweet-button /></div>

    <div :class="`rankingTable column${rankingSetting.columns.length}`">
      <div class="header">
        <div class="cell head">_</div>
        <div class="subRow">
          <div class="cell head headerName">名前</div>
          <div v-for="(column, n) in rankingSetting.columns" :key="`column${n}`" class="cell head data" :class="{ targetCell: rankingSetting.sortColumn === n }">{{ column.name }}</div>
        </div>
      </div>

      <div v-for="(data, n) in rankInfosInPage" class="roww" :key="`monster${data.data.no}`">
        <div class="cell head number text-right">
          <div class="stretch">{{ (page - 1) * inPageCount + n + 1 }}</div>
        </div>
        <div class="cell">
          <span class="monsterIconWrapper">
            <monster-icon style="line-height: 1em;" use-favorite-flag use-favorite-evolution-flag :no="data.data.no" width="3em" height="3em" />
            {{ (_senzaiKillerNo = data.data.enableSenzaiKiller) && null }}
            <img v-if="_senzaiKillerNo" class="senzaiIcon" :src="`image/senzaiKiller/${_senzaiKillerNo}.png`">
            {{ (_superAwakenNo = data.data.bestSuperAwaken) && null }}
            <img v-if="_superAwakenNo" class="superAwakenIcon" :src="`image/awaken/${_superAwakenNo}.png`">
          </span>
        </div>
        <div class="subRow">
          <div class="cell name">
            <div class="stretch">
              <router-link :to="{ name: 'monsterDetails', params: { no: data.data.no }}">
                {{ data.data.name }}
              </router-link>
            </div>
          </div>
          <div v-for="(column, m) in data.columns" class="cell text-right data" :class="{ targetCell: rankingSetting.sortColumn === m }" :key="`column${m}`">{{ column | addComma }}</div>
        </div>
      </div>
    </div>

    <pagination item-count="11" :page="page" :page-count="pageCount" />
  </div>
</template>

<script>
import { constData, checkCanMixMonster, stretchElement } from '../mtpadmdb.js';
import MonsterFilterSetting, { filterMonsterDataArray, filterSettingText, getFilterDefault } from '../components/monsterFilterSetting.vue';
import MixinForPage from '../components/mixins/forPage.js';
import RouteQueryWrapper from '../components/mixins/routeQueryWrapper.js';

/** 2体攻撃発動のフラグ。 */
const F_A_WAY = 1 << 0;
/** L字消し攻撃発動のフラグ。 */
const F_A_L_JI = 1 << 1;
/** コンボ強化発動のフラグ。 */
const F_A_COMBO_UP = 1 << 2;
/** 超コンボ強化発動のフラグ。 */
const F_A_SP_COMBO_UP = 1 << 3;
/** ダメージ無効貫通発動のフラグ。 */
const F_A_A3X3 = 1 << 4;
/** HP80以上強化発動のフラグ。 */
const F_A_OVER80 = 1 << 5;
/** HP50以下強化発動のフラグ。 */
const F_A_UNDER50 = 1 << 6;
/** 回復ドロップ強化の回復４個消し時回復力アップ発動のフラグ。 */
const F_A_RECOVERY_PLUS = 1 << 7;
/** 攻撃力（与えるダメージ）のランキングのフラグ。 */
const F_DAMAGE_RANKING = 1 << 8;

/**
 * モンスターのパラメータなどのランク付けを行うページのコンポーネント。
 */
export default {
  name: 'PageRanking',
  pageTitle: function () {
    return this.pageTitle;
  },
  breadcrumbsTitle: function () {
    return this.rankingSetting.title + 'ランキング';
  },
  components: { MonsterFilterSetting },
  mixins: [
    MixinForPage,
    RouteQueryWrapper
  ],
  /** $route.query ラッパー設定 */
  queries: {
    /** 表示するページの番号。 */
    page: {
      type: Number,
      default: 1
    },
    /** 限界突破時のパラメータを使用するかどうか。 */
    useOverLimit: {
      type: Boolean
    },
    /** マルチブースト適用時のパラメータを使用するかどうか。 */
    useMultiBoost: {
      type: Boolean
    },
    /** 超覚醒を使用するかどうか。 */
    useSuperAwaken: {
      type: Boolean
    },
    /** 敵のタイプ・属性を反映した攻撃力を使用するかどうか。 */
    useEnemyState: {
      type: Boolean
    },
    /** 想定する敵の番号。 */
    enemyNoWrapper: {
      type: Number,
      queryKey: 'enemyNo',
      default: null,
      computed: true
    },
    /** 想定する敵のタイプ。 */
    enemyAttributesWrapper: {
      type: Array,
      queryKey: 'enemyAttributes',
      computed: true
    },
    /** 想定する敵の属性。 */
    enemyTypesWrapper: {
      type: Array,
      queryKey: 'enemyTypes',
      computed: true
    },
    /** 潜在キラーを使用するかどうか。 */
    useSenzaiKillerWrapper: {
      type: Boolean,
      queryKey: 'useSenzaiKiller',
      computed: true
    },
    /** 潜在覚醒枠の解放分を使用するかどうか。 */
    useRelasedSenzaiAwakenWrapper: {
      type: Boolean,
      queryKey: 'useRelasedSenzaiAwaken',
      computed: true
    },
    /** 与えるダメージを半減させる属性の配列。 */
    damageHalfAttributesWrapper: {
      type: Array,
      queryKey: 'damageHalfAttributes',
      computed: true
    },
    /** 与えるダメージを半減させるタイプの配列。 */
    damageHalfTypesWrapper: {
      type: Array,
      queryKey: 'damageHalfTypes',
      computed: true
    }
  },
  /** $route.query の変更を受けてデータが変更されたときに呼ばれるフック。 */
  queriesReceived: function () {
    this.visibleDamageHalf = this.damageHalfAttributes.length || this.damageHalfTypes.length;
  },
  props: {
    id: {
      type: String,
      default: 'hp'
    }
  },
  /** ランキング設定の配列。 */
  rankingSettings: [
    {
      label: 'ステータス',
      settings: [
        {
          id: 'hp',
          title: 'HP',
          description: 'モンスターのレベル最大・+297・全覚醒時のHPのランキングです。',
          columns: [
            { name: 'HP', func: data => data.hyperMaxParam.hp },
            { name: '攻撃', func: data => data.hyperMaxParam.attack },
            { name: '回復', func: data => data.hyperMaxParam.recovery }
          ],
          sortColumn: 0,
          awakenFlag: 0
        },
        {
          id: 'attack',
          title: '攻撃',
          description: 'モンスターのレベル最大・+297・全覚醒時の攻撃のランキングです。',
          columns: [
            { name: 'HP', func: data => data.hyperMaxParam.hp },
            { name: '攻撃', func: data => (data.attackWithToTarget) | 0 },
            { name: '回復', func: data => data.hyperMaxParam.recovery }
          ],
          sortColumn: 1,
          awakenFlag: F_DAMAGE_RANKING
        },
        {
          id: 'recovery',
          title: '回復',
          description: 'モンスターのレベル最大・+297・全覚醒時の回復のランキングです。',
          columns: [
            { name: 'HP', func: data => data.hyperMaxParam.hp },
            { name: '攻撃', func: data => data.hyperMaxParam.attack },
            { name: '回復', func: data => data.hyperMaxParam.recovery }
          ],
          sortColumn: 2,
          awakenFlag: 0
        },
        {
          id: 'plus',
          title: 'プラス換算値',
          description: 'モンスターのレベル最大・全覚醒時のプラス換算値のランキングです。',
          columns: [
            { name: 'HP', func: data => data.hyperPlusCount.hp },
            { name: '攻撃', func: data => data.hyperPlusCount.attack },
            { name: '回復', func: data => data.hyperPlusCount.recovery },
            { name: '+換算', func: data => data.hyperPlusCount.plus }
          ],
          sortColumn: 3,
          awakenFlag: 0
        },
        {
          id: 'overlimitOffset',
          title: '限界突破時プラス換算値増加量',
          description: '限界突破によるステータスプラス換算値の増加量のランキングです。',
          columns: [
            { name: 'Lv最大', func: data => data.hyper100PlusCount.plus },
            { name: 'Lv110', func: data => data.hyper110PlusCount.plus },
            { name: '増加量', func: data => data.overLimitOffset }
          ],
          sortColumn: 2,
          awakenFlag: 0
        }
      ]
    },
    {
      label: '覚醒反映',
      settings: [
        {
          id: 'wayAttack',
          title: '2体攻撃消し時攻撃力',
          description: 'モンスターのレベル最大・+297・全覚醒時の2体攻撃消し時の攻撃力ランキングです。',
          columns: [
            { name: '攻撃力', func: data => (data.attackWithToTarget * data.wayAttackRate) | 0 }
          ],
          sortColumn: 0,
          awakenFlag: F_DAMAGE_RANKING | F_A_WAY
        },
        {
          id: 'lJiAttack',
          title: 'L字消し攻撃時攻撃力',
          description: 'モンスターのレベル最大・+297・全覚醒時のL字消し攻撃時の攻撃力ランキングです。',
          columns: [
            { name: '攻撃力', func: data => (data.attackWithToTarget * data.lJiAttackRate) | 0 }
          ],
          sortColumn: 0,
          awakenFlag: F_DAMAGE_RANKING | F_A_L_JI
        },
        {
          id: '7comboAttack',
          title: '7コンボ時攻撃力',
          description: 'モンスターのレベル最大・+297・全覚醒時の7コンボ時の攻撃力ランキングです。',
          columns: [
            { name: '攻撃力', func: data => (data.attackWithToTarget * data.comboUpAttackRate) | 0 }
          ],
          sortColumn: 0,
          awakenFlag: F_DAMAGE_RANKING | F_A_COMBO_UP
        },
        {
          id: '10comboAttack',
          title: '10コンボ時攻撃力',
          description: 'モンスターのレベル最大・+297・全覚醒時の10コンボ時の攻撃力ランキングです。',
          columns: [
            { name: '攻撃力', func: data => (data.attackWithToTarget * data.comboUpAttackRate * data.spComboUpAttackRate) | 0 }
          ],
          sortColumn: 0,
          awakenFlag: F_DAMAGE_RANKING | F_A_COMBO_UP | F_A_SP_COMBO_UP
        },
        {
          id: 'way7comboAttack',
          title: '2体攻撃消し7コンボ時攻撃力',
          description: 'モンスターのレベル最大・+297・全覚醒時の2体消し攻撃7コンボ時の攻撃力ランキングです。',
          columns: [
            { name: '攻撃力', func: data => (data.attackWithToTarget * data.wayAttackRate * data.comboUpAttackRate) | 0 }
          ],
          sortColumn: 0,
          awakenFlag: F_DAMAGE_RANKING | F_A_WAY | F_A_COMBO_UP
        },
        {
          id: 'lJi7comboAttack',
          title: 'L字消し攻撃7コンボ時攻撃力',
          description: 'モンスターのレベル最大・+297・全覚醒時の消し7コンボ時の攻撃力ランキングです。',
          columns: [
            { name: '攻撃力', func: data => (data.attackWithToTarget * data.lJiAttackRate * data.comboUpAttackRate) | 0 }
          ],
          sortColumn: 0,
          awakenFlag: F_DAMAGE_RANKING | F_A_L_JI | F_A_COMBO_UP
        },
        {
          id: 'recovery4',
          title: '回復４個消し時回復力',
          description: 'モンスターのレベル最大・+297・全覚醒時の回復４個消し時の回復力ランキングです。',
          columns: [
            { name: '回復+99', func: data => data.hyperMaxParam.recovery },
            { name: '回復力', func: data => (data.hyperMaxParam.recovery * data.bestSuperAwakenRate * data.recoveryUpRate) | 0 },
          ],
          sortColumn: 1,
          awakenFlag: F_A_RECOVERY_PLUS
        }
      ]
    },
    {
      label: '無効貫通',
      settings: [
        {
          id: 'a3x3Attack',
          title: '無効貫通時攻撃力',
          description: 'モンスターのレベル最大・+297・全覚醒時の無効貫通時の攻撃力ランキングです。',
          columns: [
            { name: '攻撃力', func: data => data.hasAawaken(48) ? (data.attackWithToTarget * data.a3x3AttackRate) | 0 : null }
          ],
          sortColumn: 0,
          awakenFlag: F_DAMAGE_RANKING | F_A_A3X3
        },
        {
          id: 'a3x37comboAttack',
          title: '無効貫通７コンボ時攻撃力',
          description: 'モンスターのレベル最大・+297・全覚醒時の無効貫通７コンボ時の攻撃力ランキングです。',
          columns: [
            { name: '攻撃力', func: data => data.hasAawaken(48) ? (data.attackWithToTarget * data.a3x3AttackRate * data.comboUpAttackRate) | 0 : null }
          ],
          sortColumn: 0,
          awakenFlag: F_DAMAGE_RANKING | F_A_A3X3 | F_A_COMBO_UP
        },
        {
          id: 'a3x310comboAttack',
          title: '無効貫通10コンボ時攻撃力',
          description: 'モンスターのレベル最大・+297・全覚醒時の無効貫通10コンボ時の攻撃力ランキングです。',
          columns: [
            { name: '攻撃力', func: data => data.hasAawaken(48) ? (data.attackWithToTarget * data.a3x3AttackRate * data.comboUpAttackRate * data.spComboUpAttackRate) | 0 : null }
          ],
          sortColumn: 0,
          awakenFlag: F_DAMAGE_RANKING | F_A_A3X3 | F_A_COMBO_UP | F_A_SP_COMBO_UP
        }
      ]
    },
    {
      label: 'アシストボーナス',
      settings: [
        {
          id: 'assistHp',
          title: 'HPアシスト',
          description: 'モンスターのレベル最大・+297・全覚醒時のHPアシストボーナスのランキングです。',
          columns: [
            { name: 'HP', func: data => data.assistMaxParam.hp },
            { name: '攻撃', func: data => data.assistMaxParam.attack },
            { name: '回復', func: data => data.assistMaxParam.recovery }
          ],
          sortColumn: 0,
          awakenFlag: 0
        },
        {
          id: 'assistAttack',
          title: '攻撃アシスト',
          description: 'モンスターのレベル最大・+297・全覚醒時の攻撃アシストボーナスのランキングです。',
          columns: [
            { name: 'HP', func: data => data.assistMaxParam.hp },
            { name: '攻撃', func: data => data.assistMaxParam.attack },
            { name: '回復', func: data => data.assistMaxParam.recovery }
          ],
          sortColumn: 1,
          awakenFlag: 0
        },
        {
          id: 'assistRecovery',
          title: '回復アシスト',
          description: 'モンスターのレベル最大・+297・全覚醒時の回復アシストボーナスのランキングです。',
          columns: [
            { name: 'HP', func: data => data.assistMaxParam.hp },
            { name: '攻撃', func: data => data.assistMaxParam.attack },
            { name: '回復', func: data => data.assistMaxParam.recovery }
          ],
          sortColumn: 2,
          awakenFlag: 0
        },
        {
          id: 'assistPlus',
          title: 'アシストボーナス プラス換算値',
          description: 'モンスターのレベル最大・全覚醒時のアシストボーナス値のプラス換算値のランキングです。',
          columns: [
            { name: 'HP', func: data => data.assistMaxParam.hp },
            { name: '攻撃', func: data => data.assistMaxParam.attack },
            { name: '回復', func: data => data.assistMaxParam.recovery },
            { name: '+換算', func: data => data.assist ? (data.assistMaxParam.hp / 10 + data.assistMaxParam.attack / 5 + data.assistMaxParam.recovery / 3).toFixed(1) : null }
          ],
          sortColumn: 3,
          awakenFlag: 0
        }
      ]
    }
  ],
  data: function () {
    return {
      /** 検索設定が変更されたときに表示ページ指定をリセットするかどうか。 */
      pageResetFlag: false,
      /** 1ページ内に表示するモンスターの件数。 */
      inPageCount: 20,
      /** 表示するモンスターに対するフィルタ。 */
      filterSetting: getFilterDefault(),
      /** 想定する敵の番号。 */
      enemyNo: null,
      /** 想定する敵のタイプ。 */
      enemyAttributes_: [],
      /** 想定する敵の属性。 */
      enemyTypes_: [],
      /** ダメージ半減指定のフォームを表示するかどうか。 */
      visibleDamageHalf: false,
      /** 与えるダメージを半減させるタイプの配列。 */
      damageHalfTypes: [],
      /** 与えるダメージを半減させる属性の配列。 */
      damageHalfAttributes: [],
      /** 潜在キラーを使用するかどうか。 */
      useSenzaiKiller: false,
      /** 潜在覚醒枠の解放分を使用するかどうか。 */
      useRelasedSenzaiAwaken: false
    };
  },
  computed: {
    monsterTable () { return this.$store.state.monsterTable; },
    imageTable () { return this.$store.state.imageTable; },
    attributeTable () { return constData.attributeTable; },
    typeTable () { return constData.typeTable; },
    awakenTable () { return constData.awakenTable; },
    /** 表示対象のモンスター数に対する、表示ページの枚数 */
    pageCount () { return ((this.filteredRankInfos.length + this.inPageCount - 1) / this.inPageCount) | 0; },
    
    enemyNoWrapper: {
      get: function () { return (this.useEnemyState) ? this.enemyNo : null; },
      set: function (no) { if (this.useEnemyState) { this.enemyNo = no; } }
    },
    /** 想定する敵属性・タイプの query への取得・設定を行うかどうか。 */
    isEnableEnemyStatus: function () { return (this.useEnemyState && this.enemyNo === null); },
    enemyAttributesWrapper: {
      get: function () { return (this.isEnableEnemyStatus) ? this.enemyAttributes : []; },
      set: function (array) { if (this.isEnableEnemyStatus) { this.enemyAttributes = array; } }
    },
    enemyTypesWrapper: {
      get: function () { return (this.isEnableEnemyStatus) ? this.enemyTypes : []; },
      set: function (array) { if (this.isEnableEnemyStatus) { this.enemyTypes = array; } }
    },
    useSenzaiKillerWrapper: {
      get: function () { return (this.useEnemyState) ? this.useSenzaiKiller : false; },
      set: function (b) { if (this.useEnemyState) { this.useSenzaiKiller = b; } }
    },
    useRelasedSenzaiAwakenWrapper: {
      get: function () { return (this.useEnemyState) ? this.useRelasedSenzaiAwaken : false; },
      set: function (b) { if (this.useEnemyState) { this.useRelasedSenzaiAwaken = b; } }
    },
    damageHalfAttributesWrapper: {
      get: function () { return (this.useEnemyState) ? this.damageHalfAttributes : []; },
      set: function (array) { if (this.useEnemyState) { this.damageHalfAttributes = array; } }
    },
    damageHalfTypesWrapper: {
      get: function () { return (this.useEnemyState) ? this.damageHalfTypes : []; },
      set: function (array) { if (this.useEnemyState) { this.damageHalfTypes = array; } }
    },

    /** ページのタイトル。 */
    pageTitle () {
      let title = this.rankingSetting.title + 'ランキング';

      const enables = [];
      let enemyInfo = '';
      if (this.useOverLimit) { enables.push('限突'); }
      if (this.useMultiBoost) { enables.push('マルブ'); }
      if (this.useSuperAwaken) { enables.push('超覚醒'); }

      if (this.useEnemyState) {
        if (this.enemyNo) {
          const monsterData = this.monsterTable[this.enemyNo];
          if (monsterData) {
            enemyInfo += ':' + monsterData.name;
          }
        } else {
          if (this.enemyAttributes.length) {
            enemyInfo += ' 属性:' + this.enemyAttributes.map(d => this.attributeTable[d]).join('/');
          }
          if (this.enemyTypes.length) {
            enemyInfo += ' タイプ:' + this.enemyTypes.map(d => this.typeTable[d].name).join('/');
            if (this.useSenzaiKiller) { enables.push('潜在キラー'); }
            if (this.useRelasedSenzaiAwaken) { enables.push('潜在覚醒枠解放'); }
          }
        }

        let herfDamages = [];
        if (this.damageHalfAttributes.length) {
          herfDamages = herfDamages.concat(this.damageHalfAttributes.map(d => this.attributeTable[d]));
        }
        if (this.damageHalfTypes.length) {
          herfDamages = herfDamages.concat(this.damageHalfTypes.map(d => this.typeTable[d].name));
        }
        if (herfDamages.length) {
          enemyInfo += ' ' + herfDamages.join('/') + 'からの攻撃を半減';
        }
      }

      if (enables.length) {
        title += ' ' + enables.join('/') + '使用';
      }
      if (enemyInfo) {
        title += ' 敵モンスター' + enemyInfo;
      }
      const fst = filterSettingText(this.filterSetting);
      if (fst) {
        title += ' 対象モンスター ' + fst;
      }

      return title;
    },

    /** IDをキーとしてランキング設定を格納したオブジェクト。 */
    rankingSettingObj () {
      const obj = {};
      for (const n in this.$options.rankingSettings) {
        const group = this.$options.rankingSettings[n];
        for (const m in group.settings) {
          const setting = group.settings[m];
          obj[setting.id] = setting;
        }
      }
      return obj;
    },
    /** 現在使用するランキング設定。 */
    rankingSetting () {
      let s = this.rankingSettingObj[this.id];
      // IDに適合する設定がない場合はID指定なしの状態にする。
      if (!s) {
        this.changeRouteId(undefined);
        s = { name: '' };
      }
      return s;
    },
    /** 攻撃力（与えるダメージ）のランキングかどうか。 */
    isDamageRanking () {
      return !!(this.rankingSetting.awakenFlag & F_DAMAGE_RANKING);
    },
    /** 現在のページで表示するランキング結果を格納した配列。 */
    rankInfosInPage () {
      const beginIndex = (this.page - 1) * this.inPageCount;
      return this.filteredRankInfos.slice(beginIndex, beginIndex + this.inPageCount);
    },
    /** 現在の設定でのランキング結果を格納した配列。 */
    rankInfos () {
      const sortColumn = this.rankingSetting.sortColumn;
      const columnsFuncs = this.rankingSetting.columns.map(o => o.func);
      const rankInfos = this.wrapedMonsterDataArray.map(data => {
        const columns = columnsFuncs.map(f => f(data));
        if (columns[sortColumn] === null) { return null; }
        return { columns: columns, data: data };
      }).filter(o => o !== null);
      
      rankInfos.sort((a, b) => {
        // NaNが含まれている場合、減算結果をそのままだ使うとNaNの値がソートされないので、事前に判定する。
        // （パラメータ不明のものの+297やプラス換算、アシスト時加算値の計算結果が NaN になっている）
        const aValue = a.columns[sortColumn];
        const bValue = b.columns[sortColumn];
        const aIsNotNumeric = aValue === null || isNaN(aValue);
        const bIsNotNumeric = bValue === null || isNaN(bValue);
        if (aIsNotNumeric) {
          if (bIsNotNumeric) { return 0; }
          return 1;
        }
        if (bIsNotNumeric) { return -1; }
        return bValue - aValue;
      });
      return rankInfos;
    },
    /** 現在のフィルタリング設定でフィルタリングされた、ランキング結果の配列。 */
    filteredRankInfos () {
      return filterMonsterDataArray(this.filterSetting, this.rankInfos);
    },
    /** 覚醒発動時の効果のレートを取得する機能を追加したモンスター情報オブジェクトの配列。 */
    wrapedMonsterDataArray: function () {
      const awakenTable = this.awakenTable;
      const manageObj = this;
      const getterBase = {
        /** 指定された覚醒を持っているかどうかを取得する。超覚醒を使う場合は含めて確認する。 */
        hasAawaken: function (awakenNo) {
          return this.awakenCount[awakenNo] || (manageObj.useSuperAwaken && this.superAwakens && this.superAwakens.includes(awakenNo));
        },
        /** 指定された覚醒発動時のレートを算出する。 */
        culcAwakenRate: function (awakenNo) {
          return Math.pow(awakenTable[awakenNo].rate, this.awakenCount[awakenNo] | 0);
        },
        /** ２体攻撃発動時の攻撃力レートを取得する。 */
        get wayAttackRate () {
          return this.culcAwakenRate(27);
        },
        /** L字攻撃発動時の攻撃力レートを取得する。 */
        get lJiAttackRate () {
          return this.culcAwakenRate(60);
        },
        /** コンボ強化発動時の攻撃力レートを取得する。 */
        get comboUpAttackRate () {
          return this.culcAwakenRate(43);
        },
        /** 超コンボ強化発動時の攻撃力レートを取得する。 */
        get spComboUpAttackRate () {
          return this.culcAwakenRate(61);
        },
        /** ダメージ無効貫通発動時の攻撃力レートを取得する。 */
        get a3x3AttackRate () {
          return this.culcAwakenRate(48);
        },
        /** HP80%以上強化発動時の攻撃力レートを取得する。 */
        get over80AttackRate () {
          return this.culcAwakenRate(57);
        },
        /** HP50%以下強化発動時の攻撃力レートを取得する。 */
        get under50AttackRate () {
          return this.culcAwakenRate(58);
        },
        /** マルチブースト発動時のレートを取得する。 */
        get multiBoostRate () {
          return this.culcAwakenRate(30);
        },
        /** 回復ドロップ強化による回復４個消し時の回復力レートを取得する。 */
        get recoveryUpRate () {
          return this.culcAwakenRate(29);
        },
        /** 属性相性による攻撃力レートを取得する。 */
        get attrbuteRate () {
          const rateInfo = manageObj.enemyAttributeRateInfo;
          if (!rateInfo) { return 1; }
          return rateInfo[this.baseData.attributes[0]] || 1;
        },
        /** 現在設定されている敵に対してキラーを発動したときのレートを取得する。 */
        get killerRate () {
          let rate = 1;
          manageObj.enableKillerNos.forEach(killerNo => {
            rate *= this.culcAwakenRate(killerNo);
          });
          // 潜在キラーが使えるかどうかの判定。
          if (manageObj.useSenzaiKiller && this.baseData.types.some(d => manageObj.targetSenzaiKillerTypeTable[d])) {
            if (manageObj.useRelasedSenzaiAwaken && this.isEnableAppendSenzai) {
              rate *= 5.0625;
            } else {
              rate *= 3.375;
            }
          }
          return rate;
        },
        /** 現在の設定で有効な潜在キラーのタイプを取得する。 */
        get enableSenzaiKiller () {
          if (!manageObj.useSenzaiKiller) { return null; }
          for (const enemyType of manageObj.filteredEnemyTypes) {
            for (const myType of this.baseData.types) {
              if (manageObj.typeTable[myType].senzaiKiller.includes(enemyType)) {
                return enemyType;
              }
            }
          }
          return null;
        },
        /** 潜在覚醒枠の解放を行えるモンスターかどうか。 */
        get isEnableAppendSenzai () {
          const monsterData = this.baseData;
          // 転生・超転生の進化形態番号がtrue になっているテーブル。
          const reincarnationTable = { 3: true, 6: true };
          if (reincarnationTable[monsterData.evolutionType]) { return true; }
          const baseMonseterData = manageObj.monsterTable[monsterData.evolution.baseNo];
          if (baseMonseterData && (reincarnationTable[baseMonseterData.evolutionType])) { return true; }
          
          return false;
        },
        /** 現在の覚醒発動条件で、最も攻撃力を挙げられる超覚醒を取得する。 */
        get bestSuperAwaken () {
          if (!manageObj.useSuperAwaken) { return null; }
          if (!this.baseData.superAwakens) { return null; }
          // 無効貫通時で、通常覚醒に無効貫通を持っていないが超覚醒に無効貫通も持っている場合は、無効貫通を選択する。
          if ((manageObj.rankingSetting.awakenFlag & F_A_A3X3) && !this.awakenCount[48] && this.baseData.superAwakens && this.baseData.superAwakens.includes(48)) { return 48; }
          // 保持している覚醒をキーとして true を格納するオブジェクトを作成する。
          const superAwakensTable = {};
          const superAwakenLength = this.baseData.superAwakens.length;
          for (let i = 0; i < superAwakenLength; i++) {
            superAwakensTable[this.baseData.superAwakens[i]] = true;
          }
          
          const checkTable = [
            [F_A_SP_COMBO_UP, 61],
            [F_A_A3X3, 48],
            [F_A_COMBO_UP, 43],
            [F_A_UNDER50, 58],
            [F_A_WAY, 27],
            [F_A_L_JI, 60],
            [F_A_OVER80, 57],
            [F_A_RECOVERY_PLUS, 29]
          ];
          
          let awakenNo = null;
          const flag = manageObj.rankingSetting.awakenFlag;
          const checkTablelength = checkTable.length;
          for (let i = 0; i < checkTablelength; i++) {
            const a = checkTable[i];
            if ((flag & a[0]) && superAwakensTable[a[1]]) {
              awakenNo = a[1];
              break;
            }
          }
          // キラーが有効で、超コンボ強化以外の場合はキラー確認。
          if (manageObj.useEnemyState && awakenNo !== 61) {
            const killerNos = manageObj.enableKillerNos;
            const enemyTypeLenght = killerNos.length;
            for (let i = 0; i < enemyTypeLenght; i++) {
              const killerAwakenNo = killerNos[i];
              if (superAwakensTable[killerAwakenNo]) {
                awakenNo = killerAwakenNo;
                break;
              }
            }
          }
          return awakenNo;
        },
        /** 現在の覚醒発動条件で、最も攻撃力を挙げられる超覚醒の攻撃力レートを取得する。 */
        get bestSuperAwakenRate () {
          const awakenNo = this.bestSuperAwaken;
          if (!awakenTable[awakenNo]) { return 1; }
          return awakenTable[awakenNo].rate || 1;
        },
        /** 敵のタイプ・属性を反映する攻撃力レート。 */
        get enemyTargetRate () {
          if (!manageObj.useEnemyState) { return 1; }
          return this.attrbuteRate * this.killerRate;
        },
        /** 指定されている敵情報に対する攻撃力。 */
        get attackWithToTarget () {
          let attack = this.hyperMaxParam.attack * this.bestSuperAwakenRate * this.enemyTargetRate;
          const types = this.baseData.types;
          if (manageObj.damageHalfAttributes.includes(this.baseData.attributes[0]) |
            manageObj.damageHalfTypes.some(type => types.includes(type))
          ) { attack /= 2; }
          return attack;
        },
        /** 指定されたベースのパラメータを全覚醒状態のものにする。 */
        culcFullAwakenParam: function (baseParam) {
          let hp = NaN;
          let attack = NaN;
          let recovery = NaN;
          if (baseParam.hp !== null) {
            const hpAddAwaken = 1;
            const hpSubAwaken = 65;
            hp = baseParam.hp + (this.awakenCount[hpAddAwaken] || 0) * awakenTable[hpAddAwaken].value +
              (this.awakenCount[hpSubAwaken] || 0) * awakenTable[hpSubAwaken].value;
          }
          if (baseParam.attack !== null) {
            const attackAddAwaken = 2;
            const attackSubAwaken = 66;
            attack = baseParam.attack + (this.awakenCount[attackAddAwaken] || 0) * awakenTable[attackAddAwaken].value +
              (this.awakenCount[attackSubAwaken] || 0) * awakenTable[attackSubAwaken].value;
          }
          if (baseParam.recovery != null) {
            const recoveryAddAwaken = 3;
            const recoverySubAwaken = 67;
            recovery = baseParam.recovery + (this.awakenCount[recoveryAddAwaken] || 0) * awakenTable[recoveryAddAwaken].value +
              (this.awakenCount[recoverySubAwaken] || 0) * awakenTable[recoverySubAwaken].value;
          }
          return {
            hp: hp,
            attack: attack,
            recovery: recovery
          };
        },
        /** 現在のランキング設定とモンスターの情報に基づき、レベル最大時のパラメータか限界突破時のパラメータのいずれかを取得する。 */
        get _targetParam () {
          if (manageObj.useOverLimit && this.baseData.overLimit) {
            const overLimitParam = this.baseData.overLimitParam;
            if (overLimitParam.hp !== null || overLimitParam.attack !== null || overLimitParam.recovery !== null) {
              return overLimitParam;
            }
          }
          return this.baseData.maxParam;
        },
        /** 指定されたモンスターデータの、レベル最大or限界突破・+297・全覚醒時のパラメータを取得する。 */
        get hyperMaxParam () {
          let propName = 'hyperMaxParam';
          if (manageObj.useOverLimit) { propName += '_overLimit'; }
          if (manageObj.useMultiBoost) { propName += '_multiBoost'; }
          const cache = this.cache;
          if (!cache[propName]) {
            const param = this.culcFullAwakenParam(this._targetParam);
            if (checkCanMixMonster(this.baseData)) {
              param.hp += 10 * 99;
              param.attack += 5 * 99;
              param.recovery += 3 * 99;
            }
            if (manageObj.useMultiBoost && this.awakenCount[30]) {
              const rate = awakenTable[30].rate ** this.awakenCount[30];
              param.hp = param.hp * rate | 0;
              param.attack = param.attack * rate | 0;
              param.recovery = param.recovery * rate | 0;
            }
            cache[propName] = param;
          }
          return cache[propName];
        },
        /** 指定されたモンスターデータの、レベル最大or限界突破・全覚醒時のパラメータ及びプラス換算値を取得する。 */
        get hyperPlusCount () {
          let propName = 'hyperPlusCount';
          if (manageObj.useOverLimit) { propName += '_overLimit'; }
          if (manageObj.useMultiBoost) { propName += '_multiBoost'; }
          const cache = this.cache;
          if (!cache[propName]) {
            const param = this.culcFullAwakenParam(this._targetParam);
            if (manageObj.useMultiBoost && this.awakenCount[30]) {
              const rate = awakenTable[30].rate ** this.awakenCount[30];
              param.hp = param.hp * rate | 0;
              param.attack = param.attack * rate | 0;
              param.recovery = param.recovery * rate | 0;
            }
            param.plus = (param.hp / 10 + param.attack / 5 + param.recovery / 3).toFixed(1);

            cache[propName] = param;
          }
          return cache[propName];
        },
        /** 限界突破時パラメータを使用するかどうかの設定に問わず、レベル最大時・全覚醒時のパラメータ及びプラス換算値を取得する。 */
        get hyper100PlusCount () {
          const b = manageObj.useOverLimit;
          manageObj.useOverLimit = false;
          const p = this.hyperPlusCount;
          manageObj.useOverLimit = b;
          return p;
        },
        /** 限界突破時パラメータを使用するかどうかの設定に問わず、レベル110時・全覚醒時のパラメータ及びプラス換算値を取得する。 */
        get hyper110PlusCount () {
          const b = manageObj.useOverLimit;
          manageObj.useOverLimit = true;
          const p = this.hyperPlusCount;
          manageObj.useOverLimit = b;
          return p;
        },
        /** 限界突破前のプラス換算値と限界突破後のプラス換算値の差を主屋する。変化がない場合は null を返す。 */
        get overLimitOffset () {
          const b = manageObj.useOverLimit;
          manageObj.useOverLimit = true;
          const on = this.hyperPlusCount;
          manageObj.useOverLimit = false;
          const off = this.hyperPlusCount;
          manageObj.useOverLimit = b;
          const offset = on.plus - off.plus;
          if (offset === 0) { return null; }
          return offset.toFixed(1);
        },
        /** レベル最大or限界突破・+297・全覚醒時のアシストボーナス値を取得する。 */
        get assistMaxParam () {
          let propName = 'assistMaxParam';
          if (manageObj.useOverLimit) { propName += '_overLimit'; }
          const cache = this.cache;
          if (!cache[propName]) {
            if (!this.baseData.assist) {
              cache[propName] = {
                hp: null,
                attack: null,
                recovery: null
              };
            } else {
              const baseParam = this._targetParam;
              let param = {
                hp: NaN,
                attack: NaN,
                recovery: NaN
              };
              if (baseParam.hp !== null) {
                param.hp = ((baseParam.hp + 10 * 99) * 0.1) | 0;
              }
              if (baseParam.attack !== null) {
                param.attack = ((baseParam.attack + 5 * 99) * 0.05) | 0;
              }
              if (baseParam.recovery != null) {
                param.recovery = ((baseParam.recovery + 3 * 99) * 0.15) | 0;
              }
              if (this.awakenCount[49]) {
                param = this.culcFullAwakenParam(param);
              }
              cache[propName] = param;
            }
          }
          return cache[propName];
        }
      };
      const array = [];
      for (const key in this.monsterTable) {
        const data = this.monsterTable[key];
        const subData = Object.create(getterBase);
        subData.baseData = data;
        subData.cache = {};
        subData.awakenCount = data.awakenCount;
        const handler = {
          get: function (target, name) {
            return (name in target) ? target[name] : subData[name];
          }
        };
        array.push(new Proxy(data, handler));
      }
      return array;
    },
    /** 現在設定している敵属性に対して各属性で攻撃したときの攻撃力レートの配列 */
    enemyAttributeRateInfo () {
      const rateTable = {
        1: { 2: 2, 3: 0.5 },
        2: { 3: 2, 1: 0.5 },
        3: { 1: 2, 2: 0.5 },
        4: { 5: 2 },
        5: { 4: 2 }
      };
      return rateTable[this.enemyAttributes[0]];
    },
    /** 重複を除いた敵タイプ。 */
    filteredEnemyTypes () {
      return Array.from(new Set(this.enemyTypes));
    },
    /** 現在設定されている敵タイプに対して発動するキラー覚醒の番号。 */
    enableKillerNos () {
      const killerNoTable = {
        1: 32, 2: 31, 3: 33, 4: 34, 5: 35, 6: 36, 7: 37,
        8: 38, 9: 39, 10: 40, 11: 41
      };
      const enableKillerNos = [];
      const length = this.filteredEnemyTypes.length;
      for (let i = 0; i < length; i++) {
        const type = this.filteredEnemyTypes[i];
        const killerNo = killerNoTable[type];
        if (killerNo) { enableKillerNos.push(killerNo); }
      }
      return enableKillerNos;
    },
    /** 現在の敵タイプに対する潜在キラーをつけられるタイプをキーにして true を格納しているオブジェクト。 */
    targetSenzaiKillerTypeTable () {
      const obj = {};
      for (const key in this.typeTable) {
        const value = this.typeTable[key];
        if (value.senzaiKiller.some(d => this.filteredEnemyTypes.includes(d))) {
          obj[key] = true;
        }
      }
      return obj;
    },
    /** 想定する敵の属性。 */
    enemyAttributes: {
      get: function () {
        if (this.enemyNo !== null) {
          const enemyData = this.monsterTable[this.enemyNo];
          if (!enemyData) { return []; }
          return enemyData.attributes;
        } else {
          return this.enemyAttributes_;
        }
      },
      set: function (d) {
        if (this.enemyNo !== null) {
          this.enemyTypes_ = this.enemyTypes;
          this.enemyNo = null;
        }
        this.enemyAttributes_ = d;
      }
    },
    /** 想定する敵のタイプ。 */
    enemyTypes: {
      get: function () {
        if (this.enemyNo !== null) {
          const enemyData = this.monsterTable[this.enemyNo];
          if (!enemyData) { return []; }
          return enemyData.types;
        } else {
          return this.enemyTypes_;
        }
      },
      set: function (d) {
        if (this.enemyNo !== null) {
          this.enemyAttributes_ = this.enemyAttributes;
          this.enemyNo = null;
        }
        this.enemyTypes_ = d;
      }
    }
  },
  watch: {
    pageTitle: '$_mixinForPage_updateTitle',
    filteredRankInfos: function () {
      if (this.pageResetFlag) {
        this.page = 1;
      }
    }
  },
  created: function () {
    // created が終わって、その時点で予約？されている処理が終わったら、それ以降の絞り込み条件変更時にページリセットを行う。
    setTimeout(() => { this.pageResetFlag = true; }, 0);
  },
  updated: function () {
    this.stretch();
  },
  mounted: function () {
    this.stretch();
    window.addEventListener('resize', this.stretch);
  },
  beforeDestroy: function () {
    window.removeEventListener('resize', this.stretch);
  },
  methods: {
    /** モンスター名を、領域の横幅に合わせて縮小する。 */
    stretch: function () {
      const elms = this.$el.getElementsByClassName('stretch');
      for (const elm of elms) {
        stretchElement(elm);
      }
    },
    /** ルート上のランキング設定IDを変更する。 */
    changeRouteId: function (newId) {
      this.$router.push({ name: this.$route.name, params: { id: newId }, query: this.$route.query });
    }
  }
};

</script>

<style lang="scss" scoped>

label[disabled] {
  color: #999999;
}

.enemyStateArea {
  border: 1px solid #CCC;
  padding: 4px;
  border-radius: 4px;
}

.damageHalf {
  cursor: pointer;
  .triggerMark {
    display: inline-block;
    border: 1px solid #999;
    border-radius: 0.3em;
    width: 1.2em;
    height: 1.2em;
    line-height: 1em;
    color: #999;
    text-align: center;
  }

  .damageHalfIcon {
    width: auto;
    height: 1.3em;
  }
}

.monsterIconWrapper {
  display: inline-block;
  position: relative;
}

.senzaiIcon {
  position: absolute;
  left: 0;
  bottom: 0;
  width: 1.5em;
  height: auto;
}
.superAwakenIcon {
  position: absolute;
  right: 0;
  top: 0;
  width: 0.8em;
  height: 0.8em;
}

.rankingTable {
  $borderColor: rgb(222, 226, 230);

  border: 1px $borderColor;
  border-style: solid solid none solid;
  margin-bottom: 1em;

  div.cell {
    display: inline-block;
    border: 1px $borderColor;
    border-style: none solid solid none;
    padding: 2px;
    line-height: 3em;
  }

  div.cell:nth-last-of-type(1) {
    border-right: none;
  }

  div.roww {
    display: flex;
  }
  
  div.subRow {
    display: inline-block;
    width: calc(100% - 6em - 5px);
  }

  div.header {
    position: sticky;
    top: 56px;
    z-index: 4;

    > .cell {
      width: calc(6em + 5px);
      color: #00000000
    }
  }

  div.header .cell {
    line-height: 1.5em;
  }

  div.cell.head {
    background: #e9ecef;
  }

  .targetCell {
    background: #eef6ff;
  }

  .header .targetCell {
    background: #bbe6ff !important;
  }

  div.headerName{
    width: 50%;
  }

  div.number {
    width: 3em;
  }

  .senzaiIcon {
    width: 2em;
    height: auto;
  }
  .superAwakenIcon {
    width: 1em;
    height: 1em;
  }
  div.name {
    width: 50%;
    white-space: nowrap;
  }

  &.column1 div.data {
    width: calc(50% / 1);
  }
  &.column2 div.data {
    width: calc(50% / 2);
  }
  &.column3 div.data {
    width: calc(50% / 3);
  }
  &.column4 div.data {
    width: calc(50% / 4);
  }
  &.column5 div.data {
    width: calc(50% / 5);
  }

  @media (max-width: 767px) {
    div.headerName {
      display: none;
    }

    div.number {
      width: 2em;
    }
    div.subRow {
      width: calc(100% - 5em - 5px);
    }
    div.header > .cell {
      width: calc(5em + 5px);
    }

    div.data, div.name {
      line-height: 1.42em;
    }
    
    div.name {
      width: 100%;
      font-size: 80%;
      border-right: none;
      border-bottom-color: rgba($borderColor, .6);
    }

    div.data {
      border-right-color: rgba($borderColor, .6);
    }

    &.column1 div.data {
      width: calc(100% / 1);
    }
    &.column2 div.data {
      width: calc(100% / 2);
    }
    &.column3 div.data {
      width: calc(100% / 3);
    }
    &.column4 div.data {
      width: calc(100% / 4);
    }
    &.column5 div.data {
      width: calc(100% / 5);
    }
  }
}

.fade-enter-active, .fade-leave-active {
  transition: all .2s ease-in;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}

</style>
