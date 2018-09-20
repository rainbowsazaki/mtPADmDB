
/** 
 * モンスター同士の比較を行うページのコンポーネント。
 */
var componentCompare = {
  name: "pageCompare",
  pageTitle: function () { return 'モンスター情報比較' },
  template: `
<div>
  <h2>モンスター情報比較</h2>
  <h3>比較対象指定</h3>
  <div class="row">
    <div class="col-md-6" v-for="n in 2">
      <monster-incremental-search v-model="targets[n - 1]" :monster-table="monsterTable" :image-table="imageTable"></monster-incremental-search>
    </div>
  </div>
  <button class="btn btn-primary" @click="updateCompareMonster">比較対象を更新する。</button>

  <template v-if="isEnableMonsterDatas">
  <h3>比較表</h3>
  <table class="table table-bordered table-sm">
    <tr class="thead-light">
      <th></th>
      <td v-for="data in monsterDatas">
        <monster-icon :no="data.no" :monsterTable="monsterTable" :imageTable="imageTable" width="1.6em" height="1.6em" />
      </td>
    </tr>
    <tr class="thead-light">
      <th>名前</th>
      <td v-for="data in monsterDatas">{{data.name}}</td>
    </tr>
    <tr class="thead-light">
      <th>HP</th>
      <td v-for="data in monsterDatas" class="text-right">{{data.maxParam.hp}}</td>
    </tr>
    <tr class="thead-light">
      <th>攻撃</th>
      <td v-for="data in monsterDatas" class="text-right">{{data.maxParam.attack}}</td>
    </tr>
    <tr class="thead-light">
      <th>回復</th>
      <td v-for="data in monsterDatas" class="text-right">{{data.maxParam.recovery}}</td>
    </tr>
  </table>
  </template>
</div>`,
  data: function () {
    return {
      monsterData0: null,
      monsterData1: null,

      targets: [0, 0],
    };
  }, 
  created: function () { this.load(); },
  watch: {
    "$route": function () { this.load(); },
  },

  computed: {
    monsterTable () { return this.$store.state.monsterTable; },
    imageTable() { return this.$store.state.imageTable; },

    /** 比較するモンスター情報の配列を取得する。 */
    monsterDatas: function () {
      return [ this.monsterData0, this.monsterData1 ];
    },
    /** モンスター情報がすべて存在しているかどうかを取得する。 */
    isEnableMonsterDatas: function () {
      return (this.monsterDatas.indexOf(null) == -1);
    },
  },

  methods: {
    /** 比較表示するモンスターを現在している番号のものに変更する。 */
    updateCompareMonster: function () {
      this.$router.push({ path: this.$router.path, params: { no1: this.targets[0], no2: this.targets[1] }});
    },

    load: function () {
      this.targets = [ this.$route.params.no1, this.$route.params.no2 ];
      this.monsterData0 = this.monsterData1 = null;
      if (this.$route.params.no1) {
        this._load(0, this.$route.params.no1);
      }
      if (this.$route.params.no2) {
        this._load(1, this.$route.params.no2);
      }
    },

    _load: function (index, monsterNo) {
      var path = `./monsterJson/${monsterNo}.json`;

      this.$store.commit('setMessages', [ 'モンスター情報取得中' ]);
      axios.get(path).then(
        response => {
          var data = $.extend(true, {}, commonData.monsterClearData, response.data);
          if (!data.superAwakens) { data.superAwakens = []; }
          this['monsterData' + index] = data; 
          this.$store.commit('clearMessages');
        }
      ).catch(
        error => {
          var errorMessage = `モンスター No.${monsterNo} の情報が見つかりませんでした。`;
          this.$store.commit('clearMessages');
          this.$store.commit('setErrors', [ errorMessage ]);
        }
      );
    }
  }
};


