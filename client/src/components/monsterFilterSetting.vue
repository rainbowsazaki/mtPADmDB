<template>

  <div id="filter">
    <div v-if="!hideName" class="row">
      <div class="col-sm-12 mb-2">
        <input type="text" class="form-control" placeholder="モンスター名検索" v-model="filter.name">
      </div>
    </div>

    <span id="filterTrigger" :class="{ open: isOpenFilterTrigger }" @click="isVisibleFilter = !isVisibleFilter">
      その他絞り込み
      <svg viewBox="0 0 100 100" width="1em" height="1em">
        <path v-if="isVisibleFilter" d="M50 0 L10 75 L90 75 Z" />
        <path v-else d="M50 75 L10 0 L90 0 Z" />
      </svg>
    </span>
    <transition name="filter"
                @before-enter="setStyleHeight($event, 'filter'); isOpenFilterTrigger = true;"
                @after-enter="clearStyleHeight($event); isFullOpenFilterTrigger = true;"
                @before-leave="setStyleHeight($event); isFullOpenFilterTrigger = false;"
                @after-leave="isOpenFilterTrigger = false;"
    >
      <form id="filterForm" v-if="isVisibleFilter">
        <div class="formMenu">
          <div class="formMenuTitle">モンスター絞り込み</div>
          <a class="btn" @click="isVisibleFilter = false;">×</a>
        </div>
        <div class="formBottomMenu">
          <button class="btn btn-secondary btn-sm" type="button" @click="clearFilter">クリア</button>
          <button class="btn btn-primary btn-sm" type="button" @click="isVisibleFilter = false;">OK</button>
        </div>
        <div class="row">
          <label class="col-4 col-form-label">主属性</label>
          <div class="col-8 col-form-label">
            <attr-select use-unknown checkbox-style v-model="filter.attr" />
          </div>
        </div>
        <div class="row">
          <label class="col-4 col-form-label">複属性</label>
          <div class="col-8 col-form-label">
            <attr-select use-none checkbox-style v-model="filter.subAttr" />
          </div>
        </div>
        <div class="row">
          <label class="col-4 col-form-label">タイプ</label>
          <div class="col-8 col-form-label">
            <attr-select use-unknown checkbox-style mode="type" v-model="filter.type" />
          </div>
        </div>
        <div class="from-group row">
          <label class="col-4 col-form-label">レアリティ</label>
          <label class="col-8 col-form-label">
            <input type="number" v-model.number.lazy="filter.rarityMin" required min="1" max="10">〜
            <input type="number" v-model.number.lazy="filter.rarityMax" required min="1" max="10">
          </label>
        </div>
        <div class="row">
          <label class="col-4 col-form-label">スキル<span class="inlineBlock">ターン</span></label>
          <div class="col-8 col-form-label">
            <input type="number" v-model.number.lazy="filter.skillTurnMin" required min="1" max="99">〜
            <input type="number" v-model.number.lazy="filter.skillTurnMax" required min="1" max="99">
          </div>
        </div>
        <div class="row">
          <label class="col-sm-4 col-form-label">覚醒</label>
          <div class="col-sm-8">
            <awaken-select v-model="filter.awaken" />
          </div>
        </div>
        <div class="row">
          <label class="col-4 col-form-label">スキル<span class="inlineBlock">ブースト</span></label>
          <div class="col-8 col-form-label">
            <input type="number" v-model.number.lazy="filter.skillBoostMin" required min="0" max="9">〜
            <input type="number" v-model.number.lazy="filter.skillBoostMax" required min="0" max="9">
          </div>
        </div>
        <div class="row">
          <label class="col-4 col-form-label">バインド耐性</label>
          <div class="col-8 col-form-label">
            <select v-model.number="filter.resistBindMin">
              <option value="0">0%</option>
              <option v-for="n in 2" :value="n * 50" :key="`opt${n}`">{{ n * 50 }}%</option>
            </select>〜
            <select v-model.number="filter.resistBindMax">
              <option value="0">0%</option>
              <option v-for="n in 2" :value="n * 50" :key="`opt${n}`">{{ n * 50 }}%</option>
            </select>
          </div>
        </div>
        <div class="row">
          <label class="col-4 col-form-label">暗闇耐性</label>
          <div class="col-8 col-form-label">
            <select v-model.number="filter.resistDarknessMin">
              <option value="0">0%</option>
              <option v-for="n in 5" :value="n * 20" :key="`opt${n}`">{{ n * 20 }}%</option>
            </select>〜
            <select v-model.number="filter.resistDarknessMax">
              <option value="0">0%</option>
              <option v-for="n in 5" :value="n * 20" :key="`opt${n}`">{{ n * 20 }}%</option>
            </select>
          </div>
        </div>
        <div class="row">
          <label class="col-4 col-form-label">お邪魔耐性</label>
          <div class="col-8 col-form-label">
            <select v-model.number="filter.resistJammerMin">
              <option value="0">0%</option>
              <option v-for="n in 5" :value="n * 20" :key="`opt${n}`">{{ n * 20 }}%</option>
            </select>〜
            <select v-model.number="filter.resistJammerMax">
              <option value="0">0%</option>
              <option v-for="n in 5" :value="n * 20" :key="`opt${n}`">{{ n * 20 }}%</option>
            </select>
          </div>
        </div>
        <div class="row">
          <label class="col-4 col-form-label">毒耐性</label>
          <div class="col-8 col-form-label">
            <select v-model.number="filter.resistPoisonMin">
              <option value="0">0%</option>
              <option v-for="n in 5" :value="n * 20" :key="`opt${n}`">{{ n * 20 }}%</option>
            </select>〜
            <select v-model.number="filter.resistPoisonMax">
              <option value="0">0%</option>
              <option v-for="n in 5" :value="n * 20" :key="`opt${n}`">{{ n * 20 }}%</option>
            </select>
          </div>
        </div>
        <div class="row timeExtension">
          <label class="col-4 col-form-label">操作時間<span class="inlineBlock">延長</span></label>
          <div class="col-8 col-form-label">
            <input type="number" v-model.number.lazy="filter.timeExtensionMin" required min="0" max="4" step="0.5">秒以上
          </div>
        </div>
        <div class="row evolutionType">
          <label class="col-4 col-form-label">進化形式</label>
          <div class="col-8 col-form-label">
            <label v-for="(typeName, no) in evolutionTypeTable" :key="no">
              <input class="decoToggle" type="checkbox" v-model.number="filter.evolutionType" :value="no">
              <span><span :class="`scale${typeName.length}char`">{{ typeName }}</span></span>
            </label>
          </div>
        </div>
        <div class="row assist">
          <label class="col-4 col-form-label">アシスト</label>
          <div class="col-8 col-form-label">
            <label>
              <input type="radio" class="decoToggle" v-model.number="filter.assist" :value="undefined">
              <span>すべて</span>
            </label>
            <label>
              <input type="radio" class="decoToggle" v-model.number="filter.assist" :value="1">
              <span>○</span>
            </label>
            <label>
              <input type="radio" class="decoToggle" v-model.number="filter.assist" :value="0">
              <span>×</span>
            </label>
          </div>
        </div>
        <div class="row">
          <label class="col-4 col-form-label">超覚醒を含める
          </label>
          <div class="col-8 col-form-label">
            <input type="checkbox" class="decoCheckbox" v-model="filter.includeSuperAwaken">
          </div>
        </div>
        <div class="innerButtons">
          <button class="btn btn-secondary btn-sm" type="button" @click="clearFilter">クリア</button>
        </div>
      </form>
    </transition>

    <ul class="settingText">
      <li v-for="(text, n) in filterSettingTextArray" :key="`settingText${n}`">{{ text }}</li>
    </ul>
  </div>
