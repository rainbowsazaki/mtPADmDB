#!/usr/bin/perl
use strict;

use utf8;

use CGI::Carp qw(fatalsToBrowser);
use CGI;
use JSON::PP ();
use DBI;

use File::Copy;

use lib qw(./modules);
use Subroutine;

# MessagePack の保存は休止中
# use Data::MessagePack;

# ローカルでの動作でなく x-requested-with が指定されていない場合は CSRF 対策として弾く。
if (!$ENV{'HTTP_X_REQUESTED_WITH'} &&
    $ENV{'HTTP_HOST'} ne 'localhost' && $ENV{'HTTP_HOST'} ne '127.0.0.1'
) {
  print "Status: 400 Bad Request\n\n";
  exit;
}

my %monster_data_db_info = (
  'monster_base_data' => [
    'name',
    'attributes_0',
    'attributes_1',
    'cost',
    'rare',
    'types_0',
    'types_1',
    'types_2',
    'awakens_0',
    'awakens_1',
    'awakens_2',
    'awakens_3',
    'awakens_4',
    'awakens_5',
    'awakens_6',
    'awakens_7',
    'awakens_8',
    'maxExp',
    'maxLevel',
    'maxParam_hp',
    'maxParam_attack',
    'maxParam_recovery',
    'skill',
    'leaderSkill',
    'assist',
    'overLimit',
    'evolutionType',
  ], 
  'over_limit' => [
    [ 'overLimitParam_hp', 'param_hp' ],
    [ 'overLimitParam_attack', 'param_attack' ],
    [ 'overLimitParam_recovery', 'param_recovery' ],
    [ 'superAwakens', 'superAwakens' ],
  ],
  'evolution' => [
    [ 'evolutionType', 'type' ],
    [ 'evolution_baseNo', 'baseNo' ],
    [ 'evolution_materials_0', 'materials_0' ],
    [ 'evolution_materials_1', 'materials_1' ],
    [ 'evolution_materials_2', 'materials_2' ],
    [ 'evolution_materials_3', 'materials_3' ],
    [ 'evolution_materials_4', 'materials_4' ],
  ]
);

# モンスター情報の各種テーブルをまとめた状態で取得するためのテーブル名指定。
my $monster_data_all_joined_table_name = "
  monster_data
    LEFT JOIN monster_base_data ON monster_data.monster_base_data = monster_base_data.id
    LEFT JOIN over_limit ON monster_data.over_limit = over_limit.id
    LEFT JOIN evolution ON monster_data.evolution = evolution.id
";

# モンスター情報の JSON を出力する際の項目のソート順。
my %json_sort_ranks = (
  no => 0,
  name => 10,
  attributes => 20,
  cost => 30,
  rare => 40,
  types => 50,
  awakens => 60,
  maxExp => 70,
  maxLevel => 80,
  maxParam => 90,
  skill => 100,
  leaderSkill => 110,
  assist => 120,
  overLimit => 130,
  overLimitParam => 140,
  superAwakens => 150,
  evolutionType => 160,
  evolution => 170,
  comment => 180,

  hp => 0,
  attack => 10,
  recovery => 20,

  description => 0,
  baseTurn => 10,
  #maxLevel は 80 で定義済み

  baseNo => 0,
  materials => 10,
);


my @monster_data_pickup_keys = qw/ no name attributes_0 attributes_1 types_0 types_1 types_2 /;

my $q = CGI->new();

my ($mode) = $ENV{'PATH_INFO'} =~ m|^/([^/]+)/?|;

my %modes = (
  'updateList' => \&mode_update_list,
  'image' => \&mode_image,
  'monsterHistory' => \&mode_monster_history,
  'monsterHistoryDetails' => \&mode_monster_history_details,
  'updateSkill' => \&mode_update_skill,
  'skillHistory' => \&mode_skill_history,
  'updateMonster' => \&mode_update_monster_data,
);

if (exists $modes{$mode}) {
  my $response_data = ResponseData->new;
  eval {
    $modes{$mode}->($q, $response_data);
  };
  # 例外が発生した場合の処理
  if ($@) {
    $response_data->add_error("Exception occur: $@");
    print "Status: 500 Internal Server Error\n";
  }
  print "Content-Type: application/json\n\n", $response_data->to_json;

} else {
  &mode_update_monster_data($q);
}


# モンスター情報のデータベースに接続する dbh を作成する。
sub create_monster_db_dbh {
  my $dbh = DBI->connect("dbi:SQLite:dbname=./db/monster.db");
  $dbh->{sqlite_unicode} = 1;
  $dbh->{AutoCommit} = 0;
  return $dbh;
}

