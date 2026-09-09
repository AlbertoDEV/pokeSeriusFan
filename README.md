# Pokémon Champions Companion

Una herramienta web estática de soporte táctico y consulta rápida diseñada para ayudar a entrenadores en combates exigentes del juego **Pokémon Champions**.

---

## 📋 Descripción del Proyecto

**Pokémon Champions Companion** es una aplicación 100% Frontend (HTML5, CSS3 vanilla y JavaScript) orientada a ofrecer asistencia estratégica en tiempo real. Su objetivo principal es facilitar el acceso instantáneo a datos clave sobre Pokémon, sus estadísticas, movimientos y eficiencias de tipos durante enfrentamientos competitivos.

---

## 🛠️ Tecnologías Utilizadas

- **HTML5**: Estructura semántica y accesible.
- **CSS3 (Vanilla)**: Diseño moderno, responsive, con variables CSS y estética Pokémon/Retro mediante Google Fonts (*Press Start 2P*).
- **JavaScript (ES6+)**: Lógica e interactividad del cliente sin dependencias pesadas.

---

## 🗺️ Roadmap del Proyecto

- [x] **Fase 1: Inicialización e Infraestructura**
  - Estructura básica de archivos HTML/CSS/JS.
  - Configuración de despliegue continuo (CI/CD) con GitHub Actions.
  - Interfaz de bienvenida estilarizada.
- [ ] **Fase 2: Pokédex Táctica**
  - Integración con la API pública [PokéAPI](https://pokeapi.co/).
  - Visualización de sprites animados provenientes de [pokemondb.net](https://pokemondb.net/).
  - Búsqueda y filtrado de Pokémon por nombre, tipo y estadísticas base.
- [ ] **Fase 3: Tabla de Tipos Interactiva**
  - Calculadora de efectividades y debilidades al estilo [pkmn.help](https://pkmn.help/).
  - Análisis de cobertura ofensiva y defensiva para combinaciones de tipos dobles.

---

## 🚀 Ejecución en Local

No se requieren herramientas de compilación o servidores complejos para ejecutar la aplicación de forma local:

1. Clona el repositorio o descarga los archivos:
   ```bash
   git clone https://github.com/<tu-usuario>/pokeSeriusFan.git
   cd pokeSeriusFan
   ```
2. Abre el archivo `index.html` directamente en tu navegador preferido, o utiliza una extensión de servidor local como *Live Server* en VS Code.

---

## ⚙️ Configuración Única de GitHub Pages en el Repositorio

El flujo de despliegue está totalmente automatizado con **GitHub Actions** (`.github/workflows/deploy.yml`).

### 📌 Paso imprescindible para habilitar el despliegue:

Para que GitHub Actions tenga permiso de desplegar el sitio, debes cambiar el origen de Pages en la interfaz gráfica de GitHub por única vez:

1. Ve a la pestaña **Settings** (Configuración) de este repositorio en GitHub.
2. En el menú lateral izquierdo, haz clic en **Pages**.
3. En la sección **Build and deployment** > **Source**, cambia la selección de `Deploy from a branch` a **GitHub Actions**.
4. Ve a la pestaña **Actions**, selecciona el workflow fallido y haz clic en **Re-run all jobs** (o simplemente empuja un nuevo commit a `main`).

¡Listo! El despliegue se completará exitosamente y tu web estará publicada en GitHub Pages.

---

## 📄 Licencia y Descargo de Responsabilidad

Este proyecto es un software no oficial desarrollado con fines educativos y de entretenimiento. Pokémon y sus marcas registradas son propiedad de Nintendo, Game Freak y The Pokémon Company.
