require "json"
require "mechanize"
require "FileUtils"

data = JSON.load(File.open("ffwall1.json"))
arg = ARGV[0].encode(Encoding::UTF_8, Encoding::GBK)

$m = Mechanize.new

result = data.find_all {|v| v.values.any?{|va| va.include? arg}}
puts result
result.each {|x|
    puts "#{x["GroupName"]} #{x["RoleName"]}"
    ext = x["SmallImage"][-3..-1]
    FileUtils.rm "img.#{ext}" rescue nil
    $m.get(x["SmallImage"]).save "img.#{ext}"
    `start img.#{ext}`
}