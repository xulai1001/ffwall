#encoding:utf-8
require "sqlite3"
require "mechanize"
require "json"

$db = SQLite3::Database.new "../db/db.sqlite3"
$m = Mechanize.new
$m.user_agent_alias = "Windows Firefox" 
$interval = ARGV[0].to_i || 3

def load
    ($db.execute "select Id, SmallImage from ffwall").to_h
end

$img = load
# puts $ids
$save_dir = "../../temp/smallimg"

tot = $img.keys.size
puts "Total #{tot}"
count = 0

$img.keys.each do |i|
    begin
        count += 1
        ext = $img[i][/\.\w+$/]
        pathname = "#{$save_dir}/#{i.to_s+ext}"
        if !FileTest.exist? pathname
            $m.get($img[i]).save pathname
            sleep $interval
        else
            pathname = "skip"
        end
    rescue
        File.open("error.log", "a+"){|f| f.puts $img[i], pathname }
    end
    puts "(#{count}/#{tot}) #{$img[i]} -> #{pathname}"
end