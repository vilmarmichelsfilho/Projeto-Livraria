// Registra somente o componente de ícones para preservar os estilos da livraria.
import '@mdi/font/css/materialdesignicons.css';
import { createVuetify } from 'vuetify';
import { VIcon } from 'vuetify/components/VIcon';
import { aliases, mdi } from 'vuetify/iconsets/mdi';

export default createVuetify({
  components: { VIcon },
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: { mdi },
  },
});
