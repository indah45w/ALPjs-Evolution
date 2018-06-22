const Command = require('./command');
const { Message, OpType, Location, Profile } = require('../curve-thrift/line_types');
const LineAPI = require('./api');
const request = require('request');
const fs = require('fs');
const unirest = require('unirest');
const webp = require('webp-converter');
const path = require('path');
const rp = require('request-promise');
const config = require('./config');

class LINE extends LineAPI {
    constructor() {
        super();
        this.receiverID = '';
        this.checkReader = [];
        this.stateStatus = {
            cancel: 1,
            kick: 1,
        };
        this.messages;
        this.payload;
        this.stateUpload =  {
                file: '',
                name: '',
                group: '',
                sender: ''
            }
    }


    get myBot() {
        const bot = ['uc301fa8f0962f52b1f2d83dc251589cb'];
        return bot; 
    }

    isAdminOrBot(param) {
        return this.myBot.includes(param);
    }

    getOprationType(operations) {
        for (let key in OpType) {
            if(operations.type == OpType[key]) {
                if(key !== 'NOTIFIED_UPDATE_PROFILE') {
                    console.info(`[* ${operations.type} ] ${key} `);
                }
            }
        }
    }

    poll(operation) {
        if(operation.type == 25 || operation.type == 26) {
            let message = new Message(operation.message);
            this.receiverID = message.to = (operation.message.to === this.myBot[0]) ? operation.message.from : operation.message.to ;
            Object.assign(message,{ ct: operation.createdTime.toString() });
            this.textMessage(message)
        }

        if(operation.type == 13 && this.stateStatus.cancel == 1) {
            this._cancel(operation.param2,operation.param1);
            
        }

        if(operation.type == 11 && !this.isAdminOrBot(operation.param2) && this.stateStatus.qrp == 1) {
            this._kickMember(operation.param1,[operation.param2]);
            this.messages.to = operation.param1;
            this.qrOpenClose();
        }

        if(operation.type == 19) { //ada kick
     {
let wN3 = new Message();
wN3.to = operation.param1;
wN3.text = "Woooiii!!! Jangan Main Kick Sembarangan!!!"
this._client.sendMessage(0,wN3);
     }
            // op1 = group nya
            // op2 = yang 'nge' kick
            // op3 = yang 'di' kick

            if(!this.isAdminOrBot(operation.param2)){
                this._kickMember(operation.param1,[operation.param2]);
            } 
            if(!this.isAdminOrBot(operation.param3)){
                this._invite(operation.param1,[operation.param3]);
            }

        }

if(operation.type == 11) { //bukattupQR
     {
let wN2 = new Message();
wN2.to = operation.param1;
wN2.text = "Jangan Ubah Gambar Dan Nama Group/Jangan Dimainin QR-nya -__- Aku Kick Yaa !"+"Cuma Admin Yang Bisa!!!"
this._client.sendMessage(0,wN2);
     }
            if(!this.isAdminOrBot(operation.param2)){
                this._kickMember(operation.param1,[operation.param2]);
            } 
}

if(operation.type == 15) { //leave grup
     {
let wN2 = new Message();
wN2.to = operation.param1;
wN2.text = "Byee~Byee... Jangan Balek Lagi Yaa Ke Group...Baper Tuh Orang :v \n║Semoga Bahagia ya 😊... Makasih ^_^"

this._client.sendMessage(0,wN2);
     }
  this._invite(operation.param1,[operation.param2]);
}

           if(operation.type == 16){
 // botjoingroup
{
let wN3 = new Message();
wN3.to = operation.param1;
wN3.text = "Terima Kasih Telah Invite Saya Di Group ^_^"
//,"Invite Juga Chucky II Kesini ^_^"

this._client.sendMessage(0,wN3);
}
/*{
let nadya = new Message();
nadya.to = operation.param1;
nadya.text = "Invite Juga Chucky II Kesini ^_^"

this._client.sendMessage(0,nadya);
  }*/
}

if(operation.type == 17) { //joingroup
let wN3 = new Message();
wN3.to = operation.param1;
wN3.text = "Hallo Selamat Datang ^_^ jangan lupa cek NOTE kak Semua info ada di note\n Semoga Betah Disini  ^😍😙==========🙋"

this._client.sendMessage(0,wN3);
}

if(operation.type == 32) { //adaygbatalin
let wN3 = new Message();
wN3.to = operation.param1;
wN3.text = "Kok Dibatalin?"

this._client.sendMessage(0,wN3);
     }

        if(operation.type == 55){ //ada reader
            const idx = this.checkReader.findIndex((v) => {
                if(v.group == operation.param1) {
                    return v
                }
            })
            if(this.checkReader.length < 1 || idx == -1) {
                this.checkReader.push({ group: operation.param1, users: [operation.param2], timeSeen: [operation.param3] });
            } else {
                for (var i = 0; i < this.checkReader.length; i++) {
                    if(this.checkReader[i].group == operation.param1) {
                        if(!this.checkReader[i].users.includes(operation.param2)) {
                            this.checkReader[i].users.push(operation.param2);
                            this.checkReader[i].timeSeen.push(operation.param3);
                        }
                    }
                }
            }
        }


        if(operation.type == 5) { // diadd
let wN3 = new Message();
wN3.to = operation.param1;
wN3.text = "Thx For Add Me 😘 ^_^"
this._client.sendMessage(0,wN3);
}

        if(operation.type == 13) { // diinvite
                this._acceptGroupInvitation(operation.param1);
let wN3 = new Message();
wN3.to = operation.param1;
wN3.text = "Jangan Main Invite Sembarangan...😧"

this._client.sendMessage(0,wN3);
}
        this.getOprationType(operation);
    }

    command(msg, reply) {
        if(this.messages.text !== null) {
            if(this.messages.text === msg.trim()) {
                if(typeof reply === 'function') {
                    reply();
                    return;
                }
                if(Array.isArray(reply)) {
                    reply.map((v) => {
                        this._sendMessage(this.messages, v);
                    })
                    return;
                }
                return this._sendMessage(this.messages, reply);
            }
        }
    }

    async textMessage(messages) {
        this.messages = messages;
        let payload = (this.messages.text !== null) ? this.messages.text.split(' ').splice(1).join(' ') : '' ;
        let receiver = messages.to;
        let sender = messages.from;
        

        if(messages.contentType == 13) {
            messages.contentType = 0;
            if(!this.isAdminOrBot(messages.contentMetadata.mid)) {
                this._sendMessage(messages,messages.contentMetadata.mid);
            }
            return;
        }
        

  if (messages.text == '#ya'){
               await this._sendMessage(messages,' Lain X Jangan Invite Aku Lagi -,-');
     {
this._leaveGroup(this.messages.to);
     }
     }
     
  if(messages.text == '#speed') {
            const curTime = (Date.now() / 1000);

            await this._sendMessage(messages,'Tunggu....');


            const rtime = (Date.now() / 1000) - curTime;
            await this._sendMessage(messages, `${rtime} second`);
        }
        if(this.stateUpload.group == messages.to && [1,2,3].includes(messages.contentType)) {
            if(sender === this.stateUpload.sender) {
                this.doUpload(messages);
                return;
            } else {
                messages.contentType = 0;
                this._sendMessage(messages,'Wrong Sender !! Reseted');
            }
            this.resetStateUpload();
            return;
        }


    }

}

module.exports = new LINE();
