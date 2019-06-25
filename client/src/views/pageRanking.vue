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
    <label>
      <input type="checkbox" v-model="useEnemyState" value="1">
      敵の属性による補正やキラーを反映する
    </label>
    <dl v-if="useEnemyState" class="enemyStateArea">
      <dt>敵のタイプ</dt>
      <dd>
        <attr-select mode="type" use-clear v-model="enemyTypes" />
      </dd>
      <dt>敵の属性</dt>
      <dd>
        <attr-select use-clear v-model="enemyAttributes" />
      </dd>
    </dl>

    <h3>{{ rankingSetting.title }}ランキング</h3>
    <p v-if="rankingSetting.description">{{ rankingSetting.description }}</p>
    <p>※このサイトに登録されているモンスターでのランキングです。</p>

    <monster-filter-setting v-model="filterSetting" />

    <pagination item-count="11" :page="page" :page-count="pageCount" />

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
            <monster-icon no-link :no="data.data.no" :monster-table="monsterTable" :image-table="imageTable" width="2em" height="2em" />
            {{ data.data.name }}
          </router-link>
        </td>
        <td v-for="(column, m) in data.columns" class="text-right" :key="`column${m}`">{{ column | addComma }}</td>
      </tr>
    </table>
  </div>
</template>

<script>
import { constData, checkCanMixMonster } from '../mtpadmdb.js';
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
            { name: '攻撃', func: data => (data.hyperMaxParam.attack * data.enemyTargetRate) | 0 },
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
          sortColumn: 2
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
            { name: '攻撃力', func: data => (data.hyperMaxParam.attack * data.enemyTargetRate * data.wayAttackRate) | 0 }
          ],
          sortColumn: 0
        },
        {
          id: 'lJiAttack',
          title: 'L字消し攻撃時攻撃力',
          description: 'モンスターのレベル最大・+297・全覚醒時のL字消し攻撃時の攻撃力ランキングです。',
          columns: [
            { name: '攻撃力', func: data => (data.hyperMaxParam.attack * data.enemyTargetRate * data.lJiAttackRate) | 0 }
          ],
          sortColumn: 0
        },
        {
          id: '7comboAttack',
          title: '7コンボ時攻撃力',
          description: 'モンスターのレベル最大・+297・全覚醒時の7コンボ時の攻撃力ランキングです。',
          columns: [
            { name: '攻撃力', func: data => (data.hyperMaxParam.attack * data.enemyTargetRate * data.comboUpAttackRate) | 0 }
          ],
          sortColumn: 0
        },
        {
          id: '10comboAttack',
          title: '10コンボ時攻撃力',
          description: 'モンスターのレベル最大・+297・全覚醒時の10コンボ時の攻撃力ランキングです。',
          columns: [
            { name: '攻撃力', func: data => (data.hyperMaxParam.attack * data.enemyTargetRate * data.comboUpAttackRate * data.spComboUpAttackRate) | 0 }
          ],
          sortColumn: 0
        },
        {
          id: 'way7comboAttack',
          title: '2体攻撃消し7コンボ時攻撃力',
          description: 'モンスターのレベル最大・+297・全覚醒時の2体消し攻撃7コンボ時の攻撃力ランキングです。',
          columns: [
            { name: '攻撃力', func: data => (data.hyperMaxParam.attack * data.enemyTargetRate * data.wayAttackRate * data.comboUpAttackRate) | 0 }
          ],
          sortColumn: 0
        },
        {
          id: 'lJi7comboAttack',
          title: 'L字消し攻撃7コンボ時攻撃力',
          description: 'モンスターのレベル最大・+297・全覚醒時の消し7コンボ時の攻撃力ランキングです。',
          columns: [
            { name: '攻撃力', func: data => (data.hyperMaxParam.attack * data.enemyTargetRate * data.lJiAttackRate * data.comboUpAttackRate) | 0 }
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
            { name: '攻撃力', func: data => data.awakenCount[48] ? (data.hyperMaxParam.attack * data.enemyTargetRate * data.a3x3AttackRate) | 0 : null }
          ],
          sortColumn: 0
        },
        {
          id: 'a3x37comboAttack',
          title: '無効貫通７コンボ時攻撃力',
          description: 'モンスターのレベル最大・+297・全覚醒時の無効貫通７コンボ時の攻撃力ランキングです。',
          columns: [
            { name: '攻撃力', func: data => data.awakenCount[48] ? (data.hyperMaxParam.attack * data.enemyTargetRate * data.a3x3AttackRate * data.comboUpAttackRate) | 0 : null }
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
      /** 検索設定が変更されたときに表示ページ指定をリセットするかどうか。 */
      pageResetFlag: false,
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
      },
      /** 想定する敵のタイプ。 */
      enemyAttributes: [],
      /** 想定する敵の属性。 */
      enemyTypes: [],
      /** 敵のタイプ・属をを反映した攻撃力を使用するかどうか。 */
      useEnemyState: false
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
        /** 属性相性による攻撃力レートを取得する。 */
        get attrbuteRate () {
          const rateTable = {
            1: { 2: 0.5, 3: 2 },
            2: { 3: 0.5, 1: 2 },
            3: { 1: 0.5, 2: 2 },
            4: { 5: 2 },
            5: { 4: 2 }
          };
          let rate = 1;
          const rateInfo = rateTable[this.baseData.attributes[0]];
          if (rateInfo) { rate = rateInfo[manageObj.enemyAttributes[0]] || 1; }
          return rate;
        },
        /** 現在設定されている敵に対してキラーを発動したときのレートを取得する。 */
        get killerRate () {
          let rate = 1;
          const killerNos = {
            1: 32, 2: 31, 3: 33, 4: 34, 5: 35, 6: 36, 7: 37,
            8: 38, 9: 39, 10: 40, 11: 41
          };
          manageObj.enemyTypes.forEach(type => {
            const killerAwakenNo = killerNos[type];
            if (killerAwakenNo) {
              rate *= this.culcAwakenRate(killerNos[type]);
            }
          });
          return rate;
        },
        /** 敵のタイプ・属性を反映する攻撃力レート。 */
        get enemyTargetRate () {
          if (!manageObj.useEnemyState) { return 1; }
          return this.attrbuteRate * this.killerRate;
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
    // created が終わって、その時点で予約？されている処理が終わったら、それ以降の絞り込み条件変更時にページリセットを行う。
    setTimeout(() => { this.pageResetFlag = true; }, 0);
  },
  methods: {
    /** ルートのクエリーを更新する。 */
    updateRouteQuery: function (changeQuery) {
      const margedQuery = Object.assign({}, this.$route.query, changeQuery);
      if (this.pageResetFlag) { margedQuery.page = undefined; }
      this.$router.push({ name: this.$route.name, params: this.$route.params, query: margedQuery });
    },
    /** 指定した名前のルートクエリーを元に同名のオブジェクトデータを変更する。 */
    queryToData: function (name) {
      this[name] = this.$route.query[name];
      return (this[name] !== undefined);
    },
    /** ルート上のランキング設定IDを変更する。 */
    changeRouteId: function (newId) {
      let query = this.$route.query;
      if (this.pageResetFlag) { query = Object.assign({}, query, { page: undefined }); }
      this.$router.push({ name: this.$route.name, params: { id: newId }, query: query });
    }
  }
};

</script>

<style lang="scss" scoped>
.enemyStateArea {
  border: 1px solid #CCC;
  padding: 4px;
  border-radius: 4px;
}
</style>
