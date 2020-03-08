const axios = require('axios');
const { datastore, databases, fileDir } = require('./utils');
const fs = require('fs');

async function saveDatastore() {
  for (let db of databases) {
    const resp = await axios.get(`${datastore}/${db}/_all_docs`, {
      params: {
        'include_docs': true,
      },
    });
    const docs = resp.data.rows
      .map(row => row.doc)
      .map(doc => {
        const { _rev, ...persistent } = doc;
        void _rev;
        return persistent;
      });
    const fname = `${fileDir}/${db}.datastore.json`;
    fs.writeFileSync(fname, JSON.stringify(docs));
    console.log('Exported', fname);
  }
}

saveDatastore()
  .then(() => console.log('Datastore saved!'))
  .catch(e => console.log(e));
