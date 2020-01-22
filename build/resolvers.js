'use strict';

var _mongoose = require('mongoose');

var _Message = require('./models/Message');

var _Message2 = _interopRequireDefault(_Message);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _require = require('graphql-subscriptions'),
    PubSub = _require.PubSub,
    withFilter = _require.withFilter;

var pubsub = new PubSub();
var mongoose = require('mongoose');


var messages = [];

var Message = _Message2.default;

var resolvers = {
  Query: {
    getMessages: function getMessages(parentValue, params) {
      var messages = Message.find().exec();
      return messages;
    },
    lastestMessages: function lastestMessages(parentValue, params) {
      var lastMess = Message.find({ device: params.dev }).sort({ timestamp: -1 }).limit(3).exec();
      return lastMess;
    },
    deviceMessages: function deviceMessages(parentValue, params) {
      var devMess = Message.find({ device: params.device }).exec();
      return devMess;
    }
  },
  Mutation: {
    addMessage: function addMessage(parentValue, _ref) {
      var device = _ref.device,
          timestamp = _ref.timestamp,
          data = _ref.data;

      console.log("in graph addMessage");
      messages.push({ device: device, timestamp: timestamp, data: data });

      var mess = new Message({ device: device, data: data, timestamp: timestamp });
      mess.save().then(function () {
        return console.log("message creado");
      });

      pubsub.publish('newMessageAdded', {
        newMessageAdded: { device: device, timestamp: timestamp, data: data }
      });

      return messages;
    }
  },
  Subscription: {
    newMessageAdded: {
      subscribe: withFilter(function () {
        return pubsub.asyncIterator('newMessageAdded');
      }, function (params, variables) {
        return true;
      })
    }
  }
};

module.exports = {
  resolvers: resolvers,
  Message: Message
};