</template>

<script>
import { constData, commonData, escapeRegExp, toAimaiSearch, MultiSendBlocker } from '../mtpadmdb.js';
import RouteQueryWrapper from '../components/mixins/routeQueryWrapper.js';

/** filterの初期値。 */
const filterDefault = {
  name: '',
  attr: [],
  subAttr: [],
  type: [],
  awaken: [],
  rarityMin: 1,
  rarityMax: 10,
  skillTurnMin: 1,
  skillTurnMax: 99,
  skillBoostMin: 0,
  skillBoostMax: 9,
  resistBindMin: 0,
  resistBindMax: 100,
  resistDarknessMin: 0,
  resistDarknessMax: 100,
  resistJammerMin: 0,
  resistJammerMax: 100,
  resistPoisonMin: 0,
  resistPoisonMax: 100,
  timeExtensionMin: 0,
  evolutionType: [],
  assist: undefined,
  includeSuperAwaken: false
};

/** 頻出する一部の漢字を、ひらがなでも検索できるようにする */
function replaceKanjiWordToRegExp (str) {
  const wordPairList = [
    ['かくせい', '覚醒'],
    ['てんせい', '転生'],
    ['きょくせい|ごくせい', '極醒'],
    ['ばんにん', '番人'],
    ['かめん', '仮面'],
    ['ほうぎょく', '宝玉'],
    ['きせき', '希石']
  ];

  for (const wordPair of wordPairList) {
    str = str.replace(new RegExp(wordPair[0]), `(?:${wordPair[1]}|$&)`);
  }
  return str;
}

