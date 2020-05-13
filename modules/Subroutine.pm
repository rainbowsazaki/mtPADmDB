use strict;
use utf8;
use Compress::Zlib;

# JSON と MessagePack で指定データを保存する。
sub save_json_and_msgpack {
  my ($path_base, $data_ref) = @_;

  my $json = JSON::PP::encode_json($data_ref);
  open(DATAFILE, "> ${path_base}.json") or die("error :$!");
  print DATAFILE $json;
  close(DATAFILE);

  my $ot_gz = gzopen("${path_base}.json.gz", 'wb');
  $ot_gz->gzwrite($json);
  $ot_gz->gzclose();

  # MessagePack での保存は休止中
  # my $mp = Data::MessagePack->new;
  # $mp->prefer_integer(1);
  # open(DATAFILE, "> ${path_base}.mpac") or die("error :$!");
  # print DATAFILE $mp->encode($data_ref);
  # close(DATAFILE);
}

# 第１引数に与えられた値を数値型に変換して返す。
# undef や 空文字列、 "null" の場合は undef (json 上の null に該当する) にする。
# 配列やハッシュのリファレンスが与えられた場合は要素すべてを変換した結果を返す。
sub to_number {
  my ($target) = @_;
  if (ref $target eq 'ARRAY') {
    return [ map { &to_number($_) } @{$target} ];
  } elsif (ref $target eq 'HASH') {
    return { map { $_ => &to_number($target->{$_}) } keys %{$target} };
  } else {
    if (!defined $target || $target eq '' || $target eq 'null') {
      return undef;
    }
    return $target + 0;
  }
}

# ハッシュ内の任意の要素を数値型に変換する。
# 第１引数 対象のハッシュのリファレンス
# 第２引数以降 変換対象の要素のキー。
sub to_number_with_key {
  my ($target_ref, @keys) = @_;
  foreach my $key (@keys) {
    if (!exists $target_ref->{$key}) { next; }
    $target_ref->{$key} = &to_number($target_ref->{$key});
  }
}

# ハッシュ内の任意の要素の全角英数字ピリオドスペースを半角に変換し、
# 半角括弧プラスパーセントアンパサンドイコールを全角に変換する。
# 冒頭・末尾のスペースの取り除きも行う。
# 第１引数 対象のハッシュのリファレンス
# 第２引数以降 変換対象の要素のキー。
sub to_hankaku_with_key {
  my ($target_ref, @keys) = @_;
  foreach my $key (@keys) {
    if (!exists $target_ref->{$key}) { next; }
    $target_ref->{$key} =~ tr/０-９Ａ-Ｚａ-ｚ．　/0-9A-Za-z. /;
    $target_ref->{$key} =~ tr/\(\)\+%&=/（）＋％＆＝/;
    $target_ref->{$key} =~ s/^[\r\n\s　]*(.*?)[\r\n\s　]*$/$1/;
  }
}

