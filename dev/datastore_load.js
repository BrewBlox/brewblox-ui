const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { retry } = require('./utils');

// const recreateDatabase = async () => {
//   try {
//     await request.delete(`${host}/${database}`);
//   } catch (e) {
//     // pass
//   }
//   console.log(await retry('create database', async () => {
//     return await request.put(`${host}/${database}`);
//   }));
// };

// const resetModule = async (mod) => {
//   const content = JSON.parse(fs.readFileSync(`${dir}/${mod}.json`, 'utf8'));
//   content.docs = content.docs
//     .map(obj => ({ ...obj, _id: `${mod}__${obj._id}` }));
//   console.log(await retry(`insert ${mod} docs`, async () => {
//     return await request.post({
//       uri: `${host}/${database}/_bulk_docs`,
//       json: content,
//       timeout: 70000,
//     });
//   }));
// };

const resetDatastore = async () => {
  await listFiles();
  // await recreateDatabase();
  // await Promise
  //   .all(modules.map(resetModule));
};

resetDatastore()
  .then(() => {
    console.log('Succesfully reset datastore');
  })
  .catch((e) => {
    console.log(e);
  });
