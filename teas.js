/**
 * Created by Administrator on 2017/2/12.
 */
var fs = require('browserify-fs');



fs.mkdir('/home', function() {
    fs.writeFile('/home/hello-world.txt', 'dsdsdfdf world!\n', function() {
        fs.readFile('/home/hello-world.txt', 'utf-8', function(err, data) {
            console.log(data);
        });
    });
});