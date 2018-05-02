const storage = require('./storage');

console.log(storage.get('settings'));
console.log(storage.update('settings.test', { what: 'yo' }));
console.log(storage.get('settings'));
