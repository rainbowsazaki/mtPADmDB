<template>

  <div>
    <h2>{{ pageTitle }}</h2>
    <p>※文字を入力するところで値が不明の場合は空欄にしておいてください。</p>
    <form onsubmit="return false;" @submit="submit">
      <table class="table table-bordered table-sm">
        <tr>
          <td colspan="12">
            <div class="form-row">
              <div class="form-group col-md-4">
                <div class="input-group">
                  <div class="input-group-prepend">
                    <span class="input-group-text">No.</span>
                  </div>
                  <input type="number" class="form-control" id="inputNo" v-model.number="monsterData.no" required min="1" max="9999">
                </div>
              </div>
              <div class="form-group col-md-8">
                <input type="text" class="form-control" id="inputMonsterName" placeholder="モンスター名" v-model="monsterData.name" required minLength="1" maxLength="50">
              </div>
            </div>
          </td>
        </tr>
        <tr class="thead-light"><th colspan="12">タイプ</th></tr>
        <tr>
          <td v-for="n in 3" colspan="4" :key="`typeNo${n}`">
            <select class="custom-select" :id="'selectType' + n" v-model.number="monsterData.types[n - 1]">
              <option v-for="(type, key) in typeTable" :disabled="key === ((n === 1) ? '0' : 'null')" :value="key" :key="`type${key}`" v-once>{{ type.name }}</option>
            </select>
          </td>
        </tr>
        <tr class="thead-light">
          <th colspan="3">属性</th>
          <th colspan="3">複属性</th>
          <th colspan="3">レア</th>
          <th colspan="3">コスト</th>
        </tr>
        <tr>
          <td colspan="3">
            <select class="custom-select" id="selectAttribute0" v-model.number="monsterData.attributes[0]">
              <option v-for="(attribute, key) in attributeTable" :disabled="key === '0'" :value="key" :key="`attr${key}`" v-once>{{ attribute }}</option>
            </select></td>
          <td colspan="3">
            <select class="custom-select" id="selectAttribute1" v-model.number="monsterData.attributes[1]">
              <option v-for="(attribute, key) in attributeTable" :disabled="key === 'null'" :value="key" :key="`attr${key}`" v-once>{{ attribute }}</option>
            </select></td>
          <td colspan="3">
            <div class="input-group">
              <div class="input-group-prepend">
                <span class="input-group-text" style="padding: 0.375rem; font-size: 80%;">★</span>
              </div>
              <input type="number" class="form-control" id="inputRare" v-model.number="monsterData.rare" min="1" max="99">
            </div>
          </td>
          <td colspan="3">
            <input type="number" class="form-control" id="inputCost" v-model.number="monsterData.cost" min="1" max="999">
          </td>
        </tr>
        <tr class="thead-light">
          <th colspan="4">最大レベル</th>
          <th colspan="4">最大レベルに必要な経験値</th>
          <th colspan="4">アシスト</th>
        </tr>
        <tr>
          <td colspan="4">
            <div class="input-group">
              <div class="input-group-prepend">
                <span class="input-group-text">Lv.</span>
              </div>
              <input type="number" class="form-control" id="inputMaxLevel" v-model.number="monsterData.maxLevel" min="1" max="99">
            </div>
          </td>
          <td colspan="4">
            <input type="number" class="form-control" id="inputMaxExp" v-model.number="monsterData.maxExp" min="0" max="999999999">
          </td>
          <td colspan="4">
            <select class="custom-select" id="selectAssist" v-model.number="monsterData.assist">
              <option v-for="(type, key) in booleanTable" :value="key" :key="`assist${key}`" v-once>{{ type }}</option>
            </select>
          </td>
        </tr>
        <tr class="thead-light">
          <th colspan="12">覚醒</th>
        </tr>
        <tr>
          <td colspan="12">
            <awaken-select use-unknown v-model="monsterData.awakens" />
          </td>
        </tr>
        <tr class="thead-light">
          <th colspan="9">レベル最大時パラメータ</th>
          <th colspan="3">+297時</th>
        </tr>
        <tr-param type="hp" v-model.number="monsterData.maxParam.hp" />
        <tr-param type="attack" v-model.number="monsterData.maxParam.attack" />
        <tr-param type="recovery" v-model.number="monsterData.maxParam.recovery" />
        <tr class="thead-light">
          <th colspan="12">スキル</th>
        </tr>
        <tr>
          <td colspan="12" style="padding: 0;">
            <edit-skill :monster-data="monsterData" style="width: calc(100% + 2px); margin: -1px;" />
          </td>
        </tr>
        <tr class="thead-light">
          <th colspan="12">リーダースキル</th>
        </tr>
        <tr>
          <td colspan="12" style="padding: 0;">
            <edit-skill leader-skill :monster-data="monsterData" style="width: calc(100% + 2px); margin: -1px;" />
          </td>
        </tr>
        <tr class="thead-light">
          <th colspan="12">限界突破</th>
        </tr>
        <tr>
          <td colspan="12">
            <select class="custom-select" id="selectOverLimit" v-model.number="monsterData.overLimit">
              <option v-for="(type, key) in booleanTable" :value="key" :key="`overLimit${key}`" v-once>{{ type }}</option>
            </select>
          </td>
        </tr>
        <template v-if="monsterData.overLimit === 1">
          <tr class="thead-light">
            <th colspan="9">限界突破時パラメータ</th>
            <th colspan="3">+297時</th>
          </tr>
          <tr-param type="hp" v-model.number="monsterData.overLimitParam.hp" />
          <tr-param type="attack" v-model.number="monsterData.overLimitParam.attack" />
          <tr-param type="recovery" v-model.number="monsterData.overLimitParam.recovery" />
          <tr class="thead-light">
            <th colspan="12">超覚醒</th>
          </tr>
          <tr>
            <td colspan="12">
              <awaken-select use-unknown checkbox-style v-model="monsterData.superAwakens" />
            </td>
          </tr>
        </template>
        <tr class="thead-light">
          <th colspan="12">このモンスターへの進化形式</th>
        </tr>
        <tr>
          <td colspan="12">
            <select class="custom-select" id="evolutionType" v-model.number="monsterData.evolutionType">
              <option v-for="(type, key) in evolutionTypeTable" :value="key" :key="`evolutionType${key}`" v-once>{{ type }}</option>
            </select>
          </td>
        </tr>
        <template v-if="monsterData.evolutionType !== 0 && monsterData.evolutionType !== null && monsterData.evolutionType !== 'null'">
          <tr class="thead-light">
            <th colspan="12">進化前キャラ</th>
          </tr>
          <tr>
            <td colspan="12">
              <monster-incremental-search id="inputEvolutionBaseNo" v-model.number="monsterData.evolution.baseNo" :monster-table="monsterTable" :image-table="imageTable" />
            </td>
          </tr>
          <tr class="thead-light">
            <th colspan="12">素材</th>
          </tr>
          <tr v-for="n in 5" :key="`material${n}`">
            <td colspan="12">
              <monster-incremental-search :id="`inputEvolutionMaterial${n}`" v-model.number="monsterData.evolution.materials[n - 1]" :monster-table="monsterTable" :image-table="imageTable" />
            </td>
          </tr>
        </template>
        <tr class="thead-light">
          <th colspan="12">編集コメント（任意）</th>
        </tr>
        <tr>
          <td colspan="12">
            編集理由などを書いてください。（例：パラメータの更新）
            <textarea class="form-control" id="textareaComment" rows="3" v-model="monsterData.comment" minLength="0" maxLength="1000" />
          </td>
        </tr>
        <tr>
          <td v-for="n in 12" style="width:8.33333%; padding: 0; border: none;" :key="`margin${n}`" />
        </tr>
      </table>
      <button type="submit" class="btn btn-primary" :disabled="isSubmitted">{{ isSubmitted ? '送信中' :'送信する' }}</button>
    </form>
  </div>
