<template>
  <div>
    <h2>モンスターランキング</h2>
    <div>
      <select :value="id" @change="changeRouteId($event.target.value)">
        <template v-for="(group, n) in $options.rankingSettings">
          <optgroup :label="group.label" :key="`group${n}`">
            <option v-for="setting in group.settings" :value="setting.id" :key="`rankingSetting_${setting.id}`">{{ setting.title }}ランキング</option>
          </optgroup>
        </template>
      </select>
    </div>
    <div>
      <input type="checkbox" id="isOverLimit" v-model="isOverLimit" value="1">
      <label for="isOverLimit">限界突破時のパラメータを使用する</label>
    </div>
    <div>
      <input type="checkbox" id="useMultiBoost" v-model="useMultiBoost" value="1">
      <label for="useMultiBoost">マルチブースト適用時のパラメータを使用する</label>
    </div>
    <h3>{{ rankingSetting.title }}ランキング</h3>
    <p v-if="rankingSetting.description">{{ rankingSetting.description }}</p>
    <p>※このサイトに登録されているモンスターでのランキングです。</p>

    <div id="filter" style="margin-bottom: 4px;">
      <span id="filterTrigger" :class="{ open: isOpenFilterTrigger }" @click="isVisibleFilter = !isVisibleFilter">
        絞り込み
        <svg viewBox="0 0 100 100" width="1em" height="1em">
          <path v-if="isVisibleFilter" d="M50 0 L10 75 L90 75 Z" style="fill:black;" />
          <path v-else d="M50 75 L10 0 L90 0 Z" style="fill:black;" />
        </svg>
      </span>
      <transition name="filter"
                  @before-enter="setStyleHeight($event, 'filter'); isOpenFilterTrigger = true;"
                  @after-enter="clearStyleHeight($event);"
                  @before-leave="setStyleHeight($event);"
                  @after-leave="isOpenFilterTrigger = false;"
      >
        <form id="filterForm" v-if="isVisibleFilter">
          <div>
            主属性：
            <template v-for="(attrName, attr) in attributeTable">
              <span style="margin-right: 0.5rem;" :key="`attr${attr}`" :style="{ visibility: attr === '0' ? 'hidden' : 'visible' }">
                <input :disabled="attr === '0'" type="checkbox" class="imageCheckBox" v-model="filter.attr" :value="attr" :id="`check_mainAttr_${attr}`">
                <label :for="`check_mainAttr_${attr}`">
                  <img v-if="attr !== '0' && attr !== 'null'" style="width: 24px; height: 24px;" :src="`./image/attribute/${attr}.png`">
                  <span v-else>{{ attrName }}</span>
                </label>
              </span>
            </template>
          </div>
          <div>
            複属性：
            <template v-for="(attrName, attr) in attributeTable">
              <span style="margin-right: 0.5rem;" :key="`attr${attr}`">
                <input type="checkbox" class="imageCheckBox" v-model="filter.subAttr" :value="attr" :id="`check_subAttr_${attr}`">
                <label :for="`check_subAttr_${attr}`">
                  <img v-if="attr !== '0' && attr !== 'null'" style="width: 24px; height: 24px;" :src="`./image/attribute/${attr}.png`">
                  <span v-else>{{ attrName }}</span>
                </label>
              </span>
            </template>
          </div>
          <div>
            タイプ：
            <template v-for="(typeInfo, type) in typeTable">
              <span v-if="type !== '0'" style="margin-right: 0.5rem" :key="`type${type}`">
                <input type="checkbox" class="imageCheckBox" v-model="filter.type" :value="type" :id="`type_${type}`">
                <label :for="`type_${type}`">
                  <img v-if="type !== 'null'" style="width: 24px; height: 24px;" :src="`./image/type/${type}.png`">
                  <span v-else>{{ typeInfo.name }}</span>
                </label>
              </span>
            </template>
          </div>
          <button class="btn btn-primary btn-sm" type="button" @click="clearFilter">クリア</button>
        </form>
      </transition>
    </div>

    <pagination :page="page" :page-count="pageCount" />

    <table class="table table-bordered table-sm">
      <tr class="thead-light">
        <th />
        <th>名前</th>
        <th v-for="(column, n) in rankingSetting.columns" :key="`column${n}`">{{ column.name }}</th>
      </tr>
      <tr v-for="(data, n) in rankInfosInPage" class="thead-light" :key="`monster${data.data.no}`">
        <th class="text-right">{{ (page - 1) * inPageCount + n + 1 }}</th>
        <td>
          <router-link :to="{ name: 'monsterDetails', params: { no: data.data.no }}">
            <monster-icon :no="data.data.no" :monster-table="monsterTable" :image-table="imageTable" width="2em" height="2em" />
            {{ data.data.name }}
          </router-link>
        </td>
        <td v-for="(column, m) in data.columns" class="text-right" :key="`column${m}`">{{ column }}</td>
      </tr>
    </table>
  </div>
