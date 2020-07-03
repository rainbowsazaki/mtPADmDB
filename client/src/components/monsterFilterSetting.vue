<template>

  <div id="filter">
    <div v-if="!hideName" class="row">
      <div class="col-sm-12 mb-2">
        <input type="text" class="form-control" placeholder="モンスター名検索" v-model="filter.name">
      </div>
    </div>

    <span id="filterTrigger" :class="{ open: isOpenFilterTrigger }" @click="isVisibleFilter = !isVisibleFilter">
      {{ toggleText }}
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
          <label class="col-4 col-form-label">お気に入り</label>
          <div class="col-8">
            <select class="custom-select" v-model="filter.favorite">
              <option :value="undefined">すべて</option>
              <option :value="1">お気に入りのみ</option>
              <option :value="2">お気に入りとその進化系統</option>
              <option :value="0">お気に入り以外のみ</option>
            </select>
          </div>
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
            <number-select v-model.number.lazy="filter.rarityMin" required min="1" max="10" />〜
            <number-select v-model.number.lazy="filter.rarityMax" required min="1" max="10" />
          </label>
        </div>
        <div class="row">
          <label class="col-4 col-form-label">スキル<span class="inlineBlock">ターン</span></label>
          <div class="col-8 col-form-label">
            <number-select v-model.number.lazy="filter.skillTurnMin" required min="1" max="55" />〜
            <number-select v-model.number.lazy="filter.skillTurnMax" required min="1" max="55" />
          </div>
        </div>
        <div class="row">
          <div class="col-8">
            <label>
              <input type="checkbox" class="decoCheckbox" v-model="filter.includeSuperAwaken">
              覚醒関連に超覚醒を含める
            </label>
          </div>
        </div>
        <div class="row">
          <label class="col-sm-4 col-form-label d-none d-sm-block">覚醒</label>
          <div class="col-sm-8">
            <awaken-select popup-style :select-length="filter.includeSuperAwaken ? 10 : 9" v-model="filter.awaken" />
          </div>
        </div>
        <div class="row">
          <label class="col-4 col-form-label">スキル<span class="inlineBlock">ブースト</span></label>
          <div class="col-8 col-form-label">
            <number-select v-model.number.lazy="filter.skillBoostMin" required min="0" max="9" />〜
            <number-select v-model.number.lazy="filter.skillBoostMax" required min="0" max="9" />
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
            <number-select v-model.number.lazy="filter.timeExtensionMin" required min="0" max="4" step="0.5" />秒以上
          </div>
        </div>
        <div class="row evolutionType">
          <label class="col-4 col-form-label">進化形態</label>
          <div class="col-8 col-form-label">
            <label v-for="no in evolutionTypeSortTable" :key="no">
              <input class="decoToggle" type="checkbox" v-model.number="filter.evolutionType" :value="no">
              <span><span :class="`scale${evolutionTypeTable[no].length}char`">{{ evolutionTypeTable[no] }}</span></span>
            </label>

            <label>
              <input class="decoToggle" type="checkbox" v-model.number="filter.evolutionType" :value="reincarnationsTypeNo">
              <span class="long"><span class="scale12char">転生・超転生とその進化後</span></span>
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
  favorite: undefined,
  name: '',
  attr: [],
  subAttr: [],
  type: [],
  awaken: [],
  rarityMin: 1,
  rarityMax: 10,
  skillTurnMin: 1,
  skillTurnMax: 55,
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
  includeSuperAwaken: false,

  tempFavoriteTable: undefined
};

