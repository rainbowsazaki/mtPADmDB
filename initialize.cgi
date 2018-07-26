#!/usr/bin/perl
use strict;

use CGI::Carp qw(fatalsToBrowser);

use utf8;
use JSON::PP ();
use DBI;



my %output_data = (
  errors => [],
  successes => [],
);

sub addSuccess {
  push @{$output_data{successes}}, @_;
}

sub addError {
  push @{$output_data{errors}}, @_;
}

# 作成するフォルダの名前の配列
my @dir_names = qw/ listJson monsterImages monsterJson monsterImagesLog /; 

foreach my $dir_name (@dir_names) {
  if (!-d "./${dir_name}"){
    if (mkdir "./${dir_name}") {
      &addSuccess("dir '${dir_name}' created.");
    } else {
      &addError("create dir '${dir_name}' is error. : ${!}");
    }
  } else {
    &addError("dir '${dir_name}' is exist.");
  }
}


my $dbh = DBI->connect("dbi:SQLite:dbname=monster.db");
$dbh->{sqlite_unicode} = 1;
$dbh->{AutoCommit} = 0;

open( IN, "< table.sql" );
local $/ = undef;
my $sql = <IN>;
close(IN);

my @sqls = split /;/, $sql;

my $sql_error = 0;

foreach my $sql_one (@sqls) {
  my $sth = $dbh->prepare( $sql_one );

  if (!$sth->execute()) {

    &addError($sth->errstr);
    $sql_error = 1;
  }
}
  
if ($sql_error == 0) {
  &addSuccess('Create DB is success.');
  $dbh->commit;
}

my $json = JSON::PP->new->pretty;

print "Content-Type: application/json\n\n", $json->encode(\%output_data);

__END__
