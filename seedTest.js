/**
 * Created by Administrator on 2017/3/27.
 */
var WebTorrent = require('webtorrent-hybrid');
var client = new WebTorrent({dht:false});

client.seed('w', {announceList: [['ws://localhost:8080']]} , function (torrent) {
    console.log('magnet uri: ' + torrent.magnetURI);

    torrent.on('wire', function (wire, addr) {
        console.log('connected to peer with address ' + addr)
    });
    torrent.on('upload', function(bytes) {
        console.log('upload: '+bytes);
    })
});