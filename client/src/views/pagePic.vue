<template>
  <div class="row">
    <div class="col-md-6">
      <canvas id="canvas" style="display:none;"></canvas>
      <div class="col-md-12">
        <template v-if="!this.$route.params.no">モンスター番号と</template>
        <template v-else>No.{{this.monsterNo}} {{(monsterTable[monsterNo] || {}).name || 'のモンスター'}}の</template>
        モンスター情報画面の画像ファイルを選択してください。</div>
      <div class="row">
          <div v-if="!this.$route.params.no" class="col-md-12">
            <monster-incremental-search v-model="monsterNo" :monster-table="monsterTable" :imageTable="imageTable"></monster-incremental-search>
          </div>
        <div class="col-md-12">
          <div class="custom-file">
            <input type="file" class="custom-file-input" id="monsterImageFile" @change="loadLocalImage">
            <label class="custom-file-label" for="monsterImageFile" style="overflow:hidden;">モンスター情報画像選択</label>
          </div>
        </div>
      
      </div>
      <img :src="uploadImgSrc" style="width: 100%; height: auto;" />
    </div>
    <div v-if="!imageResultSrc" class="col-md-6">
      <p>下記のような画面のスクリーンショットを選択してください。</p>
      <p>アシストしていない状態のものをお願いします。</p>
      <img src="./image/image_sample.jpg" alt="サンプル" />
    </div>

    <div v-if="imageResultSrc" id="result" class="col-md-6">
      <h2>切り抜き結果</h2>
      <div>
        <h3>モンスター画像</h3>
        <img :src="imageResultSrc" style="width: 100%;"/>
      </div>
      <div>
        <h3>アイコン画像</h3>
        <img :src="iconResultSrc" />
      </div>
          
      </table>
      <div style="margin-top: 1em;">
        <button @click="submit" class="btn btn-primary" :disabled="isSubmitted">{{isSubmitted ? '送信中' : 'この画像を送信する'}}</button>
      </div>
    </div>
  </div>
</template>

<script>
/**
 * 画像投稿ページコンポーネント
 */