/** 転生・超転生とその進化後 で絞り込む際の進化形態の識別子。 */
const reincarnationsTypeNo = 99;

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
  if (setting.favorite !== undefined) {
    const favoriteTable = setting.tempFavoriteTable || commonData.monsterFavorites;
    let func;
    switch (setting.favorite) {
    case 1:
      func = d => { return favoriteTable[d.no] === 1; };
      break;
    case 2:
      func = d => { const state = favoriteTable[d.no]; return state === 1 || state === 2; };
      break;
    default:
      func = d => { return !favoriteTable[d.no]; };
      break;
    }
    if (func) { functionArray.push(func); }
  }
  if (setting.name) {
    const searchWords = setting.name.split(/\s+/g);
    const searchWordsRegText = searchWords.map(escapeRegExp).map(replaceKanjiWordToRegExp).map(toAimaiSearch);
    // (?=.*hogehoge) が連続していて ^ と .*$ で挟まれた正規表現で、肯定先読みを利用した AND 検索になるとのこと。
    const regexp = new RegExp('^(?=.*' + searchWordsRegText.join(')(?=.*') + ').*$', 's');
    // 数字のみの指定の場合はその番号のモンスターも表示する。
    if (/^\d+$/.test(setting.name)) {
      const targetNo = Number(setting.name);
      functionArray.push(d => { return d.no === targetNo || regexp.test(d.name); });
    } else {
      functionArray.push(d => { return regexp.test(d.name); });
    }
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
    let isDefault = false;
    let isRreincarnations = false;
    for (const evo of setting.evolutionType) {
      if (evo === reincarnationsTypeNo) {
        isRreincarnations = true;
      } else {
        filterObj[evo] = true;
        isDefault = true;
      }
    }
    let func = d => filterObj[d.evolutionType];
    if (isRreincarnations) {
      const baseFunc = func;
      // 転生・超転生の進化形態番号がtrue になっているテーブル。
      const reincarnationTable = { 3: true, 6: true };
      // 転生・超転生とその進化後の場合に true を返す関数。
      const checkReincarnations = d => {
        if (reincarnationTable[d.evolutionType]) { return true; }
        const baseMonseterData = commonData.monsterTable[d.evolution.baseNo];
        if (baseMonseterData && (reincarnationTable[baseMonseterData.evolutionType])) { return true; }
        return false;
      };
      if (isDefault) {
        func = d => baseFunc(d) || checkReincarnations(d);
      } else {
        func = checkReincarnations;
      }
    }
    functionArray.push(func);
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
  if (setting.favorite !== undefined) {
    const favoSettingTexts = {
      0: 'お気に入り以外のみ',
      1: 'お気に入りのみ',
      2: 'お気に入りとその進化系統'
    };
    const favoSettingText = favoSettingTexts[setting.favorite];
    if (favoSettingText) { textArray.push(favoSettingText); }
  }
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
  if (setting.includeSuperAwaken) {
    textArray.push('覚醒関連に超覚醒を含める');
  }
  if (setting.awaken && setting.awaken.length > 0) {
    textArray.push('覚醒:' + setting.awaken.map(a => { const info = constData.awakenTable[a]; return info && info.name || ''; }).join('/') + 'を含む');
  }
  addRangeText('skillBoost', 'スキブ');
  addRangeText('resistBind', 'バインド耐性', '%');
  addRangeText('resistDarkness', '暗闇耐性', '%');
  addRangeText('resistJammer', 'お邪魔耐性', '%');
  addRangeText('resistPoison', '毒耐性', '%');
  addRangeText('timeExtension', '指延長', '秒');

  if (setting.evolutionType && setting.evolutionType.length > 0) {
    textArray.push('進化形態:' + setting.evolutionType.map(n => {
      if (n === reincarnationsTypeNo) { return '転生・超転生とその進化後'; }
      return constData.evolutionTypeTable[n] || '';
    }).join('/'));
  }
  if (setting.assist !== undefined) {
    textArray.push('アシスト:' + constData.booleanTable[setting.assist]);
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
  components: {
    /** <input type="number"> と同じような指定で、ドロップダウンメニューによる数値指定を行うコンポーネント。 */
    numberSelect: {
      props: {
        value: {
          type: Number,
          require: true
        },
        /** 最小値。 */
        min: {
          type: [Number, String],
          defualt: 0
        },
        /** 最大値。 */
        max: {
          type: [Number, String],
          default: 99
        },
        /** 数値の間隔。 */
        step: {
          type: [Number, String],
          default: 1
        }
      },
      render: function (createElement) {
        const elms = [];
        const min = Number(this.min);
        let max = Number(this.max);
        let step = Number(this.step);
        const value = Number(this.value);
        if (min > max) { max = min; }
        if (step <= 0) { step = 1; }
        for (let i = min; i <= max; i += step) {
          elms.push(createElement('option', { attrs: { value: i, selected: i === value }}, i));
        }
        return createElement('select', {
          attrs: { value: this.value },
          on: {
            change: (event) => {
              this.$emit('input', event.target.value);
            }
          }
        }, elms);
      }
    }
  },
  mixins: [
    RouteQueryWrapper
  ],
  queries: {
    favorite: {
      type: Number,
      default: filterDefault.favorite,
      computed: {
        get: function () { return this.filter.favorite; },
        set: function (v) { this.filter.favorite = v; }
      }
    },
    name: {
      type: String,
      default: filterDefault.name,
      computed: {
        get: function () { return this.filter.name; },
        set: function (v) { this.filter.name = v; }
      }
    },
    attr: {
      type: Array,
      default: filterDefault.attr,
      computed: {
        get: function () { return this.filter.attr; },
        set: function (v) { this.filter.attr = v; }
      }
    },
    subAttr: {
      type: Array,
      default: filterDefault.subAttr,
      computed: {
        get: function () { return this.filter.subAttr; },
        set: function (v) { this.filter.subAttr = v; }
      }
    },
    type: {
      type: Array,
      default: filterDefault.type,
      computed: {
        get: function () { return this.filter.type; },
        set: function (v) { this.filter.type = v; }
      }
    },
    awaken: {
      type: Array,
      default: filterDefault.awaken,
      computed: {
        get: function () { return this.filter.awaken; },
        set: function (v) { this.filter.awaken = v; }
      }
    },
    assist: {
      type: Number,
      default: filterDefault.assist,
      computed: {
        get: function () { return this.filter.assist; },
        set: function (v) { this.filter.assist = v; }
      }
    },
    rarity: {
      type: String,
      default: filterDefault.rarityMin + '-' + filterDefault.rarityMax,
      computed: {
        get: function () { return this.getRangeFilterText('rarity'); },
        set: function (val) { this.setRangeFilterText('rarity', val); }
      }
    },
    skillTurn: {
      type: String,
      default: filterDefault.skillTurnMin + '-' + filterDefault.skillTurnMax,
      computed: {
        get: function () { return this.getRangeFilterText('skillTurn'); },
        set: function (val) { this.setRangeFilterText('skillTurn', val); }
      }
    },
    skillBoost: {
      type: String,
      default: filterDefault.skillBoostMin + '-' + filterDefault.skillBoostMax,
      computed: {
        get: function () { return this.getRangeFilterText('skillBoost'); },
        set: function (val) { this.setRangeFilterText('skillBoost', val); }
      }
    },
    resistBind: {
      type: String,
      default: filterDefault.resistBindMin + '-' + filterDefault.resistBindMax,
      computed: {
        get: function () { return this.getRangeFilterText('resistBind'); },
        set: function (val) { this.setRangeFilterText('resistBind', val); }
      }
    },
    resistDarkness: {
      type: String,
      default: filterDefault.resistDarknessMin + '-' + filterDefault.resistDarknessMax,
      computed: {
        get: function () { return this.getRangeFilterText('resistDarkness'); },
        set: function (val) { this.setRangeFilterText('resistDarkness', val); }
      }
    },
    resistJammer: {
      type: String,
      default: filterDefault.resistJammerMin + '-' + filterDefault.resistJammerMax,
      computed: {
        get: function () { return this.getRangeFilterText('resistJammer'); },
        set: function (val) { this.setRangeFilterText('resistJammer', val); }
      }
    },
    resistPoison: {
      type: String,
      default: filterDefault.resistPoisonMin + '-' + filterDefault.resistPoisonMax,
      computed: {
        get: function () { return this.getRangeFilterText('resistPoison'); },
        set: function (val) { this.setRangeFilterText('resistPoison', val); }
      }
    },
    timeExtensionMin: {
      type: Number,
      default: filterDefault.timeExtensionMin,
      computed: {
        get: function () { return this.filter.timeExtensionMin; },
        set: function (v) { this.filter.timeExtensionMin = v; }
      }
    },
    evolutionType: {
      type: Array,
      defualt: filterDefault.evolutionType,
      computed: {
        get: function () { return this.filter.evolutionType; },
        set: function (v) { this.filter.evolutionType = v; }
      }
    },
    includeSuperAwaken: {
      type: Boolean,
      default: filterDefault.includesSuperAwaken,
      computed: {
        get: function () { return this.filter.useSuperAwaken; },
        set: function (v) { this.filter.useSuperAwaken = v; }
      }
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
    },
    /** 表示・非表示切替部分に表示するテキスト。 */
    'toggleText': {
      type: String,
      default: 'その他絞り込み'
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
    evolutionTypeSortTable () { return constData.evolutionTypeSortTable; },
    /** 転生・超転生とその進化後 で絞り込む際の進化形態番号。 */
    reincarnationsTypeNo () { return reincarnationsTypeNo; },

    /** その他絞り込み部分のフィルタリング設定をもとに作成したテキスト。 */
    filterSettingTextArray () {
      const array = filterSettingTextArray(this.filter);
      if (/^名前に/.test(array[0])) { array.shift(); }
      return array;
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
    
    'filter.favorite': function () {
      if (this.filter.favorite === undefined) {
        this.filter.tempFavoriteTable = null;
      } else {
        this.filter.tempFavoriteTable = Object.assign({}, this.$store.state.monsterFavorites);
      }
    },

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
  body.noScroll_monsterFilterSetting {
    overflow: hidden;
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
    max-width: 40em;

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

    @mixin scaleXchar ($length: 1) {
      display: inline-block;
      position: relative;
      left: 50%;
      transform: translateX(-50%) scaleX(4.5 / $length);
    }

    .scale5char {
      @include scaleXchar(5);
    }
    .scale6char {
      @include scaleXchar(6);
    }
    .scale12char {
      @include scaleXchar(5.5);
    }

    &.long {
      width: 10.4em;
    }
  }

  .assist input[type="radio"] + span {
    margin-right: 0.4em;
    min-width: 3.2em;
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
