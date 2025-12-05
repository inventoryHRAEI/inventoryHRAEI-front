# Inventario Frontend

## Instalación

1. Instala dependencias:
   ```sh
   npm install
   ```
2. Inicia el servidor de desarrollo:
   ```sh
   npm run dev
   ```

## Notas
- Usa componentes de bits.dev y vue-liquid-glass.
- El backend debe estar corriendo en http://localhost:3001.
- Configura el proxy en `vite.config.js` si cambias el puerto del backend.

## Datepicker (Flowbite)

- El componente `DatePicker.vue` ahora intenta usar `flowbite-datepicker` automáticamente si está instalado; en caso contrario, usa `flatpickr` como fallback.
- Para usar el Datepicker de Flowbite (UI y comportamiento), instala `flowbite-datepicker` y Tailwind + Flowbite si quieres que tenga el estilo oficial. Recomendación mínima:

```powershell
npm install flowbite-datepicker --save
```

- Si quieres el estilo oficial de Flowbite debes integrar Tailwind CSS y el plugin Flowbite (pasos en https://flowbite.com/docs/getting-started/quickstart/).
   - La hoja de estilos del Datepicker de Flowbite se procesa a través de la pipeline de Tailwind y se importa desde `src/styles/tailwind.css` (que a su vez importa `src/styles/vendor/flowbite-datepicker.css`). Evita intentar importar `node_modules/flowbite-datepicker/dist/css/datepicker.min.css` directamente, ya que Vite puede bloquear el acceso por `exports` y PostCSS necesita procesar `@layer`.

- En la vista `OpEntrada.vue` el componente `<DatePicker>` se fuerza a Flowbite con `:forceFlowbite="true"` (usa `flatpickr` como fallback si la importación dinámica falla).
