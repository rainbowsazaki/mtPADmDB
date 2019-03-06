<template>
  <div>
    <div class="selectedList">
      <span v-for="i in 9" :key="`selectedAwaken_${i}`">
        <img :class="{ hasItem: selectedArray[i - 1] }" :src="selectedArray[i - 1] ? `./image/awaken/${selectedArray[i - 1]}.png` : undefined" @click="removeAwaken(i - 1, $event);" :key="selectedArray[i - 1] ? i : '0'">
      </span>
      <div v-if="isUnknown" class="unknownMessage">不明</div>
    </div>
    <div class="selectArea">
      <table>
        <tr v-if="useUnknown">
          <td colspan="2">
            <button type="button" class="btn btn-secondary btn-sm btn-block" @click="setUnknown">不明</button>
          </td>
          <td colspan="2">
            <button type="button" class="btn btn-secondary btn-sm btn-block" @click="clear">なし</button>
          </td>
        </tr>
        <tr v-for="(n, i) in awakenSortList" :key="`alTr_${i}`">
          <td v-for="(m, j) in n" class="item" :key="`alTd_${j}`">
            <input v-if="checkboxStyle" type="checkbox" v-model="selectedArray" :value="m" :id="`awaken_${m}`" @change="$emit('input', selectedArray);">
            <label :for="`awaken_${m}`">
              <img :src="`./image/awaken/${m}.png`" @click="addAwaken(m, $event);">
            </label>
          </td>
        </tr>
      </table>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    'value': {
      type: Array,
      default: () => []
    },
    'useUnknown': {
      type: Boolean,
      default: false
    },
    'checkboxStyle': {
      type: Boolean,
      default: false
    }
  },
  data: function () {
    return {
      selectedArray: []
    };
  },
  computed: {
    /** ゲーム内の覚醒フィルタでの覚醒の並び順を示すテーブル。 0 は改行。 */
    awakenSortList () {
      return [
        [4, 5, 6, 7, 8, 1, 49, 57],
        [14, 15, 16, 17, 18, 2, 50, 58],
        [22, 23, 24, 25, 26, 3, 51, 59],
        [9, 10, 20, 11, 12, 13, 52, 60],
        [19, 21, 27, 28, 29, 30, 53, 61],
        [32, 31, 33, 34, 35, 36, 54, 62],
        [37, 38, 39, 40, 41, 42, 55, 63],
        [43, 44, 45, 46, 47, 48, 56, 64]
      ];
    },
    /** 覚醒内容が不明であることを示す値が指定されているかどうか。 */
    isUnknown () {
      return this.selectedArray[0] === null;
    }
  },
  watch: {
    'value': 'updateFromValue'
  },
  created: function () {
    this.updateFromValue();
  },
  methods: {
    /** value プロパティの値で現在の値を更新する。 */
    updateFromValue: function () {
      // 末尾の 0（なし）と null は除いて処理する。
      let length = this.value.length;
      while (length > 1 && (this.value[length - 1] === 0 || this.value[length - 1] === null)) { length--; }
      // 残ったのが 0（なし）の場合は全て無い状態にする。
      if (length === 1 && this.value[length - 1] === 0) { length = 0; }
      this.selectedArray = this.value.slice(0, length);
    },
    /** 選択中の覚醒を追加する。 */
    addAwaken: function (no, event) {
      if (this.isUnknown) { this.selectedArray = []; }
      // チェックボックス形式の場合、 checkbox の v-model と change イベントで更新反映されるので、 不明解除以外の処理は行わない。
      // ただし、不明にする場合は除く。
      if (this.checkboxStyle && no !== null) { return; }
      if (event) { event.preventDefault(); }
      if (this.selectedArray.length >= 9) { return; }
      this.selectedArray.push(no);
      this.$emit('input', this.selectedArray);
    },
    /** 選択中の覚醒から、指定したインデックスのものを削除する。 */
    removeAwaken: function (index, event) {
      if (event) { event.preventDefault(); }
      this.selectedArray.splice(index, 1);
      this.$emit('input', this.selectedArray);
    },
    /** 覚醒内容が不明であることを示す値を設定する。 */
    setUnknown: function (event) {
      if (event) { event.preventDefault(); }
      this.selectedArray = [];
      this.addAwaken(null);
    },
    /** 選択を空にする。 */
    clear: function (event) {
      if (event) { event.preventDefault(); }
      this.selectedArray = [];
      this.$emit('input', this.selectedArray);
    }
  }
};

</script>

<style lang="scss">

.selectedList {
  position: relative;
  display: inline-block;
  margin-bottom: 8px;
  padding: 4px;
  border-radius: 6px;
  border: solid #CCC 1px;
  overflow: hidden;
  img {
    width: 24px;
    height: 24px;
    background: #CCC;
    border-radius: 4px;
    margin: 3px;
  }
  img.hasItem {
    cursor: pointer;
  }
}

.unknownMessage {
  position: absolute;
  top: 0px;
  left: 0px;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.3);
  padding-top: 4px;
  color: white;
  text-shadow: 0px -1px 1px black;
  text-align: center;
}

.selectArea {
  table, td, th {
    border: none;
    padding: 0px;
  }
  td {
    padding: 5.4px;
  }
  .item img {
    width: 24px;
    height: 24px;
    cursor: pointer;
  }
  input[type="checkbox"] {
    display: none;
  }

  input[type="checkbox"] + label {
    filter: opacity(35%) brightness(50%);
  }

  input[type="checkbox"]:checked + label {
    filter: none;
  }
  label { margin: 0; }
}

@media (max-width: 575px) {

.selectedList img {
  width: 8vw;
  height: 8vw;
  border-radius: 1.5vw;
  margin: 0.6vw;
}

.selectArea {

  td {
    padding: 1.4vw;
  }
  .item img {
    width: 8vw;
    height: 8vw;
  }
}

}
</style>
