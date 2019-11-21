
export default {
  data: function () {
    return {
      /** 読み込み対象の情報を格納するオブジェクト。 */
      '$routeQueryWrapper_info': {}
    };
  },
  watch: {
    '$route': 'readRouteQuery'
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
    this.readRouteQuery();
  },
  methods: {
    /** 設定に基づき、$route.query からデータを読み込む。 */
    readRouteQuery: function () {
      const query = this.$route.query;
      const info = this.$data.$routeQueryWrapper_info;
      for (const key in info) {
        let value = query[key];
        if (value === undefined) {
          value = info[key].default;
        } else {
          // 型指定に応じた加工。
          switch (info[key].type) {
          case Number:
            value = Number(value);
            break;
          }
        }
        this.routeQueryWrapper[key] = value;
      }
    }
  }
};
