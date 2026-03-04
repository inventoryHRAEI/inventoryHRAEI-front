const fs = require('fs');
(async() => {
  try {
    const parse = require('@kalimahapps/vue-icons/vite-plugin/dist/parse-vue-files.js').default;
    const code = fs.readFileSync('src/components/EquipmentHistoryPanel.vue','utf8');
    const magic = parse(code);
    console.log('----start----');
    console.log(magic.toString().slice(0,1200));
    console.log('----end----');
  } catch (e) {
    console.error('error', e);
  }
})();