# テーブルJSON更新モード
sub mode_update_list {
  my ($q, $response_data) = @_;
  my $dbh = &create_monster_db_dbh();
  &save_monster_list_json($dbh, { is_create_monster_json => 1 });
  &save_skill_list_json($dbh);
  &save_leader_skill_list_json($dbh);
  &save_image_list_json($dbh);
  &save_evolution_list_json($dbh);
  $response_data->add_message('success.')
}


# 画像受信モード
sub mode_image {
  my ($q, $response_data) = @_;

  my %newImageTable;
  
  my $no = $q->param('no');

  my $dbh = &create_monster_db_dbh();

  # 既存画像がロックされていないか確認する。
  my $table_ary_ref = &get_one_row_data($dbh, 'monster_image', [ 'COUNT(*)' ], (no => $no, state => 2 ));
  if ($table_ary_ref->[0] > 0) {
    $response_data->add_error('このモンスターの画像はロックされています。');
  }
  if (!$response_data->has_error) {
    # 既存の画像を無効化
    &update_disable_state($dbh, 'monster_image', (no => $no, state => 1));
    # 今回の投稿の情報をDBに登録
    my $ip_address = $ENV{'REMOTE_ADDR'};
    &insert_table_data($dbh, 'monster_image', (no => $no, ipAddress => $ip_address, accountName => '', state => 1));

    my $tbl_ary_ref = &get_one_row_data($dbh, 'monster_image', [ 'MAX(id)' ]);
    my $id = $tbl_ary_ref->[0];
    if ($id >= 0) {
      # 画像を保存
      my $iconFileName = $q->param('icon');
      my $imageFileName = $q->param('image');

      my $buffer;

      open(OUT, ">./monsterIcons/icon_${no}.jpg");
      binmode(OUT);
      while(read($iconFileName,$buffer,1024))
      {
        print OUT $buffer;
      }

      close(OUT);
      close($iconFileName); #ファイルハンドルをcloseしています。

      open(OUT, ">./monsterImages/${no}.jpg");
      binmode(OUT);
      while(read($imageFileName,$buffer,1024))
      {
        print OUT $buffer;
      }

      close(OUT);
      close($imageFileName); #ファイルハンドルをcloseしています。

      # ログとしてID付きで保存
      copy("./monsterIcons/icon_${no}.jpg","./monsterIconsLog/icon_${no}_${id}.jpg") or $response_data->add_error("error: $!");
      copy("./monsterImages/${no}.jpg","./monsterImagesLog/${no}_${id}.jpg") or $response_data->add_error("error: $!");

      # 投稿画像情報の一覧を作成する。
      &save_image_list_json($dbh);
      
      $newImageTable{$no} = { 'id' => $id }
    }
  }

  if (!$response_data->has_error) {
    $response_data->add_message('投稿を受け付けました。ありがとうございました。');
    $response_data->set_data({
      'newTableData' => {
        'imageTable' => \%newImageTable
      }
    });
    $dbh->commit;
  }
  
  $dbh->disconnect;
  
}


# モンスター情報編集履歴取得モード
# パラメータ
#   no - 取得対象のモンスターの番号。
sub mode_monster_history {
  my ($q, $response_data) = @_;
  my $monster_no = $q->param('no');
  
  my @columns = (
    'id', 'comment', [ 'datetime', 'createdDatetime' ], 'state'
  );
  my $dbh = &create_monster_db_dbh();
  my %where;
  if (defined $monster_no) {
    $where{no} = $monster_no;
  } else {
    push @columns, 'no';
  }

  my $data_ref = &table_to_array($dbh, "monster_data", \@columns, \%where, { order => 'createdDatetime DESC', limit => 50 });

  $response_data->set_data($data_ref);
  $dbh->disconnect;
}


# モンスター情報の過去の記録を取得する。
# パラメータ
#   id - 取得対象の記録のID。
sub mode_monster_history_details {
  my ($q, $response_data) = @_;
  my $id = $q->param('id');
  
  my $dbh = &create_monster_db_dbh();
  my @column_infos = @{&create_monster_data_column_infos()};
  push @column_infos, [ 'comment', 'monster_data.comment' ], [ 'datetime', 'monster_data.createdDatetime' ];

  my $data_ref = &table_to_array($dbh, $monster_data_all_joined_table_name, \@column_infos, { 'monster_data.id' => $id }, { limit => 1 });
  # データが取得できなかった場合は404と空情報を返す。
  if (length @$data_ref == 0 || !$data_ref->[0]) {
    $data_ref = [ {} ];
    print "Status: 404 Not Found\n";
  }
  
  $response_data->set_data($data_ref->[0]);
  $dbh->disconnect;
}

