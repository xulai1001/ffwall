require "json"

data = JSON.load(File.open("ffwall.json"))

File.open("ffwall1.json", "w") {|f|
    f.puts "["
    data.keys.sort{|x, y|x.to_i <=> y.to_i}.each {|k| f.puts JSON.dump(data[k]) + ","}
    f.puts "]"
}
