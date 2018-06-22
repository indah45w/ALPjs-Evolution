const LineConnect = require('./connect');
const LINE = require('./token.js'); // ganti token.js/main.js sesuai nama bot yg ingin di gunakan
console.info("\n\
=========================================\n\
BotName: LINE Alphat JS\n\
Version: ALPjs-Evolution By:wN\n\
Thanks to @Alfathdirk @NadyaTJ @TCR_TEAM @gogglex @etotJS DLL\n\
=========================================\n\
\nNOTE : This bot is made by @Alfathdirk  @TCR_TEAM !");

/*
| This constant is for auth/login
| Change it to your authToken or your email & password
*/
const auth = {
	authToken: '',
	certificate: '',
	email: '',
	password: ''
}

let client =  new LineConnect();
//let client =  new LineConnect(auth);

client.startx().then(async (res) => {
	while(true) {
		try {
			ops = await client.fetchOps(res.operation.revision);
		} catch(error) {
			console.log('error',error)
		}
		for (let op in ops) {
			if(ops[op].revision.toString() != -1){
				res.operation.revision = ops[op].revision;
				LINE.poll(ops[op])
			}
		}
	}
});