/** filter の初期値のオブジェクトを取得する。 */
export function getFilterDefault () {
  return Object.assign({}, filterDefault);
}

/**
 * 指定されたフィルタリング設定に基づき、モンスター情報を判定する関数を作成する。
 * フィルタリング指定のない設定の場合は、isAll プロパティに true が入った関数を返す。
 */
export function getFilterFunction (setting) {
  const functionArray = [];
  if (setting.name) {
    const searchWords = setting.name.split(/\s+/g);
    const searchWordsRegText = searchWords.map(escapeRegExp).map(replaceKanjiWordToRegExp).map(toAimaiSearch);
    // (?=.*hogehoge) が連続していて ^ と .*$ で挟まれた正規表現で、肯定先読みを利用した AND 検索になるとのこと。
    const regexp = new RegExp('^(?=.*' + searchWordsRegText.join(')(?=.*') + ').*$', 's');
    functionArray.push(d => { return regexp.test(d.name); });
  }
  if (setting.attr && setting.attr.length > 0) {
    const filterObj = {};
    for (const attr of setting.attr) { filterObj[attr] = true; }
    functionArray.push(d => filterObj[d.attributes[0]]);
  }
  if (setting.subAttr && setting.subAttr.length > 0) {
    const filterObj = {};
    for (const attr of setting.subAttr) { filterObj[attr] = true; }
    functionArray.push(d => filterObj[d.attributes[1]]);
  }
  if (setting.type && setting.type.length > 0) {
    const filterObj = {};
    for (const type of setting.type) { filterObj[type] = true; }
    functionArray.push(d => d.types.some(type => filterObj[type]));
  }
  if (setting.awaken && setting.awaken.length > 0) {
    const awakenFilter = {};
    for (const awaken of setting.awaken) {
      awakenFilter[awaken] = (awakenFilter[awaken] || 0) + 1;
    }
    const awakenKeys = Object.keys(awakenFilter);
    if (setting.includeSuperAwaken) {
      functionArray.push(d => {
        let canUseSuperAwaken = !!d.superAwakens;
        return awakenKeys.every(key => {
          if (d.awakenCount[key] >= awakenFilter[key]) { return true; }
          if (canUseSuperAwaken && (d.awakenCount[key] || 0) === awakenFilter[key] - 1 && d.superAwakens.includes(Number(key))) {
            canUseSuperAwaken = false;
            return true;
          }
          return false;
        });
      });
    } else {
      functionArray.push(d => awakenKeys.every(key => d.awakenCount[key] >= awakenFilter[key]));
    }
  }
  function getSettingValue (name) { return setting.hasOwnProperty(name) ? setting[name] : filterDefault[name]; }

  /**
   * モンスター情報の何らかの値が指定範囲内に入っているかどうかのフィルタリングを登録する。
   * @param name 対象の項目の名前。 後ろにMaxやMinをつけた文字列をパラメータのプロパティ名として使用する。
   * @param createFilterFunc 範囲の最小値と最大値を受け取り、モンスター情報を受け取って表示対象かどうかを返す関数を作成して返す関数。
   */
  function resistRangeFilter (name, createFilterFunc) {
    const nameMin = name + 'Min';
    const nameMax = name + 'Max';
    const borderMin = getSettingValue(nameMin);
    const borderMax = getSettingValue(nameMax);
    if (borderMin !== filterDefault[nameMin] ||
        borderMax !== filterDefault[nameMax]) {
      functionArray.push(createFilterFunc(borderMin, borderMax));
    }
  }
  // ２種類の覚醒の数をもとにした値が指定範囲内に入っているかどうかのフィルタリングを登録する
  function registAwakenPowerFilter (name, awakenNo0, rate0, awakenNo1, rate1) {
    resistRangeFilter(name, (borderMin, borderMax) => {
      if (setting.includeSuperAwaken) {
        return d => {
          let power = (d.awakenCount[awakenNo0] | 0) * rate0 + (d.awakenCount[awakenNo1] | 0) * rate1;
          if (d.superAwakens) {
            if (d.superAwakens.includes(awakenNo0)) {
              power += rate0;
            } else if (d.superAwakens.includes(awakenNo1)) {
              power += rate1;
            }
          }
          return power >= borderMin && power <= borderMax;
        };
      } else {
        return d => {
          const power = (d.awakenCount[awakenNo0] | 0) * rate0 + (d.awakenCount[awakenNo1] | 0) * rate1;
          return power >= borderMin && power <= borderMax;
        };
      }
    });
  };

  resistRangeFilter('rarity', (borderMin, borderMax) => {
    return d => d.rare >= borderMin && d.rare <= borderMax;
  });
  resistRangeFilter('skillTurn', (borderMin, borderMax) => {
    return d => {
      const skill = commonData.skillTable[d.skill];
      if (!skill) { return false; }
      // 最短ターン情報がない場合は弾く。
      if (skill.minTurn === null) { return false; }
      return skill.minTurn >= borderMin && skill.minTurn <= borderMax;
    };
  });
  registAwakenPowerFilter('skillBoost', 21, 1, 56, 2);
  registAwakenPowerFilter('resistBind', 10, 50, 52, 100);
  registAwakenPowerFilter('resistDarkness', 11, 20, 68, 100);
  registAwakenPowerFilter('resistJammer', 12, 20, 69, 100);
  registAwakenPowerFilter('resistPoison', 13, 20, 70, 100);
  resistRangeFilter('timeExtension', (borderMin, borderMax) => {
    if (setting.includeSuperAwaken) {
      return d => {
        let power = (d.awakenCount[19] | 0) * 0.5 + (d.awakenCount[53] | 0) * 1;
        if (d.superAwakens) {
          if (d.superAwakens.includes(19)) {
            power += 0.5;
          } else if (d.superAwakens.includes(53)) {
            power += 1;
          }
        }
        return power >= borderMin;
      };
    } else {
      return d => {
        const power = (d.awakenCount[19] | 0) * 0.5 + (d.awakenCount[53] | 0) * 1;
        return power >= borderMin;
      };
    }
  });

  if (setting.evolutionType && setting.evolutionType.length) {
    const filterObj = {};
    for (const attr of setting.evolutionType) { filterObj[attr] = true; }
    functionArray.push(d => filterObj[d.evolutionType]);
  }
  
  if (setting.assist !== undefined) {
    functionArray.push(d => d.assist === setting.assist);
  }
  // フィルタリングがない場合は常に true を返す関数を返す。
  if (functionArray.length === 0) {
    const retFunc = d => true;
    retFunc.isAll = true;
    return retFunc;
  }
  return d => functionArray.every(f => f(d));
}

