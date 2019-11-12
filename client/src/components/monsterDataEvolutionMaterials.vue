<template>
  <div :class="classObject">
    <router-link class="evolutionInfoLink" :to="{ name: 'monsterDetails', params: { no: targetNo }}">
      <div class="evolutionInfo">
        <div class="baseIcon">
          <div class="typeName" style="-webkit-background-clip: text;">{{ evolutionTypeName }}</div>
          <div>
            <monster-icon :no="dispMonsterData.no" width="3.6em" height="3.6em" />
          </div>
        </div>
        <div class="materials">
          <div class="monsterName">
            <div class="monsterNameText">{{ dispMonsterData ? dispMonsterData.name : '？？？？' }}</div>
          </div>
          <ul v-if="type === 0 || materials === null || materials[0]">
            <template v-for="(material, n) in materials || []">
              <li v-if="material" :key="`materialNo${n}`">
                <router-link :to="{ name:'monsterDetails', params: { no: material }}">
                  <monster-icon :no="material" width="2.7em" height="2.7em" />
                </router-link>
              </li>
              <li v-else class="nullMaterial" :key="`materialNo${n}`" />
            </template>
            <li v-for="n in (5 - (materials || []).length)" class="nullMaterial" :key="`materialNull${n}`" />
          </ul>
          <span v-else>進化素材不明</span>
        </div>
      </div>
    </router-link>
    <div v-if="relatedLinks" class="relatedLinks">
      <ul>
        <li v-if="!originOfEvolution">
          <router-link :to="{ name: 'evolutionMaterial', params: { no: targetNo } }">
            作成に必要な全モンスター一覧へ
          </router-link>
        </li>
        <li v-if="targetNo">
          <router-link :to="{ name: 'compare', params: { nos: originOfEvolution ? `${targetNo},${beforeNo}` : `${beforeNo},${targetNo}` } }">
            進化前と進化後のパラメータ比較へ
          </router-link>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { constData, stretchElement } from '../mtpadmdb.js';

/** モンスター情報ページの進化素材情報を表示するコンポーネント。 */
export default {
  name: 'MonsterDataEvolutionMaterials',
  props: {
    /** 強調表示を行うかどうか。 */
    highlight: {
      type: Boolean,
      default: false
    },
    /** 表示対象のモンスターの番号。 */
    targetNo: {
      type: Number,
      default: null
    },
    /** 進化元のモンスターの表示かどうか。 */
    originOfEvolution: {
      type: Boolean,
      default: false
    },
    /** モンスター交換かどうか。 */
    exchange: {
      type: Boolean,
      default: false
    },
    /** 関連リンクを表示するかどうか。 */
    relatedLinks: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    monsterData: function () {
      return this.$store.state.monsterTable[this.targetNo];
    },
    beforeNo: function () {
      return this.monsterData.evolution.baseNo;
    },
    dispMonsterData: function () {
      return (this.originOfEvolution) ? this.$store.state.monsterTable[this.beforeNo] : this.monsterData;
    },
    /** 進化素材の番号が入った配列。 */
    materials: function () {
      return this.monsterData.evolution.materials;
    },
    /** 進化形式を示す番号。 */
    type: function () {
      return this.monsterData.evolutionType;
    },
    /** コンポーネントのルート要素のクラス指定に使用するオブジェクト。 */
    classObject: function () {
      const obj = {
        base: true,
        type_originOfEvolution: this.originOfEvolution,
        highlight: this.highlight
      };
      if (this.exchange) {
        obj.typeExchange = true;
      } else {
        obj[`type${this.type}`] = true;
      }
      return obj;
    },
    /** 進化種類に対する表示名。 */
    evolutionTypeName: function () {
      if (this.exchange) { return '交換'; }
      if (this.type === 0) { return 'ベース'; }
      return constData.evolutionTypeTable[this.type];
    }
  },
  mounted: function () { this.stretchMonsterName(); },
  updated: function () { this.stretchMonsterName(); },
  methods: {
    /** モンスター名が長い場合に、枠のサイズに収まるように縮小する。 */
    stretchMonsterName: function () {
      const elm = this.$el.getElementsByClassName('monsterNameText')[0];
      stretchElement(elm);
    }
  }
};
</script>

<style lang="scss" scoped>

.base {
  display: inline-block;
}

