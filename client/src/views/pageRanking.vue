<template>
  <div>
    <select v-model.number="rankingSettingIndex">
      <option v-for="(setting, n) in $options.rankingSettings" :value="n" :key="`rankingSetting${n}`">{{ setting.title }}ランキング</option>
    </select>
    <h2>{{ rankingSetting.title }}ランキング</h2>
    <p v-if="rankingSetting.description">{{ rankingSetting.description }}</p>
    <p>※このサイトに登録されているモンスターでのランキングです。</p>
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
      description: 'モンスターのレベル最大時のHPのランキングです。',
      columns: [
        { name: 'HP', func: data => data.maxParam.hp },
        { name: '攻撃', func: data => data.maxParam.attack },
        { name: '回復', func: data => data.maxParam.recovery }
      ],
      sortColumn: 0
    },
    {
      id: 'attack',
      title: '攻撃',
      description: 'モンスターのレベル最大時の攻撃のランキングです。',
      columns: [
        { name: 'HP', func: data => data.maxParam.hp },
        { name: '攻撃', func: data => data.maxParam.attack },
        { name: '回復', func: data => data.maxParam.recovery }
      ],
      sortColumn: 1
    }
  ],
  data: function () {
    return {
      /** 現在使用するランキング設定のインデックス。 */
      rankingSettingIndex: 0
    };
  },
  computed: {
    monsterTable () { return this.$store.state.monsterTable; },
    imageTable () { return this.$store.state.imageTable; },
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
        }
      };
      const array = [];
      for (const key in this.monsterTable) {
        const data = this.monsterTable[key];
        const subData = Object.create(getterBase);
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
