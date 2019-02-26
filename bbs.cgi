#!/usr/bin/perl
use strict;

use utf8;

use CGI::Carp qw(fatalsToBrowser);

use CGI;
use DBI;
use JSON::PP ();

my $ret_ref = '';

# サブのデータベースに接続する dbh を作成する。
sub create_sub_db_dbh {
  my $dbh = DBI->connect("dbi:SQLite:dbname=./db/sub.db");
  $dbh->{sqlite_unicode} = 1;
  $dbh->{AutoCommit} = 0;
  return $dbh;
}

my $q = CGI->new();
my $dbh = create_sub_db_dbh();

if ($ENV{'REQUEST_METHOD'} eq 'POST') {

} elsif ($ENV{'REQUEST_METHOD'} eq 'GET') {
  # 指定されたページURL、リミット、オフセットに基づいた書き込みログ情報をを返す。
  my $pageUrl = $q->param('pageUrl');
  my $limit = $q->param('limit');
  my $offset = $q->param('offset');
  if (!$limit) { $limit = 100; }

  my @get_columns = qw/ pageUrl pageTitle name message timestamp /;
  my $columns = join ', ', @get_columns;

  my @params = ();
  my $sql_str = "SELECT ${columns} FROM bbs_entry";
  if ($pageUrl) {
    $sql_str .= ' WHERE pageUrl = ?';
    push @params, $pageUrl;
  }
  $sql_str .= ' ORDER BY timestamp DESC LIMIT ?';
  push @params, $limit;
  if ($offset) {
    $sql_str .= ' OFFSET ?';
    push @params, $offset;
  }
  
  my $sth = $dbh->prepare($sql_str);
  if (!$sth) { die "$sql_str :\n " . $dbh->errstr; }
  $sth->execute(@params);

  my @data;
  while (my $tbl_ary_ref = $sth->fetchrow_arrayref) {
    my %hash;
    while (my ($i, $key) = each @get_columns) {
      my $key = $get_columns[$i];
      $hash{$key} = $tbl_ary_ref->[$i];
    }
    push @data, \%hash;
  }

  $ret_ref = \@data;
}

print "Content-Type: application/json\n\n";
print JSON::PP::encode_json($ret_ref), "\n";

__END__
