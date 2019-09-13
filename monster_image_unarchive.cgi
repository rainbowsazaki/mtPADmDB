#!/usr/bin/perl
use strict;

use CGI::Carp qw(fatalsToBrowser);

use utf8;
use JSON::PP ();
use DBI;
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

my $output;

if (1) {
  &unpack();
  $output = 'unpacked;'
}

# 結果出力
my $json = JSON::PP->new->pretty;
print "Content-Type: application/json\n\n", $json->encode({
  output => $output,
  unpacked_zip => \@unpacked_zips,
  unpacked_jpg_count => $unpacked_jpg_count
});

__END__
