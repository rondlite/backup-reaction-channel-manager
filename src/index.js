
import graphqlTools from "graphql-tools";

import getAnonymousAccessToken from "@reactioncommerce/api-utils/getAnonymousAccessToken.js";


const tokenInfo = getAnonymousAccessToken();

const {
  makeExecutableSchema,
  makeRemoteExecutableSchema
} = graphqlTools;
import httpLink from "apollo-link-http";
import setContex from "apollo-link-context";
import ApolloLink from "apollo-link";

const { setContext } = setContex;
const { createHttpLink } = httpLink;
import fetch from "node-fetch";
import i18n from "./i18n/index.js";
import schemaSDL from "./schemas/index.js";

const channelsUrl = "http://demandjs-graphql:4001";

const http = createHttpLink({ uri: channelsUrl, fetch });
const authLink = setContext((_, { headers, ...context }) => {
  const { userId, account } = context.graphqlContext;

  const { token } = tokenInfo;
  return {
    headers: {
      ...headers,
      ...(token ? { Authorization: token } : {}),
      ...(userId ? { userId } : { NoUser: true }),
      ...((account && account.companyId) ? { companyId: account.companyId } : { NoCompany: true })
    },
    ...context
  };
});

const link = ApolloLink.from([authLink, http]);

const exSchema = makeExecutableSchema({ typeDefs: schemaSDL });
const remoteSchema = makeRemoteExecutableSchema({ schema: exSchema, link });


// eslint-disable-next-line require-jsdoc
export default async function register(app) {
  await app.registerPlugin({
    label: "demandcluster channels",
    name: "demandcluster",
    version: "1.1.1",
    i18n,
    graphQL: {
      schemas: [remoteSchema]
    }
    // other props
  });
}
