'use strict';

/* eslint-disable require-jsdoc */
/* eslint-disable no-unused-vars */
/* eslint-disable new-cap */
/* eslint-disable camelcase */
/* eslint-disable max-len */
var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var cors = require('cors');

var _require = require('apollo-server-express'),
    graphqlExpress = _require.graphqlExpress,
    graphiqlExpress = _require.graphiqlExpress;

var _require2 = require('graphql'),
    execute = _require2.execute,
    subscribe = _require2.subscribe;

var _require3 = require('subscriptions-transport-ws'),
    SubscriptionServer = _require3.SubscriptionServer;

var _require4 = require('http'),
    createServer = _require4.createServer;

var _require5 = require('./resolvers'),
    Message = _require5.Message,
    Device = _require5.Device,
    Report = _require5.Report,
    Records = _require5.Records,
    Bus = _require5.Bus,
    Panic = _require5.Panic,
    Counts = _require5.Counts,
    Bindings = _require5.Bindings;

var timestampToDate = require('date-from-timestamp');
var axios = require('axios');
var nodemailer = require('nodemailer');
var path = require('path');
var bcrypt = require('bcryptjs');

var SALT_WORK_FACTOR = 10;

var schema = require('./schema');

var app = express();

mongoose.connect('mongodb://sento:1q2w3e4r5t6y@ds211829.mlab.com:11829/botonera_bimbo');
var db = mongoose.connection;
db.on('error', function () {
  return console.log('Error al conectar a la BD');
}).once('open', function () {
  return console.log('Conectado a la BD!!');
});

app.use(bodyParser.json());
app.use(cors());

// se obtiene la hora
function Unix_timestamp(t) {
  var time = new Date(t * 1000).toLocaleTimeString('es-MX');
  console.log(time);
  return time;
}

// se obtiene la fecha
function Unix_timestamp_date(t) {
  var date = new Date(t * 1000).toLocaleString('es-MX');
  console.log(date);
  return date;
}

app.post('/createMessage', function (req, res) {
  var message = req.body;
  console.log(message);

  if (message.device) {
    var hora = Unix_timestamp(message.timestamp);
    var fecha = Unix_timestamp_date(message.timestamp);
    console.log(hora, "hora");
    console.log(fecha, "date");

    axios({
      url: 'https://back-bimbo.herokuapp.com/graphql',
      method: 'post',
      data: {
        query: '\n              mutation{\n                  addMessage(\n                      device:"' + message.device + '",\n                      timestamp:"' + fecha + '",\n                      data:"' + message.data + '"\n                  ){\n                      device\n                  }\n              }\n          '
      }
    });
    return res.status(201).json({ 'message': 'Mensaje procesado', 'Dispositivo': message.device });
  }
  return res.status(200).json({ 'message': 'Mensaje procesado', 'Dispositivo': message.device });
});

/* app.use('/graphql',(req,res,next) => {
    const token  = req.headers['authorization'];
    try{
        req.user = verifyToken(token)
        next();
    }catch(error){
        res.status(401).json({message:error.message})
    }
}) */

app.use('/graphql', graphqlExpress({
  schema: schema
}));

/* app.use('/graphiql', (req, res, next) => {
  const token = req.headers['authorization'];
  try {
    req.user = verifyToken(token);
    next();
  } catch (error) {
    res.status(401).json({message: error.message});
  }
}); */

// ws://movilidad-back.herokuapp.com/graphql
app.use('/graphiql', graphiqlExpress({
  endpointURL: '/graphql',
  subscriptionsEndpoint: 'ws://back-bimbo.herokuapp.com/graphql'
}));

var PORT = process.env.PORT || 3030;

var server = createServer(app);
server.listen(PORT, function () {
  console.log('Server now running at port ' + PORT);
  new SubscriptionServer({
    execute: execute,
    subscribe: subscribe,
    schema: schema
  }, {
    server: server,
    path: '/graphql'
  });
});