"use strict";var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");Object.defineProperty(exports, "__esModule", { value: true });exports.default = register;
var _graphqlTools = _interopRequireDefault(require("graphql-tools"));

var _getAnonymousAccessToken = _interopRequireDefault(require("@reactioncommerce/api-utils/getAnonymousAccessToken.js"));

var _index = _interopRequireDefault(require("./i18n/index.js"));







var _apolloLinkHttp = _interopRequireDefault(require("apollo-link-http"));
var _apolloLinkContext = _interopRequireDefault(require("apollo-link-context"));
var _apolloLink = _interopRequireDefault(require("apollo-link"));


var _nodeFetch = _interopRequireDefault(require("node-fetch"));
var _index2 = _interopRequireDefault(require("./schemas/index.js"));const tokenInfo = (0, _getAnonymousAccessToken.default)();const { makeExecutableSchema, makeRemoteExecutableSchema } = _graphqlTools.default;const { setContext } = _apolloLinkContext.default;const { createHttpLink } = _apolloLinkHttp.default;

const channelsUrl = "http://demandjs-graphql:4001";

const http = createHttpLink({ uri: channelsUrl, fetch: _nodeFetch.default });
const authLink = setContext((_, { headers, ...context }) => {
  const { userId, account } = context.graphqlContext;

  const { token } = tokenInfo;
  return {
    headers: {
      ...headers,
      ...(token ? { Authorization: token } : {}),
      ...(userId ? { userId: userId } : { NoUser: true }),
      ...(account && account.companyId ? { companyId: account.companyId } : { NoCompany: true }) },

    ...context };

});

const link = _apolloLink.default.from([authLink, http]);

const exSchema = makeExecutableSchema({ typeDefs: _index2.default });
const remoteSchema = makeRemoteExecutableSchema({ schema: exSchema, link });


async function register(app) {
  await app.registerPlugin({
    label: "demandcluster channels",
    name: "reaction-demandcluster",
    version: "0.1.0",
    i18n: _index.default,
    graphQL: {
      schemas: [remoteSchema] }

    // other props
  });
}