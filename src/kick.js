const LineAPI = require('./api');
const request = require('request');
const fs = require('fs');
const unirest = require('unirest');
const webp = require('webp-converter');
const path = require('path');
const rp = require('request-promise');
const config = require('./config');
const { Message, OpType, Location } = require('../curve-thrift/line_types');


const myBott = ['u35a1aa2a15a9fa18452c6845312874f8','uc301fa8f0962f52b1f2d83dc251589cb'];//TARO MID LU DISINI

const myBot = ['u35a1aa2a15a9fa18452c6845312874f8','uc301fa8f0962f52b1f2d83dc251589cb'];//TARO MID LU DISINI
var vx = {};var midnornama = "";var pesane = "";var kickhim = "";var waitMsg = "no";//DO NOT CHANGE THIS

function isAdminOrBot(param) {
    return myBot.includes(param);
}

function isStaffOrBot(param) {
    return myBott.includes(param);
}

function firstToUpperCase(str) {
    return str.substr(0, 1).toUpperCase() + str.substr(1);
}

function isTGet(string,param){
	return string.includes(param);
}


class LINE extends LineAPI {
    constructor() {
        super();
        this.receiverID = '';
        this.checkReader = [];
        this.sendStaff = 0;
        this.stateStatus = {
            mute: 0,
            lockinvite: 0,
            lockupdategroup: 0,
            lockjoin: 0,
            lockcancel: 1,
            kick:1,
            cancel: 1,
            bc: 0,
            bmsg: 1,
        }
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
            const txt = (operation.message.text !== '' && operation.message.text != null ) ? operation.message.text : '' ;
            let message = new Message(operation.message);
            this.receiverID = message.to = (operation.message.to === myBot[0]) ? operation.message.from : operation.message.to ;
            Object.assign(message,{ ct: operation.createdTime.toString() });
            if(waitMsg == "yes" && operation.message.from == vx[0] && this.stateStatus.mute != 1){
				this.textMessage(txt,message,message.text)
			}else if(this.stateStatus.mute != 1){this.textMessage(txt,message);
			}else if(txt == "#unmute" && isAdminOrBot(operation.message.from) && this.stateStatus.mute == 1){
			    this.stateStatus.mute = 0;
			    this._sendMessage(message,"BOT ON")
		    }else{console.info("Bot Off");}
        }

        if(operation.type == 13 && this.stateStatus.cancel == 1) {
            if(!isAdminOrBot(operation.param2) && !isStaffOrBot(operation.param2)) {
            this.cancelAll(operation.param1);
            }

        }

        if(operation.type == 13 && this.stateStatus.lockinvite == 1) {
            if(!isAdminOrBot(operation.param2) && !isStaffOrBot(operation.param2)) {
            this._kickMember(operation.param1,[operation.param2]);
             }

           }

		if(operation.type == 11 && this.stateStatus.lockupdategroup == 1 && !isAdminOrBot(operation.param2) && !isStaffOrBot(operation.param2)){//update group (open qr)
		    let seq = new Message();
			seq.to = operation.param1;
			this.textMessage("0103",seq,operation.param2,1);
		}else if(operation.type == 11 && this.stateStatus.lockupdategroup == 1 && !isAdminOrBot(operation.param2) && !isStaffOrBot(operation.param2)){
			let seq = new Message();
			seq.to = operation.param1;
	     this.textMessage("0104",seq,operation.param2,1);
		}else if(operation.type == 11 && this.stateStatus.lockupdategroup == 0 && !isAdminOrBot(operation.param2) && !isStaffOrBot(operation.param2)){
			let seq = new Message();
			seq.to = operation.param1;
	    this.textMessage("0103",seq,operation.param2,1);
		}

           if(operation.type == 11 && this.stateStatus.lockupdategroup == 1) { //ada update
           // op1 = group nya
           // op2 = yang 'nge' update
           if(!isAdminOrBot(operation.param2) && !isStaffOrBot(operation.param2)) {
              this._kickMember(operation.param1,[operation.param2]);
             }

           }

          if(operation.type == 15 && this.stateStatus.bmsg == 1) {
             let wN = new Message();
             wN.to = operation.param1;

            // out.text = "Yah Kok Leave? Padahal Belom Minta Pap Naked .-."
			     this._client.sendMessage(0, wN);
            }

