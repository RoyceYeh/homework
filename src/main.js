import Vue from "vue";
import App from "./App.vue";

// import router from "./router";
// import AuthPlugin from "./plugins/auth";

import ApolloClient from "apollo-client";
import { InMemoryCache } from "apollo-cache-inmemory";
import { HttpLink } from "apollo-link-http";
import { WebSocketLink } from "apollo-link-ws";
import VueApollo from "vue-apollo";
import { split } from "apollo-link";
import { getMainDefinition } from "apollo-utilities";
import { BootstrapVue, IconsPlugin } from "bootstrap-vue";

// Import Bootstrap an BootstrapVue CSS files (order is important)
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-vue/dist/bootstrap-vue.css";
// Vue.use(AuthPlugin);
Vue.use(VueApollo);
Vue.config.productionTip = false;
// const getHeaders = () => {
// 	const headers = {};
// 	const token = "myadminsecretkey";
// 	headers.authorization = `Bearer ${token}`;

// 	return headers;
// };

// Create an http link:
const link = new HttpLink({
	uri: "http://35.189.161.175:8080/v1/graphql",
	fetch,
	headers: {
		// add API key here
		"x-hasura-admin-secret": "myadminsecretkey",
	},
});

const wsLink = new WebSocketLink({
	uri: "wss://35.189.161.175:8080/v1/graphql",
	fetch,
	options: {
		reconnect: true,
	},
	connectionParams: {
		"x-hasura-admin-secret": "myadminsecretkey",
	},
});

const splitLink = split(
	({ query }) => {
		const definition = getMainDefinition(query);
		return (
			definition.kind === "OperationDefinition" &&
			definition.operation === "subscription"
		);
	},
	wsLink,
	link
);

const client = new ApolloClient({
	link: splitLink,
	cache: new InMemoryCache(),
	connectToDevTools: true,
});
const apolloProvider = new VueApollo({
	defaultClient: client,
});

// Make BootstrapVue available throughout your project
Vue.use(BootstrapVue);
// Optionally install the BootstrapVue icon components plugin
Vue.use(IconsPlugin);

Vue.config.productionTip = false;

new Vue({
	apolloProvider,
	render: (h) => h(App),
}).$mount("#app");
