/* eslint-disable global-require */
const view = require('./view.json');

view.layouts = [
  require('./layout.json'),
];

const requestHandler = (request, response) => response.json(view);

module.exports = requestHandler;
