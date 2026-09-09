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
        activeTab: 'pokedex'
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
        retryBtn: document.getElementById('retry-btn')
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

    // Inicialización del módulo
    initNavigation();
    initPokedexEvents();
    fetchPokedex();
});
