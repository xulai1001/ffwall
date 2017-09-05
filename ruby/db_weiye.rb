# encoding:utf-8
require "sqlite3"
require "digest"
require "json"
require "csv"

def quote(s); "\'#{s}\'"; end

class Weiye
    attr_accessor :group
    attr_accessor :role
    attr_accessor :value
    attr_accessor :details

    def set(h); h.each{|k, v| instance_variable_set("@#{k}", v) }; end

    def uid; Digest::MD5.hexdigest(@group+@role); end
    def complete; @details[:complete] ? 1 : 0; end

    def sqlvalues
        [quote(self.uid), quote(self.group), "\"#{self.role}\"", self.complete, quote(JSON.dump(self.details))].join(",")
    end
end

$details = {
    complete: { file: "0_complete.csv", shift: 1, layout: ["group", "role"], condition: true},
    odin: { file: "1_odin.csv", shift: 1, layout: ["group", "role", "value"], condition: 3 },
    queen: { file: "2_queen.csv", shift: 1, layout: ["group", "role"], condition: true},
    flower: { file: "3_flower.csv", shift: 1, layout: ["group", "role"], condition: true},
    behemoth: { file: "4_behemoth.csv", shift: 1, layout: ["group", "role"], condition: true},
    a2s: { file: "5_a2s.csv", shift: 1, layout: ["group", "role", "value"], condition: 5},
    a6s: { file: "6_a6s.csv", shift: 1, layout: ["group", "role", "value"], condition: 5},
    a10s: { file: "7_a10s.csv", shift: 1, layout: ["group", "role", "value"], condition: 5},
    bird: { file: "8_bird.csv", shift: 1, layout: ["group", "role", "value"], condition: 5},
    ally: { file: "9_ally.csv", shift: 1, layout: ["group", "role"], condition: true}
}

$roles = {}

$db = SQLite3::Database.new "../db/db.sqlite3"

def list_transaction(list, ntime=1000)
    $db.transaction
    count = 0
    list.each do |item|
        count += 1
        if count % ntime == 0
            $db.commit
            $db.transaction
        end
        yield item
    end
    $db.commit
end

def parse(key, meta)
    data = CSV.read meta[:file], encoding:"utf-8"
    meta[:shift].times { data.shift }
    data.each {|item|
        w = Weiye.new
        w.set(meta[:layout].zip(item).to_h)
        w.details ||= {}
        if meta[:condition] == true
            w.details[key] = true
        else
            w.value = w.value.to_i
            w.details[key] = { value: w.value, ok: w.value>=meta[:condition] }
        end
        # puts w.sqlvalues
        $roles[w.uid] ||= w 
        $roles[w.uid].details.update(w.details)
    }
end

$details.each {|k, v| parse k, v}

# puts $roles

list_transaction $roles.values do |v|
    begin
    $db.execute "insert or replace into ffwork values (#{v.sqlvalues})"
    STDOUT.write "."
    rescue =>e
        puts v.sqlvalues, e 
        raise
    end
end
puts "ok!"
