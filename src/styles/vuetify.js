import '@mdi/font/css/materialdesignicons.css';
import 'vuetify/styles';
import { createVuetify } from 'vuetify';
import { aliases, mdi } from 'vuetify/iconsets/mdi';
import { es } from 'vuetify/locale';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';

//Setting themes

// Copilot suggestion
const tema1 = {
  dark: false,
  colors: {
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

// Grok Suggestions
const ocean = {
  dark: false,
  colors: {
    background: '#F8FAFC',
    surface: '#FFFFFF',
    primary: '#0F766E', // Teal profundo
    secondary: '#334155', // Slate oscuro
    accent: '#14B8A6', // Turquesa brillante
    error: '#EF4444',
    info: '#3B82F6',
    success: '#10B981',
    warning: '#F59E0B',
  },
};

const oceanDark = {
  dark: true,
  colors: {
    background: '#0F172A', // Slate profundo
    surface: '#1E2937', // Slate más claro (elevaciones)
    primary: '#14B8A6', // Turquesa brillante
    secondary: '#94A3B8', // Slate claro
    accent: '#67E8F9', // Cyan vibrante
    error: '#F87171',
    info: '#60A5FA',
    success: '#34D399',
    warning: '#FBBF24',
  },
};

const lavender = {
  dark: false,
  colors: {
    background: '#FAF5FF',
    surface: '#FFFFFF',
    primary: '#7C3AED', // Violeta vibrante
    secondary: '#64748B',
    accent: '#C4B5FD',
    error: '#F87171',
    info: '#60A5FA',
    success: '#4ADE80',
    warning: '#FB923C',
  },
};

const lavenderDark = {
  dark: true,
  colors: {
    background: '#1E1B2E',
    surface: '#2A263F',
    primary: '#A78BFA', // Violeta claro y vibrante
    secondary: '#CBD5E1',
    accent: '#C4B5FD',
    error: '#FB7185',
    info: '#93C5FD',
    success: '#6EE7B7',
    warning: '#FDBA74',
  },
};

const forest = {
  dark: false,
  colors: {
    background: '#F7F9F5',
    surface: '#FFFFFF',
    primary: '#166534', // Verde bosque
    secondary: '#4D4038',
    accent: '#4ADE80',
    error: '#DC2626',
    info: '#22D3EE',
    success: '#16A34A',
    warning: '#EA580C',
  },
};

const forestDark = {
  dark: true,
  colors: {
    background: '#0F1C12',
    surface: '#1A2F21',
    primary: '#4ADE80', // Verde brillante
    secondary: '#A3B18A',
    accent: '#86EFAC',
    error: '#F87171',
    info: '#67E8F9',
    success: '#4ADE80',
    warning: '#FBBF24',
  },
};

const sunset = {
  dark: false,
  colors: {
    background: '#FFF7ED',
    surface: '#FFFFFF',
    primary: '#C2410C', // Naranja profundo
    secondary: '#57534E',
    accent: '#FB7185',
    error: '#F43F5E',
    info: '#0EA5E9',
    success: '#4ADE80',
    warning: '#FACC15',
  },
};

const sunsetDark = {
  dark: true,
  colors: {
    background: '#1C0F0A',
    surface: '#2C1F18',
    primary: '#FB923C', // Naranja cálido brillante
    secondary: '#D1D5DB',
    accent: '#F472B6',
    error: '#F87171',
    info: '#60A5FA',
    success: '#34D399',
    warning: '#FDE047',
  },
};

const indigo = {
  dark: false,
  colors: {
    background: '#F8FAFC',
    surface: '#FFFFFF',
    primary: '#4338CA', // Índigo fuerte
    secondary: '#475569',
    accent: '#818CF8',
    error: '#EF4444',
    info: '#2563EB',
    success: '#10B981',
    warning: '#D97706',
  },
};

const indigoDark = {
  dark: true,
  colors: {
    background: '#111827',
    surface: '#1F2937',
    primary: '#818CF8', // Indigo brillante
    secondary: '#9CA3AF',
    accent: '#A5B4FC',
    error: '#F87171',
    info: '#60A5FA',
    success: '#34D399',
    warning: '#FACC15',
  },
};

const vuetify = createVuetify({
  theme: {
    defaultTheme: 'ocean',
    themes: {
      tema1,
      ocean,
      oceanDark,
      lavender,
      lavenderDark,
      forest,
      forestDark,
      sunset,
      sunsetDark,
      indigo,
      indigoDark,
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
