import 'babel-polyfill';
import express from 'express';
import bodyParser from 'body-parser';
import logger from 'morgan';
import router from './app';

const server = express();

server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: false }));

server.use(logger('dev'));

server.use(router);

server.listen(7000, () => {
  console.log('App started');
});