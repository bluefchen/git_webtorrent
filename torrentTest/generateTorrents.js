/**
 * Created by Administrator on 2017/4/28.
 */
//var dir = 'file/home/786d6fcfa55192740003d27ad6d776fe04d6dc5284a0c83f65e08e59f5cbd23b83a9d666180a93dd078d04fc4763f75123a38265f346865aeb4ab3d96ace3483';
var config = {
    ip: '127.0.0.1',
    port: 33129,
    trackerserver: 'ws://www.extratown.com:8080\nwss://www.extratown.com:8443\nudp://www.extratown.com:8080\nhttp://www.extratown.com:8080/announce',
    name: 'Human'
};
//trackerserver: 'ws://www.extratown.com:8080\nwss://www.extratown.com:8443\nudp://www.extratown.com:8080\nhttp://www.extratown.com:8080/announce',

const os = require('os');
const fs = require('fs');
//const fse = require('fs-extra');
const createTorrent = require('create-torrent');
//var basedir = os.homedir() + '/extratown';
//var path = basedir + '/' + dir + '/';
//var torrentpath = basedir + '/' + dir + '.torrent';
if (fs.existsSync(path) === true) {
    var foldername = dir.substr(dir.lastIndexOf('/') + 1);
    var url = 'https://' + config.ip + ':' + config.port + '/' + dir + '/';
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
        private: true,
        announceList: server,
        urlList: url
    });
    createTorrent(path, {
        name: foldername,
        announceList: server,
        urlList: url
    }, function (err, torrent) {
        fs.writeFile(torrentpath, torrent);
    });
}