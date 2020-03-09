<template>
  <div v-if="hasImage" class="monsterIcon" :class="{ favoriteFlag: favoriteFlagType === 1, favoriteEvolutionFlag: favoriteFlagType === 2 }" :style="iconSizeStyleObject">
    <span :is="linkTag" :to="routerLinkObject">
      <img :src="iconPath" :alt="monsterNoAndName" :key="`icon${no}`">
    </span>
  </div>
  <div v-else class="monsterIcon monsterIconDummy" :class="{ favoriteFlag: favoriteFlagType === 1, favoriteEvolutionFlag: favoriteFlagType === 2 , subAttr: hasAttr1 }" :style="iconSizeStyleObject">
    <span :is="linkTag" :to="routerLinkObject">
      <img v-if="hasAttr0" class="attr attr1" :src="attrPath0">
      <img v-if="hasAttr1" class="attr attr2" :src="attrPath1">
      <div v-if="!isNaN(no)" class="iconDummy" :style="{ fontSize: fontSize, lineHeight: '3em' }">{{ no || '????' }}</div>
    </span>
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
    'width': {
      type: String,
      default: '96px'
    },
    'height': {
      type: String,
      default: '96px'
    },
    /** モンスター詳細ページへのリンクを貼らないための指定。 */
    'noLink': {
      type: Boolean,
      default: false
    },
    /** お気に入りに入っているときにそれを示すフラグを表示するかどうか。 */
    'useFavoriteFlag': {
      type: Boolean,
      default: false
    }
  },
  computed: {
    imageInfo () { return this.$store.state.imageTable[this.no]; },

    hasImage: function () { return !!this.imageInfo; },
    monsterData: function () { return (this.$store.state.monsterTable[this.no] || {}); },
    monsterNoAndName: function () {
      const monsterData = this.monsterData;
      return `No.${monsterData.no} ${monsterData.name}`;
    },
    attributes: function () { return this.monsterData.attributes || []; },
    hasAttr0: function () { const attr = this.attributes[0]; return (attr && attr !== 0 && attr !== 99); },
    hasAttr1: function () { const attr = this.attributes[1]; return (attr && attr !== 0 && attr !== 99); },
    iconPath: function () { return `./monsterIconsLog/icon_${this.no}_${this.imageInfo.id}.jpg`; },
    attrPath0: function () { return `./image/attribute/${this.attributes[0]}.png`; },
    attrPath1: function () { return `./image/attribute/${this.attributes[1]}.png`; },
    
    fontSize: function () {
      const ret = /^([\d|.]*)(.*)$/.exec(this.width);
      return ret[1] / 3 + ret[2];
    },
    /** モンスター詳細ページへのリンクを貼るのに使うタグ。リンク不要な場合は span にすることでリンクを無効化する。 */
    linkTag: function () {
      return (this.noLink) ? 'span' : 'router-link';
    },
    /** モンスター詳細ページへリンクするために router-link コンポーネントの to プロパティに指定するオブジェクト。 */
    routerLinkObject: function () {
      return (this.noLink) ? {} : { name: 'monsterDetails', params: { no: this.no }};
    },
    /** アイコンサイズの指定のために style 属性に指定するオブジェクト。 */
    iconSizeStyleObject: function () {
      return { width: this.width, height: this.height };
    },
    /** 表示するお気に入りマークの種類。 */
    favoriteFlagType: function () {
      if (!this.useFavoriteFlag) { return 0; }
      return this.$store.state.monsterFavorites[this.no];
    }
  }
};
</script>

<style lang="scss" scoped>

.monsterIcon {
  $border-radius-size: 7.5%;

  display: inline-block;
  background-color: #444;
  background-image: url('../assets/image/icon_null.jpg');
  background-size: contain;
  vertical-align: bottom;
  border-radius: $border-radius-size;
  position: relative;

  &.subAttr {
    background-image: url('../assets/image/icon_null2.jpg');
  }

  a { text-decoration: none; }

  img {
    border-radius: $border-radius-size;
    width: 100%;
    height: 100%;
  }

  &.favoriteFlag:after {
    $flag_width: 10%;
    content: '';
    background-image: linear-gradient(#f9f, #99f, #9ff, #5f5, #ff6, #f55);
    border: 0.03em solid #0008;
    border-left: none;
    width: $flag_width;
    height: 30%;
    position: absolute;
    right: -$flag_width;
    top: 6%;
  }

  &.favoriteEvolutionFlag:after {
    $flag_width: 8%;
    content: '';
    background-image: linear-gradient(#c9cf, #99cc, #9cc8, #5c56, #cc93, #c550);
    border-top: 0.03em solid #0008;
    width: $flag_width;
    height: 20%;
    position: absolute;
    right: -$flag_width;
    top: 6%;
  }
}

.monsterIconDummy {
  * {
    user-select: none;
  }

  $attr_size: 22.7%;
  
  img.attr {
    position: absolute;
    width: $attr_size;
    height: $attr_size;
  }
  img.attr1 {
    left: 2.0%;
    top: 1.3%;
  }
  img.attr2 {
    right: 2%;
    bottom: 4%;
  }

  .iconDummy {
    text-align: center;
    overflow: hidden;
    color: #999;
  }
}
</style>
