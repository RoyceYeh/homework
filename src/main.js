import Vue from "vue";
import App from "./App.vue";
// import router from "./router";
// import AuthPlugin from "./plugins/auth";

import ApolloClient from "apollo-client";
import { HttpLink } from "apollo-link-http";
import { InMemoryCache } from "apollo-cache-inmemory";

import VueApollo from "vue-apollo";
import { BootstrapVue, IconsPlugin } from "bootstrap-vue";

// Import Bootstrap an BootstrapVue CSS files (order is important)
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-vue/dist/bootstrap-vue.css";
// Vue.use(AuthPlugin);
Vue.use(VueApollo);
Vue.config.productionTip = false;
const getHeaders = () => {
	const headers = {};
	const token = window.localStorage.getItem("apollo-token");
	if (token) {
		headers.authorization = `Bearer ${token}`;
	}
	return headers;
};

// Create an http link:
const link = new HttpLink({
	uri: "https://hasura.io/learn/graphql",
	fetch,
	headers: getHeaders(),
});

const client = new ApolloClient({
	link: link,
	cache: new InMemoryCache({
		addTypename: true,
	}),
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
