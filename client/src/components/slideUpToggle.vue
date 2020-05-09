<template>
  <div>
    <span class="filterTrigger" :class="{ open: isOpenTriggerBottom }" @click="isVisibleMain = !isVisibleMain">
      <slot name="trigger" :isOpened="isVisibleMain" :isFullOverlay="isBrowserWidthSmall">
        {{ isVisibleMain ? '閉じる' :'開く' }}
      </slot>
    </span>
    <transition name="filter"
                @before-enter="setStyleHeight($event, 'filter'); isOpenTriggerBottom = true;"
                @after-enter="clearStyleHeight($event); isFullOpened = true;"
                @before-leave="setStyleHeight($event); isFullOpened = false;"
                @after-leave="isOpenTriggerBottom = false;"
    >
      <form class="main" v-if="isVisibleMain">
        <div class="header">
          <div class="headerTitle">
            <slot name="head" :isOpened="isVisibleMain" :isFullOverlay="isBrowserWidthSmall" />
          </div>
          <a class="btn closeButton" @click="isVisibleMain = false;">×</a>
        </div>
        <div class="body">
          <slot :isOpened="isVisibleMain" :isFullOverlay="isBrowserWidthSmall" />
        </div>
        <div class="footer">
          <slot name="foot" :isOpened="isVisibleMain" :isFullOverlay="isBrowserWidthSmall">
            <button class="btn btn-primary btn-sm" type="button" @click="isVisibleMain = false;">OK</button>
          </slot>
        </div>
      </form>
    </transition>
  </div>
</template>

<script>

/** 任意の内容を、ブラウザ横幅が広い場合はトグル表示、狭い場合はスライドアップ表示するコンポーネント。 */
export default {
  name: 'SlideupToggle',
  props: {
    /** メイン領域を表示するかどうか。 */
    value: {
      type: Boolean,
      default: false
    }
  },
  data: function () {
    return {
      /** メイン領域を表示するかどうか。 */
      isVisibleMain: false,
      /** メイン領域の表示／非表示を切り替えるトリガーの下部が開いた状態かどうか。 */
      isOpenTriggerBottom: false,
      /** メイン領域がすべて表示されている状態かどうか。 */
      isFullOpened: false,
      /** ブラウザの横幅がメイン領域を全画面で覆って表示するものかどうか。 */
      isBrowserWidthSmall: false,
      /** メイン領域の全画面の表示を開始した時点の、全体の縦スクロール位置。 */
      tempScrollTop: 0
    };
  },
  computed: {
    /** 全画面で表示しているかどうか。 */
    isFullOverMainArea: function () {
      return this.isBrowserWidthSmall && this.isFullOpened;
    }
  },
  watch: {
    value: function (newValue) {
      this.isVisibleMain = newValue;
    },
    isVisibleMain: function (newValue) { this.$emit('input', newValue); },
    isFullOverSettingArea: function (newValue) {
      if (newValue) {
        this.tempScrollTop = document.scrollingElement.scrollTop;
        document.scrollingElement.scrollTop = 0;
      } else {
        document.scrollingElement.scrollTop = this.tempScrollTop;
      }
      this.setDisableScroll(newValue);
    }
  },
  mounted: function () {
    window.addEventListener('resize', this.checkBrowserWidthSmall);
    this.checkBrowserWidthSmall();
  },
  beforeDestroy: function () {
    window.removeEventListener('resize', this.checkBrowserWidthSmall);
    if (this.isFullOpened) {
      this.setDisableScroll(false);
    }
  },
  methods: {
    /**
     * ページ全体のスクロールを無効にするかどうかを設定する。
     * 引数に true を指定するとスクロールが無効になり、 false を指定するとスクロールが有効になる。
     */
    setDisableScroll: function (b) {
      const className = 'noScroll_monsterFilterSetting';
      if (b) {
        document.body.classList.add(className);
      } else {
        document.body.classList.remove(className);
      }
    },
    /** 現在のウィンドウサイズが、設定領域を全画面表示するものかどうかを確認する。 */
    checkBrowserWidthSmall: function () {
      this.isBrowserWidthSmall = window.matchMedia('(max-width: 575px)').matches;
    },
    /** 指定要素の現在の高さを style に設定する。親要素がない場合は指定された ID の要素に一時的に登録して計測する。 */
    setStyleHeight: function (elm, dummyParentId) {
      let dummyParent;
      const hasParent = !!elm.parentNode;
      if (!hasParent) {
        dummyParent = document.getElementById(dummyParentId);
        dummyParent.appendChild(elm);
      }
      elm.style.height = elm.clientHeight + 'px';
      if (!hasParent) { dummyParent.removeChild(elm); }
    },
    /** style に設定されている高さを空にする。 */
    clearStyleHeight: function (elm) {
      elm.style.height = '';
    }
  }
};
</script>

<style lang="scss">
@media (max-width: 575px) {
  // 全画面表示している際に裏をスクロールさせないための設定。
  body.noScroll_monsterFilterSetting {
    overflow: hidden;
  }
}
</style>

<style lang="scss" scoped>

  .filterTrigger {
    border: 0.0625em solid #ced4da;
    border-radius: 0.25em;
    padding: 0.25em 0.25em 0.125em 0.25em;
    background: #FFF;
    cursor: pointer;

    &.open {
      border-bottom-style: none;
      border-radius: 0.25em 0.25em 0 0;
    }

    svg {
      fill: #000;
    }
  }

  .main {
    border: 0.0625em solid #ced4da;
    border-radius: 0 0.25em 0.25em 0.25em;
    background: #FFF;
    margin-top: -0.125em;
    padding-top: 0.125em;
    overflow: hidden;

    .body {
      padding: 0.25em;
    }

    .header, .footer {
      display: none;
    }
  }

  .filter-enter-active {
    animation: filter-in .3s;
  }
  .filter-leave-active {
    animation: filter-in .3s reverse;
  }
  @keyframes filter-in {
    0% {
      height: 0em;
    }
  }

@media (max-width: 575px) {
  .main {
    position: fixed;
    z-index: 1050;
    left: 0;
    top: 0;
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
    border: none;
    border-radius: 0;
    overflow-y: scroll;
    -webkit-overflow-scrolling: touch;

    .header {
      display: block;
      position: sticky;
      left: 0;
      top: 0;
      width: 100%;
      margin: 0;
      border-bottom: 0.0625em solid #c9cccf;
      z-index: 1;
      text-align: right;
      background: #e9ecef;

      .headerTitle {
        text-align: center;
        height: 2.5em;
        line-height: 2.5em;
      }

      .closeButton {
        position: absolute;
        top: 0;
        right: 0;
      }
    }

    .footer {
      display: block;
      position: sticky;
      left: 0;
      bottom: 0;
      width: 100%;
      height: 3em;
      margin: 0;
      padding: 0.5em;
      border-top: 0.0625em solid #c9cccf;
      z-index: 1;
      background: #e9ecef;
      text-align: right;
    }
  }

  @keyframes filter-in {
    0% {
      top: 100%;
    }
  }
}

</style>
