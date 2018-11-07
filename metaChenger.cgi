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
}

#html ファイル読み込み
open(DATAFILE, '<:utf8', 'index.html');
local $/ = undef;
my $html = <DATAFILE>;
close(DATAFILE);

# html 内容置き換え
if ($title) {
  $html =~ s|(<title>)(.*?)(</title>)|$1${title} - $2$3|;
  $html =~ s|(<meta property="og:title" content=")(.*?)(" />)|$1${title} - $2$3|;
}
if ($image_url) {
  $html =~ s|(<meta property="og:image" content=")(.*?)(" />)|$1${image_url}$3|;
}

print "Content-Type: text/html\n\n";
print $html;

__END__