/** フィルタリング設定を使用してモンスター情報の配列から、フィルタリング情報の条件を満たすもののみ取り出した配列を作成する。 */
export function filterMonsterDataArray (setting, target) {
  const func = getFilterFunction(setting);
  if (func.isAll) { return target; }
  return target.filter(d => func(d.data || d));
}

/** フィルタリング設定の内容を表現したテキストの配列を作成する。 */
export function filterSettingTextArray (setting) {
  const textArray = [];
  if (setting.name) {
    textArray.push(`名前に『${setting.name}』を含む`);
  }
  const hasMainAttr = setting.attr && setting.attr.length > 0;
  const hasSubAttr = setting.subAttr && setting.subAttr.length > 0;
  if (hasMainAttr) {
    if (hasSubAttr) {
      textArray.push('属性:' + setting.attr.map(a => constData.attributeTable[a]).join('') +
        '/' + setting.subAttr.map(a => constData.attributeTable[a]).join('')
      );
    } else {
      textArray.push('主属性:' + setting.attr.map(a => constData.attributeTable[a]).join(''));
    }
  } else if (hasSubAttr) {
    textArray.push('複属性:' + setting.subAttr.map(a => constData.attributeTable[a]).join(''));
  }
  if (setting.type && setting.type.length > 0) {
    textArray.push('タイプ:' + setting.type.map(a => { const info = constData.typeTable[a]; return info && info.name || ''; }).join('/'));
  }
  if (setting.awaken && setting.awaken.length > 0) {
    textArray.push('覚醒:' + setting.awaken.map(a => { const info = constData.awakenTable[a]; return info && info.name || ''; }).join('/') + 'を含む');
  }
  function createRangeText (min, max, defaultMin, defaultMax, tanni) {
    if (tanni === undefined) { tanni = ''; }
    if (min === max) { return min + tanni; }
    if (min === defaultMin) { return `${max}${tanni}以下`; }
    if (max === defaultMax) { return `${min}${tanni}以上`; }
    return `${min}〜${max}${tanni}`;
  }
  function getSettingValue (name) { return setting.hasOwnProperty(name) ? setting[name] : filterDefault[name]; }
  function addRangeText (propName, dispName, tanni) {
    const nameMin = propName + 'Min';
    const nameMax = propName + 'Max';
    const borderMin = getSettingValue(nameMin);
    const borderMax = getSettingValue(nameMax);
    if (borderMin !== filterDefault[nameMin] ||
        borderMax !== filterDefault[nameMax]) {
      const valueText = createRangeText(borderMin, borderMax, filterDefault[nameMin], filterDefault[nameMax], tanni);
      textArray.push(`${dispName}:${valueText}`);
    }
  }
  addRangeText('rarity', 'レア度');
  addRangeText('skillTurn', 'Sターン');
  addRangeText('skillBoost', 'スキブ');
  addRangeText('resistBind', 'バインド耐性', '%');
  addRangeText('resistDarkness', '暗闇耐性', '%');
  addRangeText('resistJammer', 'お邪魔耐性', '%');
  addRangeText('resistPoison', '毒耐性', '%');
  addRangeText('timeExtension', '指延長', '秒');

  if (setting.evolutionType && setting.evolutionType.length > 0) {
    textArray.push('進化形式:' + setting.evolutionType.map(a => { const info = constData.evolutionTypeTable[a]; return info || ''; }).join('/'));
  }
  if (setting.assist !== undefined) {
    textArray.push('アシスト:' + constData.booleanTable[setting.assist]);
  }
  if (setting.includeSuperAwaken) {
    textArray.push('覚醒関連に超覚醒を含める');
  }

  return textArray;
}

