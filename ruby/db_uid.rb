# encoding:utf-8
require "sqlite3"
require "digest"
require "json"

$db = SQLite3::Database.new "../db/db.sqlite3"

def load
    $db.execute("select Id, GroupName, RoleName from ffwall").sort{|a, b| a[0].to_i<=>b[0].to_i}
end

$ids = load
# puts $ids[0]
$db.transaction

$ids.each_index {|i|
    if i % 1000 == 999
        $db.commit
        $db.transaction
    end
    uid = Digest::MD5.hexdigest($ids[i][1] + $ids[i][2])
    # puts uid; raise
    $db.execute("update ffwall set uid = \"#{uid}\" where Id = #{$ids[i][0].to_i}")
    STDOUT.write "."
}
$db.commit
puts "ok!"