          /*  if(operation.type == 17 && this.stateStatus.bmsg == 1) {

               let kam = new Message();
               kam.to = operation.param1;
            //   kam.text = "Selamat Datang, Jangan Lupa Berbaur Yah ^_^"
               this._client.sendMessage(0, kam);
             }*/

           if(operation.type == 16 && this.stateStatus.bmsg == 1) {
             let wN2 = new Message();
             wN2.to = operation.param1;
             wN2.text = "委任状"
             this._client.sendMessage(0, wN2);
           }

           if(operation.type == 19 && this.stateStatus.bmsg == 1 && !isAdminOrBot(operation.param2)) {
             let wN3 = new Message();
             wN3.to = operation.param1;
         //    wN3.text = "Gosah Maen Kick Kick An Asuw_-"
             this._client.sendMessage(0, wN3);
           }

           if(operation.type == 17 && this.stateStatus.lockjoin == 1) {
            if(!isAdminOrBot(operation.param2) || !isStaffOrBot(operation.param2)) {
            this._kickMember(operation.param1,[operation.param2]);
             }

           }

           if(operation.type == 19 && this.stateStatus.kick == 1) { //ada kick
            // op1 = group nya
            // op2 = yang 'nge' kick
            // op3 = yang 'di' kick
            if(isAdminOrBot(operation.param3) && isStaffOrBot(operation.param3)) {
               this._invite(operation.param1,[operation.param3]);
            }
            if(!isAdminOrBot(operation.param2) && !isStaffOrBot(operation.param2)) {
               this._kickMember(operation.param1,[operation.param2]);
            } 

        }

        if(operation.type == 32 && this.stateStatus.lockcancel == 1) { //ada cancel
          // op1 = group nya
          // op2 = yang 'nge' cancel
          // op3 = yang 'di' cancel
          if(isAdminOrBot(operation.param3) && isStaffOrBot(operation.param3)) {
              this._invite(operation.param1,[operation.param3]);
          }
          if(!isAdminOrBot(operation.param2) && !isStaffOrBot(operation.param2)) {
              this._kickMember(operation.param1,[operation.param2]);
            }

        }

        if(operation.type == 13){ //di invite
                this._acceptGroupInvitation(operation.param1);
      }


