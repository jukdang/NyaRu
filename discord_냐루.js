const Discord = require("discord.js");
const 냐루 = new Discord.Client();

const config = require("./config.json");

냐루.login(config.token);

const ytdl = require("ytdl-core");
var Youtube = require("youtube-node");

var servers = {};

냐루.on("ready", () => {
    console.log(`Logged in as ${냐루.user.tag}!`);
});

냐루.on("message", msg => {

    function playQueue(connection, msg){
        var server = servers[msg.guild.id];

        server.dispatcher = connection.play(ytdl(server.queue[0]), {filter: "audioonly"});

        server.dispatcher.on("finish", () => {
            server.queue.shift();

            if(server.queue[0]){
                playQueue(connection, msg);
            }
            else{
                connection.disconnect();
            }
        })
    }

    if(!msg.content.startsWith(config.prefix)) return;
    
    let args = msg.content.substring(config.prefix.length).split(" ");

    for(var i=2;args[i];i++){
        args[1]+=" ";
        args[1]+=args[i];
    }
    console.log(args[1]);

    if(args[0] == "play"){

        if(!msg.member.voice.channel){
            msg.channel.send("보이스채팅방에 들어오라냥");
            return;
        }

        if(!args[1]){
            msg.channel.send("어떤 노래냥");
            return;
        }

        if(!servers[msg.guild.id]) servers[msg.guild.id] = {
            queue: []
        } 

        var server = servers[msg.guild.id];

        //youtube search
        var youtube = new Youtube();
        youtube.setKey("AIzaSyA0ClSFHZ4MOafJaEKvruddvGgnCsStvco");
        youtube.addParam("type","video");

        var searchWord = args[1];
        youtube.search(searchWord,1,function(err, result){
            if(err){
                console.log(err); return;
            }

            console.log(JSON.stringify(result,null,2));
            
            server.queue.push("https://www.youtube.com/watch?v="+result["items"][0]["id"]["videoId"]);


            const embedMsg = new Discord.MessageEmbed()
                .setTitle("「"+result["items"][0]["snippet"]["title"]+"」 추가했다냥!");
            msg.channel.send(embedMsg);
        
        });
        //youtube search

        if(!server.queue[0]){
            msg.member.voice.channel.join().then(connection => {
            playQueue(connection, msg);
        })}
    }

    if(args[0] == "skip"){
        var server = servers[msg.guild.id];
        if(server.dispatcher) server.dispatcher.end();
    }
/*
    if(args[0] == "list"){
        var server = servers[msg.guild.id];
        var index = 0;
        msg.channel.send("\'플레이리스트\'<br>");
        while(server.queue[index]){
            msg.channel.send(index+": "+server.queue[index]+"<br>");
        }
    }
*/
})