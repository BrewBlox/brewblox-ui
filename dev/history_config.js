const axios = require('axios');
const { history, retry } = require('./utils');

async function run() {
  await retry('Waiting for history service', () => axios.get(`${history}/ping`));
  await axios.post(`${history}/configure`);
}

run()
  .then(() => console.log('Script done!', __filename))
  .catch(e => console.log(e));
