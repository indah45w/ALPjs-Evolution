//const Command = require('./command');
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
            cancel: 0,
            kick: 0,
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
        const bot = ['u659f68789c0e74d37cdd97c0e879c73e','u653c0c37cdaefb7f583023c02cb8384a','u2297b268eec8988b3c32ffa058b0a248','uea50f7108c44b400a9f70b75f7848fcf','ua89b571977cb320814c4175591db2d23','u90a32052cf753761431423d1ee234591','u8b8fad7361ed7c32a1b9c2448732f528','u7cbe6149e62a5df0d42c46f590760601','u14f64e139a3817afaabe27d237afb36b','u8748762cfc5091da024235c27975a0e0','ue43a33a6ea6350447b7ca1de72e23c2e','u8333a7b83f7742aa795672420d2376df','ud7fb95cc02f0f7d09898669633520040','u7b62234875424b196927381b177112c9','uc486961efab83d61d218fa7d8a735661','u7235ccb3dd6b587f28fec4044901d710'];
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
let nadyaq = new Message();
nadyaq.to = operation.param1;
nadyaq.text = "Woooiii!!! Jangan Main Kick Sembarangan!!! Aku Kick Kamu Yaa, Byeee!!!"
this._client.sendMessage(0,nadyaq);
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
let nadyasayang = new Message();
nadyasayang.to = operation.param1;
nadyasayang.text = "Jangan Ubah Gambar Dan Nama Group/Jangan Dimainin QR-nya -__- Aku Kick Yaa !"+"Cuma Admin Yang Bisa!!!"
this._client.sendMessage(0,nadyasayang);
     }
            if(!this.isAdminOrBot(operation.param2)){
                this._kickMember(operation.param1,[operation.param2]);
            } 
}

if(operation.type == 15) { //leave grup
     {
let nadyasayang = new Message();
nadyasayang.to = operation.param1;
nadyasayang.text = "Byee~Byee... Jangan Balek Lagi Yaa Ke Group... Bikin Semak Aja... Makasih ^_^"

this._client.sendMessage(0,nadyasayang);
     }
  this._invite(operation.param1,[operation.param2]);
}

           if(operation.type == 16){
 // botjoingroup
{
let nadyaq = new Message();
nadyaq.to = operation.param1;
nadyaq.text = "Terima Kasih Telah Invite Saya Di Group Anda ^_^\n\nSilahkan Ketik [/help] Untuk Mengetahui Command Bot Kami.\n\n~NADYA~"
,"Invite Juga Chucky II Kesini ^_^"

this._client.sendMessage(0,nadyaq);
}
{
let nadya = new Message();
nadya.to = operation.param1;
nadya.text = "Invite Juga Chucky II Kesini ^_^"

this._client.sendMessage(0,nadya);
  }
}

if(operation.type == 17) { //joingroup
let nadyaq = new Message();
nadyaq.to = operation.param1;
nadyaq.text = "Hallo Selamat Datang ^_^ Jangan Nakal Yaa Di Group Ini ^_^"

this._client.sendMessage(0,nadyaq);
}

