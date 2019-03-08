var net = require('net');
var publisher = {}; // เก็บข้อมูล Publisher
var subscriber = {}; // เก็บข้อมูล Subscriber
var countPublisher = 0 ; // นับจำนวน Publisher
var countSubscriber = 0 ; // นับจำนวน Sublisher
var positionTopic = 0 ;  // เก็บตำแหน่งของหัวข้อนั้น ๆ
var tempTopic ;
var tempIp ;
//สร้างและส่งคืนเน็ตการเชื่อมต่อตามกระบวนการ . Object ฝั่งเซิร์ฟเวอร์ . ฟังก์ชั่นจะถูกเรียกใช้เมื่อ client เชื่อมต่อกับเซิร์ฟเวอร์นี้
var server = net.createServer(function(client) {
    
    console.log('Client เชื่อมต่อเข้ามา. Client local address : ' + client.localAddress + ':' + client.localPort + '. client remote address : ' + client.remoteAddress + ':' + client.remotePort); //แสดงผลว่ามีใครเข้ามาเชื่อมบ้าง
    client.setEncoding('utf-8'); // encode ให้อ่านออก
    client.setTimeout(300000); // set เวลาเมื่อรอนานเกินไป

    // เมื่อ client ได้รับข้อมูล.
    client.on('data', function (data) {
        var temp = JSON.parse(data); //แปลงข้อมูลที่ได้รับเข้ามาในรูปแบบ JSON
        var text = temp.split(" "); //แบ่งคำเพื้อแยกข้อมูล
        if(text[0] == 'publish'){ // สำหรับ publisher

            //เก็บข้อมูล Publisher คนนั้นๆ เป็นรูปแบบ struct
            publisher[countPublisher] = {};
            publisher[countPublisher].address = client; //เก็บข้อมูลการเชื่อมต่อของ publisher นี้
            publisher[countPublisher].ip = text[1]; // เก็บ ip publisher คนนั้น
            publisher[countPublisher].topic = text[2]; //เก็บหัวข้อ topic นี้
            publisher[countPublisher].data = text[3]; //เก็บข้อมูลของ topic นี้

            if(Object.keys(subscriber).length <= 0){
                publisher[countPublisher].address.end('ณ นี้ยังไม่มีข้อมูลผู้สมัคร');
                delete publisher[countPublisher];
            }else{
                //เพื่อทำการหาว่า Publisher นั้นตรงกับ Subscriber ที่สมัครใน topic ใหนบ้าง
                for (let SB = 0; SB < Object.keys(subscriber).length; SB++) {
                    for (let PB = 0; PB < Object.keys(publisher).length; PB++) {
                        if(subscriber[SB].topic == publisher[PB].topic && subscriber[SB].ip == publisher[PB].ip){
                            subscriber[SB].address.end(publisher[PB].data); //ส่งข้อมูลไปหา Subscriber คนนั้นว่า มีข้อมูลใน topic นี้ว่าอย่างไร
                            publisher[PB].address.end('ส่งข้อมูลไปยัง subscriber สมบูรณ์');
                            delete publisher[PB];
                            delete subscriber[SB];
                        }
                    }
                }
            }

            // countPublisher ++ ;
        }
        else if(text[0] == 'subscribe'){
            subscriber[countSubscriber] = {};
            subscriber[countSubscriber].address = client; // เก็บข้อมูล address client
            subscriber[countSubscriber].ip = text[1]; // เก็บข้อมูล ip subscriber คนนั้นๆ
            subscriber[countSubscriber].topic =  text[2]; // เก็บหัวข้อที่ client สมัครรับข้อมูล
            countSubscriber ++ ;
        }

        
    });

    // เมื่อ client ส่งข้อมูลเสร็จสมบูรณ์.
    client.on('end', function () {
        console.log('ผู้เชื่อมต่อถูกตัดขาด.');

        // นับการเชื่อมต่อปัจจุบันทั้งหมด.
        server.getConnections(function (err, count) {
            if(!err)
            {
                // รายงานจำนวนการเชื่อมต่อปัจจุบันในคอนโซลเซิร์ฟเวอร์
                console.log("ยังมีจำนวนผูัใช้เชื่อมต่ออยู่ %d คน ", count);
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
server.listen(9999, function () {

    // รับข้อมูลที่อยู่เซิร์ฟเวอร์.
    var serverInfo = server.address();
    var serverInfoJson = JSON.stringify(serverInfo);
    console.log('TCP server ถูกเปิดใช้งานบนที่อยู่ address นี้ : ' + serverInfoJson);

    server.on('close', function () {
        console.log('TCP server socket is closed.');
    });

    server.on('error', function (error) {
        console.error(JSON.stringify(error));
    });

});