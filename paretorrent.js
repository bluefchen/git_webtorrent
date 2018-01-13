/**
 * Created by Administrator on 2017/2/12.
 */
//一样以readFileSync方式，官方给的种子文件可以查找节点400ms，我给出的最快需要11s，有可能是搭建tracker的问题。


var parseTorrent = require('parse-torrent');
//
var fs = require("fs");
//var torrent_current = parseTorrent(fs.readFileSync((__dirname+ '/sintel.torrent')));
var torrent_current = parseTorrent(fs.readFileSync((__dirname+ '/w.torrent')));
//var torrent_current = 'magnet:?xt=urn:btih:6a9759bffd5c0af65319979fb7832189f4f3c35d&dn=sintel.mp4&tr=udp%3A%2F%2Fexodus.desync.com%3A6969&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Ftracker.internetwarriors.net%3A1337&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969&tr=udp%3A%2F%2Ftracker.openbittorrent.com%3A80&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.fastcast.nz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com&tr=wss%3A%2F%2Ftracker.webtorrent.io&ws=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2Fsintel-1024-surround.mp4'
console.log(torrent_current);
//fs.writeFile('hello-world.txt', torrent_current, function() {});


var WebTorrent = require('webtorrent');
var client = new WebTorrent();

console.time("time of find peer");

var torrent = client.add(torrent_current);

/*
//webtorrent相关
var torrentId = 'https://webtorrent.io/torrents/sintel.torrent';
var client = new WebTorrent({tracker:true,dht: {
    //nodeId: '',    // 160-bit DHT node ID (Buffer or hex string, default: randomly generated)
    bootstrap: ['router.bittorrent.com:6881', 'router.utorrent.com:6881', 'dht.transmissionbt.com:6881'], // bootstrap servers (default: router.bittorrent.com:6881, router.utorrent.com:6881, dht.transmissionbt.com:6881)
    host: false,    // host of local peer, if specified then announces get added to local table (String, disabled by default)
    concurrency: 16 // k-rpc option to specify maximum concurrent UDP requests allowed (Number, 16 by default)
}});
var blobUrl=[];*/
//
//var client = new WebTorrent();
//var torrentId = 'D:/torrent/TongyanProject/w.torrent';
////var torrentbuf = fs.readFile(torrentId);
//
//fs.readFileSync(torrentId, function (err, torrentBuf) {
//    if (err) return (new Error('Invalid torrent identifier me'))
//    console.log(torrentBuf);
//    var torrent = client.add(torrentBuf);
//    torrent.on('wire', function (wire) {
//        console.log('Now connected to ' + torrent.numPeers + ' peers')
//        client.torrents.forEach(function(element) {
//            console.log(element.name); // Return only sintel.mp4
//        });
//    });
//});

//var torrentId ='D:/torrent/TongyanProject/Sintel.torrent';
//var torrent = client.add(torrentbuf);
/*var torrentId2 = 'https://instant.io/torrents/sintel.torrent';
var torrent2 = client.add(torrentId2);*/

// Note: we refer to "peers" as "wires" in the WebTorrent codebase sometimes
torrent.on('wire', function (wire) {
    console.timeEnd("time of find peer");

    console.log('Now connected to ' + torrent.numPeers + ' peers')
    client.torrents.forEach(function(element) {
        console.log(element.name); // Return only sintel.mp4
    });
});

/*
client.add(torrentId, function (torrent) {
    torrent.on('done', function() {
        torrent.files.forEach(function (file) {
            file.getBlobURL(function (err, url) {
                if (err) return log(err.message);
                blobUrl.push(url)
            })
        });
        console.log(blobUrl);
    })});
*/


