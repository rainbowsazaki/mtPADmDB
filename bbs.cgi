#!/usr/local/bin/perl
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
  my @errors = ();
  my $json = $q->param("POSTDATA");
  my $data;
  if ($json eq "") {
    push @errors ,'データなし'
  } else {
    $data = JSON::PP::decode_json($json);

    my $page_url = $data->{'pageUrl'};
    my $page_title = $data->{'pageTitle'};
    my $name = $data->{'name'};
    my $message = $data->{'message'};

    if (!$page_url) {
      push @errors, 'ページURLがありません。';
    }
    if ($name && length $name > 50) {
      push @errors, '名前が長すぎます。';
    }
    if (!$message) {
      push @errors, '本文がありません。';
    } elsif (length $message > 5000) {
      push @errors, '本文が長すぎます。';
    }
  }

  if (@errors) {
    $ret_ref = {
      "result" => 'error',
      "errors" => \@errors
    };
  } else {
    my $sql_str = q/
INSERT INTO bbs_entry
  (pageUrl, pageTitle, name, message, ipAddress, state) 
  VALUES (?, ?, ?, ?, ?, 1);
    /;
    my $ip_address = $ENV{'REMOTE_ADDR'};
    $dbh->do($sql_str, undef, $data->{'pageUrl'}, $data->{'pageTitle'}, $data->{'name'}, $data->{'message'}, $ip_address);
    $dbh->commit;

    $ret_ref = {
      "result" => 'success'
    };
  }

} elsif ($ENV{'REQUEST_METHOD'} eq 'GET') {
  # 指定されたページURL、リミット、オフセットに基づいた書き込みログ情報をを返す。
  my $pageUrl = $q->param('pageUrl');
  my $limit = $q->param('limit');
  my $offset = $q->param('offset');
  if (!$limit) { $limit = 100; }

  my @get_columns = qw/ id pageUrl pageTitle name message timestamp /;
  my $columns = join ', ', @get_columns;

  my @params = ();
  my $sql_str = "SELECT ${columns} FROM bbs_entry WHERE state = 1";
  if ($pageUrl) {
    # URL の末尾に / が有るのと無いのの両方を取得する。
    if ($pageUrl =~ /^(.*)\/$/) { $pageUrl = $1; }
    $sql_str .= ' AND (pageUrl = ? OR pageUrl = ?)';
    push @params, $pageUrl, $pageUrl . '/';
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
    for (my $i = 0; $i < @get_columns; $i++) {
      my $key = $get_columns[$i];
      $hash{$key} = $tbl_ary_ref->[$i];
    }
    push @data, \%hash;
  }
  # 時系列を降順から昇順にする。
  @data = reverse @data;
  $ret_ref = \@data;
}

print "Content-Type: application/json\n\n";
print JSON::PP::encode_json($ret_ref), "\n";

__END__
