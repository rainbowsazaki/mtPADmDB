<template>
  <div>
    <select v-model.number="rankingSettingIndex">
      <option v-for="(setting, n) in $options.rankingSettings" :value="n" :key="`rankingSetting${n}`">{{ setting.title }}ランキング</option>
    </select>
    <h2>{{ rankingSetting.title }}ランキング</h2>
    <p v-if="rankingSetting.description">{{ rankingSetting.description }}</p>
    <p>※このサイトに登録されているモンスターでのランキングです。</p>

    <div style="margin-bottom: 4px;">
      <span id="filterTrigger" :class="{ open: isOpenFilterTrigger }" @click="isVisibleFilter = !isVisibleFilter">
        絞り込み
        <svg viewBox="0 0 100 100" width="1em" height="1em">
          <path v-if="isVisibleFilter" d="M50 0 L10 75 L90 75 Z" style="fill:black;" />
          <path v-else d="M50 75 L10 0 L90 0 Z" style="fill:black;" />
        </svg>
      </span>
      <transition name="filter" @before-enter="isOpenFilterTrigger = true;" @after-leave="isOpenFilterTrigger = false;">
        <form id="filterForm" v-if="isVisibleFilter">
          <div>
            主属性：
            <template v-for="(attrName, attr) in attributeTable">
              <span style="margin-right: 0.5rem;" :key="`attr${attr}`" :style="{ visibility: attr === '0' ? 'hidden' : 'visible' }">
                <input :disabled="attr === '0'" type="checkbox" class="imageCheckBox" v-model.number="filter.attr" :value="attr" :id="`check_mainAttr_${attr}`">
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
                <input type="checkbox" class="imageCheckBox" v-model.number="filter.subAttr" :value="attr" :id="`check_subAttr_${attr}`">
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
                <input type="checkbox" class="imageCheckBox" v-model.number="filter.type" :value="type" :id="`type_${type}`">
                <label :for="`type_${type}`">
                  <img v-if="type !== 'null'" style="width: 24px; height: 24px;" :src="`./image/type/${type}.png`">
                  <span v-else>{{ typeInfo.name }}</span>
                </label>
              </span>
            </template>
          </div>
        </form>
      </transition>
    </div>

    <table class="table table-bordered table-sm">
      <tr class="thead-light">
        <th />
        <th>名前</th>
        <th v-for="(column, n) in rankingSetting.columns" :key="`column${n}`">{{ column.name }}</th>
      </tr>
      <tr v-for="(data, n) in rankInfos.slice(0, 20)" class="thead-light" :key="`monster${data.data.no}`">
        <th class="text-right">{{ n + 1 }}</th>
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
      default: null
    }
  },
  /** ランキング設定の配列。 */
  rankingSettings: [
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
        { name: 'HP', func: data => data.hyperMaxParam.hp - 990 },
        { name: '攻撃', func: data => data.hyperMaxParam.attack - 495 },
        { name: '回復', func: data => data.hyperMaxParam.recovery - 297 },
        { name: '+換算', func: data => (data.hyperMaxParam.hp / 10 + data.hyperMaxParam.attack / 5 + data.hyperMaxParam.recovery / 3 - 297).toFixed(1) }
      ],
      sortColumn: 3
    },
    {
      id: 'overLimitHp',
      title: '限界突破 HP',
      description: 'モンスターの限界突破orレベル最大・+297・全覚醒時のHPのランキングです。',
      columns: [
        { name: 'HP', func: data => data.hyperOverLimitParam.hp },
        { name: '攻撃', func: data => data.hyperOverLimitParam.attack },
        { name: '回復', func: data => data.hyperOverLimitParam.recovery }
      ],
      sortColumn: 0
    },
    {
      id: 'overLimitAttack',
      title: '限界突破 攻撃',
      description: 'モンスターの限界突破orレベル最大・+297・全覚醒時の攻撃のランキングです。',
      columns: [
        { name: 'HP', func: data => data.hyperOverLimitParam.hp },
        { name: '攻撃', func: data => data.hyperOverLimitParam.attack },
        { name: '回復', func: data => data.hyperOverLimitParam.recovery }
      ],
      sortColumn: 1
    },
    {
      id: 'overLimitRecovery',
      title: '限界突破 回復',
      description: 'モンスターの限界突破orレベル最大・+297・全覚醒時の回復のランキングです。',
      columns: [
        { name: 'HP', func: data => data.hyperOverLimitParam.hp },
        { name: '攻撃', func: data => data.hyperOverLimitParam.attack },
        { name: '回復', func: data => data.hyperOverLimitParam.recovery }
      ],
      sortColumn: 2
    },
    {
      id: 'overLimitPlus',
      title: '限界突破 プラス換算値',
      description: 'モンスターの限界突破orレベル最大・全覚醒時のプラス換算値のランキングです。',
      columns: [
        { name: 'HP', func: data => data.hyperOverLimitParam.hp - 990 },
        { name: '攻撃', func: data => data.hyperOverLimitParam.attack - 495 },
        { name: '回復', func: data => data.hyperOverLimitParam.recovery - 297 },
        { name: '+換算', func: data => (data.hyperOverLimitParam.hp / 10 + data.hyperOverLimitParam.attack / 5 + data.hyperOverLimitParam.recovery / 3 - 297).toFixed(1) }
      ],
      sortColumn: 3
    }
  ],
  data: function () {
    return {
      /** 現在使用するランキング設定のインデックス。 */
      rankingSettingIndex: 0,
      /** フィルタリング設定領域を表示するかどうか。 */
      isVisibleFilter: false,
      /** フィルタリング設定領域の表示／非表示を切り替えるトリガーの下部が開いた状態かどうか。 */
      isOpenFilterTrigger: false,
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

    /** 現在使用するランキング設定。 */
    rankingSetting () { return this.$options.rankingSettings[this.rankingSettingIndex]; },
    /** 現在の設定でのランキング結果を格納した配列。 */
    rankInfos () {
      const rankInfos = [];
      for (const key in this.wrapedMonsterDataArray) {
        const data = this.wrapedMonsterDataArray[key];
        rankInfos.push({ columns: this.rankingSetting.columns.map(o => o.func(data)), data: data });
      }
      const sortColumn = this.rankingSetting.sortColumn;
      rankInfos.sort((a, b) => b.columns[sortColumn] - a.columns[sortColumn]);
      return rankInfos;
    },
    /** 現在のフィルタリング設定でフィルタリングされたモンスター情報の配列。 */
    filteredMonsterArray () {
      let monsterArray = Object.values(this.monsterTable);
      if (this.filter.attr.length > 0) {
        monsterArray = monsterArray.filter(
          d => this.filter.attr.some(attr => d.attributes[0] === attr)
        );
      }
      if (this.filter.subAttr.length > 0) {
        monsterArray = monsterArray.filter(
          d => this.filter.subAttr.some(attr => d.attributes[1] === attr)
        );
      }
      if (this.filter.type.length > 0) {
        monsterArray = monsterArray.filter(
          d => d.types.some(
            type => this.filter.type.some(compType => compType === type)
          )
        );
      }
      return monsterArray;
    },
    /** 覚醒発動時の効果のレートを取得する機能を追加したモンスター情報オブジェクトの配列。 */
    wrapedMonsterDataArray: function () {
      const awakenTable = this.awakenTable;
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
        /** 指定されたベースのパラメータを、+297・全覚醒状ののものにする。 */
        culcHyperParam: function (baseParam) {
          let hp = NaN;
          let attack = NaN;
          let recovery = NaN;
          if (baseParam.hp !== null) {
            hp = baseParam.hp + 990 + (this.awakenObj[1] || 0) * awakenTable[1].value;
          }
          if (baseParam.attack !== null) {
            attack = baseParam.attack + 495 + (this.awakenObj[2] || 0) * awakenTable[2].value;
          }
          if (baseParam.recovery != null) {
            recovery = baseParam.recovery + 297 + (this.awakenObj[3] || 0) * awakenTable[3].value;
          }
          return {
            hp: hp,
            attack: attack,
            recovery: recovery
          };
        },
        /** 指定されたモンスターデータの、レベル最大・攻撃+99・攻撃強化覚醒 時の攻撃力を取得する。 */
        get hyperMaxParam () {
          const propName = 'hyperMaxParam';
          const cache = this.cache;
          if (!cache[propName]) {
            const param = this.baseData.maxParam;
            cache[propName] = this.culcHyperParam(param);
          }
          return cache[propName];
        },
        /** 指定されたモンスターデータの、限界突破orレベル最大・攻撃+99・攻撃強化覚醒 時の攻撃力を取得する。 */
        get hyperOverLimitParam () {
          const propName = 'hyperOverLimitParam';
          const cache = this.cache;
          if (!cache[propName]) {
            const overLimitParam = this.baseData.overLimitParam;
            if (this.baseData.overLimit &&
                (overLimitParam.hp !== null || overLimitParam.attack !== null || overLimitParam.recovery !== null)
            ) {
              cache[propName] = this.culcHyperParam(overLimitParam);
            } else {
              cache[propName] = this.hyperMaxParam;
            }
          }
          return cache[propName];
        }
      };
      const array = [];
      for (const key in this.filteredMonsterArray) {
        const data = this.filteredMonsterArray[key];
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
    rankingSettingIndex: function () {
      this.$router.push({ name: this.$route.name, params: { id: this.rankingSetting.id }});
    },
    '$route': 'selectSettingFromId'
  },
  created: function () {
    this.selectSettingFromId();
  },
  methods: {
    /** プロパティの id に指定された値を元に、使用するランキング設定を選択する。 */
    selectSettingFromId: function () {
      if (this.id === null) {
        this.rankingSettingIndex = 0;
      } else {
        for (const i in this.$options.rankingSettings) {
          const setting = this.$options.rankingSettings[i];
          if (setting.id === this.id) {
            this.rankingSettingIndex = i;
            break;
          }
        }
      }
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
    height: 7.5em;
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
    100% {
      height: 7.5em;
    }
  }

</style>