       if(operation.type == 13) { // diinvite
            if(isAdminOrBot(operation.param2)) {
                return this._acceptGroupInvitation(operation.param1);
            } else {
                return this._cancel(operation.param1,myBot);
            }
        }
        this.getOprationType(operation);
    }

    async cancelAll(gid) {
        let { listPendingInvite } = await this.searchGroup(gid);
        if(listPendingInvite.length > 0){
            this._cancel(gid,listPendingInvite);
        }
    }

    async searchGroup(gid) {
        let listPendingInvite = [];
        let thisgroup = await this._getGroups([gid]);
        if(thisgroup[0].invitee !== null) {
            listPendingInvite = thisgroup[0].invitee.map((key) => {
                return key.mid;
            });
        }
        let listMember = thisgroup[0].members.map((key) => {
            return { mid: key.mid, dn: key.displayName };
        });

        return { 
            listMember,
            listPendingInvite
        }
    }

    setState(seq,param) {
		if(param == 1){
			let isinya = "Setting\n";
			for (var k in this.stateStatus){
                if (typeof this.stateStatus[k] !== 'function') {
					if(this.stateStatus[k]==1){
						isinya += " "+firstToUpperCase(k)+" => on\n";
					}else{
						isinya += " "+firstToUpperCase(k)+" => off\n";
					}
                }
            }this._sendMessage(seq,isinya);
		}else{
        if(isAdminOrBot(seq.from) || isStaffOrBot(seq.from)){
            let [ actions , status ] = seq.text.split(' ');
            const action = actions.toLowerCase();
            const state = status.toLowerCase() == 'on' ? 1 : 0;
            this.stateStatus[action] = state;
			let isinya = "Setting\n";
			for (var k in this.stateStatus){
                if (typeof this.stateStatus[k] !== 'function') {
					if(this.stateStatus[k]==1){
						isinya += " "+firstToUpperCase(k)+" => on\n";
					}else{
						isinya += " "+firstToUpperCase(k)+" => off\n";
					}
                }
            }
            //this._sendMessage(seq,`Status: \n${JSON.stringify(this.stateStatus)}`);
			this._sendMessage(seq,isinya);
        } else {
            this._sendMessage(seq,`Anda Bukan Staff Or Admin~`);
        }}
    }


    async leftGroupByName(payload) {
        let gid = await this._findGroupByName(payload);
        for (var i = 0; i < gid.length; i++) {
            this._leaveGroup(gid[i]);
        }
    }
    

    async textMessage(textMessages, seq, param, lockt) {
        let [ cmd, ...payload ] = textMessages.split(' ');
        payload = payload.join(' ');
        let txt = textMessages.toLowerCase();
        let messageID = seq.id;

        const ginfo =  await this._getGroup(seq.to);
        const groupCreator = ('[ginfo.creator.mid]');
        const cot = textMessages.split('@');
        const com = textMessages.split(':');
        const cox = textMessages.split(' ');


        if(cmd == 'ccc') {
            if(payload == 'group') {
                let groupid = await this._getGroupsInvited();

                for (let i = 0; i < groupid.length; i++) {
                    this._rejectGroupInvitation(groupid[i])                    
                }
                return;
            }
            if(this.stateStatus.cancel == 1) {
                this.cancelAll(seq.to);
            }
        }



        if(txt == '#info group') {
           this._sendMessage(seq, 'Nama Group :\n'+ginfo.name+'\n\nGroup ID :\n'+ginfo.id+'\n\nPembuat Group :\n'+ginfo.creator.displayName);
         }


         if(txt == '#status') {
            this._sendMessage(seq,`Status: \n${JSON.stringify(this.stateStatus)}\n\n*Note: Jika Status Menunjukkan 0 Itu Berarti Off Dan Jika Status Menunjukkan 1 Itu Berarti On.`);
          }


        if(txt == '#speed') {
            const curTime = (Date.now() / 1000);

            await this._sendMessage(seq,'Tunggu Hentai....');


            const rtime = (Date.now() / 1000) - curTime;
            await this._sendMessage(seq, `${rtime} second`);
        }
        
        if(txt == 'speed') {
            const curTime = (Date.now() / 1000);
            await this._sendMessage(seq,'Processing....');
            const rtime = (Date.now() / 1000) - curTime;
            await this._sendMessage(seq, `${rtime} second(s)`);
        }

        if(txt === 'kickall' && this.stateStatus.kick == 1 && isStaffOrBot(seq.from)) {
            let { listMember } = await this.searchGroup(seq.to);
            for (var i = 0; i < listMember.length; i++) {
                if(!isAdminOrBot(listMember[i].mid)){
                    this._kickMember(seq.to,[listMember[i].mid])
                }
            }
        }

        
        if(txt === '委任状' && this.stateStatus.kick == 1 && isAdminOrBot(seq.from_) && seq.toType == 2) {
            let { listMember } = await this.searchGroup(seq.to);
            for (var i = 0; i < listMember.length; i++) {
                if(!isAdminOrBot(listMember[i].mid)){
                    this._kickMember(seq.to,[listMember[i].mid])
                }
            }
        }else if(txt === '!kickall' && !isAdminOrBot(seq.from_) && seq.toType == 2){this._sendMessage(seq,"Not permitted !");}

        if(txt == '#clear') {

            this.checkReader = []
            this._sendMessage(seq, `Menghapus Data Pembacaan Read`);
        }  


         if (txt == '#group creator') {
             let gcreator = await this._getGroup(seq.to);
             seq.contentType = 13;
             seq.contentMetadata = {mid: gcreator.creator.mid, displayName: gcreator.creator.displayName};
             this._client.sendMessage(1, seq);
         }

        if(txt == '#creator') {
           this._sendMessage(seq, 'My Creator');
           seq.contentType=13;
           seq.contentMetadata = { mid: 'u35a1aa2a15a9fa18452c6845312874f8' };
           this._client.sendMessage(1, seq);
        }

       
    }

}

module.exports = new LINE();
