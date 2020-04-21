<template>

  <div>
    <h2>{{ title }}</h2>
    <div class="monsterInfo" v-for="nullMonster in nullMonsterInfos" :key="`no${nullMonster.no}`">
      <div v-if="!isSkill" class="icon">
        <monster-icon :no="nullMonster.no" width="2.5em" height="2.5em" />
      </div>
      <div>
        <div class="monsterName">
          <router-link :to="{ name: detailPageName, params: { no: nullMonster.no } }">
            No.{{ nullMonster.no }} {{ targetTable[nullMonster.no].name }}
          </router-link>
          <router-link v-if="!isSkill" class="editLink" :to="{ name: editPageName, params: { no: nullMonster.no} }">編集</router-link>
        </div>
        <div class="itemNames">{{ nullMonster.names.join(' / ') }}</div>
        
      </div>
    </div>
  </div>
</template>

<script>
import MixinForPage from '../components/mixins/forPage.js';

/**
 * モンスター一覧ページコンポーネント
 */
export default {
  name: 'PageNullCheck',
  pageTitle: function () { return this.title; },
  mixins: [MixinForPage],

  data: function () {
    return {
    };
  },
  computed: {
    /** スキル情報に対する確認かどうか。 */
    isSkill () { return this.$route.name === 'nullSkillCheck'; },
    /** ページのタイトル。 */
    title () { return (this.isSkill) ? '空情報ありスキルデータチェック' : '空情報ありモンスターデータチェック'; },
    /** 情報の詳細ページのルート名。 */
    detailPageName () { return (this.isSkill) ? 'skillDetails' : 'monsterDetails'; },
    /** 情報の編集ページのルート名。 */
    editPageName () { return (this.isSkill) ? '' : 'monsterEdit'; },
    /** 確認対象の情報のテーブル。 */
    targetTable () { return (this.isSkill) ? this.$store.state.skillTable : this.$store.state.monsterTable; },
    /** 空の情報を持つモンスターの番号及び空の情報のキーの配列。 */
    nullMonsterInfos () {
      function nullCheck (d) {
        if (d === null) { return true; }
        // 配列やオブジェクトは要素を確認する。
        if (typeof d === 'object') {
          if (Array.isArray(d)) {
            // 配列は、確保している長さよりデータが少ない場合に余白が null になっているものがあるので、
            // 0番目のもののみ確認する。
            return nullCheck(d[0]);
          } else {
            return Object.values(d).some(nullCheck);
          }
        }
        return false;
      }

      const array = [];
      Object.values(this.targetTable).forEach(d => {
        // 内容が空の項目のキーの配列。
        const nullKeys = Object.keys(d).filter(key => {
          // 進化種類が無しや不明の場合は進化情報はない。
          if (key === 'evolution' && !d.evolutionType) {
            return false;
          }
          /** 限界突破が不明やなしの場合は限界突破時パラメータや超覚醒はない。 */
          if ((key === 'overLimitParam' || key === 'superAwakens') && !d.overLimit) {
            return false;
          }

          return nullCheck(d[key]);
        });

        const key2NameTable = {
          'attributes': '属性',
          'cost': 'コスト',
          'rare': 'レアリティ',
          'types': 'タイプ',
          'awakens': '覚醒',
          'maxExp': '必要経験値',
          'maxLevel': '最大レベル',
          'maxParam': '最大パラメータ',
          'skill': 'スキル',
          'leaderSkill': 'リーダースキル',
          'assist': 'アシスト可不可',
          'overLimit': '限界突破可不可',
          'overLimitParam': '限界突破時最大パラメータ',
          'superAwakens': '超覚醒',
          'evolutionType': '進化形態',
          'evolution': '進化情報',

          'baseTurn': 'レベル１時ターン',
          'minTurn': '最短ターン'
        };
        const names = nullKeys.map(d => key2NameTable[d] || d);

        if (nullKeys.length) {
          array.push({
            no: d.no,
            keys: nullKeys,
            names: names
          });
        }
      });
      return array;
    }
  }
};
</script>

<style lang="scss" scoped>

.monsterInfo {

  margin-bottom: 8px;
  padding: 4px;
  box-shadow: #0003 0px 0px 6px;
  border-radius: 4px;

  .editLink {
    float: right;
    margin-right: 4px;
    opacity: 0.4;

    &:hover {
      opacity: 1;
    }
  }

  .icon {
    float: left;
    padding: 0.25em;
  }

  .monsterName {
    min-height: 1.5em;
  }

  .itemNames {
    min-height: 1.5em;
  }
}
</style>
