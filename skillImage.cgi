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

my ($mode, $no) = $ENV{'PATH_INFO'} =~ m|^/([^/]+)/(\d+)|;

my $dbh = create_monster_db_dbh();
# 指定されたスキル/リーダースキルを持っていて、最もレアリティが高く、番号の小さいモンスターをそのスキルの代表モンスターとする。
my $target_name = ($mode eq 'leaderSkill')? 'leaderSkill' : 'skill';
my $sql = <<"EOS";
SELECT mi.id, mi.no FROM monster_image AS mi
	LEFT JOIN monster_data AS md ON mi.no = md.no
	LEFT JOIN monster_base_data AS mbd ON md.monster_base_data = mbd.id
	WHERE mi.state = 1 AND md.state = 1 AND mbd.${target_name} = ?
	ORDER BY mbd.rare DESC, md.no
	LIMIT 1
EOS

my @row_ary = $dbh->selectrow_array($sql, undef, $no);

my $file_name;
# データを取得できた場合
if ($row_ary[0]) {
  # 代表モンスターのアイコンを表示。
  $file_name = "monsterIconsLog/icon_$row_ary[1]_$row_ary[0].jpg";
  print "Content-type: image/jpeg\n\n";
# データを取得できなかった場合
} else {
  # ファビコンと同じ画像を表示。
  $file_name = 'image/twitterCard.png';
  print "Content-type: image/png\n\n";
}

open IMG,$file_name;
binmode (IMG);
print <IMG>;
close (IMG);

__END__