# スキル更新モード
sub mode_update_skill {
  my ($q, $response_data) = @_;

  my $json = $q->param("POSTDATA");
  if ($json eq "") {
    $response_data->add_error('データなし');
    return;
  }

  my $data = JSON::PP::decode_json($json);

  sub check_range {
    my ($name, $value, $min, $max, $is_not_null) = @_;
    if ($is_not_null == undef) { $is_not_null = 1; }

    if ($value == undef) {
      if ($is_not_null) { return 1; }
      $response_data->add_error("${name} の値が入力されていません。");
      return 0;
    }
    if ($value < $min || $value > $max) {
      $response_data->add_error("${name} の値が不正(${value})");
      return 0;
    }
    return 1;
  }

  sub check_string_length {
    my $length = length $_[1];
    if ($length < $_[2]) {
      if ($length == 0) {
        $response_data->add_error("${_[0]}が未入力");
      } else {
        $response_data->add_error("${_[0]}が短すぎます。(${_[2]}文字以上)");
      }
      return 0;
    }
    if ($length > $_[3]) {
      $response_data->add_error("${_[0]}が長すぎます。(${_[3]}文字以内)");
      return 0;
    }
    return 1;
  }
  
  &to_number_with_key($data->{updateData}, qw/ baseTurn maxLevel /);
  &to_hankaku_with_key($data->{updateData}, qw/ name description /);
  &check_string_length('スキル名', $data->{updateData}{name}, 1, 50);
  &check_string_length('スキル詳細', $data->{updateData}{description}, 0, 200);
  &check_range('スキルLv1ターン', $data->{updateData}{baseTurn}, 1, 199, 0);
  &check_range('スキル最大レベル', $data->{updateData}{maxLevel}, 1, 99, 0);

  if ($response_data->has_error) {
    return;
  }

  my $is_leader_skill = $data->{isLeaderSkill};

  my $type_name = ($is_leader_skill) ? 'リーダースキル' : 'スキル';
  my $dbh = &create_monster_db_dbh();

  my $ret = &set_skill_data($dbh, $is_leader_skill, $data->{updateData});

  if ($ret->{result} == -1) {
    $response_data->add_error("指定された番号の${type_name}は存在していません。");
    return;
  } elsif ($ret->{result} == 1) {
    $response_data->add_error('同じデータで登録されています。');
    return;
  }

  my $response_propaty_name = ($is_leader_skill) ? 'leaderSkillDetails' : 'skillDetails';
  $response_data->set_data({
    newTableData=> {
      $response_propaty_name => {
        $ret->{data}{no} => $ret->{data}
      }
    }
  });

  if ($is_leader_skill) {
    &save_leader_skill_list_json($dbh);
  } else {
    &save_skill_list_json($dbh);
  }

  $dbh->commit;
  $response_data->add_message("${type_name}データを更新しました。");
}

# スキル（リーダースキル）の登録・更新を行う。
# $data に no プロパティがある場合は更新。ない場合は同一の名前のものを探し、あれば更新、なければ追加。
sub set_skill_data {
  my ($dbh, $is_leader_skill, $data) = @_;

  my $table_name = ($is_leader_skill) ? 'leader_skill' : 'skill';

  my @target_columns = qw/ no name description /;
  if (!$is_leader_skill) {
    push @target_columns, qw/ baseTurn maxLevel /;
  }

  # テーブルにある項目のみを取り出したハッシュを作成する。
  my %target_data = ();
  for my $column (@target_columns) {
    $target_data{$column} = $data->{$column} if (exists $data->{$column});
  }
  
  my $specify_no = (exists $data->{no});  # no が指定されているかどうか
  my $search_column_names = ($specify_no) ? [ 'no' ] : [ 'name' ];
  my %search_data = map { $_ => $data->{$_} } @$search_column_names;
  my $tbl_ary_ref = &get_one_row_data($dbh, $table_name, \@target_columns, (%search_data, state => 1));

  if ($tbl_ary_ref) {
    $target_data{no} = $tbl_ary_ref->[0];
      # 同一内容か確認
    my $is_equal = 1;
    for my $i (1 .. $#target_columns) {
      if ($tbl_ary_ref->[$i] ne $data->{$target_columns[$i]}) {
        $is_equal = 0;
        last;
      }
    }
    # 　同じ場合は更新しない。
    if ($is_equal) {
      return { result => 1, data => \%target_data };
    }
  } else {
    if ($specify_no) {
      # 存在しない no が指定されたのでエラー。
      return { result => -1 };
    } else {
      # 新たな no を割り振る。
      $tbl_ary_ref = &get_one_row_data($dbh, $table_name, [ 'MAX(no)' ]);
      $target_data{no} = $tbl_ary_ref->[0] + 1;
    }
  }

  my $ip_address = $ENV{'REMOTE_ADDR'};
  my $account_name = '';

  my %common_insert_data = (
    comment => $data->{comment},
    ipAddress => $ip_address,
    accountName => $account_name,
    state => 1
  );
  
  &update_disable_state($dbh, $table_name, (no => $target_data{no}, state => 1));
  &insert_table_data($dbh, $table_name, %target_data, %common_insert_data);

  return { result => 0, data => \%target_data };
}

