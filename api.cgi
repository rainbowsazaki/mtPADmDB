#!/usr/bin/perl
use strict;

use utf8;

use CGI::Carp qw(fatalsToBrowser);
use CGI;
use JSON::PP ();
use DBI;


my $q = CGI->new();

my $mode = $q->param('mode');

if ($mode eq 'image') {
  my $no = $q->param('no');

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


  print "Content-Type: text/html\n\n", 'saved.'; #JSON::PP::encode_json(\%outputData);

} else {

  my $json = $q->param("POSTDATA");

  if ($json eq "") {
    print "Content-Type: text/html\n\n{ error: ['データなし'] }";
    exit(0);
  }


  my $data = JSON::PP::decode_json($json);

  my @error;

  sub check_range {
    if ($_[1] < $_[2] || $_[1] > $_[3]) {
      push @error, "${_[0]}の値が不正(${_[1]})";
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

  &check_range('No', $data->{no}, 1, 9999);
  &check_string_length('名前', $data->{name}, 1, 50);
  &check_range('属性', $data->{attributes}[0], 0, 99);
  &check_range('複属性', $data->{attributes}[1], 0, 99);
  &check_range('コスト', $data->{cost}, 0, 999);
  &check_range('レアリティ', $data->{rare}, 0, 99);
  foreach my $i (0..3) {
    &check_range('タイプ${i}', $data->{types}[$i], 0, 99);
  }
  foreach my $i (0..9) {
    &check_range('覚醒${i}', $data->{awakens}[$i], 0, 99);
  }
  &check_range('経験値テーブル', $data->{expTable}, 0, 999999999);
  &check_range('最大レベル', $data->{maxLevel}, 0, 99);
  &check_range('HP', $data->{maxParam}{hp}, 0, 99999);
  &check_range('攻撃', $data->{maxParam}{attack}, 0, 99999);
  &check_range('回復', $data->{maxParam}{recovery}, 0, 99999);

  if ($data->{skillNo} == 0) {
    &check_string_length('スキル名', $data->{skillDetails}{name}, 1, 50);
    &check_string_length('スキル詳細', $data->{skillDetails}{description}, 1, 200);
    &check_range('スキルLv1ターン', $data->{skillDetails}{baseTurn}, 1, 199);
    &check_range('スキル最大レベル', $data->{skillDetails}{maxLevel}, 1, 99);
  }
  if ($data->{leaderSkillNo} == 0) {
    &check_string_length('リーダースキル名', $data->{leaderSkillDetails}{name}, 1, 50);
    &check_string_length('リーダースキル詳細', $data->{leaderSkillDetails}{description}, 1, 200);

  }
  &check_range('アシスト', $data->{assist}, 0, 9);
  &check_range('限界突破', $data->{overLimit}, 0, 9);
  if ($data->{overLimit} == 1) {
    &check_range('限界突破時 HP', $data->{overLimitParam}{hp}, 0, 99999);
    &check_range('限界突破時 攻撃', $data->{overLimitParam}{attack}, 0, 99999);
    &check_range('限界突破時 回復', $data->{overLimitParam}{recovery}, 0, 99999);
  }
  foreach my $n ($data->{superawakens}) {
    #&check_range('超覚醒', $n, 1, 99);
  }
  &check_range('進化タイプ', $data->{evolution}{type}, 0, 99);
  if ($data->{evolution}{type} > 0 && $data->{evolution}{type} < 99) {
    &check_range('進化前', $data->{evolution}{baseNo}, 1, 9999);
    foreach my $i (0..4) {
      &check_range('進化素材${i}', $data->{evolution}{materials}[$i], 0, 9999);
    }
  }
  &check_string_length('コメント', $data->{comment}, 0, 1000);


  my $is_update_skill_table = 0;
  my $is_update_leader_skill_table = 0;

  if (@error) {
  } else {
    my $dbh = DBI->connect("dbi:SQLite:dbname=monster.db");
    $dbh->{sqlite_unicode} = 1;
    $dbh->{AutoCommit} = 0;

    # スキル
    if ($data->{skillNo} == 0) {
      my $sth;
      my $new_no = -1;
      # 同一内容のスキルが登録されてないか確認
      $sth = $dbh->prepare('SELECT no FROM skill WHERE name = ? AND description = ? AND baseTurn = ? AND maxLevel = ?');
      if ($sth->execute($data->{skillDetails}{name}, $data->{skillDetails}{description}, $data->{skillDetails}{baseTurn}, $data->{skillDetails}{maxLevel})) {
        my $tbl_ary_ref = $sth->fetchrow_arrayref;
        if ($tbl_ary_ref) {
          $new_no = $tbl_ary_ref->[0];
        }
      }

      if ($new_no != -1) {
        $data->{skillNo} = $new_no;
      } else {
        # 新たに登録するスキルに割り振る番号を求める
        $sth = $dbh->prepare("SELECT MAX(no), name FROM skill");
        $sth->execute();
        my $tbl_ary_ref = $sth->fetchrow_arrayref;
        $new_no = $tbl_ary_ref->[0] + 1;

        $sth = $dbh->prepare('INSERT INTO skill(no, name, description, baseTurn, maxLevel, comment, ipAddress, accountName, state) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);');
        if ($sth->execute($new_no, $data->{skillDetails}{name}, $data->{skillDetails}{description}, $data->{skillDetails}{baseTurn}, $data->{skillDetails}{maxLevel}, $data->{comment}, $ip_address, $account_name, 1)) {
          $data->{skillNo} = $new_no;
          $is_update_skill_table = 1;
        } else {
          push @error, 'スキル登録エラー:' . $sth->errstr;
        }
      }
    } else {
      # 指定された番号のスキルが有るか確認
      my $sth = $dbh->prepare("select count(*) FROM skill WHERE id = ?");
      $sth->execute($data->{skillNo});
      my $tbl_ary_ref = $sth->fetchrow_arrayref;
      if ($tbl_ary_ref->[0] == 0) {
        push @error, 'スキル番号指定が不正';
      }
    }

    #リーダースキル
    if ($data->{leaderSkillNo} == 0) {
      my $sth;
      my $new_no = -1;

      # 同一内容のスキルが登録されてないか確認
      $sth = $dbh->prepare('SELECT no FROM leader_skill WHERE name = ? AND description = ?');
      if ($sth->execute($data->{leaderSkillDetails}{name}, $data->{leaderSkillDetails}{description})) {
        my $tbl_ary_ref = $sth->fetchrow_arrayref;
        if ($tbl_ary_ref) {
          $new_no = $tbl_ary_ref->[0];
        }
      }
      if ($new_no != -1) {
        $data->{leaderSkillNo} = $new_no;
      } else {
        # 新たに登録するスキルに割り振る番号を求める
        $sth = $dbh->prepare("SELECT MAX(no) FROM leader_skill");
        $sth->execute();
        my $tbl_ary_ref = $sth->fetchrow_arrayref;
        my $new_no = $tbl_ary_ref->[0] + 1;

        $sth = $dbh->prepare('INSERT INTO leader_skill(no, name, description, comment, ipAddress, accountName, state ) VALUES (?, ?, ?, ?, ?, ?, ?);');
        if ($sth->execute($new_no, $data->{leaderSkillDetails}{name}, $data->{leaderSkillDetails}{description}, $data->{comment}, $ip_address, $account_name, 1)) {
          $data->{leaderSkillNo} = $new_no;
          $is_update_leader_skill_table = 1;
        } else {
          push @error, 'リーダースキル登録エラー:' . $sth->errstr;
        }
      }
    } else {
      # 指定された番号のリーダースキルがあるか確認
      my $sth = $dbh->prepare("select count(*) FROM leader_skill WHERE id = ?");
      $sth->execute($data->{leaderSkillNo});
      my $tbl_ary_ref = $sth->fetchrow_arrayref;
      if ($tbl_ary_ref->[0] == 0) {
        push @error, 'リーダースキル番号指定が不正';
      }
    }

    if (@error) {
    
    } else {

      my @sql_keys = qw/
        no name attributes_0 attributes_1
        cost rare types_0 types_1 types_2 
        awakens_0 awakens_1 awakens_2 awakens_3 awakens_4
        awakens_5 awakens_6 awakens_7 awakens_8
        expTable maxlevel maxParam_hp maxParam_attack maxParam_recovery
        skill leaderSkill
        assist overLimit overLimitParam_hp overLimitParam_attack
        overLimitParam_recovery superAwakens
        evolution_type evolution_baseNo evolution_materials_0 evolution_materials_1
        evolution_materials_2 evolution_materials_3 evolution_materials_4
      /;

      my @sql_values =(
        $data->{no}, $data->{name}, $data->{attributes}[0], $data->{attributes}[1],
        $data->{cost}, $data->{rare}, $data->{types}[0], $data->{types}[1], $data->{types}[2],
        $data->{awakens}[0], $data->{awakens}[1], $data->{awakens}[2], $data->{awakens}[3], $data->{awakens}[4], 
        $data->{awakens}[5], $data->{awakens}[6], $data->{awakens}[7], $data->{awakens}[8], 
        $data->{expTable}, $data->{maxLevel}, $data->{maxParam}{hp}, $data->{maxParam}{attack}, $data->{maxParam}{recovery},
        $data->{skillNo}, $data->{leaderSkillNo},
        $data->{assist}, $data->{overLimit}, $data->{overLimitParam}{hp}, $data->{overLimitParam}{attack},
        $data->{overLimitParam}{recovery}, JSON::PP::encode_json($data->{superAwakens}),
        $data->{evolution}{type}, $data->{evolution}{baseNo}, $data->{evolution}{materials}[0], $data->{evolution}{materials}[1], 
        $data->{evolution}{materials}[2], $data->{evolution}{materials}[3], $data->{evolution}{materials}[4], 
      );

      my $column_count = @sql_keys;

      my $check_sql = 'SELECT COUNT(*) FROM monster_data WHERE ';
      foreach my $key (@sql_keys) {
        $check_sql .= "${key} = ? AND ";
      }
      $check_sql .= 'state = 1';
      my $sth = $dbh->prepare($check_sql);
      if (!$sth) {
          push @error, 'モンスター情報確認エラー:' .  $dbh->errstr;
      } else {

        $sth->execute(@sql_values);
        my $tbl_ary_ref = $sth->fetchrow_arrayref;
        if ($tbl_ary_ref->[0] > 0) {
          push @error, '同一内容で登録されています';
        } else {

          $dbh->do('UPDATE monster_data SET state = 0 WHERE no = ? AND state = 1', undef, $data->{no});

          $sth = $dbh->prepare(<<'EOS');
  INSERT INTO monster_data (
    no, name, attributes_0, attributes_1, cost, rare, types_0, types_1, types_2, 
    awakens_0, awakens_1, awakens_2, awakens_3, awakens_4, awakens_5, awakens_6, awakens_7, awakens_8,
    expTable, maxlevel, maxParam_hp, maxParam_attack, maxParam_recovery, skill, leaderSkill,
    assist, overLimit, overLimitParam_hp, overLimitParam_attack, overLimitParam_recovery, superAwakens,
    evolution_type, evolution_baseNo, evolution_materials_0, evolution_materials_1, evolution_materials_2, evolution_materials_3, evolution_materials_4,
    comment, ipAddress, accountName, state
  ) VALUES (
    ?, ?, ?, ?, ?, ?, ?, ?, ?, 
    ?, ?, ?, ?, ?, ?, ?, ?, ?, 
    ?, ?, ?, ?, ?, ?, ?, 
    ?, ?, ?, ?, ?, ?, 
    ?, ?, ?, ?, ?, ?, ?,
    ?, ?, ?, ?
  )
EOS
          if (!$sth) {
            push @error, 'モンスター情報登録エラー:' .  $dbh->errstr;
          } else {
            my $ret = $sth->execute(
              $data->{no}, $data->{name}, $data->{attributes}[0], $data->{attributes}[1],
              $data->{cost}, $data->{rare}, $data->{types}[0], $data->{types}[1], $data->{types}[2],
              $data->{awakens}[0], $data->{awakens}[1], $data->{awakens}[2], $data->{awakens}[3], $data->{awakens}[4], 
              $data->{awakens}[5], $data->{awakens}[6], $data->{awakens}[7], $data->{awakens}[8], 
              $data->{expTable}, $data->{maxLevel}, $data->{maxParam}{hp}, $data->{maxParam}{attack}, $data->{maxParam}{recovery},
              $data->{skillNo}, $data->{leaderSkillNo},
              $data->{assist}, $data->{overLimit}, $data->{overLimitParam}{hp}, $data->{overLimitParam}{attack},
              $data->{overLimitParam}{recovery}, JSON::PP::encode_json($data->{superAwakens}),
              $data->{evolution}{type}, $data->{evolution}{baseNo}, $data->{evolution}{materials}[0], $data->{evolution}{materials}[1], 
              $data->{evolution}{materials}[2], $data->{evolution}{materials}[3], $data->{evolution}{materials}[4], 
              $data->{comment}, $ip_address, $account_name, 1
            );
            if ($ret) {
              # モンスターデータのJSON保存

              delete $data->{skillDetails};
              delete $data->{leaderSkillDetails};

              my $fileNo = $data->{no};
              open(DATAFILE, "> ./monsterJson/${fileNo}.json") or die("error :$!");
              print DATAFILE JSON::PP::encode_json($data);
              close(DATAFILE);

              &save_monster_list_json($dbh);
              if ($is_update_skill_table) {
                &save_skill_list_json($dbh);
              }
              if ($is_update_leader_skill_table) {
                &save_leader_skill_list_json($dbh);
              }

              $dbh->commit;

              
            } else {
              push @error, 'モンスター情報登録エラー:' .  $sth->errstr;
            }
          }
        }
      }
    }
    $dbh->disconnect;
  }

  my %outputData;

  if (@error) {
    $outputData{error} = \@error;
  } else {
    $outputData{message} = [ 'モンスターデータを更新しました。' ];
    $outputData{newTableData} = {
      monster => {
        $data->{no} => { name => $data->{name} }
      },
    };
    if ($is_update_skill_table) {
      $outputData{newTableData}{skillDetails} = {
        $data->{skillNo} => {
          name => $data->{skillDetails}{name},
          description => $data->{skillDetails}{description},
          baseTurn => $data->{skillDetails}{baseTurn},
          maxLevel => $data->{skillDetails}{maxLevel}
        }
      };
    }
    if ($is_update_leader_skill_table) {
      $outputData{newTableData}{leaderSkillDetails} = {
        $data->{leaderSkillNo} => {
          name => $data->{leaderSkillDetails}{name},
          description => $data->{leaderSkillDetails}{description}
        }
      };
    }
  }

  print "Content-Type: text/html\n\n", JSON::PP::encode_json(\%outputData);
}

sub save_monster_list_json {
  my ($dbh) = @_;
  
  my $sth = $dbh->prepare('SELECT no, name FROM monster_data WHERE state = 1 ORDER BY no ASC;');
  $sth->execute();
  my %savedata;
  while (my $tbl_ary_ref = $sth->fetchrow_arrayref) {
    $savedata{$tbl_ary_ref->[0]} = {
      name => $tbl_ary_ref->[1]
    };
    #die $tbl_ary_ref->[1];
  }
  
  open(DATAFILE, "> ./listJson/monster_list.json") or die("error :$!");
  print DATAFILE JSON::PP::encode_json(\%savedata);
  close(DATAFILE);
}


sub save_skill_list_json {
  my ($dbh) = @_;
  
  my $sth = $dbh->prepare('SELECT no, name, description, baseTurn, maxLevel FROM skill WHERE state = 1 ORDER BY no ASC;');
  $sth->execute();
  my %savedata;
  while (my $tbl_ary_ref = $sth->fetchrow_arrayref) {
    $savedata{$tbl_ary_ref->[0]} = {
      name => $tbl_ary_ref->[1],
      description => $tbl_ary_ref->[2],
      baseTurn => $tbl_ary_ref->[3],
      maxLevel => $tbl_ary_ref->[4]
    };
  }
  
  open(DATAFILE, "> ./listJson/skill_list.json") or die("error :$!");
  print DATAFILE JSON::PP::encode_json(\%savedata);
  close(DATAFILE);
}


sub save_leader_skill_list_json {
  my ($dbh) = @_;
  
  my $sth = $dbh->prepare('SELECT no, name, description FROM leader_skill WHERE state = 1 ORDER BY no ASC;');
  $sth->execute();
  my %savedata;
  while (my $tbl_ary_ref = $sth->fetchrow_arrayref) {
    $savedata{$tbl_ary_ref->[0]} = {
      name => $tbl_ary_ref->[1],
      description => $tbl_ary_ref->[2]
    };
  }
  
  open(DATAFILE, "> ./listJson/leader_skill_list.json") or die("error :$!");
  print DATAFILE JSON::PP::encode_json(\%savedata);
  close(DATAFILE);
}


__END__
