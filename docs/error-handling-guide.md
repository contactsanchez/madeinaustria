# Guía de Manejo de Errores Preventivo para Tina CMS

## Problema Resuelto

Se implementó un sistema preventivo para manejar archivos de contenido faltantes en el sitio web, evitando que la aplicación se caiga cuando faltan archivos `.md` referenciados en el contenido.

## Cambios Implementados

### 1. Archivo de Utilidades: `helpers/safe-queries.js`

Se creó un archivo con funciones utilitarias para manejar queries de Tina CMS de forma segura:

- `safeQuery()` - Ejecuta queries con manejo de errores y datos de fallback
- `safeGlobalSettings()` - Query seguro para configuraciones globales
- `safeContactsConnection()` - Query seguro para contactos
- `safeAboutData()` - Query seguro para datos "about"
- `safeFetchPhotographerBySlug()` - Búsqueda segura de fotógrafos por slug
- `safeFetchDirectorBySlug()` - Búsqueda segura de directores por slug

### 2. Páginas Actualizadas

#### `pages/index.js`
- Implementó manejo de errores preventivo en `getStaticProps`
- Agregó validaciones seguras en el componente principal
- Funciones helper actualizadas con verificaciones de null/undefined

#### `pages/photographers/[slug].js`
- Actualizado para usar las utilidades de consulta segura
- Manejo de errores en `getStaticPaths` y `getStaticProps`

#### `pages/directors/[slug].js` (parcialmente actualizado)
- Agregadas las importaciones para consultas seguras
- Actualizado `getStaticPaths` con manejo de errores

### 3. Características del Sistema Preventivo

✅ **Manejo de archivos faltantes**: Si un archivo `.md` referenciado no existe, se usa un fallback en lugar de romper la aplicación

✅ **Logging informativo**: Se registran warnings en console cuando se detectan archivos faltantes

✅ **Datos de fallback**: Cada query tiene datos de respaldo apropiados para mantener la funcionalidad

✅ **Validaciones defensivas**: Verificaciones de null/undefined en todas las funciones de procesamiento de datos

## Cómo Aplicar a Otras Páginas

Para aplicar este sistema preventivo a otras páginas del sitio:

1. **Importar las utilidades**:
   ```javascript
   import { safeQuery, safeGlobalSettings, /* otras... */ } from "../../helpers/safe-queries";
   ```

2. **Reemplazar queries directos con versiones seguras**:
   ```javascript
   // ❌ Antes (inseguro)
   const data = await client.queries.someQuery();
   
   // ✅ Después (seguro)
   const data = await safeQuery(
     () => client.queries.someQuery(),
     { /* datos de fallback */ }
   );
   ```

3. **Agregar validaciones defensivas**:
   ```javascript
   // ❌ Antes
   const value = data.someProperty.nestedProperty;
   
   // ✅ Después
   const value = data?.someProperty?.nestedProperty || 'fallback';
   ```

## Páginas que Podrían Necesitar Actualización

- `pages/[slug].js`
- `pages/posts/[slug].js`
- `pages/posts/index.js`
- `pages/directors/index.js`
- `pages/photographers/index.js`

## Beneficios

1. **Resistencia a errores**: El sitio no se cae por archivos faltantes
2. **Mejor experiencia de desarrollo**: Warnings informativos en lugar de crashes
3. **Graceful degradation**: La funcionalidad se mantiene con datos de fallback
4. **Mantenibilidad**: Código más robusto y fácil de debuggear
5. **Escalabilidad**: Sistema reutilizable para futuras páginas

## Ejemplo de Uso

```javascript
export const getStaticProps = async () => {
  // Queries seguras con fallbacks apropiados
  const gs = await safeGlobalSettings(client);
  const contacts = await safeContactsConnection(client);
  const about = await safeAboutData(client);
  
  return {
    props: {
      gs_data: gs.data.global_settings,
      contacts_data: getContactDataArray(contacts),
      about_data: about.data.about,
    },
  };
};
```

Este sistema asegura que el sitio web sea robusto y maneje graciosamente cualquier archivo de contenido faltante sin interrumpir la experiencia del usuario.
