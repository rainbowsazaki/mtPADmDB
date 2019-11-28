
export default {
  data: function () {
    const queryInfoBase = this.$options.queries;
    if (!queryInfoBase) { return {}; }
    const dataObj = {};
    // 設定情報を取得する。
    const info = {};
    for (const key in queryInfoBase) {
      let value = queryInfoBase[key];
      if (!value.type) { value = { type: value }; }
      if (!value.hasOwnProperty('default')) {
        switch (value.type) {
        case String:
          value.default = '';
          break;
        }
      }
      info[key] = value;
      dataObj[key] = value.default;
    }
      
    dataObj['$routeQueryWrapper_info'] = info;
    return dataObj;
  },
  computed: {
    /** このミックスインで管理している情報を $route.query に指定するオブジェクト。 */
    '$routeQueryWrapper_routeQueryObject': function () {
      const obj = {};
      const data = this.$data;
      const info = data.$routeQueryWrapper_info;
      for (const key in info) {
        let value = data[key];
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
    this.readRouteQuery();
  },
  methods: {
    /** 設定に基づき、$route.query からデータを読み込む。 */
    readRouteQuery: function () {
      const query = this.$route.query;
      const data = this.$data;
      const info = data.$routeQueryWrapper_info;
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
        data[key] = value;
      }
    }
  }
};
