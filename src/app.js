/**
 * Pokémon Champions Companion - Main Application Script
 */

document.addEventListener('DOMContentLoaded', () => {
    console.log('Pokémon Champions Companion inicializado.');

    // Estado global de la aplicación
    const state = {
        allPokemon: [],
        filteredPokemon: [],
        isLoading: false,
        error: null,
        activeTab: 'pokedex',
        // Estado de la tabla de tipos
        typeChart: {
            selectedTypes: [], // Máximo 2 tipos (p. ej. ['fire', 'flying'])
            mode: 'defense',   // 'defense' u 'offense'
            showNormalDamage: false // Control del colapsable x1
        }
    };

    // Referencias al DOM
    const elements = {
        navButtons: document.querySelectorAll('.nav-btn'),
        views: {
            home: document.getElementById('home-view'),
            pokedex: document.getElementById('pokedex-view'),
            'type-chart': document.getElementById('type-chart-view')
        },
        pokedexSearch: document.getElementById('pokedex-search'),
        pokedexCount: document.getElementById('pokedex-count'),
        pokedexGrid: document.getElementById('pokedex-grid'),
        pokedexLoader: document.getElementById('pokedex-loader'),
        pokedexError: document.getElementById('pokedex-error'),
        pokedexEmpty: document.getElementById('pokedex-empty'),
        retryBtn: document.getElementById('retry-btn'),
        // Elementos de la tabla de tipos
        typeButtonsGrid: document.getElementById('type-buttons-grid'),
        selectedTypesList: document.getElementById('selected-types-list'),
        clearTypesBtn: document.getElementById('clear-types-btn'),
        modeDefenseBtn: document.getElementById('mode-defense-btn'),
        modeOffenseBtn: document.getElementById('mode-offense-btn'),
        typeResultsContainer: document.getElementById('type-results-container')
    };

    /**
     * Capitaliza la primera letra de un texto
     * @param {string} str
     * @returns {string}
     */
    function capitalize(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    /**
     * Formatea un número ID de Pokedex a formato #0001
     * @param {number} id
     * @returns {string}
     */
    function formatPokedexNumber(id) {
        return `#${String(id).padStart(4, '0')}`;
    }

    /**
     * Adapta el nombre devuelto por PokéAPI para construir la URL del sprite en pokemondb.net
     * @param {string} name
     * @returns {string}
     */
    function formatPokemonDbName(name) {
        if (!name) return '';
        let formatted = name.toLowerCase().trim();

        // Mappings específicos para casos especiales de pokemondb
        const specialCases = {
            'nidoran-f': 'nidoran-f',
            'nidoran-m': 'nidoran-m',
            'mr-mime': 'mr-mime',
            'mime-jr': 'mime-jr',
            'type-null': 'type-null',
            'tapu-koko': 'tapu-koko',
            'tapu-lele': 'tapu-lele',
            'tapu-bulu': 'tapu-bulu',
            'tapu-fini': 'tapu-fini',
            'ho-oh': 'ho-oh',
            'jangmo-o': 'jangmo-o',
            'hakamo-o': 'hakamo-o',
            'kommo-o': 'kommo-o',
            'porygon-z': 'porygon-z',
            'wo-chien': 'wo-chien',
            'chien-pao': 'chien-pao',
            'ting-lu': 'ting-lu',
            'chi-yu': 'chi-yu'
        };

        if (specialCases[formatted]) {
            return specialCases[formatted];
        }

        // Para formas base que PokéAPI nombra con sufijos (ej. deoxys-normal -> deoxys)
        const suffixCleanups = [
            '-normal', '-plant', '-altered', '-land', '-red-striped',
            '-standard', '-incarnate', '-ordinary', '-aria', '-male',
            '-shield', '-average', '-50', '-baile', '-midday',
            '-solo', '-red-meteor', '-disguised', '-amped', '-ice',
            '-full-belly', '-single-strike', '-family-of-four', '-green-plumage',
            '-zero', '-curly', '-two-segment'
        ];

        for (const suffix of suffixCleanups) {
            if (formatted.endsWith(suffix)) {
                formatted = formatted.replace(suffix, '');
                break;
            }
        }

        return formatted;
    }

    /**
     * Genera la URL del sprite para un Pokémon usando pokemondb.net
     * @param {string} name
     * @returns {string}
     */
    function getPokemonSpriteUrl(name) {
        const formattedName = formatPokemonDbName(name);
        return `https://img.pokemondb.net/sprites/home/normal/${formattedName}.png`;
    }

    /**
     * Alterna la visibilidad entre las pestañas
     * @param {string} targetTab
     */
    function switchTab(targetTab) {
        if (!elements.views[targetTab]) return;

        state.activeTab = targetTab;

        // Actualizar botones del nav
        elements.navButtons.forEach(btn => {
            const btnTab = btn.getAttribute('data-tab');
            if (btnTab === targetTab) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        // Actualizar visibilidad de vistas
        Object.keys(elements.views).forEach(tab => {
            if (tab === targetTab) {
                elements.views[tab].classList.remove('view-hidden');
            } else {
                elements.views[tab].classList.add('view-hidden');
            }
        });

        // Re-renderizar o verificar el módulo de tipos si se activa su pestaña
        if (targetTab === 'type-chart') {
            updateTypeChartUI();
        }
    }

    /**
     * Inicializa los manejadores de eventos para la navegación
     */
    function initNavigation() {
        elements.navButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const targetTab = btn.getAttribute('data-tab');
                switchTab(targetTab);
            });
        });
    }

    /**
     * Renderiza las tarjetas de los Pokémon en la cuadrícula
     * @param {Array} list
     */
    function renderPokedexGrid(list) {
        elements.pokedexGrid.innerHTML = '';

        if (list.length === 0) {
            elements.pokedexGrid.classList.add('hidden');
            elements.pokedexEmpty.classList.remove('hidden');
            elements.pokedexCount.textContent = '0 Pokémon encontrados';
            return;
        }

        elements.pokedexEmpty.classList.add('hidden');
        elements.pokedexGrid.classList.remove('hidden');

        const countText = state.allPokemon.length === list.length
            ? `Mostrando ${list.length} Pokémon`
            : `Mostrando ${list.length} de ${state.allPokemon.length} Pokémon`;
        elements.pokedexCount.textContent = countText;

        const fragment = document.createDocumentFragment();

        list.forEach(pokemon => {
            const card = document.createElement('article');
            card.className = 'pokemon-card';

            const numberSpan = document.createElement('span');
            numberSpan.className = 'pokemon-number';
            numberSpan.textContent = formatPokedexNumber(pokemon.id);

            const imgWrapper = document.createElement('div');
            imgWrapper.className = 'pokemon-image-wrapper';

            const img = document.createElement('img');
            img.className = 'pokemon-image';
            img.src = getPokemonSpriteUrl(pokemon.name);
            img.alt = capitalize(pokemon.name);
            img.loading = 'lazy';

            // Manejador de error de imagen (fallback)
            img.onerror = () => {
                imgWrapper.innerHTML = '<div class="pokemon-image-fallback" title="Imagen no disponible"></div>';
            };

            imgWrapper.appendChild(img);

            const nameHeading = document.createElement('h3');
            nameHeading.className = 'pokemon-name';
            nameHeading.textContent = capitalize(pokemon.name);

            card.appendChild(numberSpan);
            card.appendChild(imgWrapper);
            card.appendChild(nameHeading);

            fragment.appendChild(card);
        });

        elements.pokedexGrid.appendChild(fragment);
    }

    /**
     * Aplica el filtro en tiempo real según el término ingresado por el usuario
     * @param {string} query
     */
    function filterPokemon(query) {
        const cleanQuery = query.toLowerCase().trim();

        if (!cleanQuery) {
            state.filteredPokemon = [...state.allPokemon];
        } else {
            // Elimina '#' si el usuario busca por #0025 o similar
            const numberQuery = cleanQuery.replace(/^#+/, '');

            state.filteredPokemon = state.allPokemon.filter(pokemon => {
                const nameMatch = pokemon.name.toLowerCase().includes(cleanQuery);
                const idMatch = String(pokemon.id) === numberQuery ||
                                String(pokemon.id).padStart(4, '0').includes(numberQuery) ||
                                formatPokedexNumber(pokemon.id).toLowerCase().includes(cleanQuery);

                return nameMatch || idMatch;
            });
        }

        renderPokedexGrid(state.filteredPokemon);
    }

    /**
     * Carga el listado de Pokémon desde la PokéAPI
     */
    async function fetchPokedex() {
        state.isLoading = true;
        state.error = null;

        elements.pokedexLoader.classList.remove('hidden');
        elements.pokedexGrid.classList.add('hidden');
        elements.pokedexError.classList.add('hidden');
        elements.pokedexEmpty.classList.add('hidden');
        elements.pokedexCount.textContent = 'Cargando Pokémon...';

        try {
            const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1025');
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }

            const data = await response.json();

            // Extraer el ID desde la URL de cada resultado para mantener orden y números exactos
            state.allPokemon = data.results.map((item, index) => {
                const id = index + 1;
                return {
                    id: id,
                    name: item.name
                };
            });

            state.filteredPokemon = [...state.allPokemon];
            state.isLoading = false;

            elements.pokedexLoader.classList.add('hidden');
            renderPokedexGrid(state.filteredPokemon);

        } catch (err) {
            console.error('Error al cargar la Pokédex desde PokéAPI:', err);
            state.isLoading = false;
            state.error = err;

            elements.pokedexLoader.classList.add('hidden');
            elements.pokedexError.classList.remove('hidden');
            elements.pokedexCount.textContent = 'Error de carga';
        }
    }

    /**
     * Asigna listeners para la búsqueda en tiempo real e interacciones
     */
    function initPokedexEvents() {
        if (elements.pokedexSearch) {
            elements.pokedexSearch.addEventListener('input', (e) => {
                filterPokemon(e.target.value);
            });
        }

        if (elements.retryBtn) {
            elements.retryBtn.addEventListener('click', () => {
                fetchPokedex();
            });
        }
    }

    /* ==========================================================================
       Módulo de Tabla de Tipos
       ========================================================================== */

    /**
     * Inicializa la cuadrícula de botones de selección de tipos
     */
    function initTypeButtons() {
        if (!elements.typeButtonsGrid || typeof TYPE_KEYS === 'undefined') return;

        elements.typeButtonsGrid.innerHTML = '';
        const fragment = document.createDocumentFragment();

        TYPE_KEYS.forEach(typeKey => {
            const typeInfo = POKEMON_TYPES[typeKey];
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'type-btn';
            btn.setAttribute('data-type', typeKey);
            btn.style.setProperty('--type-color', typeInfo.color);
            btn.style.setProperty('--type-text-bg', typeInfo.textBg);

            const dot = document.createElement('span');
            dot.className = 'type-btn-dot';

            const text = document.createElement('span');
            text.textContent = typeInfo.name;

            btn.appendChild(dot);
            btn.appendChild(text);

            btn.addEventListener('click', () => handleTypeClick(typeKey));
            fragment.appendChild(btn);
        });

        elements.typeButtonsGrid.appendChild(fragment);
    }

    /**
     * Maneja la selección / deselección de un tipo al hacer clic
     * @param {string} typeKey
     */
    function handleTypeClick(typeKey) {
        const { selectedTypes } = state.typeChart;
        const index = selectedTypes.indexOf(typeKey);

        if (index !== -1) {
            // Deseleccionar
            selectedTypes.splice(index, 1);
        } else {
            if (selectedTypes.length >= 2) {
                // Reemplazar el segundo tipo si ya hay 2 seleccionados
                selectedTypes[1] = typeKey;
            } else {
                selectedTypes.push(typeKey);
            }
        }

        updateTypeChartUI();
    }

    /**
     * Limpia la selección de tipos
     */
    function clearSelectedTypes() {
        state.typeChart.selectedTypes = [];
        updateTypeChartUI();
    }

    /**
     * Cambia entre los modos Defensa y Ataque
     * @param {string} newMode
     */
    function setTypeMode(newMode) {
        if (state.typeChart.mode === newMode) return;
        state.typeChart.mode = newMode;

        if (elements.modeDefenseBtn && elements.modeOffenseBtn) {
            if (newMode === 'defense') {
                elements.modeDefenseBtn.classList.add('active');
                elements.modeDefenseBtn.setAttribute('aria-selected', 'true');
                elements.modeOffenseBtn.classList.remove('active');
                elements.modeOffenseBtn.setAttribute('aria-selected', 'false');
            } else {
                elements.modeOffenseBtn.classList.add('active');
                elements.modeOffenseBtn.setAttribute('aria-selected', 'true');
                elements.modeDefenseBtn.classList.remove('active');
                elements.modeDefenseBtn.setAttribute('aria-selected', 'false');
            }
        }

        updateTypeChartUI();
    }

    /**
     * Crea un badge de tipo para mostrar en los resultados o en la barra de selección
     * @param {Object} typeInfo - Objeto del tipo en POKEMON_TYPES
     * @param {boolean} removable - Si incluye un botón de eliminar
     * @returns {HTMLElement}
     */
    function createTypeBadge(typeInfo, removable = false) {
        const badge = document.createElement('span');
        badge.className = 'type-badge';
        badge.style.backgroundColor = typeInfo.color;

        const text = document.createElement('span');
        text.textContent = typeInfo.name;
        badge.appendChild(text);

        if (removable) {
            const removeBtn = document.createElement('button');
            removeBtn.type = 'button';
            removeBtn.className = 'remove-badge-btn';
            removeBtn.innerHTML = '&times;';
            removeBtn.title = `Eliminar ${typeInfo.name}`;
            removeBtn.setAttribute('aria-label', `Eliminar ${typeInfo.name}`);
            removeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                handleTypeClick(typeInfo.id);
            });
            badge.appendChild(removeBtn);
        }

        return badge;
    }

    /**
     * Actualiza toda la interfaz de la Tabla de Tipos según el estado actual
     */
    function updateTypeChartUI() {
        const { selectedTypes, mode, showNormalDamage } = state.typeChart;

        // 1. Actualizar estado visual de los botones de tipos (grid)
        const typeButtons = elements.typeButtonsGrid.querySelectorAll('.type-btn');
        typeButtons.forEach(btn => {
            const typeKey = btn.getAttribute('data-type');
            const selectedIndex = selectedTypes.indexOf(typeKey);

            if (selectedIndex !== -1) {
                btn.classList.add('selected');
                btn.setAttribute('data-order', selectedIndex + 1);
            } else {
                btn.classList.remove('selected');
                btn.removeAttribute('data-order');
            }
        });

        // 2. Actualizar barra de selección actual
        if (elements.selectedTypesList) {
            elements.selectedTypesList.innerHTML = '';

            if (selectedTypes.length === 0) {
                elements.selectedTypesList.innerHTML = '<span class="placeholder-text">Ningún tipo seleccionado (haz clic en los botones de abajo)</span>';
                if (elements.clearTypesBtn) elements.clearTypesBtn.classList.add('hidden');
            } else {
                if (elements.clearTypesBtn) elements.clearTypesBtn.classList.remove('hidden');

                selectedTypes.forEach(typeKey => {
                    const typeInfo = POKEMON_TYPES[typeKey];
                    if (typeInfo) {
                        const badge = createTypeBadge(typeInfo, true);
                        elements.selectedTypesList.appendChild(badge);
                    }
                });
            }
        }

        // 3. Renderizar resultados
        renderTypeResults();
    }

    /**
     * Renderiza las tarjetas de resultados según la selección y el modo
     */
    function renderTypeResults() {
        if (!elements.typeResultsContainer) return;

        const { selectedTypes, mode, showNormalDamage } = state.typeChart;
        elements.typeResultsContainer.innerHTML = '';

        if (selectedTypes.length === 0) {
            elements.typeResultsContainer.innerHTML = `
                <div class="empty-results-card">
                    <div class="empty-icon">⚡</div>
                    <h3>Selecciona un Tipo</h3>
                    <p>Elige al menos un tipo de Pokémon para desplegar el desglose defensivo u ofensivo.</p>
                </div>
            `;
            return;
        }

        const type1 = selectedTypes[0];
        const type2 = selectedTypes[1] || null;

        if (mode === 'defense') {
            const matchups = calculateDefenseMatchups(type1, type2);
            renderDefenseResults(matchups, showNormalDamage);
        } else {
            const matchups = calculateOffenseMatchups(type1, type2);
            renderOffenseResults(matchups, showNormalDamage);
        }
    }

    /**
     * Renderiza el panel de resultados para el modo Defensivo
     * @param {Object} matchups
     * @param {boolean} showNormal
     */
    function renderDefenseResults(matchups, showNormal) {
        const categories = [
            { key: 'x4', label: 'Debilidades Extremas', multiplier: 'x4', badgeClass: 'mult-x4', list: matchups.x4 },
            { key: 'x2', label: 'Debilidades', multiplier: 'x2', badgeClass: 'mult-x2', list: matchups.x2 },
            { key: 'x05', label: 'Resistencias', multiplier: 'x1/2', badgeClass: 'mult-x05', list: matchups.x05 },
            { key: 'x025', label: 'Altas Resistencias', multiplier: 'x1/4', badgeClass: 'mult-x025', list: matchups.x025 },
            { key: 'x0', label: 'Inmunidades', multiplier: 'x0', badgeClass: 'mult-x0', list: matchups.x0 },
            { key: 'x1', label: 'Daño Normal', multiplier: 'x1', badgeClass: 'mult-x1', list: matchups.x1, collapsible: true }
        ];

        const container = document.createElement('div');
        container.className = 'results-grid';

        categories.forEach(cat => {
            if (cat.collapsible && !showNormal) {
                // Renderizar barra para desplegar daño normal x1
                const toggleCard = document.createElement('div');
                toggleCard.className = 'result-category-card collapsible-card';

                const toggleHeader = document.createElement('button');
                toggleHeader.type = 'button';
                toggleHeader.className = 'collapsible-toggle-btn';
                toggleHeader.innerHTML = `
                    <span>
                        <span class="mult-badge mult-x1">x1</span>
                        <strong>${cat.label} (${cat.list.length})</strong>
                    </span>
                    <span class="toggle-icon">▼ Mostrar</span>
                `;
                toggleHeader.addEventListener('click', () => {
                    state.typeChart.showNormalDamage = true;
                    updateTypeChartUI();
                });

                toggleCard.appendChild(toggleHeader);
                container.appendChild(toggleCard);
                return;
            }

            const card = document.createElement('div');
            card.className = `result-category-card ${cat.collapsible ? 'is-expanded' : ''}`;

            const header = document.createElement('div');
            header.className = 'result-category-header';

            const titleSpan = document.createElement('div');
            titleSpan.className = 'result-title-wrapper';

            const badge = document.createElement('span');
            badge.className = `mult-badge ${cat.badgeClass}`;
            badge.textContent = cat.multiplier;

            const title = document.createElement('h4');
            title.textContent = cat.label;

            const countBadge = document.createElement('span');
            countBadge.className = 'category-count';
            countBadge.textContent = `(${cat.list.length})`;

            titleSpan.appendChild(badge);
            titleSpan.appendChild(title);
            titleSpan.appendChild(countBadge);
            header.appendChild(titleSpan);

            if (cat.collapsible && showNormal) {
                const collapseBtn = document.createElement('button');
                collapseBtn.type = 'button';
                collapseBtn.className = 'collapse-btn';
                collapseBtn.innerHTML = '▲ Ocultar';
                collapseBtn.addEventListener('click', () => {
                    state.typeChart.showNormalDamage = false;
                    updateTypeChartUI();
                });
                header.appendChild(collapseBtn);
            }

            card.appendChild(header);

            const badgesGrid = document.createElement('div');
            badgesGrid.className = 'result-badges-grid';

            if (cat.list.length === 0) {
                const emptyMsg = document.createElement('span');
                emptyMsg.className = 'no-types-msg';
                emptyMsg.textContent = 'Ninguno';
                badgesGrid.appendChild(emptyMsg);
            } else {
                cat.list.forEach(typeInfo => {
                    badgesGrid.appendChild(createTypeBadge(typeInfo));
                });
            }

            card.appendChild(badgesGrid);
            container.appendChild(card);
        });

        elements.typeResultsContainer.appendChild(container);
    }

    /**
     * Renderiza el panel de resultados para el modo Ofensivo
     * @param {Object} matchups
     * @param {boolean} showNormal
     */
    function renderOffenseResults(matchups, showNormal) {
        const categories = [
            { key: 'x2', label: 'Súper Efectivo Contra (x2)', multiplier: 'x2', badgeClass: 'mult-x2', list: matchups.x2 },
            { key: 'x05', label: 'Poco Efectivo Contra (x1/2)', multiplier: 'x1/2', badgeClass: 'mult-x05', list: matchups.x05 },
            { key: 'x0', label: 'Sin Efecto Contra (x0)', multiplier: 'x0', badgeClass: 'mult-x0', list: matchups.x0 },
            { key: 'x1', label: 'Daño Normal (x1)', multiplier: 'x1', badgeClass: 'mult-x1', list: matchups.x1, collapsible: true }
        ];

        const container = document.createElement('div');
        container.className = 'results-grid';

        categories.forEach(cat => {
            if (cat.collapsible && !showNormal) {
                const toggleCard = document.createElement('div');
                toggleCard.className = 'result-category-card collapsible-card';

                const toggleHeader = document.createElement('button');
                toggleHeader.type = 'button';
                toggleHeader.className = 'collapsible-toggle-btn';
                toggleHeader.innerHTML = `
                    <span>
                        <span class="mult-badge mult-x1">x1</span>
                        <strong>${cat.label} (${cat.list.length})</strong>
                    </span>
                    <span class="toggle-icon">▼ Mostrar</span>
                `;
                toggleHeader.addEventListener('click', () => {
                    state.typeChart.showNormalDamage = true;
                    updateTypeChartUI();
                });

                toggleCard.appendChild(toggleHeader);
                container.appendChild(toggleCard);
                return;
            }

            const card = document.createElement('div');
            card.className = `result-category-card ${cat.collapsible ? 'is-expanded' : ''}`;

            const header = document.createElement('div');
            header.className = 'result-category-header';

            const titleSpan = document.createElement('div');
            titleSpan.className = 'result-title-wrapper';

            const badge = document.createElement('span');
            badge.className = `mult-badge ${cat.badgeClass}`;
            badge.textContent = cat.multiplier;

            const title = document.createElement('h4');
            title.textContent = cat.label;

            const countBadge = document.createElement('span');
            countBadge.className = 'category-count';
            countBadge.textContent = `(${cat.list.length})`;

            titleSpan.appendChild(badge);
            titleSpan.appendChild(title);
            titleSpan.appendChild(countBadge);
            header.appendChild(titleSpan);

            if (cat.collapsible && showNormal) {
                const collapseBtn = document.createElement('button');
                collapseBtn.type = 'button';
                collapseBtn.className = 'collapse-btn';
                collapseBtn.innerHTML = '▲ Ocultar';
                collapseBtn.addEventListener('click', () => {
                    state.typeChart.showNormalDamage = false;
                    updateTypeChartUI();
                });
                header.appendChild(collapseBtn);
            }

            card.appendChild(header);

            const badgesGrid = document.createElement('div');
            badgesGrid.className = 'result-badges-grid';

            if (cat.list.length === 0) {
                const emptyMsg = document.createElement('span');
                emptyMsg.className = 'no-types-msg';
                emptyMsg.textContent = 'Ninguno';
                badgesGrid.appendChild(emptyMsg);
            } else {
                cat.list.forEach(typeInfo => {
                    badgesGrid.appendChild(createTypeBadge(typeInfo));
                });
            }

            card.appendChild(badgesGrid);
            container.appendChild(card);
        });

        elements.typeResultsContainer.appendChild(container);
    }

    /**
     * Asigna listeners de eventos para el módulo de tabla de tipos
     */
    function initTypeChartEvents() {
        if (elements.clearTypesBtn) {
            elements.clearTypesBtn.addEventListener('click', clearSelectedTypes);
        }

        if (elements.modeDefenseBtn) {
            elements.modeDefenseBtn.addEventListener('click', () => setTypeMode('defense'));
        }

        if (elements.modeOffenseBtn) {
            elements.modeOffenseBtn.addEventListener('click', () => setTypeMode('offense'));
        }
    }

    // Inicialización del módulo
    initNavigation();
    initPokedexEvents();
    fetchPokedex();
    initTypeButtons();
    initTypeChartEvents();
});
