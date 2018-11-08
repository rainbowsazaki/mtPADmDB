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
if ($ENV{'PATH_INFO'} =~ m|^/(\d+)/?$|) {
  my $no = $1;
  my $dbh = create_monster_db_dbh();
  my $quoted_no = $dbh->quote($no);
  eval {
    my $sql = <<"EOS";
SELECT monster_base_data.name FROM monster_data 
  LEFT JOIN monster_base_data ON monster_data.monster_base_data == monster_base_data.id
  WHERE monster_data.no == ${quoted_no} AND monster_data.state == 1
EOS
    my @row_ary = $dbh->selectrow_array($sql);
    $title = "No.${no} ${row_ary[0]}";
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
}

#html ファイル読み込み
open(DATAFILE, '<:utf8', 'index.html');
local $/ = undef;
my $html = <DATAFILE>;
close(DATAFILE);

# html 内容置き換え
if ($title) {
  $html =~ s|(<title>)(.*?)(</title>)|$1${title} - $2$3|;
  $html =~ s|(<meta property="og:title" content=")(.*?)(".*?>)|$1${title} - $2$3|;
}
if ($image_url) {
  $html =~ s|(<meta property="og:image" content=")(.*?)(".*?>)|$1${image_url}$3|;
}
if ($description) {
  $html =~ s|(<meta name="description" content=")(.*?)(".*?>)|$1${description}$3|;
  $html =~ s|(<meta property="og:description" content=")(.*?)(".*?>)|$1${description}$3|;
}

print "Content-Type: text/html\n\n";
print $html;

__END__