if(operation.type == 32) { //adaygbatalin
let nadyaq = new Message();
nadyaq.to = operation.param1;
nadyaq.text = "Kok Dibatalin? Emangnya Dia Siapa?"

this._client.sendMessage(0,nadyaq);
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
let nadyaq = new Message();
nadyaq.to = operation.param1;
nadyaq.text = "Thx For Add Me 😘 Invite Me To Your Group ^_^"
this._client.sendMessage(0,nadyaq);
}

        if(operation.type == 13) { // diinvite
                this._acceptGroupInvitation(operation.param1);
let nadyaq = new Message();
nadyaq.to = operation.param1;
nadyaq.text = "Jangan Main Invite Sembarangan... Siapa Tau Kicker 😧"

this._client.sendMessage(0,nadyaq);
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
        



       /* this.command('Siapa kamu', this.getProfile.bind(this));
        this.command('Status', `Your Status: ${JSON.stringify(this.stateStatus)}`);
        this.command(`Left ${payload}`, this.leftGroupByName.bind(this));*/
        //this.command('Speed', this.getSpeed.bind(this));
       /* this.command('Kernel', this.checkKernel.bind(this));
        this.command(`Kick ${payload}`, this.OnOff.bind(this));
        this.command(`Cancel ${payload}`, this.OnOff.bind(this));
        this.command(`Qrp ${payload}`, this.OnOff.bind(this));
        this.command(`Kickall ${payload}`,this.kickAll.bind(this));
        this.command(`Cancelall ${payload}`, this.cancelMember.bind(this));
        this.command(`Set`,this.setReader.bind(this));
        this.command(`set`,this.setReader.bind(this));
        this.command(`Cctv`,this.setReader.bind(this));
        this.command(`cctv`,this.setReader.bind(this));
        this.command(`Setpoint`,this.setReader.bind(this));
        this.command(`setpoint`,this.setReader.bind(this));
        this.command(`Recheck`,this.rechecks.bind(this));
        this.command(`recheck`,this.rechecks.bind(this));
        this.command(`Check`,this.rechecks.bind(this));
        this.command(`check`,this.rechecks.bind(this));
        this.command(`Cyduk`,this.rechecks.bind(this));
        this.command(`cyduk`,this.rechecks.bind(this));
        this.command(`Ciduk`,this.rechecks.bind(this));
        this.command(`ciduk`,this.rechecks.bind(this));
        this.command(`Check sider`,this.rechecks.bind(this));
        this.command(`Clearall`,this.clear.bind(this));
        this.command(`Clear`,this.clear.bind(this));
        this.command(`clear`,this.clear.bind(this));
        this.command(`Reset`,this.clear.bind(this));
        this.command(`reset`,this.clear.bind(this));
        this.command('Myid',`Your ID: ${messages.from}`)
        this.command(`ip ${payload}`,this.checkIP.bind(this))
        this.command(`Ig ${payload}`,this.checkIG.bind(this))
        this.command(`Qr ${payload}`,this.qrOpenClose.bind(this))
        this.command(`Joinqr ${payload}`,this.joinQr.bind(this));
        this.command(`spam ${payload}`,this.spam2.bind(this));
        this.command(`Spamgroup ${payload}`,this.spamGroup.bind(this));
        this.command(`Creator`,this.creator.bind(this));
        this.command(`List admin`,this.list.bind(this));
        this.command(`Admin1`,this.admin1.bind(this));
        this.command(`Admin2`,this.admin2.bind(this));
        this.command(`Admin3`,this.admin3.bind(this));
        this.command(`Admin4`,this.admin4.bind(this));
        this.command(`Admin5`,this.admin5.bind(this));
        this.command(`Admin6`,this.admin6.bind(this));
        this.command(`Admin7`,this.admin7.bind(this));
        this.command(`Admin8`,this.admin8.bind(this));
        this.command(`Admin9`,this.admin9.bind(this));
        this.command(`Admin10`,this.admin10.bind(this));
        this.command(`Admin11`,this.admin11.bind(this));
        this.command(`Admin12`,this.admin12.bind(this));
        this.command(`Admin13`,this.admin13.bind(this));
        this.command(`Admin14`,this.admin14.bind(this));
        this.command(`Admin15`,this.admin15.bind(this));
        this.command(`Pap ${payload}`,this.searchLocalImage.bind(this));
        this.command(`Upload ${payload}`,this.prepareUpload.bind(this));
        this.command(`Musik ${payload}`,this.vn.bind(this));
        this.command(`Suara ${payload}`,this.vn.bind(this));
        this.command(`/lagu ${payload}`,this.lagu.bind(this));
        this.command(`Video ${payload}`,this.video.bind(this));
        this.command(`Tag all`,this.tagall.bind(this));
        this.command(`Tagall`,this.tagall2.bind(this));
        this.command(`Help`,this.help.bind(this));
        this.command(`help`,this.help.bind(this));
        this.command(`Menu`,this.help.bind(this));
        this.command(`/help`,this.help.bind(this));
        this.command(`Keyword`,this.help.bind(this));
        this.command(`Key`,this.help.bind(this));
        this.command(`Info kick`,this.infokick.bind(this));
        this.command(`List lagu1`,this.listlagu1.bind(this));
        this.command(`List lagu2`,this.listlagu2.bind(this));
        this.command(`List lagu 1`,this.listlagu1.bind(this));
        this.command(`List lagu 2`,this.listlagu2.bind(this));
        this.command(`Chucky keluar`,this.keluar.bind(this));
        this.command(`#tidak`,this.batal.bind(this));
        this.command(`Gift`,this.gift.bind(this));
        this.command(`gift`,this.gift.bind(this));
        this.command(`Media`,this.media.bind(this));
        this.command(`Invite Juga Chucky II Kesini ^_^`,this.bot2.bind(this));*/


        if(messages.contentType == 13) {
            messages.contentType = 0;
            if(!this.isAdminOrBot(messages.contentMetadata.mid)) {
                this._sendMessage(messages,messages.contentMetadata.mid);
            }
            return;
        }
        





  if (messages.text == '#ya'){
               await this._sendMessage(messages,'Kakak Jahat :( Lain X Jangan Invite Aku Lagi -,-');
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

        // if(cmd == 'Lirik ') {
        //     let lyrics = await this._searchLyrics(payload);
        //     this._sendMessage(seq,lyrics);
        // }

    }

}

module.exports = new LINE();
