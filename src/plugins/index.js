import vuetify from '../styles/vuetify';
import router from '../router/';
import { createPinia } from 'pinia';

export function registerPlugins(app) {
  app.use(vuetify).use(router).use(createPinia());
}