$highlightColor0: #ff8855;
$highlightColor1: #ffdd33;

.highlight .evolutionInfo {
  $borderWidth: 0.25em;
  border: $borderWidth solid $highlightColor0;
  margin: -$borderWidth;
  border-radius: 0.66em;
  filter: drop-shadow(0 0 0.3em $highlightColor0);

  animation: highlightBlink 0.5s ease-in-out 0s infinite alternate none running;
}

@keyframes highlightBlink {
  0% {
    border-color: $highlightColor0;
    filter: drop-shadow(0 0 0.3em $highlightColor0);
  }

  100% {
    border-color: $highlightColor1;
    filter: drop-shadow(0 0 0.3em $highlightColor1);
  }
}

a.evolutionInfoLink {
  color: rgba(0,0,0,0.8);
}

a.evolutionInfoLink:hover {
  text-decoration:none;
}

.evolutionInfo {
  z-index: 2;
  position: relative;
  display: table;
  width: 100%;

  .baseIcon {
    display: table-cell;
    width: 4em;
    background: linear-gradient(#9a6d36, #5b3f1e);
    border: 2px solid #303030;
    border-right: none;
    padding: 0.1em 0.2em 0.2em 0.2em;
    border-radius: 6px 0 0 6px;
    
    box-shadow:
      0 4px 2px -2px rgba(255,255,0,0.5) inset,
      3px 0 2px -2px rgba(255,255,0,0.5) inset,
      0 -2px 2px -2px rgba(255,255,0,0.5) inset
    ;
  }

  /* これを .baseIcon の中に入れると下の .type? .typeName より優先度が高くなり下でのクラデーション背景指定が効かなくなるの外に出しておく。 */
  .typeName {
    font-size: 0.9em;
    line-height: 1em;
    text-align: center;
    margin: 0.25em 0;
    color: #FFF;
    background: #FFF;
    -webkit-text-fill-color: transparent;
    white-space: nowrap;
    font-weight: bold;

    $shadowBlur: 1px;
    $shadowColor: rgba(0,0,0,0.6);
    filter:
      drop-shadow(0px 0px $shadowBlur $shadowColor)
      drop-shadow(0px 0px $shadowBlur $shadowColor)
      drop-shadow(0px 0px $shadowBlur $shadowColor)
      drop-shadow(0px 0px $shadowBlur $shadowColor);
  }
  
  .materials {
    display: table-cell;
    vertical-align:top;
    border: 2px solid #2d261b;
    border-left: none;
    padding: 0.5em 0.3em 0 0.3em;
    border-radius: 0 6px 6px 0;
    
    box-shadow:
      0 4px 2px -2px rgba(255,255,255,0.5) inset,
      -3px 0 2px -2px rgba(255,255,255,0.5) inset,
      0 -2px 2px -2px rgba(255,255,255,0.5) inset;

    .monsterName {
      border: 0.1em solid #5b401e;
      width: 14em;
      white-space: nowrap;
      background: #3f3421;
      color: #FFF;
      text-shadow: 1px 1px rgba(0,0,0,0.5);
      padding-left: 2px;
      margin-bottom: 0.1em;
      box-shadow: 0 2px 1px 0px rgba(0,0,0,0.6) inset;
      border-radius: 6px;
    }

    ul {
      width: 14em;
      list-style: none;
      margin: 0px;
      padding: 0px;

      li {
        float: left;

        &.nullMaterial {
          width: 2.7em;
          height: 2.7em;
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(0, 0, 0, 0.2);
          border-radius: 7.5%;
        }
      }
      li + li {
        margin-left: (14em - 2.7em * 5) / 4;
      }
    }
  }
}

.relatedLinks {
  z-index: 1;
  position: relative;
  margin-top: -6px;
  padding-top: 6px;
  border: 1px solid #000;
  border-top: none;
  background: rgba(255,255,255,0.5);
  box-shadow: 0 11px 4px -4px rgba(0,0,0,0.3) inset;
  border-radius: 0 0 6px 6px;

  ul {
    list-style: none;
    margin: 0px;
    padding: 0.2em;
  }
}

$bgColorLigntnPercent: 30%;

// ベース
.type0 {
  $bgColor: #d6b67e;

  .materials {
    background: $bgColor;
  }

  .relatedLinks {
    background: lighten($bgColor, $bgColorLigntnPercent);
    border-color: darken($bgColor, $bgColorLigntnPercent);
  }

  .typeName {
    background: linear-gradient(#fcf15c, #d7e14b)
  }
}

// 通常進化
.type1 {
  $bgColor: #d6b67e;

  .materials {
    background: $bgColor;
  }

  .relatedLinks {
    background: lighten($bgColor, $bgColorLigntnPercent);
    border-color: darken($bgColor, $bgColorLigntnPercent);
  }

  .typeName {
    background: linear-gradient(#d1fc5c, #97e14b)
  }
}

// 究極進化
.type2 {
  $bgColor: #d6b67e;
  
  .materials {
    background: $bgColor;
  }

  .relatedLinks {
    background: lighten($bgColor, $bgColorLigntnPercent);
    border-color: darken($bgColor, $bgColorLigntnPercent);
  }

  .typeName {
    background: linear-gradient(#fefcae 20%, #a58a2c 50%, #fefcae 80%);
  }
}

// 転生進化
.type3 {
  $bgColor: #d6b67e;
  
  .materials {
    background: $bgColor;
  }

  .relatedLinks {
    background: lighten($bgColor, $bgColorLigntnPercent);
    border-color: darken($bgColor, $bgColorLigntnPercent);
  }

  .typeName {
    background: linear-gradient(#58c2cb 10%, #ffffff 50%, #aa8f2e 50%, #fefcb0 90%);
  }
}

// ドット進化
.type4 {
  $bgColor: #bba658;
  
  .materials {
    background: $bgColor;
  }

  .relatedLinks {
    background: lighten($bgColor, $bgColorLigntnPercent);
    border-color: darken($bgColor, $bgColorLigntnPercent);
  }

  .typeName {
    background: linear-gradient(#edce7c 33.3%, #e6b955 33.3% 66.6%, #b6812e 66.6%);
    margin-right: -1em;
    transform: scaleX(1 / 5 * 4);
    transform-origin: left top;
  }
}

// アシスト進化
.type5 {
  $bgColor: #677f42;
  
  .materials {
    background: $bgColor;
  }

  .relatedLinks {
    background: lighten($bgColor, $bgColorLigntnPercent);
    border-color: darken($bgColor, $bgColorLigntnPercent);
  }

  .typeName {
    background: linear-gradient(#b6ef7d 10%, #5f7926 90%);
    margin-right: -2em;
    transform: scaleX(1 / 6 * 4);
    transform-origin: left top;
  }
}

// 超転生進化
.type6 {
  $bgColor: #d6b67e;

  .materials {
    background: $bgColor;
  }

  .relatedLinks {
    background: lighten($bgColor, $bgColorLigntnPercent);
    border-color: darken($bgColor, $bgColorLigntnPercent);
  }

  .typeName {
    background: linear-gradient(#ec8a33 10%, #faf462 30%, #faf462 40%, #2b4fa3 90%);
    margin-right: -1em;
    transform: scaleX(1 / 5 * 4);
    transform-origin: left top;
  }
}

// 交換
.typeExchange {
  $bgColor: #cc7673;

  .materials {
    background: $bgColor;
  }

  .relatedLinks {
    background: lighten($bgColor, $bgColorLigntnPercent);
    border-color: darken($bgColor, $bgColorLigntnPercent);
  }

  .typeName {
    background: linear-gradient(#fdc5d9, #c47d95)
  }
}

// 進化形式不明
.typenull {
  $bgColor: #ccccdd;

  .materials {
    background: $bgColor;
  }

  .relatedLinks {
    background: lighten($bgColor, $bgColorLigntnPercent);
    border-color: darken($bgColor, $bgColorLigntnPercent);
  }
  
  .typeName {
    background: linear-gradient(#dddde0 10%, #bbbbc1 90%);
    margin-right: -2em;
    transform: scaleX(1 / 6 * 4);
    transform-origin: left top;
  }
}

// 進化元
.type_originOfEvolution {
  $bgColor: #65779b;
  
  .materials {
    background: $bgColor;
  }

  .relatedLinks {
    background: lighten($bgColor, $bgColorLigntnPercent);
    border-color: darken($bgColor, $bgColorLigntnPercent);
  }
}

</style>

