
import { constData } from './../../mtpadmdb.js';

/** ページ用のコンポーネントで使用する処理のミックスイン */
export default {
  created: function () {
    this.$_mixinForPage_updateTitle();
  },
  methods: {
    // ページタイトルの更新。
    $_mixinForPage_updateTitle: function () { // eslint-disable-line camelcase
      if ('pageTitle' in this.$options) {
        let pageTitle = this.$options.pageTitle;
        if (typeof pageTitle === 'function') {
          pageTitle = pageTitle.call(this);
        }
        if (pageTitle) {
          document.title = `${pageTitle} - ${constData.title}`;
        }

        // パンくずリスト
        let breadcrumbsTitle = this.$options.breadcrumbsTitle;
        if (typeof breadcrumbsTitle === 'function') {
          breadcrumbsTitle = breadcrumbsTitle.call(this);
        }
        // パンくずリストタイトルの指定がない場合はページタイトルを使用する。
        if (!breadcrumbsTitle) { breadcrumbsTitle = pageTitle; }
        if (breadcrumbsTitle) {
          let breadcrumbs = [];
          let middleOfBreadcrumbs = this.$options.middleOfBreadcrumbs;
          if (typeof middleOfBreadcrumbs === 'function') {
            middleOfBreadcrumbs = middleOfBreadcrumbs.call(this);
          }
          if (middleOfBreadcrumbs) {
            breadcrumbs = breadcrumbs.concat(middleOfBreadcrumbs);
          }
          breadcrumbs.push({ text: breadcrumbsTitle });

          this.$root.breadcrumbs = breadcrumbs;
        } else {
          document.title = constData.title;
          // パンくずリスト
          this.$root.breadcrumbs = null;
        }
      }
    }
  }
};
