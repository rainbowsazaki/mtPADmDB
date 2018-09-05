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
my @dir_names = qw/ listJson monsterImages monsterJson monsterImagesLog monsterIcons monsterIconsLog /; 

foreach my $dir_name (@dir_names) {
  if (!-d "./${dir_name}"){
    if (mkdir "./${dir_name}") {
      &addSuccess("dir '${dir_name}' created.");
    } else {
      &addError("create dir '${dir_name}' is error. : ${!}");
    }
  } else {
    &addSuccess("dir '${dir_name}' is exist.");
  }
}

# 必要な JSON ファイルがない場合は空のオブジェクトの JSON を作成する
my @json_names = qw/ evolution_list.json image_list.json leader_skill_list.json monster_data.json monster_list.json skill_list.json /;
foreach my $json_name (@json_names) {
  my $path = "./listJson/${json_name}";
  if (-e $path) {
    &addSuccess("json file '${path}' is exist.");
  } else {
    if (open(DATAFILE, "> ${path}")) {
      print DATAFILE '{}';
      close(DATAFILE);
      &addSuccess("json file '${path}' is created.");
    } else {
      &addError("json file '${path}' is can't create.");
    }
  }
}

my $db_path = './db/monster.db';
if (-e $db_path) {
  &addSuccess('DB file is exist.');
} else {

  my $dbh = DBI->connect("dbi:SQLite:dbname=${db_path}");
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

    if (!$sth) { die $sql_one; }

    if (!$sth->execute()) {

      &addError($sth->errstr);
      $sql_error = 1;
    }
  }
    
  if ($sql_error == 0) {
    &addSuccess('Create DB is success.');
    $dbh->commit;
  }
}

my $json = JSON::PP->new->pretty;

print "Content-Type: application/json\n\n", $json->encode(\%output_data);

__END__