# キー or 添字の階層を _ でつないだキーを指定してハッシュ・配列の階層にアクセスする処理。
#
sub joined_key_access {
  my ($ref, $key, $value) = @_;
  my $is_set = ($#_ >= 2);

  my @splited_keys = split '_', $key;
  my @types = map { ($_ =~ /^[0-9]+$/) ? 0 : 1 } @splited_keys;
  my $target = $ref;

  for my $j (0 .. $#splited_keys - 1) {        
    my $v = @splited_keys[$j];

    my $insert_ref = ($types[$j + 1] == 0) ? [] : {};
    if ($types[$j] == 0) {
      if (!exists $target->[$v]) {
        if ($is_set) { $target->[$v] = $insert_ref; }
        else { return undef; }
      }
      $target = $target->[$v];
    } elsif ($types[$j] == 1) {
      if (!exists $target->{$v}) {
        if ($is_set) { $target->{$v} = $insert_ref; }
        else { return undef; }
      }
      $target = $target->{$v};
    }
  }

  my $ret_val;
  if ($types[$#splited_keys] == 0) {
    $ret_val = $target->[$splited_keys[$#splited_keys]];
    if ($is_set) { $target->[$splited_keys[$#splited_keys]] = $value; }
  } else {
    $ret_val = $target->{$splited_keys[$#splited_keys]};
    if ($is_set) { $target->{$splited_keys[$#splited_keys]} = $value; }
  }

  return $ret_val;
}

# ハッシュのデータをもとに where 句で使用する文字列と置き換え値の配列
#
sub create_where_sql_and_value {
  my ($where_hash_ref) = @_;

  my @where_strings;
  my @where_values;

  for my $key (keys %$where_hash_ref) {
    my $value = $where_hash_ref->{$key};
    if (!defined $value) {
      $key = "${key} IS NULL";
      push @where_strings, $key;
    } else {
      $key = "${key} = ?";
      
      push @where_strings, $key;
      push @where_values, $value;
    }
  }

  return (\@where_strings, \@where_values);
}

# 指定条件を満たす１行の指定項目を取得する。
#
sub get_one_row_data {
  my ($dbh, $table_name, $column_names_ref, %where_data) = @_;

  my $where_values_ref = [];
  
  my $check_sql = "SELECT " . join(', ', @$column_names_ref) . " FROM ${table_name}";
  if (%where_data) {
    my $where_strings_ref;
    ($where_strings_ref, $where_values_ref) = &create_where_sql_and_value(\%where_data);
    $check_sql .= " WHERE " . join(' AND ', @$where_strings_ref);
  }
  my $sth = $dbh->prepare($check_sql);
  if (!$sth) { die $check_sql . ":\n" . $dbh->errstr; }
  $sth->execute(@$where_values_ref);
  return $sth->fetchrow_arrayref;
}

# 同一内容のデータが存在しているか確認する。
#
sub check_same_table_data {
  my ($dbh, $table_name, %check_data) = @_;
  my $tbl_ary_ref = &get_one_row_data($dbh, $table_name, [ 'COUNT(*)' ], %check_data);
  if (!$tbl_ary_ref) { return undef; }
  return ($tbl_ary_ref->[0] > 0);
}

# テーブルに指定された内容のデータを追加する。
#
sub insert_table_data {
  my ($dbh, $table_name, %insert_data) = @_;

  my @insert_keys = keys %insert_data;
  my @insert_values = map { $insert_data{$_} } @insert_keys;

  my $update_sql = "INSERT INTO ${table_name} (" . join(', ', @insert_keys) .
    ') VALUES (' .  join(', ', map { '?' } @insert_values) . ');';
  my $sth = $dbh->prepare($update_sql);
  if (!$sth) {
    die $dbh->errstr;
    return 0;
  }
  if (!$sth->execute(@insert_values)) {
    die $sth->errstr;
    return 0;
  }
  return 1;
}

# テーブルに指定された内容のデータを更新する。
#
sub update_table_data {
  my ($dbh, $table_name, $where_hash_ref, %update_data) = @_;

  my @update_keys = keys %update_data;
  my @update_values = map { $update_data{$_} } @update_keys;

  my $update_sql = "UPDATE ${table_name} SET " . 
    join ' AND ', map { "'$_' = ?" } @update_keys;
  
  my $where_values_ref = [];
  if ($where_hash_ref) {
    my $where_strings_ref;
    ($where_strings_ref, $where_values_ref) = &create_where_sql_and_value($where_hash_ref);
    my $where_string = join ' AND ', @$where_strings_ref;
    if ($where_string) { $update_sql .= " WHERE ${where_string}"; }
  }

  my $sth = $dbh->prepare($update_sql);
  if (!$sth) {
    die $dbh->errstr;
    return 0;
  }
  if (!$sth->execute(@update_values, @$where_values_ref)) {
    die $sth->errstr;
    return 0;
  }
  return 1;
}

# ハッシュデータをDBに格納するためのハッシュデータに変更する。
#
sub hash_to_table_data {
  my ($data, $db_tale_info) = @_;
  my %ret;
  for my $key (@$db_tale_info) {
    my ($hash_key, $db_column_name);
    $hash_key = $db_column_name = $key;
    if (ref $key eq 'ARRAY') {
      $hash_key = $key->[0];
      $db_column_name = $key->[1];
    }
    my $value = &joined_key_access($data, $hash_key);
    if ($hash_key eq 'superAwakens') {
      $value = JSON::PP::encode_json($value);
    }
    $ret{$db_column_name} = $value;
  }
  return \%ret;
}

# db から取り出した行のデータの配列から、任意のキーのものを対象としたハッシュを作成する。
#
sub db_row_to_hash {
  my ($row_array_ref, $keys_ref, @pickup_indexes) = @_;
  if (!@pickup_indexes) {
    @pickup_indexes = (0 .. (scalar @$keys_ref) - 1);
  }
  my %data;
  for my $i (@pickup_indexes) {
    my $key = $keys_ref->[$i];
    my $value = $row_array_ref->[$i];
    if ($key eq 'superAwakens' && $value) {
      $value = JSON::PP::decode_json($value);
    }
    if ($key) {
      &joined_key_access(\%data, $key, $value);
    }
  }
  return \%data;
}

# テーブルの情報を取得し、先頭の項目の値をキーとして、指定項目をハッシュにしたものを格納したハッシュを作成する。
# $column_names_ref は取得項目名を格納した配列。
# 取得項目名の指定は、ハッシュ上のキー名とデータベース上の項目名の2つを格納した配列。
# ハッシュ上とデータベース上での名前が同じ場合は配列ではなく文字列での指定も可能。
# option
#   remove_key_column - 真値だとキーに使用した項目を列情報のハッシュの中から削除する。
sub table_to_hash {
  my ($dbh, $table_name, $column_names_ref, $where, $option) = @_;
  my $a = &table_to_array(@_);

  my $key_column_name = $column_names_ref->[0];
  if (ref $key_column_name eq 'ARRAY') { $key_column_name = $key_column_name->[0] };

  my %data;
  for my $d (@$a) {
    my $key = $d->{$key_column_name};
    if ($option->{remove_key_column}) { delete $d->{$key_column_name}; }
    $data{$key} = $d;
  }
  return \%data;
}

# テーブルの情報を取得し、指定項目を配列にしたものを格納したハッシュを作成する。
# $column_names_ref は取得項目名を格納した配列。
# 取得項目名の指定は、ハッシュ上のキー名とデータベース上の項目名の2つを格納した配列。
# ハッシュ上とデータベース上での名前が同じ場合は配列ではなく文字列での指定も可能。
# option
#   order - SQL文の order by 句 の指定。文字列もしくは文字列の配列で指定する。
#           項目名と、必要に応じて ASC or DESC を１つの文字列で指定する。
sub table_to_array {
  my ($dbh, $table_name, $column_names_ref, $where, $option) = @_;

  my @hash_keys;
  my @db_column_names;
  for my $column_name (@$column_names_ref) {
      if (ref $column_name eq 'ARRAY') {
        push @hash_keys, $column_name->[0];
        push @db_column_names, $column_name->[1];
      } else {
        push @hash_keys, $column_name;
        push @db_column_names, $column_name;
      }
  }

  my $where_values_ref = [];
  my $sql_str = 'SELECT ' . join(',', @db_column_names) . " FROM ${table_name}";  
  if ($where) {
    my $where_strings_ref;
    ($where_strings_ref, $where_values_ref) = &create_where_sql_and_value($where);
    my $where_string = join ' AND ', @$where_strings_ref;
    if ($where_string) { $sql_str .= " WHERE ${where_string}"; }
  }

  if ($option->{order}) {
    my $orders = $option->{order};
    if (ref $orders eq '') { $orders = [ $orders ]; }
    $sql_str .= ' ORDER BY ' . join ', ', @$orders;
  }
  if ($option->{limit}) {
    $sql_str .= " LIMIT $option->{limit}";
  }
  if ($option->{offset}) {
    $sql_str .= " OFFSET $option->{offset}";
  }

  my $sth = $dbh->prepare($sql_str);
  if (!$sth) { die "$sql_str :\n " . $dbh->errstr; }
  $sth->execute(@$where_values_ref);

  my @data;
  while (my $tbl_ary_ref = $sth->fetchrow_arrayref) {
    push @data, &db_row_to_hash($tbl_ary_ref, \@hash_keys);
  }
  return \@data;
}

1;
