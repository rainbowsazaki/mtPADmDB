<template functional>
  <img
    :src="`./image/awaken/${props.no}.png`"
    v-bind="(() => { data.attrs[`${parent.$options._scopeId}`] = ''; return data.attrs; })()"
    v-on="listeners"
    class="awakenIcon" :class="[data.staticClass, data.class ]"
    :title="$options.createText(props.no)"
  >
</template>

<script>
import { constData } from '../mtpadmdb.js';

/** 覚醒アイコンを表示するコンポーネント。 */
export default {
  name: 'AwakenIcon',
  props: {
    /** 表示する覚醒の番号。 */
    'no': {
      type: [Number, String],
      default: null
    }
  },
  /** 説明文を作成する。 */
  createText: function (no) {
    const awakenInfo = constData.awakenTable[no];
    if (!awakenInfo) { return null; }
    return awakenInfo.name + '\n\n' + awakenInfo.description;
  }
};
</script>
