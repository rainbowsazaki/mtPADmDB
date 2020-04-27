<template>
  <div>
    <div v-if="popupStyle" class="selectedList popupTrigger" :class="`length${selectLength}`" @click="isShowPopup = true;">
      <span v-for="i in selectLength" :key="`selectedAwaken_${i}`">
        <img :src="selectedArray[i - 1] ? `./image/awaken/${selectedArray[i - 1]}.png` : undefined" :key="selectedArray[i - 1] ? i : '0'">
      </span>
      <div v-if="isUnknown" class="unknownMessage"><span>不明</span></div>
      <div v-if="selectedArray[0] === undefined" class="placeholder"><span>覚醒（タップ・クリックで追加）</span></div>
    </div>

    <div :class="{ 'popupStyle' : popupStyle }" v-if="!popupStyle || isShowPopup">
      <div class="dialog">
        <div class="body">
          <div v-if="popupStyle">覚醒（タップ・クリックで削除）</div>
          <div class="selectedList" :class="`length${selectLength}`">
            <span v-for="i in selectLength" :key="`selectedAwaken_${i}`">
              <img v-if="i - 1 == lastRemoveIndex" class="removeEffect" :src="`./image/awaken/${lastRemoveItem}.png`">
              <img :src="selectedArray[i - 1] ? `./image/awaken/${selectedArray[i - 1]}.png` : undefined"
                    :class="{ shiftLeft: i - 1 >= lastRemoveIndex && selectedArray[i - 1], lastAdd: i - 1 === lastAddIndex }"
                    @click="removeAwaken(i - 1, $event);" :key="selectedArray[i - 1] ? i : '0'"
              >
            </span>
            <button v-if="!useUnknown" type="button" class="btn btn-sm btn-primary clearButton" @click="clear">クリア</button>
            <div v-if="isUnknown" class="unknownMessage"><span>不明</span></div>
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
                  <input v-if="checkboxStyle" type="checkbox" v-model="selectedArray" :value="m" :id="`awaken_${m}`" @change="emitInput();">
                  <label :for="`awaken_${m}`">
                    <img :src="`./image/awaken/${m}.png`" @click="addAwaken(m, $event);">
                  </label>
                </td>
              </tr>
            </table>
          </div>
        </div>
        <div v-if="popupStyle" class="footer">
          <button type="button" class="btn btn-primary" @click="isShowPopup = false;">OK</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    /** 値を格納する配列。 */
    'value': {
      type: Array,
      default: () => []
    },
    /** 『不明』の入力を行えるようにするかどうか。 */
    'useUnknown': {
      type: Boolean,
      default: false
    },
    /** 項目をオンオフで切り替えるスタイルにするかどうか。 */
    'checkboxStyle': {
      type: Boolean,
      default: false
    },
    /** 入力部分をポップアップ表示にするかどうか。 */
    'popupStyle': {
      type: Boolean,
      default: false
    },
    /** 選択可能な覚醒の個数。 */
    'selectLength': {
      type: Number,
      default: 9
    }
  },
  data: function () {
    return {
      selectedArray: [],
      /** 入力部分をポップアップ表示しているかどうか。 */
      isShowPopup: false,
      /** 最後に追加した覚醒のインデックス。 */
      lastAddIndex: undefined,
      /** 最後に削除した覚醒のインデックス。 */
      lastRemoveIndex: undefined,
      /** 最後に削除した覚醒の種類。 */
      lastRemoveItem: 0
    };
  },
  computed: {
    /** ゲーム内の覚醒フィルタでの覚醒の並び順を示すテーブル。 */
    awakenSortList () {
      return [
        [21, 19, 43, 45, 10, 11, 12, 13, 49],
        [56, 53, 61, 50, 52, 68, 69, 70, 28],
        [27, 48, 62, 57, 58, 60, 59, 54, 55],
        [14, 15, 16, 17, 18, 29, 20, 44, 51],
        [22, 23, 24, 25, 26, 32, 31, 33, 34],
        [4, 5, 6, 7, 8, 35, 36, 37, 38],
        [1, 2, 3, 46, 47, 39, 40, 41, 42],
        [65, 66, 67, 9, 71, 72, 30, 64, 63]
      ];
    },
    /** 覚醒内容が不明であることを示す値が指定されているかどうか。 */
    isUnknown () {
      return this.selectedArray[0] === null;
    }
  },
  watch: {
    'value': 'updateFromValue',
    'isShowPopup': function (isShowPopup) {
      const className = 'noScroll_awakenSelect';
      if (isShowPopup) {
        document.body.classList.add(className);
      } else {
        document.body.classList.remove(className);
      }
      this.lastAddIndex = undefined;
      this.lastRemoveIndex = undefined;
    },
    'selectLength': function (newValue) {
      // 指定個数を超えてる分を取り除く。。
      if (this.selectedArray.length > newValue) {
        this.selectedArray.length = newValue;
        this.emitInput();
      }
    }
  },
  created: function () {
    this.updateFromValue();
  },
  methods: {
    /** value プロパティの値で現在の値を更新する。 */
    updateFromValue: function () {
      // 末尾の 0（なし）と null は除いて処理する。
      let length = Math.min(this.value.length, this.selectLength);
      while (length > 1 && (this.value[length - 1] === 0 || this.value[length - 1] === null)) { length--; }
      // 残ったのが 0（なし）の場合は全て無い状態にする。
      if (length === 1 && this.value[length - 1] === 0) { length = 0; }
      this.selectedArray = this.value.slice(0, length);
      // 覚醒指定が多い場合は超過分をカットした結果を value 側に反映させる。
      if (this.value.length > this.selectLength) { this.emitInput(); }
    },
    /** 選択中の覚醒を追加する。 */
    addAwaken: function (no, event) {
      if (this.isUnknown) { this.selectedArray = []; }
      // チェックボックス形式の場合、 checkbox の v-model と change イベントで更新反映されるので、 不明解除以外の処理は行わない。
      // ただし、不明にする場合は除く。
      if (this.checkboxStyle && no !== null) { return; }
      if (event) { event.preventDefault(); }
      if (this.selectedArray.length >= this.selectLength) { return; }
      this.lastAddIndex = undefined;
      this.lastRemoveIndex = undefined;
      if (no !== null) {
        this.lastAddIndex = this.selectedArray.length;
      }
      this.selectedArray.push(no);
      this.emitInput();
    },
    /** 選択中の覚醒から、指定したインデックスのものを削除する。 */
    removeAwaken: function (index, event) {
      if (event) { event.preventDefault(); }
      this.lastRemoveItem = this.selectedArray[index];
      if (this.lastRemoveItem === undefined) { return; }
      this.selectedArray.splice(index, 1);
      this.emitInput();
      this.lastRemoveIndex = index;
      // 左移動アニメーションが終わったらアニメーション基準位置を初期化する。
      setTimeout(() => { this.lastRemoveIndex = undefined; }, 200);
      this.lastAddIndex = undefined;
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
      this.emitInput();
      this.lastAddIndex = undefined;
      this.lastRemoveIndex = undefined;
    },
    /** 値の変更を通知する。 */
    emitInput: function () {
      this.$emit('input', this.selectedArray);
    }
  }
};

