import { Token, checkTable } from '../server/token';
// checkTable();
console.log('hello world');


(async () => {

    var tokenContent = JSON.stringify({ userId: 1234, name: 'mai' });
    let token = await Token.create(JSON.stringify(tokenContent), "application/json");
    let t = await Token.parse(token._id);
})();
