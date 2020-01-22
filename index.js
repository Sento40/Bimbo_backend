/* eslint-disable require-jsdoc */
/* eslint-disable no-unused-vars */
/* eslint-disable new-cap */
/* eslint-disable camelcase */
/* eslint-disable max-len */
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const {graphqlExpress, graphiqlExpress} = require('apollo-server-express');
const {execute, subscribe} = require('graphql');
const {SubscriptionServer} = require('subscriptions-transport-ws');
const {createServer} = require('http');
const {Message, Device, Report, Records, Bus, Panic, Counts, Bindings} = require('./resolvers');
const timestampToDate = require('date-from-timestamp');
const axios = require('axios');
const nodemailer = require('nodemailer');
const path = require('path');
const bcrypt = require('bcryptjs');

const SALT_WORK_FACTOR = 10;

const schema = require('./schema');

const app = express();

mongoose.connect('mongodb://sento:1q2w3e4r5t6y@ds211829.mlab.com:11829/botonera_bimbo');
const db = mongoose.connection;
db.on('error', ()=> console.log('Error al conectar a la BD'))
    .once('open', () => console.log('Conectado a la BD!!'));

app.use(bodyParser.json());
app.use(cors());

// se obtiene la hora
function Unix_timestamp(t) {
  const time = new Date(t * 1000).toLocaleTimeString('es-MX');
  console.log(time);
  return time;
}

// se obtiene la fecha
function Unix_timestamp_date(t) {
  const date = new Date(t * 1000).toLocaleString('es-MX');
  console.log(date);
  return date;
}

app.post('/createMessage', (req, res) => {
  const message = req.body;
  console.log(message);
  
  if(message.device){
    const hora = Unix_timestamp(message.timestamp);
    const fecha = Unix_timestamp_date(message.timestamp);
    console.log(hora, "hora");
    console.log(fecha, "date");
  
      axios({
        url: 'http://localhost:3030/graphql',
        method: 'post',
        data: {
          query: `
              mutation{
                  addMessage(
                      device:"${message.device}",
                      timestamp:"${fecha}",
                      data:"${message.data}"
                  ){
                      device
                  }
              }
          `,
        },
      });
      return res.status(201).json({'message': 'Mensaje procesado', 'Dispositivo': message.device});
    }
    return res.status(200).json({'message': 'Mensaje procesado', 'Dispositivo': message.device});
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

app.use(
    '/graphql',
    graphqlExpress({
      schema,
    })
);

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
app.use(
    '/graphiql',
    graphiqlExpress({
      endpointURL: '/graphql',
      subscriptionsEndpoint: 'ws://localhost:3030/graphql',
    })
);

const PORT = process.env.PORT || 3030;

const server = createServer(app);
server.listen(PORT, () => {
  console.log(`Server now running at port ${PORT}`);
  new SubscriptionServer(
      {
        execute,
        subscribe,
        schema,
      },
      {
        server,
        path: '/graphql',
      }
  );
});
