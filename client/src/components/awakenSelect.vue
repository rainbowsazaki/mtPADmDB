<template>
  <div>
    <div class="selectedList">
      <span v-for="i in 9" :key="`selectedAwaken_${i}`">
        <img :class="{ hasItem: selectedArray[i - 1] }" :src="selectedArray[i - 1] ? `./image/awaken/${selectedArray[i - 1]}.png` : undefined" @click="removeAwaken(i - 1);" :key="selectedArray[i - 1] ? i : '0'">
      </span>
      <div v-if="isUnknown" class="unknownMessage">不明</div>
    </div>
    <div class="selectArea">
      <template v-if="useUnknown">
        <button type="button" class="btn btn-secondary btn-sm" @click="setUnknown">不明</button>
        <button type="button" class="btn btn-secondary btn-sm" @click="clear">なし</button>
        <br>
      </template>
      <template v-for="(n, i) in awakenSortList">
        <span v-if="n != 0" class="item" :key="`awakenList_${i}`">
          <img :src="`./image/awaken/${n}.png`" @click="addAwaken(n);">
        </span>
        <br v-else :key="`awakenList_${i}`">
      </template>
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
        4, 5, 6, 7, 8, 1, 49, 57, 0,
        14, 15, 16, 17, 18, 2, 50, 58, 0,
        22, 23, 24, 25, 26, 3, 51, 59, 0,
        9, 10, 20, 11, 12, 13, 52, 60, 0,
        19, 21, 27, 28, 29, 30, 53, 61, 0,
        32, 31, 33, 34, 35, 36, 54, 62, 0,
        37, 38, 39, 40, 41, 42, 55, 63, 0,
        43, 44, 45, 46, 47, 48, 56, 64
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
    addAwaken: function (no) {
      if (this.selectedArray.length >= 9) { return; }
      if (this.isUnknown) { this.selectedArray = []; }
      this.selectedArray.push(no);
      this.$emit('input', this.selectedArray);
    },
    /** 選択中の覚醒から、指定したインデックスのものを削除する。 */
    removeAwaken: function (index) {
      this.selectedArray.splice(index, 1);
      this.$emit('input', this.selectedArray);
    },
    /** 覚醒内容が不明であることを示す値を設定する。 */
    setUnknown: function () {
      this.selectedArray = [];
      this.addAwaken(null);
    },
    /** 選択を空にする。 */
    clear: function () {
      this.selectedArray = [];
      this.$emit('input', this.selectedArray);
    }
  }
};

</script>

<style scoped>
.selectedList {
  position: relative;
  display: inline-block;
  margin-bottom: 24px;
  padding: 4px;
  border: solid #CCC 1px;
}

.selectedList img {
  width: 24px;
  height: 24px;
  background: #CCC;
  border-radius: 4px;
  margin-right: 6px;
}
.selectedList img.hasItem {
  cursor: pointer;
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

.selectArea .item img {
  width: 24px;
  height: 24px;
  margin: 0 12px 12px 0;
  cursor: pointer;
}

@media (max-width: 575px) {

.selectedList img {
  width: 8vw;
  height: 8vw;
  border-radius: 1.5vw;
  margin: 0.6vw;
}

.selectArea .item img {
  width: 8vw;
  height: 8vw;
  margin: 1.4vw;
}

}
</style>
