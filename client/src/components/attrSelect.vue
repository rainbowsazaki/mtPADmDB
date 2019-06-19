<template>
  <div>
    <div class="selectedList">
      <ul>
        <li v-for="i in 2" :key="`selectedAwaken_${i}`" :class="{ hasItem: selectedArray[i - 1] }" @click="removeAwaken(i - 1, $event);">
          <div v-if="selectedArray[i - 1] === 0" class="text">無</div>
          <div v-else-if="checkboxStyle && selectedArray[i - 1] === null" class="text">不</div>
          <div v-else-if="selectedArray[i - 1]" :style="{ height: '24px',backgroundImage: `url(./image/attribute/${selectedArray[i - 1]}.png)`, backgroundSize: '24px 24px'}" :key="selectedArray[i - 1] ? i : '0'" />
        </li>
      </ul>
      <div v-if="isUnknown" class="unknownMessage">不明</div>
    </div>
    <div class="selectArea">
      <ul>
        <li v-for="(n, i) in [1,2,3,4,5]" :key="`alTr_${i}`" class="item">
          <label>
            <input v-if="checkboxStyle" type="checkbox" v-model="selectedArray" :value="n" @change="$emit('input', selectedArray);">
            <img :src="`./image/attribute/${n}.png`" @click="addAwaken(n, $event);">
          </label>
        </li>
        <li v-if="useNone" class="item">
          <label>
            <input v-if="checkboxStyle" type="checkbox" v-model="selectedArray" :value="0" @change="$emit('input', selectedArray);">
            <span class="btn btn-secondary btn-sm" @click="addAwaken(0, $event);">なし</span>
          </label>
        </li>
        <li v-if="useUnknown" class="item">
          <label>
            <input v-if="checkboxStyle" type="checkbox" v-model="selectedArray" :value="null" @change="$emit('input', selectedArray);">
            <span class="btn btn-secondary btn-sm" @click="(checkboxStyle) ? addAwaken(0, $event) : setUnknown()">不明</span>
          </label>
        </li>
        <li v-if="useClear" class="item">
          <span class="btn btn-secondary btn-sm" @click="clear">クリア</span>
        </li>
      </ul>
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
    'useNone': {
      type: Boolean,
      default: false
    },
    'useUnknown': {
      type: Boolean,
      default: false
    },
    'useClear': {
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
    /** 覚醒内容が不明であることを示す値が指定されているかどうか。 */
    isUnknown () {
      return !this.checkboxStyle && this.selectedArray[0] === null;
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
      if (this.selectedArray.length >= 2) { return; }
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

<style lang="scss" scoped>

.selectedList {
  position: relative;
  display: inline-block;
  padding: 4px;
  border-radius: 6px;
  border: solid #CCC 1px;
  overflow: hidden;

  ul {
    margin: 0;
    padding: 0;
    line-height: 12px;
  }
  li {
    display: inline-Block;
    text-align: center;
    font-size: 16px;
    width: 24px;
    height: 24px;
    background: #CCC;
    border-radius: 12px;
    margin: 3px 5px;
    line-height: 1em;
    
    div {
      cursor: pointer;
    }

    .text {
      display: table-caption;
      width: 24px;
      height: 24px;
      background: white;
      border: 1px solid black;
      border-radius: 12px;
      padding: 3px;
    }
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

  ul {
    margin: 0;
    padding: 0;
  }

  li {
    display: inline;
    list-style: none;
    margin-right: 4px;
  }

  .item img {
    width: 24px;
    height: 24px;
    cursor: pointer;
  }
  input[type="checkbox"] {
    display: none;
  }

  input[type="checkbox"] + * {
    filter: opacity(35%) brightness(50%);
  }

  input[type="checkbox"]:checked + * {
    filter: none;
  }
  label { margin: 0; }
}
</style>
