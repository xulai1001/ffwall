require "sqlite3"
require "json"

$data = JSON.load(File.open("ffwall.json"))

if !FileTest.exists? "db.sqlite3"
    $db = SQLite3::Database.new "db.sqlite3"
    # create
    $db.execute """
        create table ffwall(
            Id int primary key not null,
            AreaId int,
            AreaName text,
            GroupId int,
            GroupName text,
            CharacterId bigint,
            RoleId int,
            RoleName text,
            BigImage text,
            SmallImage text
        )   
    """
else
    $db = SQLite3::Database.new "db.sqlite3"
end

def process(v)
    ["Id", "AreaId", "GroupId", "CharacterId", "RoleId"].each do |k|
        v[k] = v[k].to_i
    end
    v.keys.each {|k| v[k] = (v[k].is_a?(String)? "\"#{v[k]}\"" : v[k])}
    values=%w(Id AreaId AreaName GroupId GroupName CharacterId
                RoleId RoleName BigImage SmallImage).map{|k|v[k]}.join(",")
    $db.execute "insert or replace into ffwall values (#{values})"
end

$data.values.each {|v| process(v); STDOUT.write "."}
puts "ok!"