</template>

<script>
import { constData } from '../mtpadmdb.js';

/**
 * モンスターのパラメータなどのランク付けを行うページのコンポーネント。
 */
export default {
  name: 'PageRanking',
  pageTitle: function () {
    return this.rankingSetting.title + 'ランキング';
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
          sortColumn: 0
        },
        {
          id: 'attack',
          title: '攻撃',
          description: 'モンスターのレベル最大・+297・全覚醒時の攻撃のランキングです。',
          columns: [
            { name: 'HP', func: data => data.hyperMaxParam.hp },
            { name: '攻撃', func: data => data.hyperMaxParam.attack },
            { name: '回復', func: data => data.hyperMaxParam.recovery }
          ],
          sortColumn: 1
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
          sortColumn: 2
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
          sortColumn: 3
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
            { name: '攻撃力', func: data => (data.hyperMaxParam.attack * data.wayAttackRate) | 0 }
          ],
          sortColumn: 0
        },
        {
          id: 'lJiAttack',
          title: 'L字消し攻撃時攻撃力',
          description: 'モンスターのレベル最大・+297・全覚醒時のL字消し攻撃時の攻撃力ランキングです。',
          columns: [
            { name: '攻撃力', func: data => (data.hyperMaxParam.attack * data.lJiAttackRate) | 0 }
          ],
          sortColumn: 0
        },
        {
          id: '7comboAttack',
          title: '7コンボ時攻撃力',
          description: 'モンスターのレベル最大・+297・全覚醒時の7コンボ時の攻撃力ランキングです。',
          columns: [
            { name: '攻撃力', func: data => (data.hyperMaxParam.attack * data.comboUpAttackRate) | 0 }
          ],
          sortColumn: 0
        },
        {
          id: '10comboAttack',
          title: '10コンボ時攻撃力',
          description: 'モンスターのレベル最大・+297・全覚醒時の10コンボ時の攻撃力ランキングです。',
          columns: [
            { name: '攻撃力', func: data => (data.hyperMaxParam.attack * data.comboUpAttackRate * data.spComboUpAttackRate) | 0 }
          ],
          sortColumn: 0
        },
        {
          id: 'way7comboAttack',
          title: '2体攻撃消し7コンボ時攻撃力',
          description: 'モンスターのレベル最大・+297・全覚醒時の2体消し攻撃7コンボ時の攻撃力ランキングです。',
          columns: [
            { name: '攻撃力', func: data => (data.hyperMaxParam.attack * data.wayAttackRate * data.comboUpAttackRate) | 0 }
          ],
          sortColumn: 0
        },
        {
          id: 'lJi7comboAttack',
          title: 'L字消し攻撃7コンボ時攻撃力',
          description: 'モンスターのレベル最大・+297・全覚醒時の消し7コンボ時の攻撃力ランキングです。',
          columns: [
            { name: '攻撃力', func: data => (data.hyperMaxParam.attack * data.lJiAttackRate * data.comboUpAttackRate) | 0 }
          ],
          sortColumn: 0
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
            { name: '攻撃力', func: data => data.awakenObj[48] ? (data.hyperMaxParam.attack * data.a3x3AttackRate) | 0 : null }
          ],
          sortColumn: 0
        },
        {
          id: 'a3x37comboAttack',
          title: '無効貫通７コンボ時攻撃力',
          description: 'モンスターのレベル最大・+297・全覚醒時の無効貫通７コンボ時の攻撃力ランキングです。',
          columns: [
            { name: '攻撃力', func: data => data.awakenObj[48] ? (data.hyperMaxParam.attack * data.a3x3AttackRate * data.comboUpAttackRate) | 0 : null }
          ],
          sortColumn: 0
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
          sortColumn: 0
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
          sortColumn: 1
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
          sortColumn: 2
        },
        {
          id: 'assistPlus',
          title: 'プラス換算値',
          description: 'モンスターのレベル最大・全覚醒時のアシストボーナス値のプラス換算値のランキングです。',
          columns: [
            { name: 'HP', func: data => data.assistMaxParam.hp },
            { name: '攻撃', func: data => data.assistMaxParam.attack },
            { name: '回復', func: data => data.assistMaxParam.recovery },
            { name: '+換算', func: data => data.assist ? (data.assistMaxParam.hp / 10 + data.assistMaxParam.attack / 5 + data.assistMaxParam.recovery / 3).toFixed(1) : null }
          ],
          sortColumn: 3
        }
      ]
    }
  ],
  data: function () {
    return {
      /** フィルタリング設定領域を表示するかどうか。 */
      isVisibleFilter: false,
      /** フィルタリング設定領域の表示／非表示を切り替えるトリガーの下部が開いた状態かどうか。 */
      isOpenFilterTrigger: false,
      /** 限界突破時のパラメータを使用するかどうか。 */
      isOverLimit: false,
      /** マルチブースト適用時のパラメータを使用するかどうか。 */
      useMultiBoost: false,
      /** 1ページ内に表示するモンスターの件数。 */
      inPageCount: 20,
      /** 表示するモンスターに対するフィルタ。 */
      filter: {
        /** 主属性。 */
        attr: [],
        /** 複属性。 */
        subAttr: [],
        /** タイプ */
        type: []
      }
    };
  },
  computed: {
    monsterTable () { return this.$store.state.monsterTable; },
    imageTable () { return this.$store.state.imageTable; },
    attributeTable () { return constData.attributeTable; },
    typeTable () { return constData.typeTable; },
    awakenTable () { return constData.awakenTable; },
    /** 表示対象のモンスター数に対する、表示ページの枚数 */
    pageCount () { return ((this.rankInfos.length + this.inPageCount - 1) / this.inPageCount) | 0; },
    /** 現在表示するページの番号。 1オリジン。 */
    page () { return (this.$route.query.page * 1) || 1; },
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
    /** 現在のページで表示するランキング結果を格納した配列。 */
    rankInfosInPage () {
      const beginIndex = (this.page - 1) * this.inPageCount;
      return this.filteredRankInfos.slice(beginIndex, beginIndex + this.inPageCount);
    },
    /** 現在の設定でのランキング結果を格納した配列。 */
    rankInfos () {
      const rankInfos = [];
      const sortColumn = this.rankingSetting.sortColumn;
      for (const key in this.wrapedMonsterDataArray) {
        const data = this.wrapedMonsterDataArray[key];
        const columns = this.rankingSetting.columns.map(o => o.func(data));
        if (columns[sortColumn] === null) { continue; }
        rankInfos.push({ columns: columns, data: data });
      }
      rankInfos.sort((a, b) => b.columns[sortColumn] - a.columns[sortColumn]);
      return rankInfos;
    },
    /** 現在のフィルタリング設定でフィルタリングされた、ランキング結果の配列。 */
    filteredRankInfos () {
      let monsterArray = this.rankInfos;
      if (this.filter.attr.length > 0) {
        const filterObj = {};
        for (const attr of this.filter.attr) { filterObj[attr] = true; }
        monsterArray = monsterArray.filter(d => filterObj[d.data.attributes[0]]);
      }
      if (this.filter.subAttr.length > 0) {
        const filterObj = {};
        for (const attr of this.filter.subAttr) { filterObj[attr] = true; }
        monsterArray = monsterArray.filter(d => filterObj[d.data.attributes[1]]);
      }
      if (this.filter.type.length > 0) {
        const filterObj = {};
        for (const type of this.filter.type) { filterObj[type] = true; }
        monsterArray = monsterArray.filter(
          d => d.data.types.some(type => filterObj[type])
        );
      }
      return monsterArray;
    },
    /** 覚醒発動時の効果のレートを取得する機能を追加したモンスター情報オブジェクトの配列。 */
    wrapedMonsterDataArray: function () {
      const awakenTable = this.awakenTable;
      const manageObj = this;
      const getterBase = {
        /** 指定された覚醒発動時のレートを算出する。 */
        culcAwakenRate: function (awakenNo) {
          return Math.pow(awakenTable[awakenNo].rate, this.awakenObj[awakenNo] | 0);
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
          return this.culcAwakenRate(30);
        },
        /** HP50%以下強化発動時の攻撃力レートを取得する。 */
        get under50AttackRate () {
          return this.culcAwakenRate(30);
        },
        /** マルチブースト発動時のレートを取得する。 */
        get multiBoostRate () {
          return this.culcAwakenRate(30);
        },
        /** 指定されたベースのパラメータを全覚醒状態のものにする。 */
        culcFullAwakenParam: function (baseParam) {
          let hp = NaN;
          let attack = NaN;
          let recovery = NaN;
          if (baseParam.hp !== null) {
            hp = baseParam.hp + (this.awakenObj[1] || 0) * awakenTable[1].value;
          }
          if (baseParam.attack !== null) {
            attack = baseParam.attack + (this.awakenObj[2] || 0) * awakenTable[2].value;
          }
          if (baseParam.recovery != null) {
            recovery = baseParam.recovery + (this.awakenObj[3] || 0) * awakenTable[3].value;
          }
          return {
            hp: hp,
            attack: attack,
            recovery: recovery
          };
        },
        /** 現在のランキング設定とモンスターの情報に基づき、レベル最大時のパラメータか限界突破時のパラメータのいずれかを取得する。 */
        get _targetParam () {
          if (manageObj.isOverLimit && this.baseData.overLimit) {
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
          if (manageObj.isOverLimit) { propName += '_overLimit'; }
          if (manageObj.useMultiBoost) { propName += '_multiBoost'; }
          const cache = this.cache;
          if (!cache[propName]) {
            const param = this.culcFullAwakenParam(this._targetParam);
            param.hp += 10 * 99;
            param.attack += 5 * 99;
            param.recovery += 3 * 99;
            if (manageObj.useMultiBoost && this.awakenObj[30]) {
              const rate = awakenTable[30].rate ** this.awakenObj[30];
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
          if (manageObj.isOverLimit) { propName += '_overLimit'; }
          if (manageObj.useMultiBoost) { propName += '_multiBoost'; }
          const cache = this.cache;
          if (!cache[propName]) {
            const param = this.culcFullAwakenParam(this._targetParam);
            if (manageObj.useMultiBoost && this.awakenObj[30]) {
              const rate = awakenTable[30].rate ** this.awakenObj[30];
              param.hp = param.hp * rate | 0;
              param.attack = param.attack * rate | 0;
              param.recovery = param.recovery * rate | 0;
            }
            param.plus = (param.hp / 10 + param.attack / 5 + param.recovery / 3).toFixed(1);

            cache[propName] = param;
          }
          return cache[propName];
        },
        /** レベル最大or限界突破・+297・全覚醒時のアシストボーナス値を取得する。 */
        get assistMaxParam () {
          let propName = 'assistMaxParam';
          if (manageObj.isOverLimit) { propName += '_overLimit'; }
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
              const param = {
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
              if (this.awakenObj[49]) {
                param.hp += (this.awakenObj[1] || 0) * awakenTable[1].value;
                param.attack += (this.awakenObj[2] || 0) * awakenTable[2].value;
                param.recovery += (this.awakenObj[3] || 0) * awakenTable[3].value;
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
        subData.awakenObj = {};
        for (const awaken of data.awakens) {
          subData.awakenObj[awaken] = (subData.awakenObj[awaken] || 0) + 1;
        }
        const handler = {
          get: function (target, name) {
            return (name in target) ? target[name] : subData[name];
          }
        };
        array.push(new Proxy(data, handler));
      }
      return array;
    }
  },
  watch: {
    rankingSetting: '$_mixinForPage_updateTitle',
    'filter.attr': function () {
      this.updateRouteQueryFromArray('attr', this.filter.attr);
    },
    '$route.query.attr': function () {
      this.queryToFilter('attr');
    },
    'filter.subAttr': function () {
      this.updateRouteQueryFromArray('subAttr', this.filter.subAttr);
    },
    '$route.query.subAttr': function () {
      this.queryToFilter('subAttr');
    },
    'filter.type': function () {
      this.updateRouteQueryFromArray('type', this.filter.type);
    },
    '$route.query.type': function () {
      this.queryToFilter('type');
    },
    'isOverLimit': function () {
      this.updateRouteQuery({ 'useOverLimitParam': this.isOverLimit ? 1 : undefined });
    },
    '$route.query.useOverLimitParam': function (newValue) {
      this.isOverLimit = !!newValue;
    },
    'useMultiBoost': function () {
      this.updateRouteQuery({ 'useMultiBoost': this.useMultiBoost ? 1 : undefined });
    },
    '$route.query.useMultiBoost': function (newValue) {
      this.useMultiBoost = !!newValue;
    }
  },
  created: function () {
    let isSetFilter = false;
    isSetFilter |= this.queryToFilter('attr');
    isSetFilter |= this.queryToFilter('subAttr');
    isSetFilter |= this.queryToFilter('type');
    isSetFilter |= this.queryToData('useMultiBoost');

    if (isSetFilter) {
      this.isVisibleFilter = this.isOpenFilterTrigger = true;
    }
  },
  methods: {
    /** 指定要素の現在の高さを style に設定する。親要素がない場合は指定された ID の要素に一時的に登録して計測する。 */
    setStyleHeight: function (elm, dummyParentId) {
      let dummyParent;
      const hasParent = !!elm.parentNode;
      if (!hasParent) {
        dummyParent = document.getElementById(dummyParentId);
        dummyParent.appendChild(elm);
      }
      elm.style.height = elm.clientHeight + 'px';
      if (!hasParent) { dummyParent.removeChild(elm); }
    },
    /** style に設定されている高さを空にする。 */
    clearStyleHeight: function (elm) {
      elm.style.height = '';
    },
    /** ルートのクエリーを更新する。 */
    updateRouteQuery: function (changeQuery) {
      const margedQuery = Object.assign({}, this.$route.query, changeQuery);
      this.$router.push({ name: this.$route.name, params: this.$route.params, query: margedQuery });
    },
    /** 配列をカンマで結合した値を使用してルートのクエリーを変更する。 */
    updateRouteQueryFromArray: function (name, array) {
      const obj = {};
      obj[name] = array.length ? array.slice().sort().join(',') : undefined;
      this.updateRouteQuery(obj);
    },
    /** 指定した名前のルートクエリーを元に同名のオブジェクトデータを変更する。 */
    queryToData: function (name) {
      this[name] = this.$route.query[name];
      return true;
    },
    /** 特定のルートクエリーを使用して、フィルタリング設定を変更する。 */
    queryToFilter: function (name) {
      let value = [];
      const query = this.$route.query[name];
      if (query) {
        value = query.split(',');
      }
      this.filter[name] = value;
      return (value.length > 0);
    },
    /** フィルタリング設定を空にする。 */
    clearFilter: function () {
      for (const key in this.filter) {
        this.filter[key] = [];
      }
    },
    /** ルート上のランキング設定IDを変更する。 */
    changeRouteId: function (newId) {
      this.$router.push({ name: this.$route.name, params: { id: newId }, query: this.$route.query });
    }
  }
};

</script>

<style scoped>
  #filterTrigger {
    border: 1px solid #AAC;
    border-radius: 8px;
    padding: 4px 4px 2px 4px;
    background: #FFF;
    cursor: pointer;
  }

  #filterTrigger.open {
    border-bottom-style: none;
    border-radius: 8px 8px 0 0;
  }

  #filterForm {
    border: 1px solid #AAC;
    border-radius: 0 8px 8px 8px;
    background: #FFF;
    margin-top: -2px;
    padding: 8px 4px 4px 4px;
  }

  input.imageCheckBox { display: none; }
  input.imageCheckBox + label {
    filter: opacity(50%) grayscale(75%);
  }

  input.imageCheckBox:checked + label {
    filter: opacity(100%) grayscale(0%);
  }

  input.imageCheckBox + label span {
    border: 1px solid #999;
    border-radius: 0.5em;
    background: #eee;
    padding: 0.25rem;
  }

  #filterForm {
    overflow: hidden;
  }

  .filter-enter-active {
    animation: filter-in .3s;
  }
  .filter-leave-active {
    animation: filter-in .3s reverse;
  }
  @keyframes filter-in {
    0% {
      height: 0em;
    }
  }

</style>
