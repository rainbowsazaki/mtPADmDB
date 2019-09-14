#!/usr/local/bin/perl
use strict;

use CGI::Carp qw(fatalsToBrowser);

use utf8;
use JSON::PP ();
use DBI;
use File::Copy qw/copy/;
use Archive::Zip qw( :ERROR_CODES :CONSTANTS );


my @unpacked_zips;
my $unpacked_jpg_count = 0;
sub unpack {
  @unpacked_zips = glob "backup/*-*.zip";
  for my $file_name (@unpacked_zips) {
    my $zip = Archive::Zip->new($file_name);
    my @m = $zip->memberNames();
    foreach (@m) {
      $zip->extractMember($_, "./$_");
      $unpacked_jpg_count++;
    }
  }
}

# モンスター情報のデータベースに接続する dbh を作成する。
sub create_monster_db_dbh {
  my $dbh = DBI->connect("dbi:SQLite:dbname=./db/monster.db");
  $dbh->{sqlite_unicode} = 1;
  $dbh->{AutoCommit} = 0;
  return $dbh;
}


my $rename_count = 0;
sub renameMonsterImageLog {
  my ($no) = $ENV{'PATH_INFO'} =~ m|^/(\d+)|;

  my $dbh = create_monster_db_dbh();
  my $sql = <<"EOS";
SELECT id, no FROM monster_image
  WHERE monster_image.state = 1;
EOS

  my $sth = $dbh->prepare($sql);
  if (!$sth) { die "$sql :\n " . $dbh->errstr; }
  $sth->execute();
  while (my $tbl_ary_ref = $sth->fetchrow_arrayref) {
    my ($id, $no) = @$tbl_ary_ref;
    
    copy("./monsterImagesLog/${no}_${id}.jpg", "./monsterImages/${no}.jpg") && $rename_count++;
    copy("./monsterIconsLog/icon_${no}_${id}.jpg", "./monsterIcons/icon_${no}.jpg") && $rename_count++;
  }
}

if (1) {
  &unpack();
}

if (1) {
  &renameMonsterImageLog();
}

# 結果出力
my $json = JSON::PP->new->pretty;
print "Content-Type: application/json\n\n", $json->encode({
  unpacked_zip => \@unpacked_zips,
  unpacked_jpg_count => $unpacked_jpg_count,
  rename_count => $rename_count
});

__END__