/** フィルタリング設定の内容を表現したテキストを作成する。 */
export function filterSettingText (setting) {
  return filterSettingTextArray(setting).join(' ');
}

/** モンスター絞り込みの設定を行うコンポーネント。 */
export default {
  name: 'MonsterFilterSetting',
  mixins: [
    RouteQueryWrapper
  ],
  queries: {
    name: {
      type: String,
      default: filterDefault.name,
      computed: true
    },
    attr: {
      type: Array,
      default: filterDefault.attr,
      computed: true
    },
    subAttr: {
      type: Array,
      default: filterDefault.subAttr,
      computed: true
    },
    type: {
      type: Array,
      default: filterDefault.type,
      computed: true
    },
    awaken: {
      type: Array,
      default: filterDefault.awaken,
      computed: true
    },
    assist: {
      type: Number,
      default: filterDefault.assist,
      computed: true
    },
    rarityFilterStr: {
      type: String,
      default: filterDefault.rarityMin + '-' + filterDefault.rarityMax,
      queryKey: 'rarity',
      computed: true
    },
    skillTurnFilterStr: {
      type: String,
      default: filterDefault.skillTurnMin + '-' + filterDefault.skillTurnMax,
      queryKey: 'skillTurn',
      computed: true
    },
    skillBoostFilterStr: {
      type: String,
      default: filterDefault.skillBoostMin + '-' + filterDefault.skillBoostMax,
      queryKey: 'skillBoost',
      computed: true
    },
    resistBindFilterStr: {
      type: String,
      default: filterDefault.resistBindMin + '-' + filterDefault.resistBindMax,
      queryKey: 'resistBind',
      computed: true
    },
    resistDarknessFilterStr: {
      type: String,
      default: filterDefault.resistDarknessMin + '-' + filterDefault.resistDarknessMax,
      queryKey: 'resistDarkness',
      computed: true
    },
    resistJammerFilterStr: {
      type: String,
      default: filterDefault.resistJammerMin + '-' + filterDefault.resistJammerMax,
      queryKey: 'resistJammer',
      computed: true
    },
    resistPoisonFilterStr: {
      type: String,
      default: filterDefault.resistPoisonMin + '-' + filterDefault.resistPoisonMax,
      queryKey: 'resistPoison',
      computed: true
    },
    timeExtensionMin: {
      type: Number,
      default: filterDefault.timeExtensionMin,
      computed: true
    },
    evolutionType: {
      type: Array,
      defualt: filterDefault.evolutionType,
      computed: true
    },
    includeSuperAwaken: {
      type: Boolean,
      default: filterDefault.includeSuperAwaken,
      computed: true
    }
  },
  /** データの変更を受けて $route.query が変更されたときに呼ばれるフック。 */
  queriesSended: function () {
    this.$emit('input', this.filter);
  },
  /** $route.query の変更を受けてデータが変更されたときに呼ばれるフック。 */
  queriesReceived: function () {
    this.$emit('input', this.filter);
  },
  props: {
    'value': {
      type: Object,
      default: () => {}
    },
    /** 名前の入力欄を非表示にするかどうか。 */
    'hideName': {
      type: Boolean,
      default: false
    }
  },
  data: function () {
    return {
      /** フィルタリング設定領域を表示するかどうか。 */
      isVisibleFilter: false,
      /** フィルタリング設定領域の表示／非表示を切り替えるトリガーの下部が開いた状態かどうか。 */
      isOpenFilterTrigger: false,
      /** フィルタリング設定領域がすべて表示されている状態かどうか。 */
      isFullOpenFilterTrigger: false,
      /** 表示するモンスターに対するフィルタ。 */
      filter: getFilterDefault(),
      /** フォームの変更とそれによる query の変更の巡回によって起こる更新イベントの多重送信を防ぐオブジェクト。 */
      multiSendBlocker: new MultiSendBlocker(1),
      /** ブラウザの横幅がフィルタリング設定領域を全画面で多い表示するものかどうか。 */
      isBrowserWidthSmall: false,
      /** フィルタリング設定領域を全画面で表示したときの、全体の縦スクロール位置。 */
      tempScrollTop: 0
    };
  },
  computed: {
    attributeTable () { return constData.attributeTable; },
    typeTable () { return constData.typeTable; },
    evolutionTypeTable () { return constData.evolutionTypeTable; },

    name: {
      get: function () { return this.filter.name; },
      set: function (v) { this.filter.name = v; }
    },
    attr: {
      get: function () { return this.filter.attr; },
      set: function (v) { this.filter.attr = v; }
    },
    subAttr: {
      get: function () { return this.filter.subAttr; },
      set: function (v) { this.filter.subAttr = v; }
    },
    type: {
      get: function () { return this.filter.type; },
      set: function (v) { this.filter.type = v; }
    },
    awaken: {
      get: function () { return this.filter.awaken; },
      set: function (v) { this.filter.awaken = v; }
    },
    assist: {
      get: function () { return this.filter.assist; },
      set: function (v) { this.filter.assist = v; }
    },
    rarityMin: {
      get: function () { return this.filter.rarityMin; },
      set: function (v) { this.filter.rarityMin = v; }
    },
    rarityMax: {
      get: function () { return this.filter.rarityMax; },
      set: function (v) { this.filter.rarityMax = v; }
    },
    timeExtensionMin: {
      get: function () { return this.filter.timeExtensionMin; },
      set: function (v) { this.filter.timeExtensionMin = v; }
    },
    evolutionType: {
      get: function () { return this.filter.evolutionType; },
      set: function (v) { this.filter.evolutionType = v; }
    },
    includeSuperAwaken: {
      get: function () { return this.filter.includeSuperAwaken; },
      set: function (v) { this.filter.includeSuperAwaken = v; }
    },

    /** その他絞り込み部分のフィルタリング設定をもとに作成したテキスト。 */
    filterSettingTextArray () {
      const array = filterSettingTextArray(this.filter);
      if (/^名前に/.test(array[0])) { array.shift(); }
      return array;
    },
    /** レアリティの絞り込み設定の最小値と最大値を - でつないだもの。 */
    rarityFilterStr: {
      get: function () { return this.getRangeFilterText('rarity'); },
      set: function (val) { this.setRangeFilterText('rarity', val); }
    },
    /** スキルターンの絞り込み設定の最小値と最大値を - でつないだもの。 */
    skillTurnFilterStr: {
      get: function () { return this.getRangeFilterText('skillTurn'); },
      set: function (val) { this.setRangeFilterText('skillTurn', val); }
    },
    /** スキルブーストの絞り込み設定の最小値と最大値を - でつないだもの。 */
    skillBoostFilterStr: {
      get: function () { return this.getRangeFilterText('skillBoost'); },
      set: function (val) { this.setRangeFilterText('skillBoost', val); }
    },
    /** バインド耐性の絞り込み設定の最小値と最大値を - でつないだもの。 */
    resistBindFilterStr: {
      get: function () { return this.getRangeFilterText('resistBind'); },
      set: function (val) { this.setRangeFilterText('resistBind', val); }
    },
    /** 暗闇耐性の絞り込み設定の最小値と最大値を - でつないだもの。 */
    resistDarknessFilterStr: {
      get: function () { return this.getRangeFilterText('resistDarkness'); },
      set: function (val) { this.setRangeFilterText('resistDarkness', val); }
    },
    /** お邪魔耐性の絞り込み設定の最小値と最大値を - でつないだもの。 */
    resistJammerFilterStr: {
      get: function () { return this.getRangeFilterText('resistJammer'); },
      set: function (val) { this.setRangeFilterText('resistJammer', val); }
    },
    /** 毒耐性の絞り込み設定の最小値と最大値を - でつないだもの。 */
    resistPoisonFilterStr: {
      get: function () { return this.getRangeFilterText('resistPoison'); },
      set: function (val) { this.setRangeFilterText('resistPoison', val); }
    },
    /** 設定領域を全画面で表示しているかどうか。 */
    isFullOverSettingArea: function () {
      return this.isBrowserWidthSmall && this.isFullOpenFilterTrigger;
    }
  },
  watch: {
    'filter.rarityMin': function () { this.checkRangeCross('rarity', false); },
    'filter.rarityMax': function () { this.checkRangeCross('rarity', true); },
    'filter.skillTurnMin': function () { this.checkRangeCross('skillTurn', false); },
    'filter.skillTurnMax': function () { this.checkRangeCross('skillTurn', true); },
    'filter.skillBoostMin': function () { this.checkRangeCross('skillBoost', false); },
    'filter.skillBoostMax': function () { this.checkRangeCross('skillBoost', true); },
    'filter.resistBindMin': function () { this.checkRangeCross('resistBind', false); },
    'filter.resistBindMax': function () { this.checkRangeCross('resistBind', true); },
    'filter.resistDarknessMin': function () { this.checkRangeCross('resistDarkness', false); },
    'filter.resistDarknessMax': function () { this.checkRangeCross('resistDarkness', true); },
    'filter.resistJammerMin': function () { this.checkRangeCross('resistJammer', false); },
    'filter.resistJammerMax': function () { this.checkRangeCross('resistJammer', true); },
    'filter.resistPoisonMin': function () { this.checkRangeCross('resistPoison', false); },
    'filter.resistPoisonMax': function () { this.checkRangeCross('resistPoison', true); },
    
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
    if (this.isFullOpenFilterTrigger) {
      this.setDisableScroll(false);
    }
  },
  methods: {
    /** 値の範囲指定の設定をテキスト化したものを取得する。 */
    getRangeFilterText: function (name) {
      const min = this.filter[name + 'Min'];
      const max = this.filter[name + 'Max'];
      if (min === max) { return min.toString(); }
      return min + '-' + max;
    },
    /** 値の範囲指定の設定を、テキスト化したものをもとに設定する。 */
    setRangeFilterText: function (name, value) {
      const nameMin = name + 'Min';
      const nameMax = name + 'Max';
      if (/^(\d+)$/.test(value)) {
        this.filter[nameMin] = RegExp.$1 | 0;
        this.filter[nameMax] = RegExp.$1 | 0;
      } else if (/^(\d+)-(\d+)$/.test(value)) {
        this.filter[nameMin] = RegExp.$1 | 0;
        this.filter[nameMax] = RegExp.$2 | 0;
      } else {
        this.filter[nameMin] = filterDefault[nameMin];
        this.filter[nameMax] = filterDefault[nameMax];
      }
    },
    /** 範囲指定の設定の大小関係が入れ替わっていないか確認し、入れ替わっている場合はいずれかの値に統一する。 */
    checkRangeCross: function (name, isUseMax) {
      const nameMax = name + 'Max';
      const nameMin = name + 'Min';
      if (this.filter[nameMax] < this.filter[nameMin]) {
        if (isUseMax) {
          this.filter[nameMin] = this.filter[nameMax];
        } else {
          this.filter[nameMax] = this.filter[nameMin];
        }
      }
    },
    /**
     * ページ全体のスクロールを無効にするかどうかを設定する。
     * 引数に true を指定するとスクロールが無効になり、 false を指定するとスクロールが有効になる。
     */
    setDisableScroll: function (b) {
      document.body.className = b ? 'noScroll' : '';
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
    },
    /** フィルタリング設定を空にする。 */
    clearFilter: function () {
      for (const key in this.filter) {
        const defaultValue = filterDefault[key];
        if (typeof defaultValue === 'object') {
          if (Array.isArray(defaultValue)) {
            this.filter[key] = defaultValue.concat();
          } else {
            this.filter[key] = Object.assign({}, defaultValue);
          }
        } else {
          this.filter[key] = defaultValue;
        }
      }
    }
  }
};
</script>

