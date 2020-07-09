
export default {
  /** 各オブジェクトで共通で扱うデータ・関数群。 */
  $routeQueryWrapper: {
    /** $route.query 更新の要約が行われているオブジェクトの配列。予約がない場合は null 。 */
    reservedComponents: null,
    /** $route.query の更新の予約を行う。
     * @param target 更新に使用する情報を持つコンポーネント
     */
    reserveUpdateRouteQuery: function (target) {
      if (!this.reservedComponents) {
        this.reservedComponents = [];
        target.$nextTick(() => this.updateRouteQuery());
      }
      if (this.reservedComponents.every(element => element !== target)) {
        this.reservedComponents.push(target);
      }
    },
    /** 予約された情報を使って $route.query の更新を行う。 */
    updateRouteQuery: function () {
      const component = this.reservedComponents[0];
      const route = component.$route;
      const margedQuery = Object.assign({}, route.query);
      this.reservedComponents.forEach(value => {
        Object.assign(margedQuery, value.$routeQueryWrapper_routeQueryObject);
      });
      component.$router.replace({ path: route.path, params: route.params, query: margedQuery });
      this.reservedComponents.forEach(value => {
        value.$options.queriesSended.call(value);
      });
      this.reservedComponents = null;
    }
  },
  data: function () {
    const queryInfoBase = this.$options.queries;
    if (!queryInfoBase) { return {}; }
    const dataObj = {};
    // 設定情報を取得する。
    const info = [];
    for (const key in queryInfoBase) {
      let value = queryInfoBase[key];
      if (!value.type) { value = { type: value }; }
      if (!value.hasOwnProperty('default')) {
        switch (value.type) {
        case String:
          value.default = '';
          break;
        case Boolean:
          value.default = false;
          break;
        case Array:
          value.default = [];
          break;
        case Object:
          value.default = {};
          break;
        }
      }
      if (!value.hasOwnProperty('queryKey')) {
        value.queryKey = key;
      }
      if (!value.hasOwnProperty('propName')) {
        value.propName = key;
      }
      info.push(value);
      if (!value.computed) {
        dataObj[key] = value.default;
      } else {
        if (typeof value.computed.get === 'function' &&
            typeof value.computed.set === 'function') {
          this.$options.computed[key] = value.computed;
        }
      }
    }
      
    dataObj['$routeQueryWrapper_info'] = info;
    return dataObj;
  },
  computed: {
    /** このミックスインで管理している情報を $route.query に指定するオブジェクト。 */
    '$routeQueryWrapper_routeQueryObject': function () {
      const obj = {};
      const infos = this.$data.$routeQueryWrapper_info;
      let isUpdated = false;
      for (const i in infos) {
        const info = infos[i];
        let value = this[info.propName];
        if (this.isEqual(info.default, value)) {
          value = undefined;
        } else {
          switch (info.type) {
          case Boolean:
            value = value ? null : 'false';
            break;
          case Array:
            if (Array.isArray(value)) {
              value = JSON.stringify(value).replace(/^\[|\]$/g, '');
            } else {
              value = undefined;
            }
            break;
          case Object:
            value = JSON.stringify(value);
            break;
          }
        }
        if (this.$route.query[info.queryKey] !== value) {
          obj[info.queryKey] = value;
          isUpdated = true;
        }
      }
      if (!isUpdated) { return null; }
      return obj;
    }
  },
  watch: {
    '$route.query': 'readRouteQuery',
    '$routeQueryWrapper_routeQueryObject': function (newValue) {
      if (newValue) {
        this.$options.$routeQueryWrapper.reserveUpdateRouteQuery(this);
      }
    }
  },
  created: function () {
    this.readRouteQuery();
  },
  /** データの変更を受けて $route.query が変更されたときに呼ばれるフック。 */
  queriesSended: function () {},
  /** $route.query の変更を受けてデータが変更されたときに呼ばれるフック。 */
  queriesReceived: function () {},
  methods: {
    /** 2つの値が同一かどうかを確認する。 */
    isEqual: function (a, b) {
      function f (a, b) {
        if (a === b) { return true; }
        if (typeof a === 'object' && typeof b === 'object') {
          if (Array.isArray(a)) {
            if (a.length === b.length) {
              return a.every((element, index) => f(element, b[index]));
            }
          } else {
            const keys = Object.keys(a);
            if (keys.length === Object.keys(b).length) {
              return keys.every(key => f(a[key], b[key]));
            }
          }
        }
        return false;
      };
      return f(a, b);
    },
    /** 設定に基づき、$route.query からデータを読み込む。 */
    readRouteQuery: function () {
      const query = this.$route.query;
      const infos = this.$data.$routeQueryWrapper_info;
      let isUpdated = false;
      for (const i in infos) {
        const info = infos[i];
        let value = query[info.queryKey];
        if (value === undefined) {
          value = info.default;
        } else {
          // 型指定に応じた加工。
          switch (info.type) {
          case Number:
            value = Number(value);
            break;
          case Boolean:
            // このテーブルにあるもの以外は null も含め true とする。
            const falseTable = {
              'false': true,
              '0': true
            };
            value = !falseTable[value];
            break;
          case Array:
            try {
              value = JSON.parse(`[${value}]`);
            } catch {}
            break;
          case Object:
            try {
              value = JSON.parse(value);
            } catch {}
            break;
          }
        }
        if (!this.isEqual(this[info.propName], value)) {
          this[info.propName] = value;
          isUpdated = true;
        }
      }
      if (isUpdated) {
        this.$options.queriesReceived.call(this);
      }
    }
  }
};
