<template>
  <div>
    <h2>モンスター比較</h2>
    <h3>比較対象指定</h3>
    <form @submit="$event.preventDefault(); updateCompareMonster();">
      <div class="row" style="margin-bottom: 4px;">
        <div class="col-md-12" v-for="(target, i) in targets" :key="`monsterSearch${i}`">
          <monster-incremental-search v-model="targets[i]" :monster-table="monsterTable" :image-table="imageTable" />
        </div>
        <div class="col-md-12">
          <button type="button" class="btn btn-outline-secondary" @click="addMonster">+</button>
        </div>
      </div>
      <button type="submit" class="btn btn-primary">{{ isEnableMonsterDatas ? '比較表を更新する' : '比較表を表示する' }}</button>
    </form>

    <template v-if="isEnableMonsterDatas">

      <h3 style="margin-top: 1em;">比較表</h3>
      <div><tweet-button /></div>

      <div style="overflow: auto;">
        <table class="table table-bordered table-sm" style="table-layout: fixed;">
          <tr class="thead-light">
            <th style="width: 5em;" />
            <td v-for="(data, n) in monsterDatas" style="width: 4.3em;" :key="`monsterNo${n}`">
              <monster-icon :no="data.no" :monster-table="monsterTable" :image-table="imageTable" width="3em" height="3em" />
            </td>
          </tr>
          <tr class="thead-light">
            <th>名前</th>
            <td v-for="(data, n) in monsterDatas" :key="`monsterNo${n}`">{{ data.name }}</td>
          </tr>
          <tr class="thead-light">
            <th>タイプ</th>
            <td v-for="(data, n) in monsterDatas" :key="`monsterNo${n}`">
              <span v-if="data.types[0] === null">不明</span>
              <span v-else>
                <template v-for="(type, m) in data.types"><img v-if="type !== 0 && type !== null" :src="`./image/type/${type}.png`" alt="" style="width:1.5em; height: 1.5em;" :key="`typeNo${m}`"></template>
              </span>
            </td>
          </tr>
          <tr class="thead-light">
            <th>属性</th>
            <td v-for="(data, n) in monsterDatas" :key="`monsterNo${n}`">
              <span v-if="data.attributes[0] === null">不明</span>
              <template v-for="(attr, m) in data.attributes"><img v-if="attr !== 0 && attr !== null" style="width: 1.5em; height: 1.5em;" :src="`./image/attribute/${attr}.png`" :key="`attrNo${m}`"></template>
            </td>
          </tr>

          <tr class="thead-light">
            <th>覚醒</th>
            <td v-for="(data, n) in monsterDatas" :key="`monsterNo${n}`">
              <span v-if="data.awakens[0] === 0">なし</span>
              <span v-else-if="data.awakens[0] === null">不明</span>
              <ul v-else style="list-style: none; margin: 0px; padding: 0px;">
                <template v-for="(count, awaken) in data.awakenCount">
                  <li v-if="awaken !== '0'" class="text-nowrap" :key="`awaken${awaken}`">
                    <img v-if="awaken !== 0" :src="'./image/awaken/' + awaken + '.png'" style="width: 1.5em; height: 1.5em;" :title="awakenTable[awaken].name + '\n\n' + awakenTable[awaken].description">
                    × {{ count }}
                  </li>
                </template>
              </ul>
            </td>
          </tr>
          <tr class="thead-light" v-if="hasOverLimit">
            <th>超覚醒</th>
            <td v-for="(data, n) in monsterDatas" :key="`monsterNo${n}`">
              <span v-for="superAwaken in data.superAwakens" :key="`superAwaken${superAwaken}`">
                <img v-if="superAwaken !== null" :src="'./image/awaken/' + superAwaken + '.png'" style="width: 1.5em; height: 1.5em;" :title="awakenTable[superAwaken].name + '\n\n' + awakenTable[superAwaken].description">
              </span>
            </td>
          </tr>
          <tr class="thead-light">
            <th>潜在キラー</th>
            <td v-for="(data, n) in monsterDatas" :key="`monsterNo${n}`">
              <span v-if="data.types[0] === null">不明</span>
              <ul v-else-if="getSenzaiKillerNos(data).length" style="list-style: none; margin: 0px; padding: 0px;">
                <li v-for="senzaiKillerType in getSenzaiKillerNos(data)" style="display: inline-block" :key="`killer${senzaiKillerType}`">
                  <img :src="`./image/senzaiKiller/${senzaiKillerType}.png`" :alt="`${typeTable[senzaiKillerType].name}キラー`" style="width: auto; height: 1.5em;">
                </li>
              </ul>
              <span v-else>なし</span>
            </td>
          </tr>
          <compare-tr head="HP" :monster-datas="monsterDatas" :func="(data) => data.maxParam.hp" />
          <compare-tr head="攻撃" :monster-datas="monsterDatas" :func="(data) => data.maxParam.attack" />
          <compare-tr head="回復" :monster-datas="monsterDatas" :func="(data) => data.maxParam.recovery" />
          <template v-if="hasOverLimit">
            <tr class="thead-light">
              <th :colspan="monsterDatas.length + 1">限界突破時</th>
            </tr>
            <compare-tr head="HP" :monster-datas="monsterDatas" :func="(data) => data.overLimit ? data.overLimitParam.hp : '-'" />
            <compare-tr head="攻撃" :monster-datas="monsterDatas" :func="(data) => data.overLimit ? data.overLimitParam.attack : '-'" />
            <compare-tr head="回復" :monster-datas="monsterDatas" :func="(data) => data.overLimit ? data.overLimitParam.recovery : '-'" />
          </template>
          <template v-if="hasWay || hasComboUp || hasSpComboUp || canA3x3Compare">
            <tr class="thead-light">
              <th :colspan="monsterDatas.length + 1">レベル最大 攻撃+99時 覚醒反映ダメージ （コンボ倍率除く）</th>
            </tr>
            <compare-tr v-if="hasWay" head="4個消し" :monster-datas="monsterDatas" :func="(data) => maxAttack(data) * eraseDropCountRate(4) * wayAttackRate(data)" />
            <compare-tr v-if="hasLJi" head="L個消し" :monster-datas="monsterDatas" :func="(data) => maxAttack(data) * eraseDropCountRate(5) * lJiAttackRate(data)" />
            <compare-tr v-if="hasComboUp" head="3個消し 7コンボ" :monster-datas="monsterDatas" :func="(data) => maxAttack(data) * eraseDropCountRate(3) * comboUpAttackRate(data)" />
            <compare-tr v-if="hasSpComboUp" head="3個消し 10コンボ" :monster-datas="monsterDatas" :func="(data) => maxAttack(data) * eraseDropCountRate(3) * comboUpAttackRate(data) * spComboUpAttackRate(data)" />
            <compare-tr v-if="hasWay && hasComboUp" head="4個消し 7コンボ" :monster-datas="monsterDatas" :func="(data) => maxAttack(data) * eraseDropCountRate(4) * wayAttackRate(data) * comboUpAttackRate(data)" />
            <compare-tr v-if="hasWay && hasSpComboUp" head="4個消し 10コンボ" :monster-datas="monsterDatas" :func="(data) => maxAttack(data) * eraseDropCountRate(4) * wayAttackRate(data) * comboUpAttackRate(data) * spComboUpAttackRate(data)" />
            <compare-tr v-if="hasLJi && hasComboUp" head="L個消し 7コンボ" :monster-datas="monsterDatas" :func="(data) => maxAttack(data) * eraseDropCountRate(5) * lJiAttackRate(data) * comboUpAttackRate(data)" />
            <compare-tr v-if="hasLJi && hasSpComboUp" head="L個消し 10コンボ" :monster-datas="monsterDatas" :func="(data) => maxAttack(data) * eraseDropCountRate(5) * lJiAttackRate(data) * comboUpAttackRate(data) * spComboUpAttackRate(data)" />
            <compare-tr v-if="canA3x3Compare" head="無効貫通" :monster-datas="monsterDatas" :func="(data) => HasA3x3Awaken(data) ? maxAttack(data) * eraseDropCountRate(9) * a3x3AttackRate(data) : '-'" />
            <compare-tr v-if="canA3x3Compare && hasComboUp" head="無効貫通 7コンボ" :monster-datas="monsterDatas" :func="(data) => HasA3x3Awaken(data) ? maxAttack(data) * eraseDropCountRate(9) * a3x3AttackRate(data) * comboUpAttackRate(data) : '-'" />
          </template>
          <template v-if="hasWay || canA3x3Compare">
            <tr class="thead-light">
              <th :colspan="monsterDatas.length + 1">レベル最大 攻撃+99時 覚醒反映複合消しダメージ （コンボ倍率除く）</th>
            </tr>
            <compare-tr v-if="hasWay" head="4+3個消し" :monster-datas="monsterDatas" :func="(data) => maxAttack(data) * (eraseDropCountRate(4) * wayAttackRate(data) + eraseDropCountRate(3))" />
            <compare-tr v-if="hasWay && hasComboUp" head="4+3個消し 7コンボ" :monster-datas="monsterDatas" :func="(data) => maxAttack(data) * (eraseDropCountRate(4) * wayAttackRate(data) + eraseDropCountRate(3)) * comboUpAttackRate(data)" />
            <compare-tr v-if="hasWay && hasSpComboUp" head="4+3個消し 10コンボ" :monster-datas="monsterDatas" :func="(data) => maxAttack(data) * (eraseDropCountRate(4) * wayAttackRate(data) + eraseDropCountRate(3)) * comboUpAttackRate(data) * spComboUpAttackRate(data)" />
            <compare-tr v-if="canA3x3Compare" head="無効貫通+3個" :monster-datas="monsterDatas" :func="(data) => HasA3x3Awaken(data) ? maxAttack(data) * (eraseDropCountRate(9) * a3x3AttackRate(data) + eraseDropCountRate(3)) : '-'" />
            <compare-tr v-if="canA3x3Compare && hasComboUp" head="無効貫通+3個 7コンボ" :monster-datas="monsterDatas" :func="(data) => HasA3x3Awaken(data) ? maxAttack(data) * (eraseDropCountRate(9) * a3x3AttackRate(data) + eraseDropCountRate(3)) * comboUpAttackRate(data) : '-'" />
          </template>
        </table>
      </div>

      <h4>スキル</h4>
      <table class="table table-bordered table-sm">
        <template v-for="(data, n) in monsterDatas">
          <tr class="thead-light" :key="`monsterNo${n}`">
            <th rowspan="2" style="width: 2em;"><monster-icon :no="data.no" :monster-table="monsterTable" :image-table="imageTable" width="2em" height="2em" /></th>
            <td v-if="data.skill === null">不明</td>
            <td v-else>
              <router-link :to="{ name: 'skillDetails', params: { no: data.skill }}">{{ getSkillData(data.skill).name }}</router-link>
              <span style="font-size: 80%; float:right;">(最短ターン:<span v-if="getSkillData(data.skill).minTurn">{{ skillTable[data.skill].minTurn }}</span><span v-else>不明</span>)</span>
            </td>
          </tr>
          <tr v-if="data.skill" :key="`monsterNo${n}_2`"><td style="font-size: 90%; padding-left: 1em;">{{ getSkillData(data.skill).description }}</td></tr>
          <tr v-else :key="`monsterNo${n}_2`"><td /></tr>
        </template>
      </table>

      <h4>リーダースキル</h4>
      <table class="table table-bordered table-sm">
        <template v-for="(data, n) in monsterDatas">
          <tr class="thead-light" :key="`monsterNo${n}`">
            <th rowspan="2" style="width: 2em;"><monster-icon :no="data.no" :monster-table="monsterTable" :image-table="imageTable" width="2em" height="2em" /></th>
            <td v-if="data.leaderSkill === null">不明</td>
            <td v-else>
              <router-link :to="{ name: 'leaderSkillDetails', params: { no: data.leaderSkill }}">{{ getLeaderSkillData(data.leaderSkill).name }}</router-link>
            </td>
          </tr>
          <tr v-if="data.leaderSkill" :key="`monsterNo${n}_2`"><td style="font-size: 90%; padding-left: 1em;" v-html="getLeaderSkillDescriptionHtml(getLeaderSkillData(data.leaderSkill))" /></tr>
          <tr v-else :key="`monsterNo${n}_2`"><td /></tr>
        </template>
      </table>

    </template>
  </div>
