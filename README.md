# Portafolio Personal — Thomas Castillo

Portafolio web personal construido con tecnologías web estándar, sin frameworks ni herramientas de construcción. Diseñado para ser rápido, accesible y completamente responsivo.

---

## Tecnologías utilizadas

- **HTML5** — estructura semántica y accesible
- **CSS3** — estilos, animaciones y diseño responsivo
- **JavaScript (ES6+)** — interactividad y lógica del cliente

Sin dependencias externas, sin npm, sin bundlers. Solo archivos estáticos.

---

## Estructura del proyecto

```
Mi Portafolio/
├── index.html                  # Página principal (hero)
├── README.md
├── Thomas-Castillo-Perfil.md   # Perfil profesional
│
├── pages/
│   ├── sobre-mi.html           # Sobre mí
│   ├── habilidades.html        # Habilidades con barras animadas
│   ├── curriculum.html         # Currículum / CV (descarga PDF)
│   ├── certificaciones.html    # Certificaciones con filtros y lightbox
│   ├── servicios.html          # Servicios ofrecidos
│   └── contacto.html           # Contacto
│
├── css/
│   └── styles.css              # Único archivo CSS compartido por todas las páginas
│
├── js/
│   └── script.js               # Único archivo JS compartido por todas las páginas
│
└── assets/
    ├── img/
    │   ├── certificaciones/    # Imágenes de los certificados
    │   └── ...                 # Foto de perfil, favicon, etc.
    └── cv/
        └── Thomas-Castillo.pdf # CV descargable
```

---

## Arquitectura

El sitio usa una arquitectura **multi-página**: cada sección del menú de navegación es un archivo HTML independiente. No hay una sola página con scroll entre secciones; cada página se carga por separado.

Todas las páginas comparten un único `styles.css` y un único `script.js`. Las rutas relativas se ajustan según la ubicación del archivo:

- `index.html` (raíz) usa `css/styles.css`, `js/script.js` y links del tipo `pages/sobre-mi.html`
- `pages/*.html` usan `../css/styles.css`, `../js/script.js` y links relativos entre ellas (`sobre-mi.html`, `habilidades.html`, etc.)

---

## Funcionalidades principales

### Modo oscuro
Implementado con una clase `dark` en el elemento `<html>`. El estado se guarda en `localStorage` con la clave `tc-dark-mode` y respeta la preferencia del sistema operativo (`prefers-color-scheme`) si el usuario no ha elegido manualmente.

### Transiciones de página
Al hacer clic en un enlace interno, el cuerpo recibe la clase `page-exit` que activa una animación CSS de salida. Después de 260 ms se navega a la nueva página, que entra con una animación de entrada (`@keyframes pageFadeIn`).

### Animaciones de scroll (IntersectionObserver)
Los elementos con la clase `.reveal` aparecen con una transición cuando entran en el viewport, usando la API `IntersectionObserver`. Las barras de habilidades animan un contador numérico desde 0 % hasta el nivel definido en `data-level`.

### Menú móvil (circle expansion)
En pantallas de 900 px o menos, el menú del navbar se reemplaza por un botón circular fijo en la parte inferior de la pantalla. Al pulsarlo, un círculo del color primario se expande hasta cubrir toda la pantalla y los enlaces aparecen con una animación escalonada. El ícono hamburguesa se transforma en una X.

### Parallax en el hero
En la página principal, mover el cursor sobre la sección hero desplaza suavemente la tarjeta y los blobs de fondo en sentidos opuestos, usando `requestAnimationFrame` para no bloquear el hilo principal. En dispositivos táctiles esta animación se desactiva automáticamente.

### Lightbox de certificaciones
Al hacer clic en "Ver" sobre una certificación, se abre un visor de imagen a pantalla completa con una animación de apertura que parte del punto donde se hizo clic.

### Filtros de certificaciones
Los botones de categoría (Todas, Cloud, Redes, Linux, Ágil, Dev) muestran u ocultan las tarjetas de certificación según el atributo `data-cat` de cada una.

### Copiar al portapapeles
Los botones de "Copiar email" usan la API `navigator.clipboard` para copiar texto al portapapeles con feedback visual.

---

## Diseño responsivo

El layout se adapta a cualquier tamaño de pantalla:

- **Desktop (> 900 px):** navbar horizontal con los enlaces visibles, grid de habilidades y servicios en varias columnas.
- **Móvil (≤ 900 px):** navbar simplificado solo con el logo y el botón de modo oscuro, menú de navegación por el botón circular inferior, columnas reducidas a una.

---

## Cómo visualizarlo

Por ser un sitio estático no requiere servidor ni instalación. Solo abrir `index.html` directamente en el navegador, o servir la carpeta con cualquier servidor HTTP estático:

```bash
# Con Python
python -m http.server 5500

# Con Node.js (npx)
npx serve .
```

---

## Autor

**Thomas Castillo**
Estudiante de Ingeniería de Software — Universidad Manuela Beltrán, Bogotá
[github.com/thomys57364](https://github.com/thomys57364) · tc57364@gmail.com
