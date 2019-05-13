<template>
  <div :class="`type${type}`" style="border: 1px solid black;">
    <div style="display: inline-block; background: linear-gradient(#9a6d36, #5b3f1e); padding: 0.1em;">
      <div class="typeName" style="-webkit-background-clip: text;">{{ evolutionTypeTable[type] }}</div>
      <div>
        <monster-icon :no="targetNo" width="3.6em" height="3.6em" />
      </div>
    </div>
    <div style="display: inline-block; vertical-align:top; padding-top: 0.5em; padding-left: 0.3em;">
      <div style="border: 0.1em solid #5b401e; background: #3f3421; color: #FFF; margin-bottom: 0.1em;">{{ monsterTable[targetNo] && monsterTable[targetNo].name }}</div>
      <ul v-if="materials[0]" style="width: 14em; list-style: none; margin: 0px; padding: 0px; display:flex; justify-content: space-between;">
        <template v-for="(material, n) in materials">
          <li v-if="material" style="" :key="`materialNo${n}`">
            <router-link :to="{ name:'monsterDetails', params: { no: material }}">
              <monster-icon :no="material" :monster-table="monsterTable" :image-table="imageTable" width="2.7em" height="2.7em" />
            </router-link>
          </li>
        </template>
      </ul>
      <span v-else>不明</span>
    </div>
    <div style="border-top: 1px solid #000; background: rgba(255,255,255,0.5);">
      <ul style="list-style: none; margin: 0px; padding: 0.2em;">
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

// 通常進化
.type1 {
  background: #d6b67e;
  .typeName {
    background: linear-gradient(#d1fc5c, #97e14b)
  }
}

// 究極進化
.type2 {
  background: #d6b67e;
  .typeName {
    background: linear-gradient(#fefcae 20%, #a58a2c 50%, #fefcae 80%);
  }
}

// 転生進化
.type3 {
  background: #d6b67e;
  .typeName {
    background: linear-gradient(#58c2cb 10%, #ffffff 50%, #aa8f2e 50%, #fefcb0 90%);
  }
}

// ドット進化
.type4 {
  background: #bba658;
  .typeName {
    background: linear-gradient(#edce7c 33.3%, #e6b955 33.3% 66.6%, #b6812e 66.6%);
  }
}

// アシスト進化
.type5 {
  background: #677f42;
  .typeName {
    background: linear-gradient(#b6ef7d 10%, #5f7926 90%);
  }
}

// 超転生進化
.type6 {
  background: #d6b67e;
  .typeName {
    background: linear-gradient(#ec8a33 10%, #faf462 30%, #faf462 40%, #2b4fa3 90%);
  }
}

</style>