# スキル情報編集履歴取得モード
# パラメータ
#   no - 取得対象のスキルの番号。
#   id - 取得対象のスキル履歴のID。
#   isLeaderSkill - 取得対象がリーダースキルかどうか。
sub mode_skill_history {
  my ($q, $response_data) = @_;
  my $skill_id = $q->param('id');
  my $skill_no = $q->param('no');
  my $is_leader_skill = $q->param('isLeaderSkill');
  my $table_name = ($is_leader_skill) ? 'leader_skill' : 'skill';
  
  my @columns = (
    'id', 'no', 'name', 'description', 'comment', [ 'datetime', 'createdDatetime' ], 'state'
  );
  if (!$is_leader_skill) {
    push @columns, 'baseTurn', 'maxLevel';
  }
  my %where;
  if (defined $skill_id) {
    $where{id} = $skill_id;
  } elsif (defined $skill_no) {
    $where{no} = $skill_no;
  }

  my $dbh = &create_monster_db_dbh();
  my $data_ref = &table_to_array($dbh, $table_name, \@columns, \%where, { order => 'createdDatetime DESC', limit => 50 });
  $dbh->disconnect;
  $response_data->set_data($data_ref);
}


# モンスター情報更新モード
sub mode_update_monster_data {
  my ($q, $response_data) = @_;

  my $json = $q->param("POSTDATA");

  if ($json eq "") {
    print "Content-Type: application/jsonl\n\n{ \"error\": [\"データなし\"] }";
    exit(0);
  }


  my $data = JSON::PP::decode_json($json);
  
  sub check_range {
    my ($name, $value, $min, $max, $is_not_null) = @_;
    if ($is_not_null == undef) { $is_not_null = 1; }

    if ($value == undef) {
      if ($is_not_null) { return 1; }
      $response_data->add_error("${name} の値が入力されていません。");
      return 0;
    }
    if ($value < $min || $value > $max) {
      $response_data->add_error("${name} の値が不正(${value})");
      return 0;
    }
    return 1;
  }

  sub check_string_length {
    my $length = length $_[1];
    if ($length < $_[2]) {
      if ($length == 0) {
        $response_data->add_error("${_[0]}が未入力");
      } else {
        $response_data->add_error("${_[0]}が短すぎます。(${_[2]}文字以上)");
      }
      return 0;
    }
    if ($length > $_[3]) {
      $response_data->add_error("${_[0]}が長すぎます。(${_[3]}文字以内)");
      return 0;
    }
    return 1;
  }

  my $ip_address = $ENV{'REMOTE_ADDR'};
  my $account_name = '';

  my %common_insert_data = (
    comment => $data->{comment},
    ipAddress => $ip_address,
    accountName => $account_name
  );


  &to_number_with_key($data, qw/ no attributes cost rate types awakens maxExp maxLevel maxParam 
    skill leaderSkill assist overLimit overLimitParam superAwakens evolutionType /);

  &to_hankaku_with_key($data, qw/ name /);
  
  &check_range('No', $data->{no}, 1, 9999);
  &check_string_length('名前', $data->{name}, 1, 50);
  &check_range('属性', $data->{attributes}[0], 0, 99, 0);
  &check_range('複属性', $data->{attributes}[1], 0, 99, 0);
  &check_range('コスト', $data->{cost}, 1, 999, 0);
  &check_range('レアリティ', $data->{rare}, 1, 99, 0);
  foreach my $i (0..3) {
    &check_range('タイプ${i}', $data->{types}[$i], 0, 99, 0);
  }
  foreach my $i (0..9) {
    &check_range('覚醒${i}', $data->{awakens}[$i], 0, 99, 0);
  }
  &check_range('最大レベルに必要な経験値', $data->{maxExp}, 0, 999999999, 0);
  &check_range('最大レベル', $data->{maxLevel}, 0, 99, 0);
  &check_range('HP', $data->{maxParam}{hp}, 0, 99999, 0);
  &check_range('攻撃', $data->{maxParam}{attack}, 0, 99999, 0);
  &check_range('回復', $data->{maxParam}{recovery}, -99999, 99999, 0);

  if ($data->{skill} == 0) {
    # 名前と説明文ともに空の場合は未指定と判断する。
    if (!length $data->{skillDetails}{name} && !length $data->{skillDetails}{description}) {
      $data->{skill} = undef;
    } else {
      &to_number_with_key($data->{skillDetails}, qw/ baseTurn maxLevel /);
      &to_hankaku_with_key($data->{skillDetails}, qw/ name description /);
      &check_string_length('スキル名', $data->{skillDetails}{name}, 1, 50);
      &check_string_length('スキル詳細', $data->{skillDetails}{description}, 0, 200);
      &check_range('スキルLv1ターン', $data->{skillDetails}{baseTurn}, 1, 199, 0);
      &check_range('スキル最大レベル', $data->{skillDetails}{maxLevel}, 1, 99, 0);
    }
  }
  if ($data->{leaderSkill} == 0) {
    # 名前と説明文ともに空の場合は未指定と判断する。
    if (!length $data->{leaderSkillDetails}{name} && !length $data->{leaderSkillDetails}{description}) {
      $data->{leaderSkill} = undef;
    } else {
      &to_hankaku_with_key($data->{leaderSkillDetails}, qw/ name description /);
      &check_string_length('リーダースキル名', $data->{leaderSkillDetails}{name}, 1, 50);
      &check_string_length('リーダースキル詳細', $data->{leaderSkillDetails}{description}, 0, 200);
    }
  }
  &check_range('アシスト', $data->{assist}, 0, 9, 0);
  &check_range('限界突破', $data->{overLimit}, 0, 9, 0);
  if ($data->{overLimit} == 1) {
    &check_range('限界突破時 HP', $data->{overLimitParam}{hp}, 0, 99999, 0);
    &check_range('限界突破時 攻撃', $data->{overLimitParam}{attack}, 0, 99999, 0);
    &check_range('限界突破時 回復', $data->{overLimitParam}{recovery}, -99999, 99999, 0);
  }

  if ($data->{superawakens}) {
    foreach my $n ($data->{superawakens}) {
      $n = to_number($n)
      &check_range('超覚醒', $n, 1, 99, 0);
    }
    $data->{superawakens} = [ sort { $a <=> $b } @$data->{superawakens} ];
  }
  &to_number_with_key($data->{evolution}, qw/ baseNo materials /);
  &check_range('進化タイプ', $data->{evolutionType}, 0, 99, 0);
  if ($data->{evolutionType} > 0 && $data->{evolutionType} < 99) {
    &check_range('進化前', $data->{evolution}{baseNo}, 1, 9999, 0);
    foreach my $i (0..4) {
      &check_range('進化素材${i}', $data->{evolution}{materials}[$i], 1, 9999, 0);
    }
  }
  &check_string_length('コメント', $data->{comment}, 0, 1000);

  my %outputData;
  
  if ($response_data->has_error) {
  } else {
    my $dbh = &create_monster_db_dbh();

    my $is_update_monster_data = 0;
    my $updated_skill_data = undef;
    my $updated_leader_skill_data = undef;

    # スキル
    if (!defined $data->{skill}) {
      #そのまま
    } elsif ($data->{skill} == 0) {
      # 登録 or 更新
      my $ret = &set_skill_data($dbh, 0, $data->{skillDetails});
      if ($ret->{result} < 0) {
        $response_data->add_error('スキル登録エラー');
      } else {
        if ($ret->{result} == 0) {
          $updated_skill_data = $ret->{data};
        }
        $data->{skill} = $ret->{data}{no};
      }
    } else {
      # 指定された番号のスキルが有るか確認
      if (!&check_same_table_data($dbh, 'skill', (no => $data->{skill}, state => 1))) {
        $response_data->add_error('スキル番号指定が不正');
      }
    }

    #リーダースキル
    if (!defined $data->{leaderSkill}) {
      # そのまま
    } elsif ($data->{leaderSkill} == 0) {
      # 登録 or 更新
      my $ret = &set_skill_data($dbh, 1, $data->{leaderSkillDetails});
      if ($ret->{result} < 0) {
        $response_data->add_error('リーダースキル登録エラー');
      } else {
        if ($ret->{result} == 0) {
          $updated_leader_skill_data = $ret->{data};
        }
        $data->{leaderSkill} = $ret->{data}{no};
      }
    } else {
      # 指定された番号のリーダースキルがあるか確認
      if (!&check_same_table_data($dbh, 'leader_skill', (no => $data->{leaderSkill}, state => 1))) {
        $response_data->add_error('リーダースキル番号指定が不正');
      }
    }

    if ($response_data->has_error) {
    
    } else {
      # 各テーブルの同データ確認・登録

      # 基本情報
      my $ret = &set_db_sub_table($dbh, 'monster_base_data', $data);
      my $monster_base_data_id = $ret->{no};
      
      # 限界突破情報
      my $over_limit_id = 0;
      if ($data->{overLimit} == 1) {
        $ret = &set_db_sub_table($dbh, 'over_limit', $data);
        $over_limit_id = $ret->{no};
      }

      # 進化情報
      my $evolution_id = 0;
      my $is_update_evolution_table = 0;
      if ($data->{evolutionType} != 0 && $data->{evolutionType} != 99) {
        $ret = &set_db_sub_table($dbh, 'evolution', $data);
        $evolution_id = $ret->{no};
        if ($ret->{ret} == 0) {
          $is_update_evolution_table = 1;
        }
      }

      my %monster_data_table_data = (
        no => $data->{no},
        monster_base_data => $monster_base_data_id,
        over_limit => $over_limit_id,
        evolution => $evolution_id,
        state => 1
      );

      $is_update_monster_data = !&check_same_table_data($dbh, 'monster_data', %monster_data_table_data);

      if (!($is_update_monster_data || $updated_skill_data || $updated_leader_skill_data)) {
        $response_data->add_error('同一内容で登録されています');
      } else {
        # データ更新。
        my %to_json_data;
        if ($is_update_monster_data) {
          &update_disable_state($dbh, 'monster_data', (no => $data->{no}, state => 1));
          &insert_table_data($dbh, 'monster_data', %monster_data_table_data, %common_insert_data);

          # モンスターデータのJSON保存
          for my $column_names_ref (values %monster_data_db_info) {
            for (@$column_names_ref) {
              my $key = $_;
              if (ref $key eq 'ARRAY') {
                $key = $key->[0];
              }
              &joined_key_access(\%to_json_data, $key,
                &joined_key_access($data, $key)
              );
            }
          }
          for my $json_append_key ( 'no', 'comment' ) {
            &joined_key_access(\%to_json_data, $json_append_key,
              &joined_key_access($data, $json_append_key)
            );
          }
          
          my $fileNo = $to_json_data{no};
          open(DATAFILE, "> ./monsterJson/${fileNo}.json") or die("error :$!");
          print DATAFILE JSON::PP::encode_json(\%to_json_data);
          close(DATAFILE);

          &save_monster_list_json($dbh);
        }
        if ($updated_skill_data) {
          &save_skill_list_json($dbh);
        }
        if ($updated_leader_skill_data) {
          &save_leader_skill_list_json($dbh);
        }
        if ($is_update_evolution_table) {
          &save_evolution_list_json($dbh);
        }

        $dbh->commit;

        $response_data->add_message('モンスターデータを更新しました。');
        $outputData{newTableData} = {};

        if ($is_update_monster_data) {
          $outputData{newTableData}{monster} = { $data->{no} => \%to_json_data };
        }

        if ($updated_skill_data) {
          $outputData{newTableData}{skillDetails} = {
            $updated_skill_data->{no} => $updated_skill_data
          };
        }
        if ($updated_leader_skill_data) {
          $outputData{newTableData}{leaderSkillDetails} = {
            $updated_leader_skill_data->{no} => $updated_leader_skill_data
          };
        }
      }
    }
    $dbh->disconnect;
  }

  $response_data->set_data(\%outputData);
}