export default {
  name: 'pagePic',
  pageTitle: function () {
    if (this.$route.params.no) {
      return `画像投稿 No.${this.$route.params.no} ${this.selectMonsterName}`;
    } else {
      return '画像投稿';
    }
  },
  middleOfBreadcrumbs: function () {
    if (this.$route.params.no) {
      return { text: `No.${this.$route.params.no} ${this.selectMonsterName}`, link: '/' + this.$route.params.no };
    } else {
      return undefined;
    }
  },

  data: function () {
    return {
      monsterNo: null,
      uploadImgSrc: '',
      imageResultSrc: '',
      iconResultSrc: '',
      /** 送信済みかどうか */
      isSubmitted: false
    };
  },

  created: function () {
    this.udpateMonsterNo();
  },

  watch: {
    '$route.params.no': function () {
      this.udpateMonsterNo();
    }
  },

  methods: {
    udpateMonsterNo: function () {
      if (this.$route.params.no) {
        this.monsterNo = this.$route.params.no;
      } else {
        this.monsterNo = null;
      }
      this.$_mixinForPage_updateTitle();
    },
    loadLocalImage: function loadLocalImage (e) {
      // ファイル情報を取得
      const fileData = e.target.files[0];
  
      // 画像ファイル以外は処理を止める
      if (!fileData.type.match('image.*')) {
        this.$store.commit('setErrors', ['画像を選択してください']);
        return;
      }

      $(e.target).next('.custom-file-label').text($(e.target)[0].files[0].name);
  
      // FileReaderオブジェクトを使ってファイル読み込み
      const reader = new FileReader();
      // ファイル読み込みに成功したときの処理
      reader.onload = () => {
        // Canvas上に表示する
        const uploadImgSrc = reader.result;
        const iconSrcScale = [12 / 640, (1136 - 795.8) / 640, 98.5 / 640];
        const imageSrcScale = [50 / 640, (1136 - 795 + 480) / 640, 540 / 640, 405 / 640];
        const canvas = document.getElementById('canvas');
        const ctx = canvas.getContext('2d');

        // Canvas上に画像を表示
        const img = new Image();
        img.src = uploadImgSrc;
        img.onload = () => {
          const iconWidth = 98;
          const iconHeight = 98;
          
          function checkWaku (array, startIndex, targetColor) {
            function isRange (value, target, margin) {
              return value - margin <= target && value + margin >= target;
            }
            const colorMargin = 64;
            return isRange(array[startIndex + 0], targetColor[0], colorMargin) &&
                    isRange(array[startIndex + 1], targetColor[1], colorMargin) &&
                    isRange(array[startIndex + 2], targetColor[2], colorMargin);
          }

          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, img.width, img.height);
          // 下端位置取得
          let data = ctx.getImageData(img.width * 0.1, 0, 8, img.height);
          let imgHeight = img.height;
          for (let i = data.height - 1; i > 0; i--) {
            if (checkWaku(data.data, data.width * 4 * i, [152, 114, 64])) {
              imgHeight = i + 1;
              break;
            }
          }
          // 上端位置取得
          let imgTop = 0;
          data = ctx.getImageData(1, 0, 8, img.height);
          for (let i = 0; i < img.height; i++) {
            if (checkWaku(data.data, data.width * 4 * i + 4, [152, 114, 64])) {
              imgTop = i;
              break;
            }
          }
          // 左端・横幅取得
          let marginLeft = 0;
          let imgWidth = img.width;
          data = ctx.getImageData(0, imgHeight - (img.width * 0.2) | 0, img.width, 8);
          for (let i = 0; i < data.width; i++) {
            if (checkWaku(data.data, 4 * i, [132, 101, 57])) {
              marginLeft = i;
              imgWidth -= marginLeft * 2;
              break;
            }
          }

          // 公式サイトのプレイヤー情報部分のない画像への対応。
          let isOfficialW750 = false;
          if (imgWidth === 640 && imgHeight >= 944 && imgHeight <= 948) {
            imgTop = imgHeight - 1096;
          }
          if (imgWidth === 750 && imgHeight >= 1117 && imgHeight <= 1119) {
            imgTop = imgHeight - 1293;
            isOfficialW750 = true;
          }

          // アイコン画像取得
          let srcX = marginLeft + (iconSrcScale[0] * imgWidth) | 0;
          let srcY = (imgHeight - iconSrcScale[1] * imgWidth) | 0;
          let srcWidth = (iconSrcScale[2] * imgWidth) | 0;
          let srcHeight = srcWidth;

          // アイコン上端の黒い線の位置を探す。
          srcY += 1; // 上にずらして確認していくので、最初は5sサイズの上端ラインの１段下から始める。
          // アイコン左上の主属性の上辺りを確認する。
          const checkWidth = 8;
          const checkHeight = 16;
          let isHitBlackLine = false;
          data = ctx.getImageData(srcX + srcWidth * 0.2, srcY - (checkHeight - 1), checkWidth, checkHeight);
          for (let i = 0; i < 10; i++) {
            const n = 4 * (checkHeight - 1 - i) * checkWidth;
            if ((data.data[n] < 40 && data.data[n + 1] < 40 && data.data[n + 2] < 40) ||
                (isOfficialW750 && data.data[n] < 60 && data.data[n + 1] < 20 && data.data[n + 2] < 10)) { // iPhoneから公式サイトの横750pxが画像を指定したとき用
              srcY -= i;
              isHitBlackLine = true;
              break;
            }
          }
          // 黒線が見つからなかった場合は最初の位置に戻す。
          if (!isHitBlackLine) { srcY -= 1; }
          
          // Canvasの準備
          canvas.width = iconWidth;
          canvas.height = iconHeight;
          ctx.drawImage(img, srcX, srcY, srcWidth, srcHeight, 0, 0, iconWidth, iconHeight);
          // canvasを画像に変換
          this.iconResultSrc = canvas.toDataURL('image/jpeg', 0.7);

          // モンスター画像取得
          const imageWidth = 540;
          const imageHeight = 405;
          
          // モンスター画像の縦の中心を求める
          const monsterAreaTop = imgTop + 144 / 640 * imgWidth;
          const monsterAreaBottom = imgHeight - 354 / 640 * imgWidth;
          const monsterAreaMiddleRate = 0.624;
          const monsterAreaMiddleOffset = imgWidth * 0.07;
          const monsterAreaMiddle = (monsterAreaTop * monsterAreaMiddleRate + monsterAreaBottom * (1 - monsterAreaMiddleRate) - monsterAreaMiddleOffset) | 0;

          srcX = marginLeft + (imageSrcScale[0] * imgWidth + 0.5) | 0;
          srcY = monsterAreaMiddle - srcHeight / 2;
          srcWidth = (imageSrcScale[2] * imgWidth + 0.5) | 0;
          srcHeight = (imageSrcScale[3] * imgWidth + 0.5) | 0;
          // Canvasの準備
          canvas.width = imageWidth;
          canvas.height = imageHeight;
          ctx.drawImage(img, srcX, srcY, srcWidth, srcHeight, 0, 0, imageWidth, imageHeight);

          // canvasを画像に変換
          this.imageResultSrc = canvas.toDataURL('image/jpeg', 0.85);

          // モンスター番号＆モンスター名の領域を切り抜く。
          const nameAreaHeight = 76 / 640 * imgWidth;
          const nameAreaTop = monsterAreaTop + 8 / 640 * imgWidth;
          srcX = marginLeft + (0.15 * imgWidth + 0.5) | 0;
          srcWidth = (0.7 * imgWidth + 0.5) | 0;
          // Canvasの準備
          canvas.width = srcWidth;
          canvas.height = nameAreaHeight;
          ctx.drawImage(img, srcX, nameAreaTop, srcWidth, nameAreaHeight, 0, 0, srcWidth, nameAreaHeight);
          // canvasを画像に変換
          this.uploadImgSrc = canvas.toDataURL('image/png');

          canvas.width = canvas.height = 0;
        };
      };
      // ファイル読み込みを実行
      reader.readAsDataURL(fileData);
    },

    submit: function () {
      function toBlob (dataUrl) {
        const bin = atob(dataUrl.replace(/^.*,/, ''));
        const buffer = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) {
          buffer[i] = bin.charCodeAt(i);
        }
        // Blobを作成
        const blob = new Blob([buffer.buffer], {
          type: 'image/jpeg'
        });
        return blob;
      }

      if (!this.iconResultSrc) { this.$store.commit('setErrors', ['画像が選択されていません。']); return; }
      if (isNaN(this.monsterNo) || this.monsterNo === null) { this.$store.commit('setErrors', ['モンスター番号が指定されていません。']); return; }
      if (this.monsterNo < 1 || this.monsterNo > 9999) { this.$store.commit('setErrors', ['モンスター番号の指定が不正です。']); return; }
      
      // 多重送信防止処理
      if (this.isSubmitted) { return; }
      this.isSubmitted = true;
      // 何かしらあってレスポンスが帰ってこなかった場合に再送信できるように２０秒後に復帰させる。
      const timeoutId = setTimeout(() => { this.isSubmitted = false; }, 20 * 1000);
      
      this.$store.commit('clearErrors');
      this.$store.commit('setMessages', ['送信中...']);

      const blobIcon = toBlob(this.iconResultSrc);
      const blobImage = toBlob(this.imageResultSrc);

      const formData = new FormData();
      formData.append('no', this.monsterNo);
      formData.append('icon', blobIcon);
      formData.append('image', blobImage);

      const onUploadProgress = (ev) => {
        if (ev.loaded === ev.total) {
          this.$store.commit('setMessages', ['登録中...']);
        }
      };

      mtpadmdb.api('image', formData, {
        headers: { 'content-type': 'multipart/form-data' },
        onUploadProgress: onUploadProgress
      }, (response) => {
        // レスポンス来なかったときの復帰処理を止める。
        clearTimeout(timeoutId);

        // Google Analiticsにイベントを送信。
        let action = 'monsterImagePost';
        if (this.monsterNo in this.$store.state.imageTable) {
          action = 'monsterImageUpdate'; // すでに画像投稿のあるモンスターに対して上書き投稿した場合。
        }
        gtagProductionOnly('event', action, {
          'event_category': 'monsterImage',
          'event_label': `No.${this.monsterNo}`
        });

        if (this.$route.params.no) {
          this.$router.push({ path: `/${this.$route.params.no}` });
        } else {
          this.monsterNo = null;
          this.uploadImgSrc = '';
          this.iconResultSrc = '';
          this.imageResultSrc = '';
          $('#monsterImageFile').next('.custom-file-label').text('モンスター情報画像選択');
          $('html,body').scrollTop(0);
          // 再度送信可能にする。
          this.isSubmitted = false;
        }
      }, (response) => {
        // レスポンス来なかったときの復帰処理を止める。
        clearTimeout(timeoutId);
        // 再度送信可能にする。
        this.isSubmitted = false;
      });
    }
  },

  computed: {
    monsterTable: function () { return this.$store.state.monsterTable; },
    imageTable: function () { return this.$store.state.imageTable; },
    selectMonsterName: function () {
      return (this.monsterTable[this.$route.params.no] || {}).name || '';
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