</script>

<style lang="scss">
// 設定フォームを全画面表示している際に裏をスクロールさせないための設定。
body.noScroll_awakenSelect {
  overflow: hidden;
}
</style>

<style lang="scss" scoped>
$iconSize: 1.5em;
$messsageSizeRate: 0.6;

.selectedList {
  position: relative;
  display: flex;
  justify-content: space-around;
  width: 20em;
  margin-bottom: 0.5em;
  padding: 0.25em;
  border-radius: 0.375em;;
  border: solid #CCC 0.0625em;

  img {
    width: $iconSize;
    height: $iconSize;
    background: #CCC;
    border-radius: 0.25em;

    &.removeEffect {
      position: absolute;
      animation: popdown 0.2s ease 0s 1 alternate none running;
    }
  }
  img[src] {
    cursor: pointer;
  }

  img.lastAdd {
    animation: popup 0.2s ease 0s 1 alternate none running;
  }

  img.shiftLeft {
    animation: shiftLeft 0.2s ease 0s 1 alternate none running;
  }

  @keyframes popup {
    0% {
      transform: scale(1.4);
    }
    100% {
      transform: scale(1);
    }
  }

  @keyframes popdown {
    0% {
      transform: scale(1);
    }
    100% {
      transform: scale(0);
    }
  }

  @keyframes shiftLeft {
    0% {
      transform: translateX($iconSize);
    }
    100% {
      transform: translateX(0);
    }
  }

  .clearButton {
    margin: 0.1vw;
    width: $iconSize * 2.8;
    height: $iconSize + 0.2em;
    padding: 0;
  }
}

