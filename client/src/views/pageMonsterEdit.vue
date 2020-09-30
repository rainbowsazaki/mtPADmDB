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
        <tr class="thead-light">
          <th colspan="12">タイプ</th>
        </tr>
        <tr>
          <td colspan="12">
            <attr-select use-unknown use-clear mode="type" v-model="monsterData.types" />
          </td>
        </tr>
        <tr class="thead-light">
          <th colspan="12">属性</th>
        </tr>
        <tr>
          <td colspan="12">
            <attr-select use-unknown use-none use-clear v-model="monsterData.attributes" />
          </td>
        </tr>
        <tr class="thead-light">
          <th colspan="4">レア</th>
          <th colspan="4">コスト</th>
          <th colspan="4">アシスト</th>
        </tr>
        <tr>
          <td colspan="4">
            <div class="input-group">
              <div class="input-group-prepend">
                <span class="input-group-text" style="padding: 0.375rem; font-size: 80%;">★</span>
              </div>
              <input type="number" class="form-control" id="inputRare" v-model.number="monsterData.rare" min="1" max="99">
            </div>
          </td>
          <td colspan="4">
            <input type="number" class="form-control" id="inputCost" v-model.number="monsterData.cost" min="0" max="999">
          </td>
          <td colspan="4">
            <select class="custom-select" id="selectAssist" v-model.number="monsterData.assist">
              <option v-for="(type, key) in booleanTable" :value="key" :key="`assist${key}`" v-once>{{ type }}</option>
            </select>
          </td>
        </tr>
        <tr class="thead-light">
          <th colspan="6">最大レベル</th>
          <th colspan="6">
            <span class="d-inline-block">最大レベルに</span>
            <span class="d-inline-block">必要な</span>
            <span class="d-inline-block">経験値</span>
          </th>
        </tr>
        <tr>
          <td colspan="6">
            <div class="input-group">
              <div class="input-group-prepend">
                <span class="input-group-text">Lv.</span>
              </div>
              <input type="number" class="form-control" id="inputMaxLevel" v-model.number="monsterData.maxLevel" min="1" max="99">
            </div>
          </td>
          <td colspan="6">
            <input type="number" class="form-control" id="inputMaxExp" v-model.number="monsterData.maxExp" min="0" max="999999999">
          </td>
        </tr>
        <tr class="thead-light">
          <th colspan="8">レベル最大時パラメータ</th>
          <th colspan="4">+297時</th>
        </tr>
        <tr-param type="hp" v-model.number="monsterData.maxParam.hp" />
        <tr-param type="attack" v-model.number="monsterData.maxParam.attack" />
        <tr-param type="recovery" v-model.number="monsterData.maxParam.recovery" />
        <tr class="thead-light">
          <th colspan="12">覚醒</th>
        </tr>
        <tr>
          <td colspan="12">
            <awaken-select use-unknown v-model="monsterData.awakens" />
          </td>
        </tr>
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
            <th colspan="8">限界突破時パラメータ</th>
            <th colspan="4">+297時</th>
          </tr>
          <tr-param type="hp" v-model.number="monsterData.overLimitParam.hp" />
          <tr-param type="attack" v-model.number="monsterData.overLimitParam.attack" />
          <tr-param type="recovery" v-model.number="monsterData.overLimitParam.recovery" />
          <tr class="thead-light">
            <th colspan="12">超覚醒</th>
          </tr>
          <tr>
            <td colspan="12">
              <awaken-select use-unknown checkbox-style :select-length="10" v-model="monsterData.superAwakens" />
            </td>
          </tr>
        </template>
        <tr class="thead-light">
          <th colspan="12">このモンスターへの進化形態</th>
        </tr>
        <tr>
          <td colspan="12">
            <select class="custom-select" id="evolutionType" v-model.number="monsterData.evolutionType">
              <option v-for="key in evolutionTypeSortTable" :value="String(key)" :key="`evolutionType${key}`" v-once>{{ evolutionTypeTable[key] }}</option>
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
          <th colspan="12">潜在覚醒枠の解放</th>
        </tr>
        <tr>
          <td colspan="12">
            <select class="custom-select" v-model.number="monsterData.canUnlockExtraSlot" :disabled="isCanUnlockExtraSlotEvolutionType">
              <option :value="0">×</option>
              <option :value="1">○</option>
            </select>
          </td>
        </tr>
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
      <button type="submit" class="btn btn-primary" :disabled="multiSendBlocker.isSending">{{ multiSendBlocker.isSending ? '送信中' :'送信する' }}</button>
    </form>
  </div>
</template>

<script>
import $ from 'jquery';
import { mtpadmdb, constData, gtagProductionOnly, MultiSendBlocker } from '../mtpadmdb.js';
import TrParam from './../components/monsterEditTrParam.vue';
import EditSkill from './../components/editSkill.vue';
import MixinForPage from '../components/mixins/forPage.js';

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
  mixins: [MixinForPage],
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
      evolutionTypeSortTable: constData.evolutionTypeSortTable,
      awakenTable: constData.awakenTable,

      monsterData: {},
      /** 多重送信を防ぐオブジェクト。 */
      multiSendBlocker: new MultiSendBlocker()
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
    },
    /** 指定されている進化形態が潜在覚醒枠の解放に対応しているものかどうか。 */
    isCanUnlockExtraSlotEvolutionType: function () {
      const canUnlockTypeTable = { 3: true, 6: true, 7: true };
      return canUnlockTypeTable[this.monsterData.evolutionType];
    }
  },
  watch: {
    '$route.params.no': function () {
      this.fetchData();
    },
    'isCanUnlockExtraSlotEvolutionType': function (value) {
      // 枠解放可能な進化形態に変わった場合は無条件に解放可能に設定し、合わせてHTMLテンプレート側で操作不可にする。
      // 逆の場合は設定解除し、操作可能になる。
      this.monsterData.canUnlockExtraSlot = (value) ? 1 : 0;
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
      // 他番号のモンスターを上書きしようとしている場合の確認処理。
      if (this.no !== this.monsterData.no && this.monsterTable[this.monsterData.no]) {
        const ret = confirm('指定された番号のモンスターはすでに登録されています。\n上書きしますか？');
        if (!ret) { return; }
      }
      
      // 多重送信防止処理
      if (this.multiSendBlocker.isSending) { return; }
      this.multiSendBlocker.set();
      
      this.$store.commit('clearErrors');
      this.$store.commit('setMessages', ['送信中...']);

      mtpadmdb.api('updateMonster', this.monsterData, (response) => {
        // レスポンス来なかったときの復帰処理を止める。
        this.multiSendBlocker.reset();

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
        // 再度送信可能にする。
        this.multiSendBlocker.reset();
      });
    }
  }
};
</script>
