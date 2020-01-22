const { PubSub, withFilter } = require('graphql-subscriptions');
const pubsub = new PubSub();
const mongoose = require('mongoose');
import { Schema } from 'mongoose';
import Messages from './models/Message'

const messages = [];

const Message = Messages

const resolvers = {
  Query: {
    getMessages(parentValue, params) {
      const messages = Message.find().exec()
      return messages;
    },
    lastestMessages(parentValue, params) {
      const lastMess = Message.find({device: params.dev}).sort({timestamp: -1}).limit(3).exec()
      return lastMess
    },
    deviceMessages(parentValue, params) {
      const devMess = Message.find({device: params.device}).exec()
      return devMess
    }
  },
  Mutation: {
    addMessage(parentValue, { device, timestamp, data }) {
      console.log("in graph addMessage");
      messages.push({ device, timestamp, data });

      const mess = new Message({ device: device, data: data, timestamp: timestamp })
      mess.save().then(() => console.log("message creado"))

      pubsub.publish('newMessageAdded', {
        newMessageAdded: { device, timestamp, data }
      });
      
      return messages;
    }
  },
  Subscription: {
    newMessageAdded: {
      subscribe: withFilter(
        () => pubsub.asyncIterator('newMessageAdded'),
        (params, variables) => true
      )
    }
  }
};

module.exports = {
  resolvers,
  Message
}