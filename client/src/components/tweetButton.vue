<template>
  <span :id="id" style="width: 61px; height:20px; display: inline-block;" />
</template>

<script>
import $ from 'jquery';
/** ツイートボタン表示のコンポーネント */
export default {
  name: 'TweetButton',
  props: {
    'hashtags': {
      type: String,
      default: ''
    }
  },
  data: function () {
    return {
      id: 'tweetButton' + (Math.random() * 1000000).toFixed(0)
    };
  },
  watch: {
    '$route': function () {
      this.createButton();
    }
  },
  mounted: function () {
    this.createButton();
  },
  methods: {
    createButton: function () {
      if (typeof twttr === 'undefined') {
        setTimeout(() => { this.createButton(); }, 100);
        return;
      }
      let hashtags = 'パズドラ,mtPADmDB';
      if (this.hashtags) { hashtags += ',' + this.hashtags; }
      
      const jq = $(`#${this.id}`);
      if (!jq.length) { return; }
      jq.empty();
      twttr.widgets.createShareButton(
        location.href,
        document.getElementById(this.id),
        {
          hashtags: hashtags
        }
      );
    }
  }
};
</script>
