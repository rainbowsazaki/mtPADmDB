#!/usr/bin/perl
use strict;
use utf8;

use CGI::Carp qw(fatalsToBrowser);
use DBI;

# モンスター情報のデータベースに接続する dbh を作成する。
sub create_monster_db_dbh {
  my $dbh = DBI->connect("dbi:SQLite:dbname=./db/monster.db");
  $dbh->{sqlite_unicode} = 1;
  $dbh->{AutoCommit} = 0;
  return $dbh;
}

my $title;
my $image_url;
my $description;
my $url_base = 'https://padmdb.rainbowsite.net';

# モンスター情報の場合
if ($ENV{'PATH_INFO'} =~ m|^/(?:monster/)?(\d+)/?$|) {
  my $no = $1;
  my $dbh = create_monster_db_dbh();
  my $quoted_no = $dbh->quote($no);
  eval {
    my @columns = map { "monster_base_data.${_}" } 
      qw/ name attributes_0 attributes_1 types_0 types_1 types_2 
          maxParam_hp maxParam_attack maxParam_recovery overLimit/;
    push @columns, 'monster_data.over_limit';
    my $columns_str = join ', ' , @columns;
    my $sql = <<"EOS";
SELECT ${columns_str} FROM monster_data 
  LEFT JOIN monster_base_data ON monster_data.monster_base_data == monster_base_data.id
  WHERE monster_data.no == ${quoted_no} AND monster_data.state == 1
EOS
    my @row_ary = $dbh->selectrow_array($sql);
    $title = "No.${no} ${row_ary[0]}";

    sub number_array_to_names_string {
      my ($name_table, @nos) = @_;
      my @names = ();
      for my $i (@nos) {
        my $name = $name_table->[$i];
        if (!defined $name) { last; }
        push @names, $name;
      }
      my $str = join '/', @names;
      if ($str eq '') { $str = '不明'; }
      return $str;
    }

    my @attr_table = ( undef, '火', '水', '木', '光', '闇' );
    my $attr_str = &number_array_to_names_string(\@attr_table, @row_ary[1..2]);

    my @type_table = (
      undef, '神', 'ドラゴン', '悪魔', 'マシン', 'バランス', '攻撃', '体力', '回復',
      '進化用','能力覚醒用', '強化合成用', '売却用'
    );
    my $type_str = &number_array_to_names_string(\@type_table, @row_ary[3..5]);

    sub array_to_param_string {
      my @params = map { (defined $_ ) ? $_ : '不明' } @_;
      return "HP:${params[0]} 攻撃:${params[1]} 回復:${params[2]}";
    }
    my $param_str = &array_to_param_string(@row_ary[6..8]);
    $description = "タイプ:${type_str} 属性:${attr_str} ${param_str}";
    
    if ($row_ary[9]) {
      my $quoted_over_limit = $dbh->quote($row_ary[10]);
      my $sql2 = <<"EOS";
SELECT param_hp, param_attack, param_recovery FROM over_limit 
  WHERE id == ${quoted_over_limit};
EOS
      my @row_ary2 = $dbh->selectrow_array($sql2);
      my $over_limit_param_string = &array_to_param_string(@row_ary2);
      $description .= " (Lv110時 ${over_limit_param_string})";
    }
  };
  eval {
    my $sql = <<"EOS";
SELECT count(id) FROM monster_image
  WHERE monster_image.no == ${quoted_no} AND monster_image.state == 1
EOS
    my @row_ary = $dbh->selectrow_array($sql);
    if ($row_ary[0] > 0) {
      $image_url = "${url_base}/monsterImages/${no}.jpg";
    }
  };

# （リーダー）スキル一覧 or （リーダー）スキル詳細の場合
} elsif ($ENV{'PATH_INFO'} =~ m!^/(skill|leaderSkill)/?(\d+)?/?$!) {
  my $is_leader_skill = $1 eq 'leaderSkill';
  my $no = $2;
  # 番号なし＝一覧
  if (!$no) {
    $title = ($is_leader_skill) ? 'リーダースキル一覧' : 'スキル一覧';
  # 番号あり＝詳細
  } else {
    my $dbh = create_monster_db_dbh();
    my $quoted_no = $dbh->quote($no);
    my $table_name = ($is_leader_skill) ? 'leader_skill' : 'skill';
    eval {
      my $sql = "SELECT name, description FROM ${table_name} WHERE no = ${quoted_no} AND state = 1 LIMIT 1";
      my @row_ary = $dbh->selectrow_array($sql);
      $title = (($is_leader_skill) ? 'リーダースキル詳細 ' : 'スキル詳細 ') . $row_ary[0];
      $description = $row_ary[1];
      $description =~ s/\r?\n//g;
    };
  }

# モンスターランキング
} elsif ($ENV{'PATH_INFO'} =~ m!^/ranking(?:/([\w\d]*)/?)?$!) {
  my $kind = $1 || 'hp';

  my %ranking_infos = (
    hp => {
      title => 'HP',
      description => 'モンスターのレベル最大・+297・全覚醒時のHPのランキングです。',
    },
    attack => {
      title => '攻撃',
      description => 'モンスターのレベル最大・+297・全覚醒時の攻撃のランキングです。',
    },
    recovery => {
      title => '回復',
      description => 'モンスターのレベル最大・+297・全覚醒時の回復のランキングです。',
    },
    plus => {
      title => 'プラス換算値',
      description => 'モンスターのレベル最大・全覚醒時のプラス換算値のランキングです。',
    },
    wayAttack => {
      title => '2体攻撃消し時攻撃力',
      description => 'モンスターのレベル最大・+297・全覚醒時の2体攻撃消し時の攻撃力ランキングです。',
    },
    lJiAttack => {
      title => 'L字消し攻撃時攻撃力',
      description => 'モンスターのレベル最大・+297・全覚醒時のL字消し攻撃時の攻撃力ランキングです。',
    },
    '7comboAttack' => {
      title => '7コンボ時攻撃力',
      description => 'モンスターのレベル最大・+297・全覚醒時の7コンボ時の攻撃力ランキングです。',
    },
    '10comboAttack' => {
      title => '10コンボ時攻撃力',
      description => 'モンスターのレベル最大・+297・全覚醒時の10コンボ時の攻撃力ランキングです。',
    },
    way7comboAttack => {
      title => '2体攻撃消し7コンボ時攻撃力',
      description => 'モンスターのレベル最大・+297・全覚醒時の2体消し攻撃7コンボ時の攻撃力ランキングです。',
    },
    lJi7comboAttack => {
      title => 'L字消し攻撃7コンボ時攻撃力',
      description => 'モンスターのレベル最大・+297・全覚醒時の消し7コンボ時の攻撃力ランキングです。',
    },
    a3x3Attack => {
      title => '無効貫通時攻撃力',
      description => 'モンスターのレベル最大・+297・全覚醒時の無効貫通時の攻撃力ランキングです。',
    },
    a3x37comboAttack => {
      title => '無効貫通７コンボ時攻撃力',
      description => 'モンスターのレベル最大・+297・全覚醒時の無効貫通７コンボ時の攻撃力ランキングです。',
    },
    assistHp => {
      title => 'HPアシスト',
      description => 'モンスターのレベル最大・+297・全覚醒時のHPアシストボーナスのランキングです。',
    },
    assistAttack => {
      title => '攻撃アシスト',
      description => 'モンスターのレベル最大・+297・全覚醒時の攻撃アシストボーナスのランキングです。',
    },
    assistRecovery => {
      title => '回復アシスト',
      description => 'モンスターのレベル最大・+297・全覚醒時の回復アシストボーナスのランキングです。',
    },
    assistPlus => {
      title => 'アシストボーナス プラス換算値',
      description => 'モンスターのレベル最大・全覚醒時のアシストボーナス値のプラス換算値のランキングです。',
    }
  );
  my $info = $ranking_infos{$kind};
  if ($info) {
    $title = $info->{title} . 'ランキング';
    $description = $info->{description};
  }
}

#html ファイル読み込み
open(DATAFILE, '<:utf8', 'index.html');
local $/ = undef;
my $html = <DATAFILE>;
close(DATAFILE);

# html 内容置き換え
if ($title) {
  $html =~ s|(<title>)(.*?)(</title>)|$1${title} - $2$3|;
  $html =~ s|(<meta property="?og:title"? content=)"?([^\s>]*?)"?(\s*/?>)|$1"${title} - $2"$3|;
}
if ($image_url) {
  $html =~ s|(<meta property="?og:image"? content=)"?([^\s>]*?)"?(\s*/?>)|$1"${image_url}"$3|;
}
if ($description) {
  $html =~ s|(<meta name="?description"? content=)"?([^\s>]*?)"?(\s*/?>)|$1"${description}"$3|;
  $html =~ s|(<meta property="?og:description"? content=)"?([^\s>]*?)"?(\s*/?>)|$1"${description}"$3|;
}

print "Content-Type: text/html\n\n";
print $html;

__END__
