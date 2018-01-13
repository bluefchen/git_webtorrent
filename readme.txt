1，生成torrent文件：1，配置需要被生成torrent的文件夹，webseed server的地址、端口，以及tracker server的信息，通过“create-torrent”模块生成toorent文件
2，将数据传输配置为webtorrent模式：将worker的postMessage字段修改为从webtorrent获取到的数据信息，并传递给worker进行解析
3，打包：通过browserify将torrent与js文件进行打包。
4，查看连接记录：console下 localStorage.debug = ‘*'进行查看torrent的连接记录