# モンスター情報のサブテーブルの更新確認を行う。
sub set_db_sub_table {
  my ($dbh, $table_name, $data) = @_;

  my $check_data_ref = &hash_to_table_data($data, $monster_data_db_info{$table_name});
  my $tbl_ary_ref = &get_one_row_data($dbh, $table_name, [ 'id' ], %$check_data_ref);
  
  my $ret = 1;
  if (!$tbl_ary_ref) {
    &insert_table_data($dbh, $table_name, %$check_data_ref);
    $tbl_ary_ref = &get_one_row_data($dbh, $table_name, [ 'id' ], %$check_data_ref);
    $ret = 0;
  }

  return { ret => $ret, no => $tbl_ary_ref->[0] };
}

# テーブル内の指定条件を満たすレコードの state を 0 にする。
sub update_disable_state {
  my ($dbh, $table_name, %target_data) = @_;
  my @target_keys = keys %target_data;
  my @target_values = map { $target_data{$_} } @target_keys;

  &update_table_data($dbh, $table_name, \%target_data, state => 0);
}

# モンスター情報一覧に必要なすべての情報の取得用配列を作成する。
sub create_monster_data_column_infos {
  # データを格納してる各テーブルにモンスター番号が存在しないのと、
  # 先頭のキーがハッシュのキーとして使用されるのでモンスター番号を予め指定しておく。
  my @column_infos = ([ 'no', 'monster_data.no' ]);
  my %used_keys;    # 複数回登場するキーは最初のもののみを使用するための確認用ハッシュ。
  # keys %monster_data_db_info を使うと順番が不定で結果が安定しないのでテーブル名を直接入れる。
  for my $table_name (qw/monster_base_data over_limit evolution/) {
    for my $column (@{$monster_data_db_info{$table_name}}) {
      my ($hash_key, $db_column);
      if (ref $column eq 'ARRAY') {
        $hash_key = $column->[0];
        $db_column = "${table_name}.$column->[1]";
      } else {
        $hash_key = $column;
        $db_column = "${table_name}.$column";
      }
      if (!exists $used_keys{$hash_key}) {
        push @column_infos, [$hash_key, $db_column];
        $used_keys{$hash_key} = 1;
      }
    }
  }

  return \@column_infos;
}

