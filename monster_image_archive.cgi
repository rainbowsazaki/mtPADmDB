#!/usr/local/bin/perl
use strict;

use CGI::Carp qw(fatalsToBrowser);

use utf8;
use JSON::PP ();
use DBI;
use Archive::Zip qw( :ERROR_CODES :CONSTANTS );

# 最後にアーカイブを行った画像のID。
my $count_file_path = 'db/image_archive_last_count.txt';

# アーカイブ対象の基準となるID。これ以下のIDのものはすでにアーカイブされているので対象にしない。
my $target_border = 0;
if (open(IN, '<', $count_file_path)) {
  $target_border = <IN>;
  close(IN);
}

my $zip = Archive::Zip->new();

my @files = glob "monsterIconsLog/* monsterImagesLog/*";

# アーカイブを行ったファイルのパスの配列。
my @archived_files;

# アーカイブを行ったうちの最大のID。
my $max_id = $target_border;

for my $file_name (@files) {
  $file_name =~ /\d+_(\d+)/;
  my $id = $1;
  if ($id <= $target_border) { next; }
  if ($max_id < $id) { $max_id = $id; }

  my $ret = $zip->addFile($file_name);  
  if ($ret) {
    push @archived_files, $file_name
  }
}

my $output;

# 対象ファイルが無ければ保存しない。
if (!@archived_files) {
  $output = 'target file none.'
} else {
  my $zip_file_name = 'backup/' . ($target_border + 1) . "-${max_id}.zip";
  if ($zip->writeToFileNamed($zip_file_name) == AZ_OK) {
    $output = "successfully saved.\n";
    if (open(OUT, '>', $count_file_path)) {
      print OUT $max_id;
      close(OUT);
    }
  } else {
    $output = "save error.\n";
  }
}

# 結果出力
my $json = JSON::PP->new->pretty;
print "Content-Type: application/json\n\n", $json->encode({
  output => $output,
  border => $target_border,
  max_id => $max_id,
  files => \@archived_files
  });

__END__
