
export default {
  data: function () {
    return {
      /** 読み込み対象の情報を格納するオブジェクト。 */
      '$routeQueryWrapper_info': {}
    };
  },
  watch: {
  },
  created: function () {
    const rqw = this.routeQueryWrapper;
    if (!rqw) { return; }
    const info = {};
    for (const key in rqw) {
      let value = rqw[key];
      if (!value.type) { value = { type: value }; }
      info[key] = value;
    }
    this.$data.$routeQueryWrapper_info = info;
  },
  methods: {
  }
};