#　指定されたURLパスの配列をもとにサイトマップを作成する。
sub save_sitemap {
  my ($file_name, $urls_ref) = @_;

  open(DATAFILE, "> $file_name.txt") or die ("error: $!");
  print DATAFILE join "\n", map { 'https://padmdb.rainbowsite.net' . $_ } @$urls_ref;
  close (DATAFILE);
}


# 全モンスターの情報を格納したJSONとそのダイジェスト版を作成する。
# option
#   is_create_monster_json - 真値を指定するとモンスター個別の JSON ファイルの再作成も行う。
sub save_monster_list_json {
  my ($dbh, $option) = @_;
  $option ||= {};
  my @column_infos = @{&create_monster_data_column_infos()};
  push @column_infos, [ 'comment', 'monster_data.comment' ];

  my $data_ref = &table_to_array($dbh, $monster_data_all_joined_table_name, \@column_infos, { 'monster_data.state' => 1 }, { 'order' => 'no' });

  # モンスター番号をキーとしたハッシュにしてJSON/MessagePackでファイルに保存する。
  my %full_data = map {
    $_->{no} => $_;
  } @$data_ref;

  # JSON/MessagePackでファイルに保存。
  &save_json_and_msgpack('./listJson/monster_list_full', \%full_data);

  my $json_pp = JSON::PP->new;

  if ($option->{is_create_monster_json}) {
    for my $value (@$data_ref) {
      my $monster_no = $value->{no};
      open(DATAFILE, "> ./monsterJson/${monster_no}.json") or die("error :$!");
      print DATAFILE $json_pp->encode($value);
      close(DATAFILE);
    }
  }

  # JSON化する際に更新コメントは入れない。
  for my $value (@$data_ref) {
    delete $value->{comment};
  }

  # JSON化してファイルに保存。
  open(DATAFILE, "> ./listJson/monster_data.json") or die("error :$!");
  print DATAFILE $json_pp->pretty
    ->sort_by(sub { 
      ($json_sort_ranks{$JSON::PP::a} - $json_sort_ranks{$JSON::PP::b}) ||
      ($JSON::PP::a - $JSON::PP::b)
    } )
    ->indent_length(2)
    ->encode($data_ref);
  close(DATAFILE);

  # ピックアップ版用のデータを抜き出したものを作成する。
  my %pickup_data = map {
    my $target_ref = $_;
      my %temp;
      for (@monster_data_pickup_keys) {
        &joined_key_access(\%temp, $_,
          &joined_key_access($target_ref, $_)
        )
      }
      $target_ref->{no} => \%temp;
  } @$data_ref;

  # JSON/MessagePackでファイルに保存。
  &save_json_and_msgpack('./listJson/monster_list', \%pickup_data);

  # サイトマップ作成。
  my @sitemap_url_paths = ( '/', '/about', '/compare', map { '/' . $_->{no} } sort {$a->{no} <=> $b->{no} } @$data_ref );
  save_sitemap('sitemap_monster', \@sitemap_url_paths);
}

