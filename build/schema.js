'use strict';

/* eslint-disable max-len */
var _require = require('graphql-tools'),
    makeExecutableSchema = _require.makeExecutableSchema;

var _require2 = require('./resolvers'),
    resolvers = _require2.resolvers;

var typeDefs = '\n  type Message {\n    device: String!\n    timestamp: String!\n    data: String!\n  }\n\n  type Query {\n    getMessages: [Message]\n    lastestMessages(dev: String): [Message]\n    deviceMessages(device: String): [Message]\n  }\n\n  type Mutation {\n    addMessage(device: String!, timestamp: String!, data: String!): [Message]\n  }\n\n  type Subscription {\n    newMessageAdded: Message\n  }\n\n  schema {\n    query: Query\n    mutation: Mutation\n    subscription: Subscription\n  }\n';

module.exports = makeExecutableSchema({ typeDefs: typeDefs, resolvers: resolvers });