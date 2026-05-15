const fs = require('fs');
const files = [
  'OpEntradaNew.vue',
  'OpResguardoNew.vue',
  'OpSalidaNew.vue',
  'OpServicioNew.vue'
];
const basePath = 'c:/Users/eduar/OneDrive/Desktop/Nueva/inventoryHRAEI-front/src/views/operations/';

files.forEach(file => {
  const filePath = basePath + file;
  let content = fs.readFileSync(filePath, 'utf8');

  // 1. Accesorio block (REF-EQ-P-001)
  content = content.replace(
    /(\s*<div class="searchable-field">\s*<label class="mini-label">Referencia<\/label>\s*<input[^>]+v-model\.trim="unidad\.referencia"[^>]+placeholder="Ej\. REF-001"[^>]*>\s*<\/div>)\s*<div class="searchable-field">\s*<label class="mini-label">Referencia de Equipo<\/label>\s*<input[^>]+v-model\.trim="unidad\.referenciaEquipo"[^>]+placeholder="Ej\. REF-EQ-P-001"[^>]*>\s*<\/div>/g,
    '$1'
  );

  // 2. Mobiliario block (REF-MOB-001 followed by REF-EQ-001)
  content = content.replace(
    /(\s*<div class="searchable-field">\s*<label class="mini-label">Referencia<\/label>\s*<input[^>]+v-model\.trim="unidad\.referencia"[^>]+placeholder="Ej\. REF-MOB-001"[^>]*>\s*<\/div>)\s*<div class="searchable-field">\s*<label class="mini-label">Referencia de Equipo<\/label>\s*<input[^>]+v-model\.trim="unidad\.referenciaEquipo"[^>]+placeholder="Ej\. REF-EQ-001"[^>]*>\s*<\/div>/g,
    '$1'
  );

  // 3. v-else block: Referencia del Equipo -> Referencia del {{ newItem.tipo === 'equipo-medico' ? 'Equipo' : 'Bien' }}
  content = content.replace(
    /<label class="mini-label">Referencia del Equipo<\/label>(\s*<input[^>]+v-model\.trim="unidad\.referencia"[^>]+placeholder="Ej\. REF-001"[^>]*>)/g,
    '<label class="mini-label">Referencia del {{ newItem.tipo === \'equipo-medico\' ? \'Equipo\' : \'Bien\' }}</label>$1'
  );

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Processed ' + file);
});