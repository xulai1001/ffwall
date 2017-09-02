# encoding:utf-8
require "mechanize"
require "json"
require "pp"

$api_root = "http://act.ff.sdo.com/20170824UploadImg/Server/ImgService.ashx"
$m = Mechanize.new

def api_call(meth)
    ret = $m.post "#{$api_root}?method=#{meth}"
    h = JSON.parse ret.body
    h["Attach"]
end

def image_num; api_call("imagenum").to_i; end

def image_list
    l = JSON.parse api_call("imagelist")
    ret = {}
    l.each {|item| ret[item["Id"].to_i] = item}
    ret
end

begin

total = image_num
result = {}
puts "Total #{total}"
while result.size < total*0.95
    total = image_num
    result.merge! image_list
    puts "#{result.size} / #{total}"
    sleep 1
end

rescue Interrupt
end

File.open("ffwall.json", "w") {|f| f.puts JSON.dump(result)}
puts "Written #{result.size} items."