#!/usr/bin/perl
use strict;
use utf8;

use Image::Magick;
use CGI::Carp qw(fatalsToBrowser);
use JSON::PP ();
use DBI;

# モンスター情報のデータベースに接続する dbh を作成する。
sub create_monster_db_dbh {
  my $dbh = DBI->connect("dbi:SQLite:dbname=./db/monster.db");
  $dbh->{sqlite_unicode} = 1;
  $dbh->{AutoCommit} = 0;
  return $dbh;
}

my ($no) = $ENV{'PATH_INFO'} =~ m|^/(\d+)|;

my $dbh = create_monster_db_dbh();
my $sql = <<"EOS";
SELECT mi.id FROM monster_image AS mi
  WHERE mi.state = 1 AND mi.no = ?
  LIMIT 1
EOS

my @row_ary = $dbh->selectrow_array($sql, undef, $no);

# データを取得できなかった場合
if (!$row_ary[0]) {
  # ファビコンと同じ画像を表示。
  print "Content-type: image/png\n\n";

  open IMG, 'image/twitterCard.png';
  binmode (IMG);
  print <IMG>;
  close (IMG);
  exit;
}

my $file_name = "monsterImagesLog/${no}_$row_ary[0].jpg";

my $canvas_width = '1200';
my $canvas_height = '630';

my $canvas = Image::Magick->new;
$canvas->Set(size => $canvas_width . 'x' . $canvas_height);
$canvas->ReadImage('xc:black');

# モンスター画像より少し広い背景画像。
my $back_image = Image::Magick->new;
$back_image->Read('tcBack.jpeg');
$canvas->Composite(image => $back_image, compose=>'over', gravity=>'Center');

my $src_image = Image::Magick->new;
$src_image->Read($file_name);
my($src_width, $src_height) = $src_image->Get('width', 'height');

$src_image->Resize(
  width => int($src_width * ($canvas_height / $src_height)),
  height => $canvas_height
);

# 画像を重ねる
$canvas->Composite(image=>$src_image, compose=>'over', gravity=>'Center');

my $opt_image_ext = 'png';

$sql = <<"EOS";
SELECT monster_base_data, over_limit FROM monster_data
	WHERE state = 1 AND no = ?
EOS
my ($monster_base_data_id, $over_limit_id) = $dbh->selectrow_array($sql, undef, $no);

# 覚醒を表示する
my @columns;
for my $i (0 .. 8) {
  push @columns, "awakens_${i}";
}
my $columns_str = join ', ', @columns;

$sql = <<"EOS";
SELECT ${columns_str} FROM monster_base_data
	WHERE id = ?
EOS

@row_ary = $dbh->selectrow_array($sql, undef, $monster_base_data_id);
for (my $i; $i < 9; $i++) {
  my $awaken = $row_ary[$i];
  if ($awaken == 0 || $awaken == 99) { next; }
  my $src_image = Image::Magick->new;
  $src_image->Read("./image/awaken/${awaken}.${opt_image_ext}");
  $src_image->Resize(width => 47, height => 48);
  $canvas->Composite(image => $src_image, compose => 'over', gravity => 'northwest', x => $canvas_width - 96, y => 32 + 64 * $i);
}

#潜在覚醒
if ($over_limit_id != 0) {
  $sql = <<"EOS";
SELECT superAwakens FROM over_limit
  WHERE id = ?
EOS

  @row_ary = $dbh->selectrow_array($sql, undef, $over_limit_id);
  my $super_awakens = JSON::PP::decode_json($row_ary[0]);
  my $super_awakens_count = @$super_awakens;
  for (my $i; $i < $super_awakens_count; $i++) {
    my $awaken = $super_awakens->[$i];
    if ($awaken == 0 || $awaken == 99) { next; }
    my $src_image = Image::Magick->new;
    $src_image->Read("./image/awaken/${awaken}.${opt_image_ext}");
    $src_image->Resize(width => 47, height => 48);
    $canvas->Composite(image => $src_image, compose => 'over', gravity => 'northwest', x => $canvas_width - 160, y => 32 + 64 * $i);
  }
}

print "Content-type: image/jpeg\n\n";
binmode(STDOUT);
$canvas->Write("jpeg:-");

__END__
