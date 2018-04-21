import { Token, checkTable } from '../server/token';
import * as assert from 'assert';

it('Token create test', async function () {
    var tokenContent = JSON.stringify({ userId: 1234, name: 'mai' });
    var token = await Token.create(JSON.stringify(tokenContent), "application/json");
    assert.equal(token != null, true);
    assert.equal(token._id != null, true);
})

it('Parse token', async function () {
    var tokenContent = JSON.stringify({ userId: 1234, name: 'mai' });
    var token = await Token.create(JSON.stringify(tokenContent), "application/json");
    var t = await Token.parse(token._id);
    assert.equal(t != null, true);
})

