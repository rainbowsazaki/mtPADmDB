#!/usr/bin/perl
use strict;

use utf8;

use CGI::Carp qw(fatalsToBrowser);

use CGI;
use DBI;
use LWP::UserAgent;
use HTTP::Request;
use URI::Escape;
use JSON::PP ();
use Time::Piece;

# サブのデータベースに接続する dbh を作成する。
sub create_sub_db_dbh {
  my $dbh = DBI->connect("dbi:SQLite:dbname=./db/sub.db");
  $dbh->{sqlite_unicode} = 1;
  $dbh->{AutoCommit} = 0;
  return $dbh;
}

my $q = CGI->new();
my $chara_name = $q->param('name');
if (!$chara_name) {
  $chara_name = 'バステト';
  utf8::encode($chara_name);
}

# DB の中にデータがないか確認する
my $dbh = create_sub_db_dbh();
my $quoted_name = $dbh->quote($chara_name);
my $sql = <<"EOS";
SELECT digest, createdDatetime FROM search_result 
  WHERE name == ${quoted_name}
EOS

my @row_ary = $dbh->selectrow_array($sql);
my $ret_json;
my $is_old = 0;

if (@row_ary) { 
  $ret_json = $row_ary[0];

  my $t_now = localtime;
  my $t = Time::Piece->strptime($row_ary[1], '%Y-%m-%d %H:%M:%S');
  my $sec = $t_now - $t;
  if ($sec->days > 1) { $is_old = 1; }
}
# データがないか古い場合
if (!$ret_json || $is_old) {
  # Google Custom Search API を利用して取得する。
  my $secret_data = {};
  eval {
    open( IN, "< db/secret.json");
    local $/ = undef;
    $secret_data = JSON::PP::decode_json(<IN>);
    close(IN);
  };

  my $api_key = $secret_data->{google_api_key};
  my $search_engine_id = $secret_data->{google_search_engine_id};
  my $chara_name_copy = $chara_name;
  # ハイフンは Google 検索上だと以降の単語を吹くものを除く指定になるので外す。
  $chara_name_copy =~ s/-//g;

  utf8::decode($chara_name_copy);
  my $query = "パズドラ 評価 ${chara_name_copy}";

  my $url = "https://www.googleapis.com/customsearch/v1?&cx=${search_engine_id}&key=${api_key}&q=" . uri_escape_utf8($query);
  # my $url = "https://www.googleapis.com/customsearch/v1/siterestrict?cx=${search_engine_id}&key=${api_key}&q=" . uri_escape_utf8($query);

  my $request = HTTP::Request->new(GET => $url);
  my $ua = LWP::UserAgent->new;
  my $res = $ua->request($request);
  my $raw_json = $res->content;

  my $hash_ref = JSON::PP::decode_json($raw_json);

  if (exists $hash_ref->{items}) {
    my @a = map { { title => $_->{title}, link => $_->{link}, snippet => $_->{snippet}, formattedUrl => $_->{formattedUrl} } } @{$hash_ref->{items}};
    $ret_json = JSON::PP::encode_json(\@a);
    my $quoted_digest = $dbh->quote($ret_json);
    # 古いデータを削除する。
    if ($is_old) {
      $dbh->do("DELETE FROM search_result WHERE name == ${quoted_name};") || die $dbh->errstr;
    }
    $dbh->do(<<"EOT");
INSERT INTO search_result (name, digest)
  VALUES (${quoted_name}, ${quoted_digest});
EOT
    $dbh->commit;
  } else {
    if (!$ret_json) { $ret_json = '[]'; }
  }
}

print "Content-Type: application/json\n\n";
print $ret_json, "\n";


__END__
