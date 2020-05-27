<template>
  <div class="monsterInfo" :style="{ 'font-size': `${infoFontSize}px` }">
    <div class="monsterNameArea">
      <div>
        <span class="monsterNo">No.{{ monsterData.no }}</span>
        <span class="rare">{{ '★'.repeat(monsterData.rare) }}</span>
      </div>
      <div>
        <div class="monsterName stretch">{{ monsterData.name }}</div>
      </div>
    </div>
    <div
      v-if="useFavorite" class="favorite"
      :class="{
        selected: $store.state.monsterFavorites[monsterData.no] === 1,
        evolution: $store.state.monsterFavorites[monsterData.no] === 2,
        toggled: favoriteToggled
      }"
      @click="flipMonsterFavorite(monsterData.no)"
    >
      <div class="favIcon">★</div>
      <div class="text">{{ $store.state.monsterFavorites[monsterData.no] === 1 ? 'ON' : 'OFF' }}</div>
    </div>
    <div class="monsterImageArea">
      <div class="monsterImage">
        <img v-if="monsterData.no" :src="monsterImagePath" :key="`monsterImage${monsterData.no}`">
      </div>

      <div v-if="monsterDataAfterTransform" class="transformIconArea">
        <div class="label">
          <div class="text">変身先</div>
        </div>
        <monster-icon :no="monsterDataAfterTransform.no" class="icon" width="2.8em" height="2.8em" />
      </div>
      <div class="typeArea">
        <template v-for="(type, n) in monsterData.types">
          <span v-if="type !== 0" :key="`typeNo${n}`">
            <img v-if="type !== null" :src="`./image/type/${type}.png`" alt="">{{ typeTable[type].name }}
          </span>
        </template>
      </div>
      <div class="awakenArea">
        <span v-if="monsterData.awakens[0] === 0" />
        <div v-else-if="monsterData.awakens[0] === null" class="awakenDummy">？</div>
        <ul v-else>
          <li v-for="(awaken, n) in monsterData.awakens" :key="`awakenNo${n}`">
            <img v-if="awaken !== 0" :src="'./image/awaken/' + awaken + '.png'" :title="awakenTable[awaken].name + '\n\n' + awakenTable[awaken].description">
          </li>
        </ul>
      </div>
      <div v-if="monsterData.overLimit === 1 && monsterData.superAwakens.length" class="superAwakenArea">
        <div v-if="monsterData.superAwakens[0] === null" class="awakenDummy">？</div>
        <ul v-else>
          <li v-for="superAwaken in monsterData.superAwakens" :key="`superAwaken${superAwaken}`">
            <img v-if="superAwaken !== null" :src="'./image/awaken/' + superAwaken + '.png'" :title="awakenTable[superAwaken].name + '\n\n' + awakenTable[superAwaken].description">
          </li>
        </ul>
      </div>
    </div>

    <div class="status">
      <div class="monsterIcon">
        <monster-icon no-link class="monsterIconInner" :no="monsterData.no" width="4.15em" height="4.15em" />
        <div v-if="monsterData.awakens && monsterData.awakens[0]" :class="`awakenCount awakenCountType${monsterData.assist}`">
          <span>{{ monsterData.assist === null ? '?' : '★' }}</span>
        </div>
      </div>
      <dl class="paramater">
        <dt>HP:</dt>
        <dd :class="{ olAnim0: (monsterData.overLimit === 1) }">{{ nullToFumei(monsterData.maxParam.hp) | addComma }}</dd>
        <dd v-if="monsterData.overLimit" class="olAnim1">{{ nullToFumei(monsterData.overLimitParam.hp) | addComma }}</dd>
        <dt>攻撃:</dt>
        <dd :class="{ olAnim0: (monsterData.overLimit === 1) }">{{ nullToFumei(monsterData.maxParam.attack) | addComma }}</dd>
        <dd v-if="monsterData.overLimit" class="olAnim1">{{ nullToFumei(monsterData.overLimitParam.attack) | addComma }}</dd>
        <dt>回復:</dt>
        <dd :class="{ olAnim0: (monsterData.overLimit === 1), statusAlert: monsterData.maxParam.recovery < 0, negative9999: monsterData.maxParam.recovery <= -9999 }">
          {{ nullToFumei(monsterData.maxParam.recovery) | addComma }}
        </dd>
        <dd v-if="monsterData.overLimit" class="olAnim1" :class="{ statusAlert: monsterData.overLimitParam.recovery < 0, negative9999: monsterData.overLimitParam.recovery <= -9999 }">
          {{ nullToFumei(monsterData.overLimitParam.recovery) | addComma }}
        </dd>
      </dl>
      <div>
        <div class="cost">
          コスト:<span class="costValue">{{ monsterData.cost === null ? '不明' : monsterData.cost }}</span>
        </div>
        <div class="levelInfo">
          <div :class="{ 'olAnim0 canOverLimit': (monsterData.overLimit === 1) }">最大Lv.{{ monsterData.maxLevel || '不明' }}</div>
          <div v-if="monsterData.overLimit" class="olAnim1 canOverLimit">限突Lv.110</div>
          
          <div :class="{ olAnim0: (monsterData.overLimit === 1) }">経験値:{{ nullToFumei(monsterData.maxExp) | addComma }}</div>
          <div v-if="monsterData.overLimit" class="olAnim1">経験値:{{ monsterData.maxExp === null ? '不明' : monsterData.maxExp + 50000000 | addComma }}</div>
        </div>
      </div>

      <div class="skillCommon skill">
        <div class="skillHeader">
          <div class="skillLogo">
            <div>スキル</div>
          </div>
          <div class="skillName">
            <div class="stretch">
              <div style="float:left; margin-right: 0.2em;">
                <span v-if="!skillDetails.name">不明</span>
                <router-link v-else :to="{ name: 'skillDetails', params: { no: skillDetails.no }}">{{ skillDetails.name }}</router-link>
              </div>
              <span v-if="skillDetails.no !== 1" class="skillTurn">
                <span style="color: #0FF;">最大</span>Lv.<span v-if="skillDetails.baseTurn && skillDetails.minTurn">{{ skillDetails.baseTurn - skillDetails.minTurn + 1 }}</span><span v-else>不明</span>
                ターン:<span v-if="skillDetails.minTurn">{{ skillDetails.minTurn }}</span><span v-else>不明</span>
              </span>
            </div>
          </div>
        </div>
        <div class="skillDescription">
          <div class="stretch">{{ skillDetails.description }}</div>
        </div>
      </div>

      <div class="skillCommon leaderSkill">
        <div class="skillHeader">
          <div class="skillLogo">
            <div>リーダースキル</div>
          </div>
          <div class="skillName">
            <div class="stretch">
              <span v-if="!leaderSkillDetails.name">不明</span>
              <router-link v-else :to="{ name: 'leaderSkillDetails', params: { no: leaderSkillDetails.no }}">{{ leaderSkillDetails.name }}</router-link>
            </div>
          </div>
        </div>
        <div class="skillDescription">
          <div class="stretch" v-html="leaderSkillDescriptionHtml" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>

