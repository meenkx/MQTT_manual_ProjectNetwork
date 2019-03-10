var net = require('net');
const readline = require('readline');

const readCommand = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// เป็น function ที่สร้างและส่งข้อมูลกลับ net. Socket object เพื่อแทนไคลเอ็นต์ TCP.
function getConnPublisher(topic){

    var option = {
        host:'localhost',
        port: 9999
    }

    // สร้าง TCP client.
    var client = net.createConnection(option, function () {
        console.log('Publisher is publish topic : ' + topic);
        console.log('local address : ' + client.localAddress + ":" + client.localPort);
        console.log('remote address : ' + client.remoteAddress + ":" + client.remotePort);
        console.log('-----------------------------------------------------');
    });

    client.setTimeout(300000);
    client.setEncoding('utf8');

    // เมื่อได้รับข้อมูลจาก server ตอบสนองมา.
    client.on('data', function (data) {
        console.log('Receive information from the server : ' + data);
    });

    // เมื่อการเชื่อมต่อถูกตัดการเชื่อมต่อ.
    client.on('end',function () {
        console.log('Client socket disconnect. ');
    });

    client.on('timeout', function () {
        console.log('Client connection timeout. ');
    });

    client.on('error', function (err) {
        console.error(JSON.stringify(err));
    });

    return client;
}


// ถาม
readCommand.question('Publish command >> ', (answer) => {
    var textSplit = answer.split(" ");
    // สร้าง node client socket นี้.
    var clientPB = getConnPublisher(textSplit[2]);
    clientPB.write(JSON.stringify(answer));
    readCommand.close();
});


// publish 202.44.12.85 /room1/light value='on'
// publish 10.0.3.2 /room2/lcd value='hello world'