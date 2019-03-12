var net = require('net');
const util = require('util')
var publisher = {}; // เก็บข้อมูล Publisher
var subscriber = {}; // เก็บข้อมูล Subscriber
var countPublisher = 0 ; // นับจำนวน Publisher
var countSubscriber = 0 ; // นับจำนวน Sublisher
var PB , SB ;
//สร้างและส่งคืนเน็ตการเชื่อมต่อตามกระบวนการ . Object ฝั่งเซิร์ฟเวอร์ . ฟังก์ชั่นจะถูกเรียกใช้เมื่อ client เชื่อมต่อกับเซิร์ฟเวอร์นี้
var server = net.createServer(function(client) {
    
    client.setEncoding('utf-8'); // encode ให้อ่านออก
    client.setTimeout(300000); // set เวลาเมื่อรอนานเกินไป

    // เมื่อ client ได้รับข้อมูล.
    client.on('data', function (data) {
        var temp = JSON.parse(data); //แปลงข้อมูลที่ได้รับเข้ามาในรูปแบบ JSON
        var text = temp.split(" "); //แบ่งคำเพื้อแยกข้อมูล
        if(text[0] == 'publish'){ // สำหรับ publisher
            console.log('Client Publisher ['+countPublisher+'] connected. Client local address : ' + client.localAddress + ':' + client.localPort + '. client remote address : ' + client.remoteAddress + ':' + client.remotePort); //แสดงผลว่ามีใครเข้ามาเชื่อมบ้าง
            console.log(' - ['+text[3] +'] received from a publisher and sends it to all subscribers for that topic [' + text[2] + '] - ')
            //เก็บข้อมูล Publisher คนนั้นๆ เป็นรูปแบบ struct
            publisher[countPublisher] = {};
            publisher[countPublisher].address = client; //เก็บข้อมูลการเชื่อมต่อของ publisher นี้
            publisher[countPublisher].ip = text[1]; // เก็บ ip publisher คนนั้น
            publisher[countPublisher].topic = text[2]; //เก็บหัวข้อ topic นี้
            publisher[countPublisher].data = text[3]; //เก็บข้อมูลของ topic นี้

            if(Object.keys(subscriber).length <= 0){
                publisher[countPublisher].address.end('There is currently no subscribe information in this topic .');
                delete publisher[countPublisher];
                countPublisher = -1;
            }else{
                //เพื่อทำการหาว่า Publisher นั้นตรงกับ Subscriber ที่สมัครใน topic ใหนบ้าง
                for (PB = 0; PB < Object.keys(publisher).length; PB++) {
                    if(publisher[PB].ip){
                        for (SB = 0; SB < Object.keys(subscriber).length; SB++) {
                            if(subscriber[SB].ip){
                                if(subscriber[SB].ip == publisher[PB].ip){ // ip ของ publisher ต้องตรงกับ subscriber 
                                    if(subscriber[SB].topic == publisher[PB].topic){ // หัวข้อ Topic จะต้องตรงกันด้วย ถ้าทั้งสองอย่างตรงกันให้เริ่มส่งข้อมูลได้
                                        subscriber[SB].address.end(publisher[PB].data); //ส่งข้อมูลไปหา Subscriber คนนั้นว่า มีข้อมูลใน topic นี้ว่าอย่างไร
                                    }
                                }
                            }
                        }
                    }
                }

                for (PB = 0; PB < Object.keys(publisher).length; PB++) {
                    for (SB = 0; SB < Object.keys(subscriber).length; SB++) {
                        if(subscriber[SB].ip && publisher[PB].ip){
                            if(subscriber[SB].ip == publisher[PB].ip){
                                publisher[PB].address.end('Send data to subscriber complete');
                                countPublisher=-1;
                            } 
                        }
                    }      
                }
            }

            countPublisher ++ ;
        }
        else if(text[0] == 'subscribe'){
            console.log('Client Subscriber ['+countSubscriber+'] connected. Client local address : ' + client.localAddress + ':' + client.localPort + '. client remote address : ' + client.remoteAddress + ':' + client.remotePort); //แสดงผลว่ามีใครเข้ามาเชื่อมบ้าง
            subscriber[countSubscriber] = {};
            subscriber[countSubscriber].address = client; // เก็บข้อมูล address client
            subscriber[countSubscriber].ip = text[1]; // เก็บข้อมูล ip subscriber คนนั้นๆ
            subscriber[countSubscriber].topic =  text[2]; // เก็บหัวข้อที่ client สมัครรับข้อมูล

            //view client conneted detail
            // console.log(util.inspect(client, false, null, true /* enable colors */));
            countSubscriber ++ ;
            // console.log('count > ' + countSubscriber);
        }

        
    });

    // เมื่อ client ส่งข้อมูลเสร็จสมบูรณ์.
    client.on('end', function () {
        console.log('client disconnect.');

        // นับการเชื่อมต่อปัจจุบันทั้งหมด.
        server.getConnections(function (err, count) {
            if(!err)
            {
                // รายงานจำนวนการเชื่อมต่อปัจจุบันในคอนโซลเซิร์ฟเวอร์
                console.log("Server have a %d client", count);
            }else
            {
                console.error(JSON.stringify(err));
            }
        });
    });

    // เมื่อ client หมดเวลา.
    client.on('timeout', function () {
        console.log('Client request time out. ');
    })
});

// ทำให้เซิร์ฟเวอร์เป็นเซิร์ฟเวอร์ TCP ที่รับฟังพอร์ต 9999.
server.listen(9999,'127.0.0.1', function () {

    // รับข้อมูลที่อยู่เซิร์ฟเวอร์.
    var serverInfo = server.address();
    var serverInfoJson = JSON.stringify(serverInfo);
    console.log('TCP server is enabled on this address : ' + serverInfoJson);

    server.on('close', function () {
        console.log('TCP server socket is closed.');
    });

    server.on('error', function (error) {
        console.error(JSON.stringify(error));
    });

});