import { constData, leaderSkillDescriptionToDecoratedHtml, stretchElement } from '../mtpadmdb.js';

/** モンスター情報ページのパラメータ表示の tr 要素として使用するコンポーネント。 */
export default {
  name: 'MonsterInfo',
  props: {
    /** 表示するモンスターの情報。 */
    monsterData: {
      type: Object,
      required: true
    },
    /** お気に入りトグルボタンを表示するかどうか。 */
    useFavorite: {
      type: Boolean,
      default: false
    }
  },
  data: function () {
    return {
      booleanTable: constData.booleanTable,
      typeTable: constData.typeTable,
      attributeTable: constData.attributeTable,
      evolutionTypeTable: constData.evolutionTypeTable,
      awakenTable: constData.awakenTable,
      /** お気に入りの切り替えを行ったかどうか。 */
      favoriteToggled: false,
      /** モンスター情報表示部分のフォントサイズ。 */
      infoFontSize: 8
    };
  },
  computed: {
    skillTable: function () { return this.$store.state.skillTable; },
    leaderSkillTable: function () { return this.$store.state.leaderSkillTable; },
    imageTable: function () { return this.$store.state.imageTable; },
    /** モンスター画像のパス。 */
    monsterImagePath: function () {
      const no = this.monsterData.no;
      const imageData = this.imageTable[no];
      if (!imageData) { return './monsterImages/notFound.jpg'; }
      return `./monsterImagesLog/${no}_${imageData.id}.jpg`;
    },
    /** スキル効果文。 */
    skillDetails: function () {
      let skillDetails = {};
      if (this.monsterData.skill !== 0) {
        const target = this.skillTable[this.monsterData.skill];
        if (target) {
          skillDetails = target;
        }
      }
      return skillDetails;
    },
    /** リーダースキル効果文。 */
    leaderSkillDetails: function () {
      let leaderSkillDetails = {};
      if (this.monsterData.leaderSkill !== 0) {
        const target = this.leaderSkillTable[this.monsterData.leaderSkill];
        if (target) {
          leaderSkillDetails = target;
        }
      }
      return leaderSkillDetails;
    },

    /** リーダースキルの効果を装飾したHTMLを取得する。 */
    leaderSkillDescriptionHtml: function () {
      return leaderSkillDescriptionToDecoratedHtml(this.leaderSkillDetails.description);
    },
    /** スキルによる変身後のモンスターの情報。変身しない場合は null 。 */
    monsterDataAfterTransform: function () {
      const skill = this.skillDetails;
      if (!skill) { return null; }
      if (/([^\n。]*?)に変身/.test(skill.description)) {
        const targetName = RegExp.$1;
        const monsterData = this.$store.getters.monsterDataArray.find(d => d.name === targetName);
        if (monsterData) { return monsterData; }
      }
      return null;
    }
  },
  watch: {
    monsterData: function () {
      this.favoriteToggled = false;
    }
  },
  mounted: function () {
    this.updateInfoFontSize();
    window.addEventListener('resize', this.updateInfoFontSize);
  },
  beforeDestroy: function () {
    window.removeEventListener('resize', this.updateInfoFontSize);
  },
  updated: function () {
    const elms = document.getElementsByClassName('stretch');
    for (const elm of elms) {
      this.stretchElement(elm);
    }
  },
  methods: {
    /** モンスター情報表示領域のフォントサイズを、領域の横幅をもとに更新する。 */
    updateInfoFontSize: function () {
      this.infoFontSize = this.$el.clientWidth * 0.0375;
    },
    /** 指定された要素の横幅が親要素より大きい場合に、親要素の横幅に収まるように縮小させる。 */
    stretchElement: function (elm) {
      stretchElement(elm);
    },
    /** 指定された値が null の場合は '不明' を、そうでない場合はそのままの値を返す。 */
    nullToFumei: function (value) {
      return (value === null) ? '不明' : value;
    },
    /** 指定したモンスターのお気に入りの状態を反転させる。 */
    flipMonsterFavorite: function (no) {
      const nowData = this.$store.state.monsterFavorites[no];
      const newData = (nowData === 1) ? undefined : 1;
      this.$store.commit('setMonsterFavorite', { no: no, data: newData });
      this.favoriteToggled = true;
    }
  }
};
</script>

