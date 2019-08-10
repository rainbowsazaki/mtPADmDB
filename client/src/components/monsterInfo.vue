<template>
  <div class="monsterInfo" :style="{ 'font-size': `${infoFontSize}px` }">
    <div class="monsterNameArea">
      <div>
        <span class="monsterNo">No.{{ monsterData.no }}</span>
        <span class="rare"><template v-for="n in monsterData.rare">★</template></span>
      </div>
      <div>
        <div class="monsterName stretch">{{ monsterData.name }}</div>
      </div>
    </div>
    <div class="monsterImageArea">
      <div class="monsterImage">
        <img v-if="monsterData.no" :src="monsterImagePath" :key="`monsterImage${monsterData.no}`">
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
      <monster-icon no-link class="monsterIcon" :no="monsterData.no" width="4.15em" height="4.15em" />
      <dl class="paramater">
        <dt>HP:</dt><dd>{{ monsterData.maxParam.hp === null ? '不明' : monsterData.maxParam.hp | addComma }}</dd>
        <dt>攻撃:</dt><dd>{{ monsterData.maxParam.attack === null ? '不明' : monsterData.maxParam.attack | addComma }}</dd>
        <dt>回復:</dt><dd :class="{ statusAlert: monsterData.maxParam.recovery < 0, negative9999:  monsterData.maxParam.recovery <= -9999 }">
          {{ monsterData.maxParam.recovery === null ? '不明' : monsterData.maxParam.recovery | addComma }}
        </dd>
      </dl>
      <div>
        <div class="cost">
          コスト:<span class="costValue">{{ monsterData.cost || '不明' }}</span>
        </div>
        <div class="levelInfo">
          <div :class="{ canOverLimit: (monsterData.overLimit === 1) }">最大Lv.{{ monsterData.maxLevel || '不明' }}</div>
          <div>経験値:{{ monsterData.maxExp === null ? '不明' : monsterData.maxExp | addComma }}</div>
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
              <span v-if="skillDetails.baseTurn >= 1" class="skillTurn">
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
    }
  },
  data: function () {
    return {
      booleanTable: constData.booleanTable,
      typeTable: constData.typeTable,
      attributeTable: constData.attributeTable,
      evolutionTypeTable: constData.evolutionTypeTable,
      awakenTable: constData.awakenTable,

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
    }
  }
};
</script>

<style lang="scss" scoped>

@import url('https://fonts.googleapis.com/css?family=M+PLUS+1p:700,900');

div.monsterInfo {
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
    margin: 0.1em;
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

  dl.paramater + * {
    margin-left: 47%;
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
      white-space: pre;
      padding-top: 1.45em;

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
}
</style>

