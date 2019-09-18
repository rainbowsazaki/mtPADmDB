<template>
  <div :class="{ 'attributeSelect': !isTypeSelect, 'typeSelect': isTypeSelect }">
    <div v-if="!checkboxStyle" class="selectedList">
      <ul>
        <li v-for="i in targetCount" :key="`selectedAwaken_${i}`" :class="{ hasItem: selectedArray[i - 1] }" @click="removeAwaken(i - 1, $event);">
          <div class="icon">
            <div v-if="selectedArray[i - 1] === 0" class="text">無</div>
            <div v-else-if="checkboxStyle && selectedArray[i - 1] === null" class="text">不</div>
            <div v-else-if="selectedArray[i - 1]" :style="{ height: '24px',backgroundImage: `url(./image/${imageFolder}/${selectedArray[i - 1]}.png)`, backgroundSize: '24px 24px'}" :key="selectedArray[i - 1] ? i : '0'" />
          </div>
          <span v-if="isTypeSelect && selectedArray[i - 1]" class="typeName">{{ getTypeName(selectedArray[i - 1]) }}</span>
        </li>
      </ul>
      <div v-if="isUnknown" class="unknownMessage">不明</div>
    </div>
    <div class="selectArea">
      <span v-for="a in (Array.isArray(items[0])) ? items : [items]" :key="a.toString()" style="display: inline-block">
        <label v-for="(m, j) in a" :key="`alTr_${j}`" class="item">
          <input v-if="checkboxStyle || isTypeSelect" type="checkbox" v-model="selectedArray" :value="m" @change="$emit('input', selectedArray);" :disabled="isFillSelected && !selectedArray.includes(m)">
          <img :src="`./image/${imageFolder}/${m}.png`" @click="addAwaken(m, $event);">
        </label>
      </span>
      <label v-if="useNone" class="item">
        <input v-if="checkboxStyle || isTypeSelect" type="checkbox" v-model="selectedArray" :value="0" @change="$emit('input', selectedArray);">
        <span class="btn btn-secondary btn-sm" @click="addAwaken(0, $event);">なし</span>
      </label>
      <label v-if="useUnknown" class="item">
        <input v-if="checkboxStyle || isTypeSelect" type="checkbox" v-model="selectedArray" value="null" @change="$emit('input', selectedArray);">
        <span class="btn btn-secondary btn-sm" @click="(checkboxStyle) ? addAwaken(0, $event) : setUnknown()">不明</span>
      </label>
      <span v-if="useClear" class="item">
        <span class="btn btn-secondary btn-sm" @click="clear">クリア</span>
      </span>
    </div>
  </div>
</template>

<script>
import { constData } from '../mtpadmdb.js';

export default {
  props: {
    /** 値を格納する配列。 */
    'value': {
      type: Array,
      default: () => []
    },
    /** 『なし』の入力を行えるようにするかどうか。 */
    'useNone': {
      type: Boolean,
      default: false
    },
    /** 『不明』の入力を行えるようにするかどうか。 */
    'useUnknown': {
      type: Boolean,
      default: false
    },
    /** 入力クリアのボタンを表示するかどうか。 */
    'useClear': {
      type: Boolean,
      default: false
    },
    /** 項目をオンオフで切り替えるスタイルにするかどうか。 */
    'checkboxStyle': {
      type: Boolean,
      default: false
    },
    /** 編集対象の指定。 'attribute' or 'type' */
    'mode': {
      type: String,
      default: 'attribute'
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
    },
    /** タイプの編集かどうか。 true の場合はタイプ、 false の場合は属性の編集。 */
    isTypeSelect () {
      return (this.mode === 'type');
    },
    /** 使用するアイコン画像があるフォルダの名前。 */
    imageFolder () {
      return (this.isTypeSelect) ? 'type' : 'attribute';
    },
    /** 表示する選択項目の番号の配列。 */
    items () {
      const table = this.isTypeSelect ? constData.typeTable : constData.attributeTable;
      const array = Object.keys(table).filter(d => d !== '0' && d !== 'null').map(d => Number(d));
      if (!this.isTypeSelect) { return array; }
      
      const array2 = [];
      for (let i = 0; i < (array.length + 3) / 4; i++) {
        array2.push(array.slice(i * 4, i * 4 + 4));
      }
      return array2;
    },
    /** チェックボックススタイルでない場合の、選択可能な項目の上限数。 */
    targetCount () {
      return this.isTypeSelect ? 3 : 2;
    },
    /** 選択可能な項目の上限数まで埋まっているかどうか。 */
    isFillSelected () {
      /* チェックボックススタイルの場合は上限なし。 */
      if (this.checkboxStyle) { return false; }
      return this.selectedArray.length >= this.targetCount;
    }
  },
  watch: {
    'value': 'updateFromValue'
  },
  created: function () {
    this.updateFromValue();
  },
  methods: {
    /** 指定されたタイプ番号に対応するタイプの名前を返す。 */
    getTypeName: function (value) {
      const typeInfo = constData.typeTable[value];
      return typeInfo && typeInfo.name;
    },
    /** value プロパティの値で現在の値を更新する。 */
    updateFromValue: function () {
      // 末尾の 0（なし）と null は除いて処理する。
      let length = this.value.length;
      while (length > 1 && (this.value[length - 1] === 0 || this.value[length - 1] === null)) { length--; }
      // なしの入力ができない状態で、残ったのが 0（なし）の場合は全て無い状態にする。
      if (!this.useNone && length === 1 && this.value[length - 1] === 0) { length = 0; }
      this.selectedArray = this.value.slice(0, length);
    },
    /** 選択中の覚醒を追加する。 */
    addAwaken: function (no, event) {
      if (this.isUnknown) { this.selectedArray = []; }
      // チェックボックス形式やタイプ指定の場合は、 checkbox の v-model と change イベントで更新反映されるので、 不明解除以外の処理は行わない。
      // ただし、不明にする場合は除く。
      if ((this.checkboxStyle || this.isTypeSelect) && no !== null) { return; }
      if (event) { event.preventDefault(); }
      if (this.isFillSelected) { return; }
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

.btn-sm {
  line-height: 1;
}

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
    margin: 3px 5px;
    font-size: 16px;

    &.hasItem {
      cursor: pointer;
    }
    
    div.icon {
      display: inline-Block;
      width: 24px;
      height: 24px;
      background: #CCC;
      border-radius: 12px;
      line-height: 1em;
    }

    .typeName {
      display: inline-Block;
      height: 20px;
      margin-left: 2px;
      line-height: 1em;
      overflow: hidden;
    }
    
    .text {
      display: table-caption;
      text-align: center;
      width: 24px;
      height: 24px;
      background: white;
      border: 1px solid black;
      border-radius: 12px;
      padding: 3px;
    }
  }
}

.typeSelect{
  .selectedList {
    div.icon, .text {
      border-radius: 4px;
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
  
  label {
    margin: 0;
  }

  .item {
    margin: 2px;
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
  input[type="checkbox"]:disabled + img {
    cursor: default;
  }
}
</style>
