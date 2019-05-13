<template>
  <div :class="`type${type}`">
    <div class="evolutionInfo">
      <div class="baseIcon">
        <div class="typeName" style="-webkit-background-clip: text;">{{ evolutionTypeTable[type] }}</div>
        <div>
          <monster-icon :no="targetNo" width="3.6em" height="3.6em" />
        </div>
      </div>
      <div class="materials">
        <div class="monsterName">{{ monsterTable[targetNo] && monsterTable[targetNo].name }}</div>
        <ul v-if="materials[0]">
          <template v-for="(material, n) in materials">
            <li v-if="material" :key="`materialNo${n}`">
              <router-link :to="{ name:'monsterDetails', params: { no: material }}">
                <monster-icon :no="material" width="2.7em" height="2.7em" />
              </router-link>
            </li>
          </template>
        </ul>
        <span v-else>不明</span>
      </div>
    </div>
    <div class="relatedLinks">
      <ul>
        <li>
          <router-link :to="{ name: 'evolutionMaterial', params: { no: targetNo } }">
            作成に必要な全モンスター一覧へ
          </router-link>
        </li>
        <li>
          <router-link :to="{ name: 'compare', params: { nos: `${targetNo},${beforeNo}` } }">
            進化前と進化後のパラメータ比較へ
          </router-link>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { constData } from '../mtpadmdb.js';

/** モンスター情報ページの進化素材情報を表示するコンポーネント。 */
export default {
  name: 'MonsterDataEvolutionMaterials',
  props: {
    /** 進化形式を示す番号。 */
    type: {
      type: Number,
      default: 99
    },
    /** 表示する内容において基準となるモンスターの番号。 */
    beforeNo: {
      type: Number,
      default: null
    },
    /** 進化後（or 進化前）のモンスターの番号。 */
    targetNo: {
      type: Number,
      default: null
    },
    /** 進化素材の番号が入った配列。 */
    materials: {
      type: Array,
      required: true
    }
  },
  computed: {
    evolutionTypeTable: function () { return constData.evolutionTypeTable; },
    monsterTable: function () { return this.$store.state.monsterTable; },
    evolutionTable: function () { return this.$store.state.evolutionTable; }
  }
};
</script>

<style lang="scss" scoped>

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
    padding: 0.1em;
    border-radius: 6px 0 0 6px;
  }

  /* これを .baseIcon の中に入れると下の .type? .typeName より優先度が高くなり下でのクラデーション背景指定が効かなくなるの外に出しておく。 */
  .typeName {
    font-size: 0.9em;
    line-height: 1em;
    margin: 0.25em 0;
    color: #FFF;
    background: #FFF;
    -webkit-text-fill-color: transparent;
    font-weight: bold;

    $shadowBlur: 0.4px;
    $shadowColor: rgba(0,0,0,1);
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
    padding-top: 0.5em;
    padding-left: 0.3em;
    border-radius: 0 6px 6px 0;

    .monsterName {
      border: 0.1em solid #5b401e;
      width: 14em;
      background: #3f3421;
      color: #FFF;
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
      display:flex;
      justify-content: space-between;
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
  box-shadow: 0 10px 4px -4px rgba(0,0,0,0.5) inset;
  border-radius: 0 0 6px 6px;

  ul {
    list-style: none;
    margin: 0px;
    padding: 0.2em;
  }
}

$bgColorLigntnPercent: 30%;

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
  }
}

</style>

