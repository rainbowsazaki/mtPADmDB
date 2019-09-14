#!/usr/local/bin/perl
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


sub run_sql_file {
  my ($db_path, $sql_path) = @_;

  my $dbh = DBI->connect("dbi:SQLite:dbname=${db_path}");
  $dbh->{sqlite_unicode} = 1;
  $dbh->{AutoCommit} = 0;

  open( IN, "< ${sql_path}");
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
    &addSuccess("Update DB '${db_path}' is success.");
    $dbh->commit;

    local $dbh->{AutoCommit} = 1;
    $dbh->do('VACUUM;');
  }
}

&run_sql_file('./db/monster.db', './db/updateDb.sql');



my $json = JSON::PP->new->pretty;

print "Content-Type: application/json\n\n", $json->encode(\%output_data);

__END__
