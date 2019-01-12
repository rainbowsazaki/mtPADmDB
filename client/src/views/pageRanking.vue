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
      <input type="checkbox" id="useOverLimit" v-model="useOverLimit" value="1">
      <label for="useOverLimit">限界突破時のパラメータを使用する</label>
    </div>
    <div>
      <input type="checkbox" id="useMultiBoost" v-model="useMultiBoost" value="1">
      <label for="useMultiBoost">マルチブースト適用時のパラメータを使用する</label>
    </div>
    <h3>{{ rankingSetting.title }}ランキング</h3>
    <p v-if="rankingSetting.description">{{ rankingSetting.description }}</p>
    <p>※このサイトに登録されているモンスターでのランキングです。</p>

    <monster-filter-setting v-model="filterSetting" />

    <pagination :page="page" :page-count="pageCount" />

    <div><tweet-button /></div>
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
        <td v-for="(column, m) in data.columns" class="text-right" :key="`column${m}`">{{ column | addComma }}</td>
      </tr>
    </table>
  </div>
</template>

<script>
import { constData } from '../mtpadmdb.js';
import { filterMonsterDataArray } from '../components/monsterFilterSetting.vue';

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
            { name: '攻撃力', func: data => data.awakenCount[48] ? (data.hyperMaxParam.attack * data.a3x3AttackRate) | 0 : null }
          ],
          sortColumn: 0
        },
        {
          id: 'a3x37comboAttack',
          title: '無効貫通７コンボ時攻撃力',
          description: 'モンスターのレベル最大・+297・全覚醒時の無効貫通７コンボ時の攻撃力ランキングです。',
          columns: [
            { name: '攻撃力', func: data => data.awakenCount[48] ? (data.hyperMaxParam.attack * data.a3x3AttackRate * data.comboUpAttackRate) | 0 : null }
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
          title: 'アシストボーナス プラス換算値',
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
      /** 限界突破時のパラメータを使用するかどうか。 */
      useOverLimit: false,
      /** マルチブースト適用時のパラメータを使用するかどうか。 */
      useMultiBoost: false,
      /** 1ページ内に表示するモンスターの件数。 */
      inPageCount: 20,
      /** 表示するモンスターに対するフィルタ。 */
      filterSetting: {
        /** 主属性。 */
        attr: [],
        /** 複属性。 */
        subAttr: [],
        /** タイプ */
        type: [],
        /** スキルターンの最小値。 */
        skillTurnMin: 1,
        /** スキルターンの最大値。 */
        skillTurnMax: 99
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
      return filterMonsterDataArray(this.filterSetting, this.rankInfos);
    },
    /** 覚醒発動時の効果のレートを取得する機能を追加したモンスター情報オブジェクトの配列。 */
    wrapedMonsterDataArray: function () {
      const awakenTable = this.awakenTable;
      const manageObj = this;
      const getterBase = {
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
            hp = baseParam.hp + (this.awakenCount[1] || 0) * awakenTable[1].value;
          }
          if (baseParam.attack !== null) {
            attack = baseParam.attack + (this.awakenCount[2] || 0) * awakenTable[2].value;
          }
          if (baseParam.recovery != null) {
            recovery = baseParam.recovery + (this.awakenCount[3] || 0) * awakenTable[3].value;
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
            param.hp += 10 * 99;
            param.attack += 5 * 99;
            param.recovery += 3 * 99;
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
              if (this.awakenCount[49]) {
                param.hp += (this.awakenCount[1] || 0) * awakenTable[1].value;
                param.attack += (this.awakenCount[2] || 0) * awakenTable[2].value;
                param.recovery += (this.awakenCount[3] || 0) * awakenTable[3].value;
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
    }
  },
  watch: {
    rankingSetting: '$_mixinForPage_updateTitle',
    'useOverLimit': function () {
      this.updateRouteQuery({ 'useOverLimit': this.useOverLimit ? 1 : undefined });
    },
    '$route.query.useOverLimit': function (newValue) {
      this.useOverLimit = !!newValue;
    },
    'useMultiBoost': function () {
      this.updateRouteQuery({ 'useMultiBoost': this.useMultiBoost ? 1 : undefined });
    },
    '$route.query.useMultiBoost': function (newValue) {
      this.useMultiBoost = !!newValue;
    }
  },
  created: function () {
    this.queryToData('useOverLimit');
    this.queryToData('useMultiBoost');
  },
  methods: {
    /** ルートのクエリーを更新する。 */
    updateRouteQuery: function (changeQuery) {
      const margedQuery = Object.assign({}, this.$route.query, changeQuery);
      this.$router.push({ name: this.$route.name, params: this.$route.params, query: margedQuery });
    },
    /** 指定した名前のルートクエリーを元に同名のオブジェクトデータを変更する。 */
    queryToData: function (name) {
      this[name] = this.$route.query[name];
      return (this[name] !== undefined);
    },
    /** ルート上のランキング設定IDを変更する。 */
    changeRouteId: function (newId) {
      this.$router.push({ name: this.$route.name, params: { id: newId }, query: this.$route.query });
    }
  }
};

</script>