</template>

<script>
import Vue from 'vue';
import $ from 'jquery';
import { constData, leaderSkillDescriptionToDecoratedHtml } from '../mtpadmdb.js';
import MixinForPage from '../components/mixins/forPage.js';
/**
 * モンスター同士の比較を行うページのコンポーネント。
 */
export default {
  name: 'PageCompare',
  pageTitle: function () {
    if (!this.isEnableMonsterDatas) { return 'モンスター比較'; }
    return 'モンスター比較 ' + this.targets.map(no => (this.monsterTable[no] || {}).name).join(',');
  },
  components: {
    // 値比較の行用のコンポーネント。
    compareTr: {
      props: {
        head: {
          type: String,
          required: true
        },
        monsterDatas: {
          type: Array,
          required: true
        },
        func: {
          type: Function,
          required: true
        }
      },
      filters: {
        /** 数値の少数点以下を切り上げるフィルタ */
        ceil: function (val) {
          if (typeof val !== 'number') { return val; }
          return Math.ceil(val);
        },
        /** パラメータが null か NaN の場合に 不明 と表示するためのフィルタ */
        nullToUndefined: function (val) {
          return (val === null || (typeof val === 'number' && isNaN(val))) ? '不明' : val;
        }
      },
      render: function (createElement) {
        const elms = [createElement('th', this.head)];
        for (const i in this.monsterDatas) {
          const data = this.monsterDatas[i];
          let text = this.func(data);
          for (const filterName of ['nullToUndefined', 'ceil', 'addComma']) {
            const filter = this.$options.filters[filterName] || Vue.filter(filterName);
            if (filter) { text = filter(text); }
          }
          elms.push(createElement('td', {
            attrs: {
              class: 'text-right',
              key: `monsterNos${i}`
            }
          }, text));
        }
        return createElement('tr', { attrs: { class: 'thead-light' }}, elms);
      }
    }
  },
  mixins: [MixinForPage],
  props: {
    nos: {
      type: String,
      default: ''
    }
  },
  data: function () {
    return {
      monsterDatas: [],

      targets: [0, 0]
    };
  },
  computed: {
    monsterTable () { return this.$store.state.monsterTable; },
    skillTable () { return this.$store.state.skillTable; },
    leaderSkillTable () { return this.$store.state.leaderSkillTable; },
    imageTable () { return this.$store.state.imageTable; },
    booleanTable () { return constData.booleanTable; },
    typeTable () { return constData.typeTable; },
    awakenTable () { return constData.awakenTable; },

    /** モンスター情報がすべて存在しているかどうかを取得する。 */
    isEnableMonsterDatas: function () {
      return (this.monsterDatas.length > 0 && this.monsterDatas.indexOf(null) === -1);
    },
    /** 限界突破可能なモンスターがいるかどうかを取得する。 */
    hasOverLimit: function () {
      return this.monsterDatas.find((o) => o.overLimit === 1);
    },

    /** 比較対象の中に２体攻撃を持つモンスターがいるかどうかを取得する。 */
    hasWay: function () {
      return this.HasAwakenMonster(27);
    },
    /** 比較対象の中にL字攻撃を持つモンスターがいるかどうかを取得する。 */
    hasLJi: function () {
      return this.HasAwakenMonster(60);
    },
    /** 比較対象の中にコンボ強化を持つモンスターがいるかどうかを取得する。 */
    hasComboUp: function () {
      return this.HasAwakenMonster(43);
    },
    /** 比較対象の中に超コンボ強化を持つモンスターがいるかどうかを取得する。 */
    hasSpComboUp: function () {
      return this.HasAwakenMonster(61);
    },
    /** 比較対象の中にダメージ無効貫通を持つモンスターがいるかどうかを取得する。 */
    hasA3x3: function () {
      return this.HasAwakenMonster(48);
    },
    /** 比較対象の中にダメージ無効貫通を持つモンスターが２体以上いて比較可能かどうかを取得する。 */
    canA3x3Compare: function () {
      return this.GetAwakenMonsterCount(48) >= 2;
    }
  },
  watch: {
    '$route': function () { this.load(); },
    monsterTable: ['$_mixinForPage_updateTitle', 'load'],
    isEnableMonsterDatas: '$_mixinForPage_updateTitle'
  },

  created: function () { this.load(); },
  
  methods: {
    addMonster: function () {
      this.targets.push(null);
    },
    /** 比較表示するモンスターを現在している番号のものに変更する。 */
    updateCompareMonster: function () {
      if (!this.targets[0] || !this.targets[1]) {
        this.$store.commit('setErrors', ['対象モンスターが正しく指定されていません。']);
        return;
      }
      this.$router.push({ name: 'compare', params: { nos: this.targets.join(',') }});
    },

    load: function () {
      this.targets = (this.nos || '').split(/,/g).map(s => { let n = parseInt(s); if (isNaN(n)) { n = null; } return n; });
      while (this.targets.length < 2) { this.targets.push(null); }
      
      this.monsterDatas = [];
      if (this.nos) {
        for (let i = 0; i < this.targets.length; i++) {
          if (this.targets[i] !== null) { this._load(i, this.targets[i]); }
        }
      }
      this.$_mixinForPage_updateTitle();
    },

    _load: function (index, monsterNo) {
      const monsterData = this.monsterTable[monsterNo];
      if (monsterData) {
        const data = $.extend(true, {}, constData.monsterClearData, monsterData);
        if (!data.superAwakens) { data.superAwakens = []; }

        Vue.set(this.monsterDatas, index, data);
        this.$store.commit('clearMessages');
      } else {
        const errorMessage = `モンスター No.${monsterNo} の情報が見つかりませんでした。`;
        this.$store.commit('clearMessages');
        this.$store.commit('setErrors', [errorMessage]);
      }
    },

    /** 指定された番号のスキル情報を取得する。存在しない場合はダミーデータを返す。 */
    getSkillData: function (no) {
      return this.$store.state.skillTable[no] || { name: '', description: '' };
    },
    /** 指定された番号のリーダースキル情報を取得する。存在しない場合はダミーデータを返す。 */
    getLeaderSkillData: function (no) {
      return this.$store.state.leaderSkillTable[no] || { name: '', description: '' };
    },
    getSenzaiKillerNos: function (monsterData) {
      // 合成できないものは潜在覚醒を降ることができないので無し。
      if (!this.canAddPlus(monsterData)) { return []; }
      const killerNoSet = new Set();
      for (const type of monsterData.types) {
        for (const killerNo of this.typeTable[type].senzaiKiller) {
          killerNoSet.add(killerNo);
        }
      }
      return Array.from(killerNoSet).filter(a => a < 9).sort((a, b) => a - b);
    },
    
    /** リーダースキル情報を元に、リーダースキルの効果をゲーム内の表記と同等の表示になるように装飾した HTML を作成する。 */
    getLeaderSkillDescriptionHtml: function (leaderSkillData) {
      return leaderSkillDescriptionToDecoratedHtml(leaderSkillData.description);
    },

    /** プラスが振れるキャラクターかどうかを返す。 */
    canAddPlus: function (monsterData) {
      // 素材系のタイプの場合はプラス合成不可と判断する。
      // レベルアップの可能なキャラの場合はプラスを降ることも可能だが需要もないだろうから無視。
      const type = monsterData.types[0];
      return !((type >= 9 && type <= 12) || type === 99);
    },

    /** 比較対象の中に指定された覚醒を持つモンスターが何体いるかを取得する。 */
    GetAwakenMonsterCount: function (awakenNo) {
      return this.monsterDatas.filter((o) => o.awakenCount[awakenNo] > 0).length;
    },
    /** 比較対象の中に指定された覚醒を持つモンスターがいるかどうかを取得する。 */
    HasAwakenMonster: function (awakenNo) {
      return this.monsterDatas.find((o) => o.awakenCount[awakenNo] > 0);
    },

    /** 指定されたモンスターデータがダメージ無効貫通を持っているかどうかを取得する。 */
    HasA3x3Awaken: function (monsterData) {
      return monsterData.awakenCount[48] > 0;
    },

    /** 指定されたモンスターデータの、レベル最大・攻撃+99・攻撃強化覚醒 時の攻撃力を取得する。 */
    maxAttack: function (monsterData) {
      if (monsterData.maxParam.attack === null) { return NaN; }
      return monsterData.maxParam.attack + 495 + (monsterData.awakenCount[2] || 0) * this.awakenTable[2].value;
    },
    /** 削除個数に応じてかかるダメージのレート */
    eraseDropCountRate: function (count) {
      return (count + 1) * 0.25;
    },
    /** 指定されたモンスターデータの、指定された覚醒発動時のレートを算出する。 */
    culcKakuseiRate: function (monsterData, awakenNo) {
      return Math.pow(this.awakenTable[awakenNo].rate, monsterData.awakenCount[awakenNo] | 0);
    },
    /** 指定されたモンスターデータの、２体攻撃発動時の攻撃力レートを取得する。 */
    wayAttackRate: function (monsterData) {
      return this.culcKakuseiRate(monsterData, 27);
    },
    /** 指定されたモンスターデータの、L字攻撃発動時の攻撃力レートを取得する。 */
    lJiAttackRate: function (monsterData) {
      return this.culcKakuseiRate(monsterData, 60);
    },
    /** 指定されたモンスターデータの、コンボ強化発動時の攻撃力レートを取得する。 */
    comboUpAttackRate: function (monsterData) {
      return this.culcKakuseiRate(monsterData, 43);
    },
    /** 指定されたモンスターデータの、超コンボ強化発動時の攻撃力レートを取得する。 */
    spComboUpAttackRate: function (monsterData) {
      return this.culcKakuseiRate(monsterData, 61);
    },
    /** 指定されたモンスターデータの、ダメージ無効貫通発動時の攻撃力レートを取得する。 */
    a3x3AttackRate: function (monsterData) {
      return this.culcKakuseiRate(monsterData, 48);
    }
  }
};
</script>
