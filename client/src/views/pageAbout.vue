<template>
  <div>
    <h2>これは何？</h2>
    <p>
      みんなで協力してパズドラモンスターのデータベースを作り、作成されたJSONデータを自由に使用できる形で公開しようという試みです。
      たとえるなら、モンスターデータに特化した Wiki といった感じでしょうか。
    </p>
    <h3>ご協力のお願い</h3>
    <p>『みんなでつくる』というコンセプトなので、よろしければデータ登録のお手伝いをしてもらえたらと思います。</p>
    <p>データはフォームに入力して登録したり修正したりする、という形になっているので、未登録のキャラクターの名前と属性を軽く登録、なんて感じでもいいのでご協力をよろしくお願います。</p>
    <p>もちろん、その他の項目も登録してもらえると大変ありがたいです。</p>
    <p>また、モンスターアイコン画像がないと表示がいろいろと悲しい感じだったので、モンスター画像も受け付けてます。</p>
    <p>こちらはモンスター情報表示画面のスクリーンショットを指定すると自動でモンスター画像とアイコン画像が切り抜かれて送信することができるものになっています。</p>
    <p>切り抜き機能は、 iPhone のスクショだと一通り大丈夫、なはずで、Android のスクショはテスト不十分ですが行ける、といいなあ、といった感じです。</p>
    <p>情報が登録されているけどアイコンが表示されていないモンスターを見かけたときに、サクッとスクショ撮ってサクッと登録してもらえるとありがたいです。</p>
    <p>もちろん、情報の登録と画像の登録の両方を合わせて行ってもらえたら大変大変ありがたいです。です。</p>

    <h3>JSONファイルリンク</h3>
    <p>以下のJSONは自由に再利用可能なものとして公開しています。</p>
    <ul>
      <li><a href="./listJson/monster_data.json" target="_blank">モンスター情報</a></li>
      <li><a href="./listJson/skill_list.json" target="_blank">スキル情報</a></li>
      <li><a href="./listJson/leader_skill_list.json" target="_blank">リーダースキル情報</a></li>
    </ul>
    <h3>JSONファイルのフォーマットについて</h3>
    <p>詳細はいわゆる『あとで書く』。</p>
    <p>ざっくり書くと、モンスター番号をキーとしてモンスター情報を値として持つオブジェクト。スキルとリーダースキルは番号が入っていて別ファイルにあるオブジェクトの情報を参照して使用する、というものです。</p>

    <h3>モンスターなどの画像の再利用について</h3>
    <p>モンスター画像は ./monsterImages/{番号}.jpg に、モンスターアイコンの画像は /mosnterIcons/icon_{番号}.jpg にあります。</p>
    <p>また、属性アイコンやタイプアイコン、覚醒アイコンを切り抜いたものは ./image/attribute/{番号}.png , ./image/type/{番号}.png , ./image/awaken/{番号}.png にあります。</p>
    <p>
      当サイトとしては、これらの画像の再利用についてはノーコメント、ということにしておきますが、
      前提としてこれらの画像はガンホー・オンライン・エンターテイメント株式会社および関係各社、各イラストレーター様の著作物であるということを留意してください。
    </p>
    <h4>モンスター画像URL例</h4>
    <ul>
      <li><a href="./monsterImages/1.jpg" target="_blank">./monsterImages/1.jpg</a></li>
      <li><a href="./monsterIcons/icon_1.jpg" target="_blank">./monsterIcons/icon_1.jpg</a></li>
    </ul>
    <h4>各種素材画像URL例</h4>
    <ul>
      <li><a href="./image/attribute/1.png" target="_blank">./image/attribute/1.png</a></li>
      <li><a href="./image/type/1.png" target="_blank">./image/type/1.png</a></li>
      <li><a href="./image/awaken/1.png" target="_blank">./image/awaken/1.png</a></li>
    </ul>

    <h3>管理者情報</h3>
    <dl class="row">
      <dt class="col-sm-3">管理者名</dt>
      <dd class="col-sm-9">RAINBOW佐崎</dd>
      <dt class="col-sm-3">メールアドレス</dt>
      <dd class="col-sm-9">rainbowsazaki@gmail.com</dd>
      <dt class="col-sm-3">Twitter アカウント</dt>
      <dd class="col-sm-9"><a href="https://twitter.com/rainbowsazaki" target="_blank">@rainbowsazaki</a></dd>
      <dt class="col-sm-3">サイトの Twitter アカウント</dt>
      <dd class="col-sm-9"><a href="https://twitter.com/mtPADmDB" target="_blank">@mtPADmDB</a></dd>
    </dl>
  </div>
</template>

<script>
/**
 * アバウトページコンポーネント
 */
export default {
  name: 'PageAbout',
  template: '#templateAbout',
  pageTitle: 'これは何？'
};
</script>