<style lang="scss" scoped>

@import url('https://fonts.googleapis.com/css?family=M+PLUS+1p:700,900');

div.monsterInfo {
  position: relative;
  color: #FFF;
  line-height: 1.3em;
  font-family: 'M PLUS 1p', sans-serif;
  text-shadow: 0.1em 0.1em 0 rgba(0,0,0, 0.5);
  background: #000;
  border: 1px solid black;
  margin-bottom: 1rem;
}

div.monsterNameArea {
  background: linear-gradient(#798320, #394a14);
  border: 0.1em #b1ba39 solid;
  border-left: none;
  margin-top: 1em;
  margin-right: 5em;
  padding: 0.1em 0em 0.2em 4.4em;
  line-height: 1.1em;
  border-radius: 0 0.5em 0.5em 0;

  .monsterName {
    white-space: nowrap;
  }
}

span.monsterNo {
  display: inline-block;
  width: 6.5em;
}

.rare {
  color: #EE0;
  -webkit-text-stroke: 0.05em #660;
}

.favorite {
  position: absolute;
  right: 0.7em;
  top: 1em;
  width: 3.05em;
  height: 2.5em;
  border: 0.1em #b68e6b solid;
  border-radius: 0.5em;
  text-align: center;
  background: #2d1312;
  line-height: 1em;

  cursor: pointer;
  user-select: none;

  $dark_color: #999;
  $light_color: #ff0;

  .favIcon {
    font-size: 110%;
    line-height: 1.1em;

    text-shadow: none;
    filter: drop-shadow(0.1em 0.1em 0 rgba(0,0,0, 0.5));

    color: $dark_color;
    background: linear-gradient(#888, #555);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .text {
    text-shadow: none;
    -webkit-text-stroke: 0.02em #000;
    $shadowBlur: 0.02em;
    $shadowColor: rgba(0,0,0,1);
    filter:
      drop-shadow(0 0 $shadowBlur $shadowColor)
      drop-shadow(0 0 $shadowBlur $shadowColor)
      drop-shadow(0 0 $shadowBlur $shadowColor)
      drop-shadow(0 0.08em $shadowBlur $shadowColor);

    color: #c17d18;
    background: linear-gradient(#c6a44a, #c17d18);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  &.toggled {
    transition: all 0.06s 0s ease;
    animation: favoriteClearAnimation 0.3s ease 0s 1 normal none running;
  }

  &.selected {
    background: #994433;
    border-color: #ffd699;
    .favIcon {
      color: $light_color;
      background: linear-gradient(#ff0, #f90);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .text {
      color: #fac960;
      background: linear-gradient(#eecc77, #fac960);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    &.toggled {
      transition: all 0.06s 0s ease;
      animation: favoriteSelectAnimaton 0.3s ease 0s 1 normal none running;
      .favIcon {
        animation: favoriteSelectIconAnimaton 0.3s ease 0s 1 normal none running;
      }
    }
  }
  
    &.evolution {
      .favIcon {
        background-image: linear-gradient(#888 0%, #666 55%, #ea0 75%, #d80 100%);
      }
    }

  @keyframes favoriteSelectIconAnimaton {
    $light_shadow_color: #ff9;
    20% {
      filter: drop-shadow(0.1em 0.1em 0 rgba(0,0,0, 0.5)) drop-shadow(0 0 0em $light_shadow_color);
    }
    90% {
      filter: drop-shadow(0.1em 0.1em 0 rgba(0,0,0, 0.5)) drop-shadow(0 0 1em $light_shadow_color);
    }
    99% {
      filter: drop-shadow(0.1em 0.1em 0 rgba(0,0,0, 0.5)) drop-shadow(0 0 2em rgba($light_shadow_color, 0));
    }
  }
  @keyframes favoriteSelectAnimaton {
    0% {
      transform: scale(1);
    }
    20% {
      transform: scale(0.9);
    }
    100% {
      transform: scale(1);
    }
  }
  @keyframes favoriteClearAnimation {
    0% {
      transform: scale(1);
    }
    20% {
      transform: scale(0.9);
    }
    100% {
      transform: scale(1);
    }
  }
}

div.monsterImageArea {
  position: relative;
  height: 17em;
}

div.monsterImage {
  height: 100%;
  background: black url('../assets/image/monsterBack.jpeg');
  background-size: auto 100%;
  background-position: center;
  background-repeat: no-repeat;

  img {
    width: auto;
    height: 100%;
    display: block;
    margin: 0 auto;
  }
}

.typeArea {
  position: absolute;
  left: 0.4em;
  top: 0.4em;
  color: white;
  span {
    margin-right: 0.2em;
  }
  img {
    width:1.3em;
    height: 1.35em;
    margin-right: 0.1em;
  }
}

div.transformIconArea {
  position: absolute;
  left: 0;
  top: 0;
  width: 3.5em;
  height: 3.5em;
  background: black url('../assets/image/monsterBack.jpeg');
  .label {
    position: absolute;
    left: 0.4em;
    top: 2em;
    width: 2.8em;
    height: 1.2em;
    
    background: linear-gradient(#77771a, #445511);
    border: 0.05em solid #ccdd44;
    border-radius: 0.2em;
    padding: 0.22em 0;
  
    .text {
      color: #ffffbb;
      font-size: 0.7em;
      font-weight: bold;
      line-height: 1em;
      text-shadow: none;
      text-align: center;

      $shadowBlur: 0.08em;
      $shadowColor: rgba(0,0,0,0.6);
      filter:
        drop-shadow(0px 0px $shadowBlur $shadowColor)
        drop-shadow(0px 0px $shadowBlur $shadowColor)
        drop-shadow(0px 0px $shadowBlur $shadowColor)
        drop-shadow(0px 0px $shadowBlur $shadowColor);
    }
  }
  .icon {
    position: absolute;
    left: 0.4em;
    top: 3.25em;
  }
}

.awakenArea {
  position: absolute;
  right: 0.7em;
  top: 0.2em;

  ul {
    list-style: none;
    margin: 0;
    padding: 0;
    
    li {
      line-height: 1.8em;

      img {
        width: 1.25em;
        height: 1.25em;
      }
    }
  }
}

.superAwakenArea {
  position: absolute;
  right: 2.5em;
  top: 0.2em;

  ul {
    list-style: none;
    margin: 0;
    padding: 0;
    
    li {
      line-height:1.8em;

      img {
        width: 1.25em;
        height: 1.25em;
      }
    }
  }
}

.awakenDummy {
  border: 0.05em solid #99ff32;
  background: linear-gradient(#559920, #3d4c11);
  width: 1.25em;
  height: 1.25em;
  line-height: 1.125em;
  margin-top: 0.3em;
  text-align: center;
  box-shadow: 0 0.1em 0.1em 0.03em rgba(0,0,0,0.4) inset;
  border-radius: 0.2em;
}

.status {
  border: #fddb70 solid 0.1em;
  background: linear-gradient(#a07b44, #382717);
  padding: 0.3em;
  padding-bottom: 0.55em;
  border-radius: 0.5em;

  .monsterIcon {
    float: left;
    position: relative;
    width: 4.15em;
    height: 4.15em;
    margin: 0.05em;
    margin-right: 0.15em;

    .awakenCount {
      animation: awakenCountBlink 3s ease 0s infinite normal none running;

      $r-size: 1.3em;
      $border-width: 0.12em;

      position: absolute;
      right: 0.05em;
      top: 0.1em;
      width: $r-size;
      height: $r-size;
      text-align: center;
      line-height: 1.05em;

      border: $border-width solid #f8f4d7;
      border-radius: 50%;

      span {
        display: block;
        text-shadow: none;
        transform: scaleX(0.8);
      }
    }

    .awakenCountTypenull {
      border-color: #eeeeee;
      background: linear-gradient(#dddddd, #aaaaaa 50%);
      box-shadow:
        0 -0.1em 0.1em 0 rgba(32,32,32, 1) inset,
        0 0.2em 0.1em 0.0em rgba(0,0,0, 0.7);

      span {
        color: #ffffff;
        -webkit-text-stroke: 0.04em #000;
        $shadowBlur: 0.06em;
        $shadowColor: rgba(0,0,0,0.4);
        filter:
          drop-shadow(0 0 $shadowBlur $shadowColor)
          drop-shadow(0 0 $shadowBlur $shadowColor)
          drop-shadow(0 0 $shadowBlur $shadowColor)
          drop-shadow(0 0 $shadowBlur $shadowColor);
        transform: none;
      }
    }
    .awakenCountType0 {
      border-color: #f0fff0;
      background: linear-gradient(#88ff88, #00671b 50%);
      line-height: 1.2em;
      box-shadow:
        0 -0.1em 0.1em 0 rgba(0,32,0, 1) inset,
        0 0.2em 0.1em 0.0em rgba(0,0,0, 0.7);

      span {
        font-size: 95%;
        color: #ffff00;
        -webkit-text-stroke: 0.04em #000;
        $shadowBlur: 0.06em;
        $shadowColor: rgba(0,0,0,0.4);
        filter:
          drop-shadow(0 0 $shadowBlur $shadowColor)
          drop-shadow(0 0 $shadowBlur $shadowColor)
          drop-shadow(0 0 $shadowBlur $shadowColor)
          drop-shadow(0 0 $shadowBlur $shadowColor);
      }
    }

    .awakenCountType1 {
      border-color: #f8f4d7;
      background: #bb9e50;
      box-shadow:
        0 -0.1em 0.1em 0 rgba(107,96,50, 1) inset,
        0 -0.4em 0.1em 0.03em rgba(240,220,155, 1) inset,
        0 0.2em 0.1em 0.0em rgba(0,0,0, 0.7);

      span {
        color: #eddd86;
        background: linear-gradient(#ffffee 40%, #edbd51 55%, #eddd86 60%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;

        $shadowBlur: 0.05em;
        $shadowColor: rgba(0,0,0,0.4);
        filter:
          drop-shadow(0 0.2em $shadowBlur $shadowColor)
          drop-shadow(0 0em $shadowBlur $shadowColor)
          drop-shadow(-0.05em 0em $shadowBlur $shadowColor)
          drop-shadow(0.1em 0em $shadowBlur $shadowColor);
      }
    }
  }

  dl.paramater {
    width: calc(45% - 4.2em - 0.2em);
    float: left;
    line-height: 1.4em;
    margin: 0 0 0.4em 0.2em;

    * {
      font-size: 1.3em;
    }

    dt {
      float: left;
    }
    dd {
      margin: 0;
      text-align: right;
    }
    dd.negative9999 {
      width: 6em;
      transform: scaleX(0.85);
    }
  }

  div {
    .cost {
      float: right;
      border: 0.2em solid #563e22;
      background: #2f2b28;
      box-shadow: 0 0.2em 0.1em 0.03em rgba(0,0,0,0.4) inset;
      margin: 0.2em 0.1em;
      padding: 0 0.1em;
      border-radius: 0.4em;

      .costValue {
        display: inline-block;
        width: 2.5em;
        text-align: right;
      }
    }

    .levelInfo {
      margin-left: 50%;
      white-space: pre;
      padding-top: 1.4em;
      line-height: 1.4em;
      margin-bottom: -0.5em;
      .canOverLimit {
        color: #85bcfd;
      }
    }
  }

  div.skillCommon {
    width: 100%;
    overflow: hidden;
    border: #9b733f 0.1em solid;
    background: #39180f;
    border-radius: 0.4em 0.4em;
    margin-top: 0.4em;

    div.skillHeader {
      display: table;
      width: 100%;
      height: 1.6em;
      padding: 0.15em;
      white-space: nowrap;
      box-shadow: 0 0.2em 0.1em 0.03em rgba(0,0,0,0.6) inset;

      div.skillLogo {
        display: table-cell;
        width: 1px;
        padding: 0em 0.12em;
        line-height: 1.1em;
        border: #9b733f 0.1em solid;
        background: #774433;
        overflow: hidden;
        text-shadow: none;
        border-radius: 0.4em 0.4em;
        -webkit-text-stroke: 0.08em #000;
        font-weight: 900;

        div {
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
      }

      div.skillName {
        display: table-cell;
        padding-left: 0.28em;
        line-height: 1em;
      }
    }

    div.skillDescription {
      height: 2.55em;
      padding: 0.2em 0.15em;
      line-height: 1.1em;
      color: #000;
      background: #FFE;
      white-space: pre;
      text-shadow: none;
    }
  }

  .skill {
    .skillLogo div {
      color: #acbcdd;
      background: linear-gradient(#ffffff, #3270a3);
    }

    .skillName, .skillName a {
      color: #85bcfd;
    }

    .skillName {
      text-align: right;
      .skillTurn {
        color: #ffffff !important;
      }
    }

    .skillDescription {
      background: #b1aaa0 !important;
    }
  }

  .leaderSkill {
    .skillLogo div {
      color: #fdaa66;
      background: linear-gradient(#feffa2, #d75b39);
    }
    
    .skillName, .skillName a {
      color: #82ff81;
    }

    .skillDescription {
      background: #d0cc82 !important;
    }
  }

  .statusAlert {
    color: #ff4040;
  }

  .olAnim0 {
    animation: paramBlink 9s ease 0s infinite normal none running;
    height: 0;
  }
  .olAnim1 {
    animation: paramBlink2 9s ease 0s infinite normal none running;
  }

  @keyframes awakenCountBlink {
    0% {
      opacity: 1;
    }
    40% {
      opacity: 1;
    }
    49% {
      opacity: 0;
    }
    91% {
      opacity: 0;
    }
    100% {
      opacity: 1;
    }
  }

  @keyframes paramBlink {
    0% {
      opacity: 1;
    }
    47% {
      opacity: 1;
    }
    50% {
      opacity: 0;
    }
    99% {
      opacity: 0;
    }
    100% {
      opacity: 1;
    }
  }

  @keyframes paramBlink2 {
    0% {
      opacity: 0;
    }
    49% {
      opacity: 0;
    }
    50% {
      opacity: 1;
    }
    97% {
      opacity: 1;
    }
    100% {
      opacity: 0;
    }
    100% {
      opacity: 0;
    }
  }
}
</style>

