/**
 * Created by Administrator on 2017/4/28.
 */
//var dir = 'WebBIMTest/Tongyan';
var dir = 'WebBIMTest/Shougang';
var config = {
    ip: '111.231.17.43',
    port: 1272,
/*
    trackerserver: 'ws://www.extratown.com:8080\nwss://www.extratown.com:8443\nudp://www.extratown.com:8080\nhttp://www.extratown.com:8080/announce',
*/
    trackerserver: 'udp://tracker.openbittorrent.com:80\nudp://tracker.leechers-paradise.org:6969\nudp://tracker.coppersurfer.tk:6969\nudp://tracker.opentrackr.org:1337\nudp://explodie.org:6969\nudp://zer0day.ch:1337\nwss://tracker.btorrent.xyz\nwss://tracker.openwebtorrent.com\nwss://tracker.fastcast.nz',
    name: 'Human'
};
const fs = require('fs');
const createTorrent = require('create-torrent');
var basedir = 'D:/torrent';
var path = basedir + '/' + dir + '/';
var torrentpath = basedir + '/' + dir + '.torrent';
if (fs.existsSync(path) === true) {
    var foldername = dir.substr(dir.lastIndexOf('/') + 1);
    var url = 'http://' + config.ip + ':' + config.port + '/torrent/' + 'WebBIMTest' + '/';
    var webseed = [];
    var files = fs.readdirSync(path);
    if (files.length == 1) {
        path = path + files[0];
        url = url + files[0];
        foldername = files[0];
    }
    var trackerserver = config.trackerserver.toString();
    var tracker = trackerserver.split("\n");
    var server = [];
    for (var k in tracker) {
        var arr = [];
        arr.push(tracker[k]);
        server.push(arr);
    }
    console.log(path);
    console.log({
        name: foldername,
        comment: config.name,
        createdBy: config.name,
        private: false,
        announceList: server,
        urlList: url,
        torrentpath:torrentpath
    });
    createTorrent(path, {
        name: foldername,
        announceList: server,
        urlList: url
    }, function (err, torrent) {
        fs.writeFile(torrentpath, torrent);
    });
}
