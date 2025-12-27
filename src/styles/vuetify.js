import '@mdi/font/css/materialdesignicons.css';
import 'vuetify/styles';
import { createVuetify } from 'vuetify';
import { aliases, mdi } from 'vuetify/iconsets/mdi';
import { es } from 'vuetify/locale';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';

//Setting themes
const light1 = {
  dark: false,
  colors: {
    // Copilot suggestion
    background: '#FFFFFF',
    surface: '#FFFFFF',
    primary: '#1976D2',
    secondary: '#424242',
    accent: '#82B1FF',
    error: '#FF5252',
    info: '#2196F3',
    success: '#4CAF50',
    warning: '#FB8C00',
  },
};

const vuetify = createVuetify({
  theme: {
    defaultTheme: 'light1',
    themes: {
      light1,
    },
  },
  icons: {
    iconFont: 'mdi',
    defaultSet: 'mdi',
    aliases,
    sets: { mdi },
  },
  locale: {
    locale: 'es',
    fallback: 'es',
    messages: { es },
  },
  components,
  directives,
});

export default vuetify;

// Todo: make vuetify to recognize material design icons
