<template>
  <div v-if="hasImage" style="display: inline-block; background-color: #ccc; vertical-align:bottom; border-radius: 6%;" :style="{ width: width, height: height }">
    <img :src="iconPath" style="border-radius: 6%;" :style="{width: width, height: height }" :alt="monsterNoAndName" :key="`icon${no}`">
  </div>
  <div v-else style="display: inline-block; background-color: #ccc; position:relative; vertical-align:bottom; border: 1px solid #bbb; border-bottom-width: 2px; border-radius: 6%;" :style="{ width: width, height: height }">
    <img v-if="hasAttr0" style="position:absolute; left:  2%; top:    2%; width: 23%; height: 23%;" :src="attrPath0">
    <img v-if="hasAttr1" style="position:absolute; right: 2%; bottom: 2%; width: 23%; height: 23%;" :src="attrPath1">
    <div v-if="!isNaN(no)" :style="{ fontSize: fontSize, lineHeight: height }" style="text-align: center; overflow: hidden; color: #aaa;">{{ no }}</div>
  </div>
</template>

<script>
/** モンスターアイコンを表示するコンポーネント。 */
export default {
  name: 'MonsterIcon',
  props: {
    'no': {
      type: Number,
      default: null
    },
    'monsterTable': {
      type: Object,
      default: undefined
    },
    'imageTable': {
      type: Object,
      required: true
    },
    'width': {
      type: String,
      default: '96px'
    },
    'height': {
      type: String,
      default: '96px'
    }
  },
  computed: {
    hasImage: function () { return !!this.imageTable[this.no]; },
    monsterData: function () { return (this.monsterTable[this.no] || {}); },
    monsterNoAndName: function () { return `No.${this.monsterData.no} ${this.monsterData.name}`; },
    attributes: function () { return this.monsterData.attributes || []; },
    hasAttr0: function () { const attr = this.attributes[0]; return (attr && attr !== 0 && attr !== 99); },
    hasAttr1: function () { const attr = this.attributes[1]; return (attr && attr !== 0 && attr !== 99); },
    iconPath: function () { return `./monsterIconsLog/icon_${this.no}_${this.imageTable[this.no].id}.jpg`; },
    attrPath0: function () { return `./image/attribute/${this.attributes[0]}.png`; },
    attrPath1: function () { return `./image/attribute/${this.attributes[1]}.png`; },
    
    fontSize: function () {
      const ret = /^([\d|.]*)(.*)$/.exec(this.width);
      return ret[1] / 3 + ret[2];
    }
  }
};
</script>
