
export default {
  data: function () {
    return {
      /** 読み込み対象の情報を格納するオブジェクト。 */
      '$routeQueryWrapper_info': {}
    };
  },
  computed: {
    /** このミックスインで管理している情報を $route.query に指定するオブジェクト。 */
    '$routeQueryWrapper_routeQueryObject': function () {
      const obj = {};
      const rqw = this.routeQueryWrapper;
      const info = this.$data.$routeQueryWrapper_info;
      for (const key in info) {
        let value = rqw[key];
        if (info[key].default === value) {
          value = undefined;
        } else {
          switch (info[key].type) {
            // todo
          }
        }
        obj[key] = value;
      }
      return obj;
    }
  },
  watch: {
    '$route': 'readRouteQuery',
    '$routeQueryWrapper_routeQueryObject': function () {
      const margedQuery = Object.assign({}, this.$route.query, this.$routeQueryWrapper_routeQueryObject);
      this.$router.replace({ path: this.$route.path, params: this.$route.params, query: margedQuery });
    }
  },
  created: function () {
    const rqw = this.routeQueryWrapper;
    if (!rqw) { return; }
    const info = {};
    for (const key in rqw) {
      let value = rqw[key];
      if (!value.type) { value = { type: value }; }
      if (!value.hasOwnProperty('default')) {
        switch (value.type) {
        case String:
          value.default = '';
          break;
        }
      }
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