<style lang="scss">
@media (max-width: 575px) {
  // 設定フォームを全画面表示している際に裏をスクロールさせないための設定。
  body.noScroll {
    position: fixed;
  }
}
</style>

<style lang="scss" scoped>
  .inlineBlock {
    display: inline-block;
  }

  #filter {
    margin-bottom: 4px;
  }

  #filterTrigger {
    border: 1px solid #ced4da;
    border-radius: 4px;
    padding: 4px 4px 2px 4px;
    background: #FFF;
    cursor: pointer;

    &.open {
      border-bottom-style: none;
      border-radius: 4px 4px 0 0;
    }

    svg {
      fill: #000;
    }
  }

  #filterForm {
    border: 1px solid #ced4da;
    border-radius: 0 4px 4px 4px;
    background: #FFF;
    margin-top: -2px;
    padding: 8px 4px 4px 4px;
    overflow: hidden;

    .formMenu, .formBottomMenu {
      display: none;
    }
  }

  .settingText {
    margin-top: 0.5em;
  }

  .timeExtension input[type="number"] {
    width: 3em;
  }

  .evolutionType input[type="checkbox"] + span {
    margin-right: 0.4em;
    width: 5em;
    overflow: hidden;
    white-space: nowrap;

    .scale5char {
      display: inline-block;
      transform: scaleX(0.86);
      transform-origin: left center;
    }
    .scale6char {
      display: inline-block;
      transform: scaleX(0.72);
      transform-origin: left center;
    }
  }

  .assist input[type="radio"] + span {
    margin-right: 0.4em;
    min-width: 3em;
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
  #filterForm {
    position: fixed;
    z-index: 1050;
    left: 0;
    top: 0;
    height: 100%;
    margin: 0;
    padding: 1em;
    padding-top: 0em;
    padding-bottom: 3em;
    border: none;
    border-radius: 0;
    overflow-y: scroll;
    -webkit-overflow-scrolling: touch;
    
    .innerButtons {
      margin-bottom: 1em;
      * {
        display: none;
      }
    }
    .formMenu {
      display: block;
      position: sticky;
      left: -1rem;
      top: 0;
      width: calc(100% + 2em);
      margin: 0;
      margin-left: -1em;
      border-bottom: 1px solid #c9cccf;
      z-index: 1;
      text-align: right;
      background: #e9ecef;

      .formMenuTitle {
        text-align: center;
        line-height: 2.5em;
        margin-bottom: -2.5em;
      }
    }
    
    .formBottomMenu {
      display: block;
      position: sticky;
      left: -1rem;
      height: 3em;
      top: 100%;
      bottom: 3em;
      width: calc(100% + 2em);
      margin: 0;
      margin-left: -1em;
      margin-bottom: -3em;
      padding: 0.5em;
      border-top: 1px solid #c9cccf;
      z-index: 1;
      background: #e9ecef;
      text-align: right;

      button {
        margin-left: 0.5em;
        min-width: 5em;
      }
    }
  }

  @keyframes filter-in {
    0% {
      top: 100%;
    }
  }
}

</style>