.popupTrigger {
  cursor: pointer;
}

.unknownMessage, .placeholder {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  font-size: $iconSize * $messsageSizeRate;
  text-shadow: 0 -0.0625em 0.0625em #0008;

  * {
    position: absolute;
    white-space: nowrap;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
  }
}

.unknownMessage {
  background: rgba(0, 0, 0, 0.3);
  color: white;
}

.placeholder {
  background: rgba(0, 0, 0, 0.4);
  color: #FF0;
}

.selectArea {
  table, td, th {
    border: none;
    padding: 0;
  }
  td {
    padding: 0.3375em;
  }
  .item img {
    width: $iconSize;
    height: $iconSize;
    cursor: pointer;
  }
  input[type="checkbox"] {
    display: none;
  }

  input[type="checkbox"] + label {
    filter: opacity(40%) brightness(80%);
  }

  input[type="checkbox"]:checked + label {
    filter: none;
  }
  label { margin: 0; }
}

.popupStyle {
  $radiusSize: 0.5em;
  $paddingSize: 0.5em;

  position: fixed;
  top: 0;
  left: 0;
  z-index: 1050;
  background: #0009;
  width: 100%;
  height: 100%;
  
  .dialog {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    background: #fff;
    box-shadow: 0 0 2em #0009;
    max-height: calc(100% - 1em * 2);
    border: 0.0625em solid #0009;
    border-radius: $radiusSize;
    padding: $paddingSize;

    $footerHeight: 3.3em;

    .body {
      margin-bottom: $footerHeight;

      .selectedList {
        margin: 0 0 0.5em 0;
        padding: 0;
        border: none;
      }

      .selectArea {
        padding-top: 0.5em;
        border-top: 0.0625em solid #0006;

        table {
          margin: auto;
        }
      }
    }

    .footer {
      position: fixed;
      left: 0;
      bottom: 0;
      width: 100%;
      height: $footerHeight;
      border-radius: $radiusSize;
      padding: $paddingSize;
      background: #fff;
      
      text-align: right;
    }
  }
}

@media (max-width: 575px) {

$iconSize: 7.3vw;

.selectedList {
  width: 100%;

  img {
    width: $iconSize;
    height: $iconSize;
    border-radius: 1.5vw;
  }
  
  .clearButton {
    width: $iconSize * 2.5;
    height: $iconSize;
  }

  img.shiftLeft {
    animation: shiftLeft 0.2s ease 0s 1 alternate none running;
  }

  @keyframes shiftLeft {
    0% {
      transform: translateX($iconSize);
    }
    100% {
      transform: translateX(0);
    }
  }
}

.selectArea {

  td {
    padding: 1.3vw;
  }
  .item img {
    width: $iconSize;
    height: $iconSize;
  }
}

.unknownMessage, .placeholder {
  font-size: $iconSize * $messsageSizeRate;
}

}

</style>
