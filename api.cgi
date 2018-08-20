#!/usr/bin/perl
use strict;

use utf8;

use CGI::Carp qw(fatalsToBrowser);
use CGI;
use JSON::PP ();
use DBI;

use File::Copy;

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
    'expTable',
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

# モンスター情報の JSON を出力する際の項目のソート順。
my %json_sort_ranks = (
  no => 0,
  name => 10,
  attributes => 20,
  cost => 30,
  rare => 40,
  types => 50,
  awakens => 60,
  expTable => 70,
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

my $mode = $q->param('mode');

my %modes = (
  'updateList' => \&mode_update_list,
  'image' => \&mode_image,
);

if (exists $modes{$mode}) {
  $modes{$mode}->($q);
} else {
  &mode_update_monster_data($q);
}


# モンスター一覧更新モード
sub mode_update_list {
  my ($q) = @_;
  my $dbh = DBI->connect("dbi:SQLite:dbname=monster.db");
  $dbh->{sqlite_unicode} = 1;
  &save_monster_list_json($dbh);
  die 'success.';
}


# 画像受信モード
sub mode_image {
  my ($q) = @_;

  my @error;
  
  my $no = $q->param('no');

  my $dbh = DBI->connect("dbi:SQLite:dbname=monster.db");
  $dbh->{sqlite_unicode} = 1;
  $dbh->{AutoCommit} = 0;

  # 既存画像がロックされていないか確認する。
  my $check_sql = 'SELECT COUNT(*) FROM monster_image WHERE no = ? AND state = 2';
  my $sth = $dbh->prepare($check_sql);
  if (!$sth) {
    push @error, '画像情報確認エラー:' .  $dbh->errstr;
  } else {
    $sth->execute($no);

    my $tbl_ary_ref = $sth->fetchrow_arrayref;
    if ($tbl_ary_ref->[0] > 0) {
      push @error, 'このモンスターの画像はロックされています。';
    }
  }

  if (!@error) {
    # 既存の画像を無効化
    $dbh->do('UPDATE monster_image SET state = 0 WHERE no = ? AND state = 1', undef, $no);

    # 今回の投稿の情報をDBに登録
    my $ip_address = $ENV{'REMOTE_ADDR'};
    $sth = $dbh->prepare(<<'EOS');
INSERT INTO monster_image (
  no, ipAddress, accountName, state
) VALUES (
  ?, ?, ?, ?
);
EOS

    my $id = -1;
    if (!$sth) {
      push @error, '画像情報登録エラー:' .  $dbh->errstr;
    } else {
      my $ret = $sth->execute($no, $ip_address, '', 1);

      $sth = $dbh->prepare('SELECT MAX(id) FROM monster_image;');
      $ret = $sth->execute();
      if ($ret) {
        my $tbl_ary_ref = $sth->fetchrow_arrayref;
        $id = $tbl_ary_ref->[0];
        
      } else {
        push @error, 'モンスター情報登録エラー:' .  $sth->errstr;
      }
    }

    if ($id != -1) {
      # 画像を保存
      my $iconFileName = $q->param('icon');
      my $imageFileName = $q->param('image');

      my $buffer;

      open(OUT, ">./monsterImages/icon_${no}.jpg");
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
      copy("./monsterImages/icon_${no}.jpg","./monsterImagesLog/icon_${no}_${id}.jpg") or push @error, "error: $!";
      copy("./monsterImages/${no}.jpg","./monsterImagesLog/${no}_${id}.jpg") or push @error, "error: $!";

      # 投稿画像情報の一覧を作成する。
      &save_image_list_json($dbh);
    }
  }

  my %outputData;
  if (@error) {
    $outputData{'errors'} = \@error;
  } else {
    $outputData{'success'} = [ '投稿を受け付けました。ありがとうございました。' ];
    $dbh->commit;
  }
  print "Content-Type: application/json\n\n", JSON::PP::encode_json(\%outputData);
  
  $dbh->disconnect;
  
}


# モンスター情報更新モード
sub mode_update_monster_data {
  my ($q) = @_;

  my $json = $q->param("POSTDATA");

  if ($json eq "") {
    print "Content-Type: application/jsonl\n\n{ error: ['データなし'] }";
    exit(0);
  }


  my $data = JSON::PP::decode_json($json);

  my @error;

  # 第１引数に与えられた値を数値型に変換して返す。
  # 配列やハッシュのリファレンスが与えられた場合は要素すべてを変換した結果を返す。
  sub to_number {
    my ($target) = @_;
    if (ref $target eq 'ARRAY') {
      return [ map { &to_number($_) } @{$target} ];
    } elsif (ref $target eq 'HASH') {
      return { map { $_ => &to_number($target->{$_}) } keys %{$target} };
    } else {
      if (!defined $target || $target eq '') {
        return undef;
      }
      return $target + 0;
    }
  }

  # ハッシュ内の任意の要素を数値型に変換する。
  # 第１引数 対象のハッシュのリファレンス
  # 第２引数以降 変換対象の要素のキー。
  sub to_number_with_key {
    my ($target_ref, @keys) = @_;
    foreach my $key (@keys) {
      if (!exists $target_ref->{$key}) { next; }
      $target_ref->{$key} = &to_number($target_ref->{$key});
    }
  }

  # ハッシュ内の任意の要素の全角英数字ピリオドパーセントスペースを半角に変換する。
  # 冒頭・末尾のスペースの取り除きも行う。
  # 第１引数 対象のハッシュのリファレンス
  # 第２引数以降 変換対象の要素のキー。
  sub to_hankaku_with_key {
    my ($target_ref, @keys) = @_;
    foreach my $key (@keys) {
      if (!exists $target_ref->{$key}) { next; }
      $target_ref->{$key} =~ tr/０-９Ａ-Ｚａ-ｚ．％　/0-9A-Za-z.% /;
    	$target_ref->{$key} =~ s/^[\s　]*(.*?)[\s　]*$/$1/;
    }
  }
  
  sub check_range {
    my ($name, $value, $min, $max, $is_not_null) = @_;
    if ($is_not_null == undef) { $is_not_null = 1; }

    if ($value == undef) {
      if ($is_not_null) { return 1; }
      push @error, "${name} の値が入力されていません。";
      return 0;
    }
    if ($value < $min || $value > $max) {
      push @error, "${name} の値が不正(${value})";
      return 0;
    }
    return 1;
  }

  sub check_string_length {
    my $length = length $_[1];
    if ($length < $_[2]) {
      if ($length == 0) {
        push @error, "${_[0]}が未入力";
      } else {
        push @error, "${_[0]}が短すぎます。(${_[2]}文字以上)";
      }
      return 0;
    }
    if ($length > $_[3]) {
      push @error, "${_[0]}が長すぎます。(${_[3]}文字以内)";
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


  &to_number_with_key($data, qw/ no attributes cost rate types awakens expTable maxLevel maxParam 
    skill leaderSkill assist overLimit overLimitParam superAwakens evolutionType /);

  &to_hankaku_with_key($data, qw/ name /);
  
  &check_range('No', $data->{no}, 1, 9999);
  &check_string_length('名前', $data->{name}, 1, 50);
  &check_range('属性', $data->{attributes}[0], 0, 99);
  &check_range('複属性', $data->{attributes}[1], 0, 99);
  &check_range('コスト', $data->{cost}, 1, 999, 0);
  &check_range('レアリティ', $data->{rare}, 1, 99, 0);
  foreach my $i (0..3) {
    &check_range('タイプ${i}', $data->{types}[$i], 0, 99);
  }
  foreach my $i (0..9) {
    &check_range('覚醒${i}', $data->{awakens}[$i], 0, 99);
  }
  &check_range('経験値テーブル', $data->{expTable}, 0, 999999999, 0);
  &check_range('最大レベル', $data->{maxLevel}, 0, 99, 0);
  &check_range('HP', $data->{maxParam}{hp}, 0, 99999, 0);
  &check_range('攻撃', $data->{maxParam}{attack}, 0, 99999, 0);
  &check_range('回復', $data->{maxParam}{recovery}, -99999, 99999, 0);

  if ($data->{skill} == 0) {
    &to_number_with_key($data->{skillDetails}, qw/ baseTurn maxLevel /);
    &to_hankaku_with_key($data->{skillDetails}, qw/ name description /);
    &check_string_length('スキル名', $data->{skillDetails}{name}, 1, 50);
    &check_string_length('スキル詳細', $data->{skillDetails}{description}, 0, 200);
    &check_range('スキルLv1ターン', $data->{skillDetails}{baseTurn}, 1, 199, 0);
    &check_range('スキル最大レベル', $data->{skillDetails}{maxLevel}, 1, 99, 0);
  }
  if ($data->{leaderSkill} == 0) {
    &to_hankaku_with_key($data->{leaderSkillDetails}, qw/ name description /);
    &check_string_length('リーダースキル名', $data->{leaderSkillDetails}{name}, 1, 50);
    &check_string_length('リーダースキル詳細', $data->{leaderSkillDetails}{description}, 0, 200);

  }
  &check_range('アシスト', $data->{assist}, 0, 9);
  &check_range('限界突破', $data->{overLimit}, 0, 9);
  if ($data->{overLimit} == 1) {
    &check_range('限界突破時 HP', $data->{overLimitParam}{hp}, 0, 99999, 0);
    &check_range('限界突破時 攻撃', $data->{overLimitParam}{attack}, 0, 99999, 0);
    &check_range('限界突破時 回復', $data->{overLimitParam}{recovery}, -99999, 99999, 0);
  }
  foreach my $n ($data->{superawakens}) {
    #&check_range('超覚醒', $n, 1, 99);
  }
  &to_number_with_key($data->{evolution}, qw/ baseNo materials /);
  &check_range('進化タイプ', $data->{evolutionType}, 0, 99);
  if ($data->{evolutionType} > 0 && $data->{evolutionType} < 99) {
    &check_range('進化前', $data->{evolution}{baseNo}, 1, 9999, 0);
    foreach my $i (0..4) {
      &check_range('進化素材${i}', $data->{evolution}{materials}[$i], 1, 9999, 0);
    }
  }
  &check_string_length('コメント', $data->{comment}, 0, 1000);


  my $is_update_monster_data = 0;
  my $is_update_skill_table = 0;
  my $is_update_leader_skill_table = 0;

  if (@error) {
  } else {
    my $dbh = DBI->connect("dbi:SQLite:dbname=monster.db");
    $dbh->{sqlite_unicode} = 1;
    $dbh->{AutoCommit} = 0;

    # スキル
    if ($data->{skill} == 0) {
      my $sth;

      my %skill_check_data = map {
        $_ => $data->{skillDetails}{$_}
      } qw/ name description baseTurn maxLevel /;
      $skill_check_data{state} = 1;
      
      # 同じ名前のスキルが無いか確認する。
      my @get_columns = qw/ no name description baseTurn maxLevel /;
      my $tbl_ary_ref = &get_one_row_data($dbh, 'skill', \@get_columns, ( name => $data->{skillDetails}{name}, state => 1 ) );
      if ($tbl_ary_ref) {
        my $skill_no = $tbl_ary_ref->[0];
        # 同一内容か確認
        my $is_equal = 1;
        for my $i (1 .. $#get_columns) {
          if ($tbl_ary_ref->[$i] ne $data->{skillDetails}{$get_columns[$i]}) {
            $is_equal = 0;
            last;
          }
        }
        # 異なる場合は更新する。
        if (!$is_equal) {  
          &update_disable_state($dbh, 'skill', (no => $skill_no, state => 1));
          &insert_table_data($dbh, 'skill', %skill_check_data, %common_insert_data, no => $skill_no);
          $is_update_skill_table = 1;
        }
        $data->{skill} = $skill_no;
      } else {
        # 新たに登録するスキルに割り振る番号を求める
        my $tbl_ary_ref = &get_one_row_data($dbh, 'skill', [ 'MAX(no)' ]);
        my $skill_no = $tbl_ary_ref->[0] + 1;
        
        if (&insert_table_data($dbh, 'skill', %skill_check_data, %common_insert_data, no => $skill_no)) {
          $data->{skill} = $skill_no;
          $is_update_skill_table = 1;
        } else {
          push @error, 'スキル登録エラー';
        }
      }
    } else {
      # 指定された番号のスキルが有るか確認
      if (!&check_same_table_data($dbh, 'skill', (id => $data->{skill}, state => 1))) {
        push @error, 'スキル番号指定が不正';
      }
    }

    #リーダースキル
    if ($data->{leaderSkill} == 0) {
      my $sth;

      my %leader_skill_check_data = map {
        $_ => $data->{leaderSkillDetails}{$_}
      } qw/ name description /;
      $leader_skill_check_data{state} = 1;

      # 同じ名前のスキルが無いか確認する。
      my @get_columns = qw/ no name description /;
      my $tbl_ary_ref = &get_one_row_data($dbh, 'leader_skill', \@get_columns, ( name => $data->{leaderSkillDetails}{name}, state => 1 ) );
      if ($tbl_ary_ref) {
        my $leader_skill_no = $tbl_ary_ref->[0];
        # 同一内容か確認
        my $is_equal = 1;
        for my $i (1 .. $#get_columns) {
          if ($tbl_ary_ref->[$i] ne $data->{leaderSkillDetails}{$get_columns[$i]}) {
            $is_equal = 0;
            last;
          }
        }
        # 異なる場合は更新する。
        if (!$is_equal) {  
          &update_disable_state($dbh, 'leader_skill', (no => $leader_skill_no, state => 1));
          &insert_table_data($dbh, 'leader_skill', %leader_skill_check_data, %common_insert_data, no => $leader_skill_no);
          $is_update_leader_skill_table = 1;
        }
        $data->{leaderSkill} = $leader_skill_no;
      } else {
        # 新たに登録するスキルに割り振る番号を求める
        my $tbl_ary_ref = &get_one_row_data($dbh, 'leader_skill', [ 'MAX(no)' ]);
        my $leader_skill_no = $tbl_ary_ref->[0] + 1;

        if (&insert_table_data($dbh, 'leader_skill', %leader_skill_check_data, %common_insert_data, no => $leader_skill_no)) {
          $data->{leaderSkill} = $leader_skill_no;
          $is_update_leader_skill_table = 1;
        } else {
          push @error, 'リーダースキル登録エラー';
        }
      }
    } else {
      # 指定された番号のリーダースキルがあるか確認
      if (!&check_same_table_data($dbh, 'leader_skill', (id => $data->{leaderSkill}, state => 1))) {
        push @error, 'リーダースキル番号指定が不正';
      }
    }

    if (@error) {
    
    } else {
      # 各テーブルの同データ確認・登録

      # 基本情報
      my $monster_check_data_ref = &hash_to_table_data($data, $monster_data_db_info{'monster_base_data'});
      my $monster_base_data_id = &get_one_row_data($dbh, 'monster_base_data', [ 'id' ], %$monster_check_data_ref);
      if (!$monster_base_data_id) {
        &insert_table_data($dbh, 'monster_base_data', %$monster_check_data_ref);
        $monster_base_data_id = &get_one_row_data($dbh, 'monster_base_data', [ 'id' ], %$monster_check_data_ref);
      }
      $monster_base_data_id = $monster_base_data_id->[0];
      
      # 限界突破情報
      my $over_limit_id = 0;
      if ($data->{overLimit} == 1) {
        my $over_limit_check_data_ref = &hash_to_table_data($data, $monster_data_db_info{'over_limit'});
        $over_limit_id = &get_one_row_data($dbh, 'over_limit', [ 'id' ], %$over_limit_check_data_ref);
        if (!$over_limit_id) {
          &insert_table_data($dbh, 'over_limit', %$over_limit_check_data_ref);
          $over_limit_id = &get_one_row_data($dbh, 'over_limit', [ 'id' ], %$over_limit_check_data_ref);
        }
        $over_limit_id = $over_limit_id->[0];
      }

      # 進化情報
      my $evolution_id = 0;
      my $is_update_evolution_table = 0;
      if ($data->{evolutionType} != 0 && $data->{evolutionType} != 99) {
        my $evolution_check_data_ref = &hash_to_table_data($data, $monster_data_db_info{'evolution'});
        $evolution_id = &get_one_row_data($dbh, 'evolution', [ 'id' ], %$evolution_check_data_ref);
        if (!$evolution_id) {
          &insert_table_data($dbh, 'evolution', %$evolution_check_data_ref);          
          $is_update_evolution_table = 1;
          $evolution_id = &get_one_row_data($dbh, 'evolution', [ 'id' ], %$evolution_check_data_ref);
        }
        $evolution_id = $evolution_id->[0];
      }

      my %monster_data_table_data = (
        no => $data->{no},
        monster_base_data => $monster_base_data_id,
        over_limit => $over_limit_id,
        evolution => $evolution_id,
        state => 1
      );

      $is_update_monster_data = !&check_same_table_data($dbh, 'monster_data', %monster_data_table_data);

      if (!($is_update_monster_data || $is_update_skill_table || $is_update_leader_skill_table)) {
        push @error, '同一内容で登録されています';
      } else {
        # データ更新。
        if ($is_update_monster_data) {
          &update_disable_state($dbh, 'monster_data', (no => $data->{no}, state => 1));
          &insert_table_data($dbh, 'monster_data', %monster_data_table_data, %common_insert_data);

          # モンスターデータのJSON保存
          my %to_json_data;
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
        if ($is_update_skill_table) {
          &save_skill_list_json($dbh);
        }
        if ($is_update_leader_skill_table) {
          &save_leader_skill_list_json($dbh);
        }
        if ($is_update_evolution_table) {
          &save_evolution_list_json($dbh);
        }

        $dbh->commit;
      }
    }
    $dbh->disconnect;
  }

  my %outputData;

  if (@error) {
    $outputData{error} = \@error;
  } else {
    $outputData{message} = [ 'モンスターデータを更新しました。' ];
    $outputData{newTableData} = {};

    if ($is_update_monster_data) {
      my %pickup_monster;

      for (@monster_data_pickup_keys) {
        &joined_key_access(\%pickup_monster, $_,
          &joined_key_access($data, $_)
        )
      }
      $outputData{newTableData}{monster} = { $data->{no} => \%pickup_monster };
    }

    if ($is_update_skill_table) {
      $outputData{newTableData}{skillDetails} = {
        $data->{skill} => {
          name => $data->{skillDetails}{name},
          description => $data->{skillDetails}{description},
          baseTurn => $data->{skillDetails}{baseTurn},
          maxLevel => $data->{skillDetails}{maxLevel}
        }
      };
    }
    if ($is_update_leader_skill_table) {
      $outputData{newTableData}{leaderSkillDetails} = {
        $data->{leaderSkill} => {
          name => $data->{leaderSkillDetails}{name},
          description => $data->{leaderSkillDetails}{description}
        }
      };
    }
  }

  print "Content-Type: application/json\n\n", JSON::PP::encode_json(\%outputData);
}


# キー or 添字の階層を _ でつないだキーを指定してハッシュ・配列の階層にアクセスする処理。
sub joined_key_access {
  my ($ref, $key, $value) = @_;
  my $is_set = ($#_ >= 2);

  my @splited_keys = split '_', $key;
  my @types = map { ($_ =~ /^[0-9]+$/) ? 0 : 1 } @splited_keys;
  my $target = $ref;

  for my $j (0 .. $#splited_keys - 1) {        
    my $v = @splited_keys[$j];

    my $insert_ref = ($types[$j + 1] == 0) ? [] : {};
    if ($types[$j] == 0) {
      if (!exists $target->[$v]) {
        if ($is_set) { $target->[$v] = $insert_ref; }
        else { return undef; }
      }
      $target = $target->[$v];
    } elsif ($types[$j] == 1) {
      if (!exists $target->{$v}) {
        if ($is_set) { $target->{$v} = $insert_ref; }
        else { return undef; }
      }
      $target = $target->{$v};
    }
  }

  my $ret_val;
  if ($types[$#splited_keys] == 0) {
    $ret_val = $target->[$splited_keys[$#splited_keys]];
    if ($is_set) { $target->[$splited_keys[$#splited_keys]] = $value; }
  } else {
    $ret_val = $target->{$splited_keys[$#splited_keys]};
    if ($is_set) { $target->{$splited_keys[$#splited_keys]} = $value; }
  }

  return $ret_val;
}

# ハッシュのデータをもとに where 句で使用する文字列と置き換え値の配列
sub create_where_sql_and_value {
  my ($where_hash_ref) = @_;

  my @where_strings;
  my @where_values;

  for my $key (keys %$where_hash_ref) {
    my $value = $where_hash_ref->{$key};
    if (!defined $value) {
      $key = "${key} IS NULL";
      push @where_strings, $key;
    } else {
      $key = "${key} = ?";
      
      push @where_strings, $key;
      push @where_values, $value;
    }
  }

  return (\@where_strings, \@where_values);
}

# 指定条件を満たす１行の指定項目を取得する。
sub get_one_row_data {
  my ($dbh, $table_name, $column_names_ref, %where_data) = @_;

  my $where_values_ref = [];
  
  my $check_sql = "SELECT " . join(', ', @$column_names_ref) . " FROM ${table_name}";
  if (%where_data) {
    my $where_strings_ref;
    ($where_strings_ref, $where_values_ref) = &create_where_sql_and_value(\%where_data);
    $check_sql .= " WHERE " . join(' AND ', @$where_strings_ref);
  }
  my $sth = $dbh->prepare($check_sql);
  if (!$sth) { die $check_sql . ":\n" . $dbh->errstr; }
  $sth->execute(@$where_values_ref);
  return $sth->fetchrow_arrayref;
}

# 同一内容のデータが存在しているか確認する。
sub check_same_table_data {
  my ($dbh, $table_name, %check_data) = @_;
  my $tbl_ary_ref = &get_one_row_data($dbh, $table_name, [ 'COUNT(*)' ], %check_data);
  if (!$tbl_ary_ref) { return undef; }
  return ($tbl_ary_ref->[0] > 0);
}

# テーブルに指定された内容のデータを追加する。
sub insert_table_data {
  my ($dbh, $table_name, %insert_data) = @_;

  my @insert_keys = keys %insert_data;
  my @insert_values = map { $insert_data{$_} } @insert_keys;

  my $update_sql = "INSERT INTO ${table_name} (" . join(', ', @insert_keys) .
    ') VALUES (' .  join(', ', map { '?' } @insert_values) . ');';
  my $sth = $dbh->prepare($update_sql);
  if (!$sth) {
    die $dbh->errstr;
    return 0;
  }
  if (!$sth->execute(@insert_values)) {
    die $sth->errstr;
    return 0;
  }
  return 1;
}

# テーブル内の指定条件を満たすレコードの state を 0 にする。
sub update_disable_state {
  my ($dbh, $table_name, %target_data) = @_;
  my @target_keys = keys %target_data;
  my @target_values = map { $target_data{$_} } @target_keys;

  my $update_sql = "UPDATE  ${table_name} SET state= 0 WHERE " .
    join(' AND ', map { "$_ = ?" } @target_keys) . ';';
  $dbh->do($update_sql, undef, @target_values);
}

# ハッシュデータをDBに格納するためのハッシュデータに変更する。
sub hash_to_table_data {
  my ($data, $db_tale_info) = @_;
  my %ret;
  for my $key (@$db_tale_info) {
    my ($hash_key, $db_column_name);
    $hash_key = $db_column_name = $key;
    if (ref $key eq 'ARRAY') {
      $hash_key = $key->[0];
      $db_column_name = $key->[1];
    }
    my $value = &joined_key_access($data, $hash_key);
    if ($hash_key eq 'superAwakens') {
      $value = JSON::PP::encode_json($value);
    }
    $ret{$db_column_name} = $value;
  }
  return \%ret;
}

# db から取り出した行のデータの配列から、任意のキーのものを対象としたハッシュを作成する。
sub db_row_to_hash {
  my ($row_array_ref, $keys_ref, @pickup_indexes) = @_;
  if (!@pickup_indexes) {
    @pickup_indexes = (0 .. (scalar @$keys_ref) - 1);
  }
  my %data;
  for my $i (@pickup_indexes) {
    my $key = $keys_ref->[$i];
    my $value = $row_array_ref->[$i];
    if ($key eq 'superAwakens' && $value) {
      $value = JSON::PP::decode_json($value);
    }
    if ($key) {
      &joined_key_access(\%data, $key, $value);
    }
  }
  return \%data;
}


sub save_monster_list_json {
  my ($dbh) = @_;

  # データを格納してる各テーブルにモンスター番号が存在しないのと、
  # 先頭のキーがハッシュのキーとして使用されるのでモンスター番号を予め指定しておく。
  my @column_infos = ([ 'no', 'monster_data.no' ]);
  my %used_keys;    # 複数回登場するキーは最初のもののみを使用するための確認用ハッシュ。
  for my $table_name (keys %monster_data_db_info) {
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

  my $data_ref = &table_to_hash($dbh, "
  monster_data
    LEFT JOIN monster_base_data ON monster_data.monster_base_data = monster_base_data.id
    LEFT JOIN over_limit ON monster_data.over_limit = over_limit.id
    LEFT JOIN evolution ON monster_data.evolution = evolution.id
  ", \@column_infos, { 'monster_data.state' => 1 });

  # JSON化してファイルに保存。
  open(DATAFILE, "> ./listJson/monster_data.json") or die("error :$!");
  print DATAFILE JSON::PP->new->pretty
    ->sort_by(sub { 
      ($json_sort_ranks{$JSON::PP::a} - $json_sort_ranks{$JSON::PP::b}) ||
      ($JSON::PP::a - $JSON::PP::b)
    } )
    ->indent_length(2)
    ->encode($data_ref);
  close(DATAFILE);

  # ピックアップ版用のデータを抜き出したものを作成する。
  my %pickup_data = map {
    my $target_ref = $data_ref->{$_};
      my %temp;
      for (@monster_data_pickup_keys) {
        &joined_key_access(\%temp, $_,
          &joined_key_access($target_ref, $_)
        )
      }
      $_ => \%temp;
  } keys %$data_ref;

  # JSON化してファイルに保存。
  open(DATAFILE, "> ./listJson/monster_list.json") or die("error :$!");
  print DATAFILE JSON::PP::encode_json(\%pickup_data);
  close(DATAFILE);
}

# テーブルの情報を取得し、先頭の項目の値キーとして、指定項目をハッシュにしたものを格納したハッシュを作成する。
# $column_names_ref は取得項目名を格納した配列。
# 取得項目名の指定は、ハッシュ上のキー名とデータベース上の項目名の2つを格納した配列。
# ハッシュ上とデータベース上での名前が同じ場合は配列ではなく文字列での指定も可能。
sub table_to_hash {
  my ($dbh, $table_name, $column_names_ref, $where) = @_;
  
  my @hash_keys;
  my @db_column_names;
  for my $column_name (@$column_names_ref) {
      if (ref $column_name eq 'ARRAY') {
        push @hash_keys, $column_name->[0];
        push @db_column_names, $column_name->[1];
      } else {
        push @hash_keys, $column_name;
        push @db_column_names, $column_name;
      }
  }

  my $where_values_ref = [];
  my $sql_str = 'SELECT ' . join(',', @db_column_names) . " FROM ${table_name}";  
  if ($where) {
    my $where_strings_ref;
    ($where_strings_ref, $where_values_ref) = &create_where_sql_and_value($where);
    my $where_string = join ' AND ', @$where_strings_ref;
    if ($where_string) { $sql_str .= " WHERE ${where_string}"; }
  }

  my $sth = $dbh->prepare($sql_str);
  if (!$sth) { die "$sql_str :\n " . $dbh->errstr; }
  $sth->execute(@$where_values_ref);
  my %data;
  while (my $tbl_ary_ref = $sth->fetchrow_arrayref) {
    $data{$tbl_ary_ref->[0]} = &db_row_to_hash($tbl_ary_ref, \@hash_keys);
  }
  return \%data;
}

sub save_skill_list_json {
  my ($dbh) = @_;
  my @keys = qw/ no name description baseTurn maxLevel /;
  my $data = table_to_hash($dbh, 'skill', \@keys, { state => 1 });

  open(DATAFILE, "> ./listJson/skill_list.json") or die("error :$!");
  print DATAFILE JSON::PP::encode_json($data);
  close(DATAFILE);
}


sub save_leader_skill_list_json {
  my ($dbh) = @_;
  my @keys = qw/ no name description /;
  my $data = table_to_hash($dbh, 'leader_skill', \@keys, { state => 1 });

  open(DATAFILE, "> ./listJson/leader_skill_list.json") or die("error :$!");
  print DATAFILE JSON::PP::encode_json($data);
  close(DATAFILE);
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
  my $data_ref = &table_to_hash($dbh, "
    evolution 
      LEFT JOIN monster_data ON monster_data.evolution = evolution.id
  ", \@column_infos, { 'monster_data.state' => 1 });

  # 取得したデータは進化後のモンスター番号がキーとなっているので、
  # 進化前をキーとして情報の配列を持つハッシュを作成する。
  my %to_evolution_hash;
  for my $data (values %$data_ref) {
    if (!exists $to_evolution_hash{$data->{baseNo}}) {
      $to_evolution_hash{$data->{baseNo}} = [];
    }
    push @{$to_evolution_hash{$data->{baseNo}}}, $data;
  }

  open(DATAFILE, "> ./listJson/evolution_list.json") or die("error :$!");
  print DATAFILE JSON::PP::encode_json(\%to_evolution_hash);
  close(DATAFILE);
}

sub save_image_list_json {
  my ($dbh) = @_;
  my @keys = (
    [ '', 'no' ],
    'id'
  );
  my $data = table_to_hash($dbh, 'monster_image', \@keys, { state => 1 });

  open(DATAFILE, "> ./listJson/image_list.json") or die("error :$!");
  print DATAFILE JSON::PP::encode_json($data);
  close(DATAFILE);
}

__END__