</template>

<script>
import $ from 'jquery';
import { mtpadmdb, constData, gtagProductionOnly } from '../mtpadmdb.js';
import TrParam from './../components/monsterEditTrParam.vue';
import EditSkill from './../components/editSkill.vue';

/**
 * モンスター情報編集ページコンポーネント
 */
export default {
  name: 'PageMonsterEdit',
  pageTitle: function () { return this.pageTitle; },
  breadcrumbsTitle: function () { return this.breadCrumpsTitle; },
  middleOfBreadcrumbs: function () {
    const breadCrumbs = [
      {
        text: 'モンスター一覧',
        link: { name: 'monsterList' }
      }
    ];
    if (this.isHistory) {
      breadCrumbs.push({
        text: `No.${this.monsterData.no} ${this.monsterData.name} (${this.monsterData.datetime})`,
        link: { name: 'monsterHistory', params: { id: this.id }}
      });
    } else if (this.no) {
      breadCrumbs.push({
        text: `No.${this.no} ${this.monsterData.name}`,
        link: { name: 'monsterDetails', params: { no: this.no }}
      });
    } else {
      return undefined;
    }
    return breadCrumbs;
  },
  components: {
    TrParam,
    EditSkill
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

      monsterData: {},
      /** 送信済みかどうか。 */
      isSubmitted: false
    };
  },
  computed: {
    monsterTable: function () { return this.$store.state.monsterTable; },
    imageTable: function () { return this.$store.state.imageTable; },
    
    pageTitle: function () {
      if (this.isHistory) { return '履歴をもとに編集'; }
      if (this.no) {
        return `編集 No.${this.no} ${this.monsterData.name}`;
      } else {
        return 'モンスター情報新規登録';
      }
    },
    breadCrumpsTitle: function () {
      if (this.isHistory) { return '履歴をもとに編集'; }
      if (this.no) {
        return '編集';
      } else {
        return 'モンスター情報新規登録';
      }
    },

    /** 編集履歴を元データとした編集かどうか。 */
    isHistory: function () {
      return (this.$route.name === 'monsterHistoryEdit');
    },

    /** 超覚醒が 不明 かどうか */
    isUnknownSuperAwaken: function () {
      return this.monsterData.superAwakens.indexOf(null) !== -1;
    }
  },
  watch: {
    '$route.params.no': function () {
      this.fetchData();
    }
  },
  created: function () {
    this.fetchData();
    window._inputFromJson = (json) => { this.inputFromJson(json); };
  },

  destroyed: function () {
    delete window._inputFromJson;
  },
  methods: {
    /** 指定されたJSONテキストをもとに情報を設定する。 */
    inputFromJson: function (json) {
      this.monsterData = $.extend(true, {}, this.monsterData, JSON.parse(json));
      this.monsterData.comment = '新規登録';
    },
    fetchData: function () {
      this.monsterData = $.extend(true, {}, constData.monsterClearData);
      this.$_mixinForPage_updateTitle();

      let commitParam = null;
      if (this.isHistory) {
        commitParam = { historyId: this.id };
      }
      if (this.no) {
        commitParam = { no: this.no };
      }
      if (commitParam) {
        commitParam.callback = () => {
          const m = $.extend(true, {}, this.$store.state.monsterData);
          m.comment = '';

          this.monsterData = m;
          this.$_mixinForPage_updateTitle();
        };
        this.$store.commit('loadMonsterData', commitParam);
      } else {
        this.monsterData.comment = '新規登録';
      }
      this.$store.commit('fetchCommonData');
    },
    submit: function () {
      // 多重送信防止処理
      if (this.isSubmitted) { return; }
      this.isSubmitted = true;
      // 何かしらあってレスポンスが帰ってこなかった場合に再送信できるように２０秒後に復帰させる。
      const timeoutId = setTimeout(() => { this.isSubmitted = false; }, 20 * 1000);

      this.$store.commit('clearErrors');
      this.$store.commit('setMessages', ['送信中...']);

      // データの整形
      // 超覚醒を昇順ソート
      this.monsterData.superAwakens.sort((a, b) => a - b);

      mtpadmdb.api('updateMonster', this.monsterData, (response) => {
        // レスポンス来なかったときの復帰処理を止める。
        clearTimeout(timeoutId);

        // Google Analiticsにイベントを送信。
        let action = 'monsterDataPost';
        if (this.no) { action = 'monsterDataUpdate'; } // 現在のデータを元した編集の場合
        if (this.isHistory) { action = 'monsterDataUpdateFromHistory'; } // 編集履歴をもとにした編集の場合
        gtagProductionOnly('event', action, {
          'event_category': 'monsterData',
          'event_label': `No.${this.monsterData.no}`
        });

        this.$router.push({ path: `/${this.monsterData.no}` });
      }, (response) => {
        // レスポンス来なかったときの復帰処理を止める。
        clearTimeout(timeoutId);
        // 再度送信可能にする。
        this.isSubmitted = false;
      });
    }
  }
};
</script>