sub save_skill_list_json {
  my ($dbh) = @_;
  my @keys = qw/ no name description baseTurn maxLevel /;
  my $data = table_to_hash($dbh, 'skill', \@keys, { state => 1 });

  &save_json_and_msgpack('./listJson/skill_list', $data);

  # サイトマップ作成。
  my @sitemap_url_paths = ( '/skill', map { '/skill/' . $_->{no} } sort {$a->{no} <=> $b->{no} } values %$data );
  save_sitemap('sitemap_skill', \@sitemap_url_paths);
}


sub save_leader_skill_list_json {
  my ($dbh) = @_;
  my @keys = qw/ no name description /;
  my $data = table_to_hash($dbh, 'leader_skill', \@keys, { state => 1 });

  &save_json_and_msgpack('./listJson/leader_skill_list', $data);

  # サイトマップ作成。
  my @sitemap_url_paths = ( '/leaderSkill', map { '/leaderSkill/' . $_->{no} } sort {$a->{no} <=> $b->{no} } values %$data );
  save_sitemap('sitemap_leader_skill', sort {$a <=> $b} \@sitemap_url_paths);
}

# 進化前のモンスター番号キーとして進化情報の配列を格納したJSONを保存する。
sub save_evolution_list_json {
  my ($dbh) = @_;
  my @column_infos = (
    [ 'no', 'monster_data.no'],
    [ 'type', 'evolution.type' ],
    [ 'baseNo', 'evolution.baseNo' ],
    [ 'materials_0', 'evolution.materials_0' ],
    [ 'materials_1', 'evolution.materials_1' ],
    [ 'materials_2', 'evolution.materials_2' ],
    [ 'materials_3', 'evolution.materials_3' ],
    [ 'materials_4', 'evolution.materials_4' ],
  );
  my $data_ref = &table_to_array($dbh, "
    evolution 
      LEFT JOIN monster_data ON monster_data.evolution = evolution.id
  ", \@column_infos, { 'monster_data.state' => 1 }, { order => 'monster_data.no ASC' });

  # 進化前番号をキーとして情報の配列を持つハッシュを作成する。
  my %to_evolution_hash;
  for my $data (@$data_ref) {
    my $key = $data->{baseNo};
    if (!exists $to_evolution_hash{$key}) {
      $to_evolution_hash{$key} = [];
    }
    push @{$to_evolution_hash{$key}}, $data;
  }

  &save_json_and_msgpack('./listJson/evolution_list', \%to_evolution_hash);
}

sub save_image_list_json {
  my ($dbh) = @_;
  my @keys = (
    [ 'no', 'no' ],
    'id'
  );
  my $data = table_to_hash($dbh, 'monster_image', \@keys, { state => 1 }, { remove_key_column => 1});

  &save_json_and_msgpack('./listJson/image_list', $data);
}

# レスポンスとして返すデータを管理するパッケージ
package ResponseData;

# コンストラクタ
sub new {
  my $self = {
    messages => [],
    errors => [],
    data => undef
  };
  my $class = shift;
  return bless $self, $class;
}

# 結果のメッセージを追加する。
sub add_message {
  my $self = shift;
  push @{$self->{messages}}, @_;
}

# エラーメッセージを追加する。
sub add_error {
  my $self = shift;
  push @{$self->{errors}}, @_;
}

# 実行結果として返すデータを設定する。
sub set_data {
  my $self = shift;
  my ($data) = @_;
  $self->{data} = $data;
}

# エラーメッセージがあるかどうかを取得する。
sub has_error { 
  my $self = shift;
  return @{$self->{errors}};
}

# 格納されているデータをもとに JSON を作成する。
sub to_json {
  my $self = shift;
  my $hash_ref = {};
  if (ref $self->{data} eq 'ARRAY') {
    $hash_ref = $self->{data};
  } else {
    if (ref $self->{data} eq 'HASH') {
      $hash_ref = { %{$self->{data}} };
    }
    if (@{$self->{messages}}) { $hash_ref->{_messages} = $self->{messages}; }
    if (@{$self->{errors}}) { $hash_ref->{_errors} = $self->{errors}; }
  }

  return JSON::PP::encode_json($hash_ref);
}

__END__
