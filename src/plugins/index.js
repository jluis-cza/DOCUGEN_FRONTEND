import vuetify from '../common/styles/vuetify';
import router from '../common/router/';
import { createPinia } from 'pinia';

export function registerPlugins(app) {
  app.use(vuetify).use(router).use(createPinia());
}
