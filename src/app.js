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
        // Mi Equipo (localStorage)
        myTeam: [], // Lista de objetos { id, name }
        // Estado de la tabla de tipos
        typeChart: {
            selectedTypes: [], // Máximo 2 tipos (p. ej. ['fire', 'flying'])
            mode: 'defense',   // 'defense' u 'offense'
            showNormalDamage: false // Control del colapsable x1
        },
        // Estado de Combate (Matchup Tool)
        matchup: {
            format: '1v1', // '1v1' o '2v2'
            activeSlot: null, // Slot actualmente siendo editado
            slots: {
                ally1: null, // { id, name, details: {...} }
                ally2: null,
                rival1: null,
                rival2: null
            }
        },
        // Caché de detalles cargados de PokéAPI para no repetir peticiones
        pokemonCache: {}
    };

    // Referencias al DOM
    const elements = {
        navButtons: document.querySelectorAll('.nav-btn'),
        views: {
            home: document.getElementById('home-view'),
            pokedex: document.getElementById('pokedex-view'),
            'type-chart': document.getElementById('type-chart-view'),
            matchup: document.getElementById('matchup-view')
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
        typeResultsContainer: document.getElementById('type-results-container'),
        // Elementos de Mi Equipo
        teamCount: document.getElementById('team-count'),
        myTeamGrid: document.getElementById('my-team-grid'),
        // Modal Inspección
        pokemonModal: document.getElementById('pokemon-modal'),
        modalCloseBtn: document.getElementById('modal-close-btn'),
        modalBodyContainer: document.getElementById('modal-body-container'),
        // Matchup Tool
        format1v1Btn: document.getElementById('format-1v1-btn'),
        format2v2Btn: document.getElementById('format-2v2-btn'),
        slots: {
            ally1: document.getElementById('slot-ally-1'),
            ally2: document.getElementById('slot-ally-2'),
            rival1: document.getElementById('slot-rival-1'),
            rival2: document.getElementById('slot-rival-2')
        },
        matchupAnalysisContainer: document.getElementById('matchup-analysis-container'),
        // Modal Selector de Slot
        selectPokemonModal: document.getElementById('select-pokemon-modal'),
        selectModalCloseBtn: document.getElementById('select-modal-close-btn'),
        slotSearchInput: document.getElementById('slot-search-input'),
        selectModalTeamButtons: document.getElementById('select-modal-team-buttons'),
        selectModalGrid: document.getElementById('select-modal-grid')
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

    /* ==========================================================================
       Persistencia Local: Mi Equipo
       ========================================================================== */

    function loadMyTeamFromStorage() {
        try {
            const stored = localStorage.getItem('pkmn_champions_my_team');
            if (stored) {
                state.myTeam = JSON.parse(stored);
            }
        } catch (e) {
            console.error('Error al cargar Mi Equipo desde localStorage:', e);
            state.myTeam = [];
        }
        renderMyTeamUI();
    }

    function saveMyTeamToStorage() {
        try {
            localStorage.setItem('pkmn_champions_my_team', JSON.stringify(state.myTeam));
        } catch (e) {
            console.error('Error al guardar Mi Equipo en localStorage:', e);
        }
        renderMyTeamUI();
    }

    function isInMyTeam(pokemonId) {
        return state.myTeam.some(p => p.id === pokemonId);
    }

    function addToMyTeam(pokemon) {
        if (state.myTeam.length >= 6) {
            alert('¡Tu equipo ya tiene el máximo de 6 Pokémon!');
            return false;
        }
        if (!isInMyTeam(pokemon.id)) {
            state.myTeam.push({ id: pokemon.id, name: pokemon.name });
            saveMyTeamToStorage();
            return true;
        }
        return false;
    }

    function removeFromMyTeam(pokemonId) {
        state.myTeam = state.myTeam.filter(p => p.id !== pokemonId);
        saveMyTeamToStorage();
    }

    function renderMyTeamUI() {
        if (elements.teamCount) {
            elements.teamCount.textContent = state.myTeam.length;
        }

        if (!elements.myTeamGrid) return;

        elements.myTeamGrid.innerHTML = '';
        const fragment = document.createDocumentFragment();

        for (let i = 0; i < 6; i++) {
            const teamMember = state.myTeam[i];
            const slotCard = document.createElement('div');
            slotCard.className = `team-slot-card ${teamMember ? 'filled' : ''}`;

            if (teamMember) {
                const img = document.createElement('img');
                img.className = 'team-slot-img';
                img.src = getPokemonSpriteUrl(teamMember.name);
                img.alt = capitalize(teamMember.name);

                const nameSpan = document.createElement('span');
                nameSpan.className = 'team-slot-name';
                nameSpan.textContent = capitalize(teamMember.name);

                const removeBtn = document.createElement('button');
                removeBtn.className = 'team-slot-remove';
                removeBtn.innerHTML = '&times;';
                removeBtn.title = `Quitar a ${capitalize(teamMember.name)}`;
                removeBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    removeFromMyTeam(teamMember.id);
                });

                slotCard.appendChild(img);
                slotCard.appendChild(nameSpan);
                slotCard.appendChild(removeBtn);

                slotCard.addEventListener('click', () => {
                    openPokemonModal(teamMember.id, teamMember.name);
                });
            } else {
                const emptyIcon = document.createElement('span');
                emptyIcon.className = 'team-slot-empty-icon';
                emptyIcon.textContent = '+';
                slotCard.appendChild(emptyIcon);
            }

            fragment.appendChild(slotCard);
        }

        elements.myTeamGrid.appendChild(fragment);
    }

    /* ==========================================================================
       Navegación entre Pestañas
       ========================================================================== */

    function switchTab(targetTab) {
        if (!elements.views[targetTab]) return;

        state.activeTab = targetTab;

        elements.navButtons.forEach(btn => {
            const btnTab = btn.getAttribute('data-tab');
            if (btnTab === targetTab) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        Object.keys(elements.views).forEach(tab => {
            if (tab === targetTab) {
                elements.views[tab].classList.remove('view-hidden');
            } else {
                elements.views[tab].classList.add('view-hidden');
            }
        });

        if (targetTab === 'type-chart') {
            updateTypeChartUI();
        } else if (targetTab === 'matchup') {
            renderMatchupUI();
        }
    }

    function initNavigation() {
        elements.navButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const targetTab = btn.getAttribute('data-tab');
                switchTab(targetTab);
            });
        });
    }

    /* ==========================================================================
       Poder de Detalle y Modal de Inspección
       ========================================================================== */

    async function fetchPokemonDetails(id) {
        if (state.pokemonCache[id]) {
            return state.pokemonCache[id];
        }

        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        const data = await response.json();

        // Estructurar datos relevantes
        const officialArtwork = data.sprites?.other?.['official-artwork']?.front_default ||
                                data.sprites?.front_default ||
                                getPokemonSpriteUrl(data.name);

        const types = data.types.map(t => t.type.name);

        const stats = {};
        data.stats.forEach(s => {
            stats[s.stat.name] = s.base_stat;
        });

        const abilities = data.abilities.map(a => ({
            name: a.ability.name,
            isHidden: a.is_hidden
        }));

        const details = {
            id: data.id,
            name: data.name,
            officialArtwork,
            types,
            stats: {
                hp: stats.hp || 0,
                attack: stats.attack || 0,
                defense: stats.defense || 0,
                specialAttack: stats['special-attack'] || 0,
                specialDefense: stats['special-defense'] || 0,
                speed: stats.speed || 0
            },
            abilities
        };

        state.pokemonCache[id] = details;
        return details;
    }

    async function openPokemonModal(id, name) {
        elements.modalBodyContainer.innerHTML = `
            <div class="loader-container">
                <div class="pokeball-spinner" aria-hidden="true"></div>
                <p class="loader-text">Obteniendo ficha técnica de ${capitalize(name)}...</p>
            </div>
        `;
        elements.pokemonModal.classList.remove('hidden');

        try {
            const details = await fetchPokemonDetails(id);
            renderPokemonModalDetails(details);
        } catch (err) {
            console.error('Error al cargar modal de Pokémon:', err);
            elements.modalBodyContainer.innerHTML = `
                <div class="error-container">
                    <p>⚠️ No se pudieron cargar los detalles de este Pokémon.</p>
                </div>
            `;
        }
    }

    function closePokemonModal() {
        elements.pokemonModal.classList.add('hidden');
    }

    function renderPokemonModalDetails(details) {
        const inTeam = isInMyTeam(details.id);

        // Mapeo de estadísticas para visualización
        const statConfig = [
            { key: 'hp', label: 'HP', color: '#FF5959' },
            { key: 'attack', label: 'Ataque', color: '#F5AC78' },
            { key: 'defense', label: 'Defensa', color: '#FAE078' },
            { key: 'specialAttack', label: 'Atq. Esp', color: '#9DB7F5' },
            { key: 'specialDefense', label: 'Def. Esp', color: '#A7DB8D' },
            { key: 'speed', label: 'Velocidad', color: '#FA92B2' }
        ];

        // Calcular perfil defensivo con types-data.js
        const defMatchups = calculateDefenseMatchups(details.types[0], details.types[1] || null);

        let html = `
            <div class="modal-pokemon-header">
                <div class="modal-title-box">
                    <span class="modal-pokemon-number">${formatPokedexNumber(details.id)}</span>
                    <h2 class="modal-pokemon-title">${capitalize(details.name)}</h2>
                </div>
                <button id="modal-team-toggle-btn" class="modal-action-btn ${inTeam ? 'btn-team-remove' : 'btn-team-add'}">
                    ${inTeam ? '❌ Quitar de Mi Equipo' : '⭐ Añadir a Mi Equipo'}
                </button>
            </div>

            <div class="modal-main-info">
                <div class="modal-image-card">
                    <img class="modal-official-img" src="${details.officialArtwork}" alt="${capitalize(details.name)}">
                    <div class="modal-types-row">
                        ${details.types.map(t => {
                            const tInfo = POKEMON_TYPES[t];
                            return tInfo ? `<span class="type-badge" style="background-color: ${tInfo.color}">${tInfo.name}</span>` : '';
                        }).join('')}
                    </div>
                </div>

                <div class="modal-stats-container">
                    <h3 class="modal-section-title">📊 Estadísticas Base</h3>
                    ${statConfig.map(sc => {
                        const val = details.stats[sc.key] || 0;
                        const pct = Math.min(100, Math.round((val / 180) * 100));
                        return `
                            <div class="stat-row">
                                <span class="stat-label">${sc.label}</span>
                                <span class="stat-val">${val}</span>
                                <div class="stat-bar-bg">
                                    <div class="stat-bar-fill" style="width: ${pct}%; background-color: ${sc.color}"></div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>

            <div class="modal-section">
                <h3 class="modal-section-title">✨ Habilidades Principales</h3>
                <div class="abilities-list">
                    ${details.abilities.map(a => `
                        <span class="ability-tag ${a.isHidden ? 'hidden-ability' : ''}">
                            ${capitalize(a.name.replace('-', ' '))} ${a.isHidden ? '(Oculta)' : ''}
                        </span>
                    `).join('')}
                </div>
            </div>

            <div class="modal-section">
                <h3 class="modal-section-title">🛡️ Perfil Defensivo</h3>
                <div class="defensive-groups">
                    ${defMatchups.x4.length > 0 ? `
                        <div class="def-group">
                            <div class="def-group-header">
                                <span class="mult-badge mult-x4">x4</span>
                                <span>Debilidad Extrema</span>
                            </div>
                            <div class="result-badges-grid">
                                ${defMatchups.x4.map(t => `<span class="type-badge" style="background-color:${t.color}">${t.name}</span>`).join('')}
                            </div>
                        </div>
                    ` : ''}

                    ${defMatchups.x2.length > 0 ? `
                        <div class="def-group">
                            <div class="def-group-header">
                                <span class="mult-badge mult-x2">x2</span>
                                <span>Debilidad</span>
                            </div>
                            <div class="result-badges-grid">
                                ${defMatchups.x2.map(t => `<span class="type-badge" style="background-color:${t.color}">${t.name}</span>`).join('')}
                            </div>
                        </div>
                    ` : ''}

                    ${defMatchups.x05.length > 0 ? `
                        <div class="def-group">
                            <div class="def-group-header">
                                <span class="mult-badge mult-x05">x1/2</span>
                                <span>Resistencia</span>
                            </div>
                            <div class="result-badges-grid">
                                ${defMatchups.x05.map(t => `<span class="type-badge" style="background-color:${t.color}">${t.name}</span>`).join('')}
                            </div>
                        </div>
                    ` : ''}

                    ${defMatchups.x025.length > 0 ? `
                        <div class="def-group">
                            <div class="def-group-header">
                                <span class="mult-badge mult-x025">x1/4</span>
                                <span>Alta Resistencia</span>
                            </div>
                            <div class="result-badges-grid">
                                ${defMatchups.x025.map(t => `<span class="type-badge" style="background-color:${t.color}">${t.name}</span>`).join('')}
                            </div>
                        </div>
                    ` : ''}

                    ${defMatchups.x0.length > 0 ? `
                        <div class="def-group">
                            <div class="def-group-header">
                                <span class="mult-badge mult-x0">x0</span>
                                <span>Inmunidad</span>
                            </div>
                            <div class="result-badges-grid">
                                ${defMatchups.x0.map(t => `<span class="type-badge" style="background-color:${t.color}">${t.name}</span>`).join('')}
                            </div>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;

        elements.modalBodyContainer.innerHTML = html;

        // Configurar botón de Mi Equipo dentro del modal
        const toggleBtn = document.getElementById('modal-team-toggle-btn');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                if (isInMyTeam(details.id)) {
                    removeFromMyTeam(details.id);
                } else {
                    addToMyTeam(details);
                }
                renderPokemonModalDetails(details);
            });
        }
    }

    /* ==========================================================================
       Renderizado de Pokédex Grid y Eventos
       ========================================================================== */

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

            // Clic en la tarjeta abre el Modal de Inspección
            card.addEventListener('click', () => {
                openPokemonModal(pokemon.id, pokemon.name);
            });

            fragment.appendChild(card);
        });

        elements.pokedexGrid.appendChild(fragment);
    }

    function filterPokemon(query) {
        const cleanQuery = query.toLowerCase().trim();

        if (!cleanQuery) {
            state.filteredPokemon = [...state.allPokemon];
        } else {
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

        if (elements.modalCloseBtn) {
            elements.modalCloseBtn.addEventListener('click', closePokemonModal);
        }

        // Cerrar modal al hacer clic en el overlay
        if (elements.pokemonModal) {
            elements.pokemonModal.addEventListener('click', (e) => {
                if (e.target === elements.pokemonModal) {
                    closePokemonModal();
                }
            });
        }
    }

    /* ==========================================================================
       Módulo de Tabla de Tipos
       ========================================================================== */

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

            const iconSpan = document.createElement('span');
            iconSpan.className = 'type-icon-wrapper';
            iconSpan.innerHTML = typeInfo.icon || '';

            const text = document.createElement('span');
            text.textContent = typeInfo.name;

            btn.appendChild(iconSpan);
            btn.appendChild(text);

            btn.addEventListener('click', () => handleTypeClick(typeKey));
            fragment.appendChild(btn);
        });

        elements.typeButtonsGrid.appendChild(fragment);
    }

    function handleTypeClick(typeKey) {
        const { selectedTypes } = state.typeChart;
        const index = selectedTypes.indexOf(typeKey);

        if (index !== -1) {
            selectedTypes.splice(index, 1);
        } else {
            if (selectedTypes.length >= 2) {
                selectedTypes[1] = typeKey;
            } else {
                selectedTypes.push(typeKey);
            }
        }

        updateTypeChartUI();
    }

    function clearSelectedTypes() {
        state.typeChart.selectedTypes = [];
        updateTypeChartUI();
    }

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

    function createTypeBadge(typeInfo, removable = false) {
        const badge = document.createElement('span');
        badge.className = 'type-badge';
        badge.style.backgroundColor = typeInfo.color;

        const iconSpan = document.createElement('span');
        iconSpan.className = 'type-badge-icon';
        iconSpan.innerHTML = typeInfo.icon || '';

        const text = document.createElement('span');
        text.textContent = typeInfo.name;

        badge.appendChild(iconSpan);
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

    function updateTypeChartUI() {
        const { selectedTypes, mode, showNormalDamage } = state.typeChart;

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

        renderTypeResults();
    }

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

    /* ==========================================================================
       Módulo Análisis de Combate (Matchup Tool)
       ========================================================================== */

    function setMatchupFormat(format) {
        state.matchup.format = format;

        if (format === '1v1') {
            elements.format1v1Btn.classList.add('active');
            elements.format2v2Btn.classList.remove('active');

            // Ocultar slots secundarios
            elements.slots.ally2.classList.add('hidden-slot');
            elements.slots.rival2.classList.add('hidden-slot');
        } else {
            elements.format2v2Btn.classList.add('active');
            elements.format1v1Btn.classList.remove('active');

            // Mostrar slots secundarios
            elements.slots.ally2.classList.remove('hidden-slot');
            elements.slots.rival2.classList.remove('hidden-slot');
        }

        renderMatchupUI();
    }

    function openSlotSelectModal(slotKey) {
        state.matchup.activeSlot = slotKey;
        if (elements.slotSearchInput) elements.slotSearchInput.value = '';

        // Renderizar accesos directos de Mi Equipo
        if (elements.selectModalTeamButtons) {
            elements.selectModalTeamButtons.innerHTML = '';

            if (state.myTeam.length === 0) {
                elements.selectModalTeamButtons.innerHTML = '<span style="font-size: 0.8rem; color: var(--text-muted); font-style: italic;">Tu equipo está vacío. Añade integrantes desde la Pokédex.</span>';
            } else {
                state.myTeam.forEach(member => {
                    const btn = document.createElement('button');
                    btn.type = 'button';
                    btn.className = 'modal-team-btn';
                    btn.innerHTML = `<img src="${getPokemonSpriteUrl(member.name)}" width="20" height="20" style="object-fit:contain;"> ${capitalize(member.name)}`;
                    btn.addEventListener('click', () => {
                        assignPokemonToSlot(slotKey, member.id, member.name);
                        closeSlotSelectModal();
                    });
                    elements.selectModalTeamButtons.appendChild(btn);
                });
            }
        }

        filterSlotModalPokemon('');
        elements.selectPokemonModal.classList.remove('hidden');
    }

    function closeSlotSelectModal() {
        elements.selectPokemonModal.classList.add('hidden');
    }

    function filterSlotModalPokemon(query) {
        if (!elements.selectModalGrid) return;
        elements.selectModalGrid.innerHTML = '';

        const cleanQuery = query.toLowerCase().trim();
        const numberQuery = cleanQuery.replace(/^#+/, '');

        const filtered = state.allPokemon.filter(p => {
            if (!cleanQuery) return true;
            return p.name.toLowerCase().includes(cleanQuery) ||
                   String(p.id) === numberQuery ||
                   formatPokedexNumber(p.id).toLowerCase().includes(cleanQuery);
        }).slice(0, 48); // Limitar a los primeros 48 para rapidez visual en modal

        const fragment = document.createDocumentFragment();

        filtered.forEach(p => {
            const card = document.createElement('div');
            card.className = 'modal-pokemon-card';

            const img = document.createElement('img');
            img.src = getPokemonSpriteUrl(p.name);
            img.alt = capitalize(p.name);

            const nameSpan = document.createElement('span');
            nameSpan.textContent = capitalize(p.name);

            card.appendChild(img);
            card.appendChild(nameSpan);

            card.addEventListener('click', () => {
                assignPokemonToSlot(state.matchup.activeSlot, p.id, p.name);
                closeSlotSelectModal();
            });

            fragment.appendChild(card);
        });

        elements.selectModalGrid.appendChild(fragment);
    }

    async function assignPokemonToSlot(slotKey, id, name) {
        state.matchup.slots[slotKey] = { id, name, details: null };
        renderMatchupUI();

        try {
            const details = await fetchPokemonDetails(id);
            state.matchup.slots[slotKey].details = details;
            renderMatchupUI();
        } catch (err) {
            console.error('Error al cargar datos para slot:', err);
        }
    }

    function clearSlot(slotKey) {
        state.matchup.slots[slotKey] = null;
        renderMatchupUI();
    }

    function renderMatchupUI() {
        const isDouble = state.matchup.format === '2v2';
        const activeSlotKeys = isDouble
            ? ['ally1', 'ally2', 'rival1', 'rival2']
            : ['ally1', 'rival1'];

        activeSlotKeys.forEach(slotKey => {
            const slotElem = elements.slots[slotKey];
            if (!slotElem) return;

            const slotData = state.matchup.slots[slotKey];

            if (!slotData) {
                slotElem.className = 'matchup-slot empty-slot';
                slotElem.innerHTML = `
                    <div class="slot-add-btn">
                        <span class="slot-add-icon">➕</span>
                        <span>Seleccionar Pokémon</span>
                    </div>
                `;
                slotElem.onclick = () => openSlotSelectModal(slotKey);
            } else {
                slotElem.className = 'matchup-slot filled-slot';
                slotElem.onclick = null;

                const details = slotData.details;
                const speedText = details ? `Vel: ${details.stats.speed}` : 'Cargando...';

                slotElem.innerHTML = `
                    <div class="slot-filled-card">
                        <div class="slot-pokemon-info">
                            <img class="slot-pokemon-img" src="${getPokemonSpriteUrl(slotData.name)}" alt="${capitalize(slotData.name)}">
                            <div class="slot-pokemon-details">
                                <h4>${capitalize(slotData.name)}</h4>
                                <span class="slot-pokemon-speed">⚡ ${speedText}</span>
                            </div>
                        </div>
                        <div class="slot-actions">
                            <button class="slot-btn slot-inspect-btn" title="Inspeccionar">🔍</button>
                            <button class="slot-btn slot-clear-btn" title="Eliminar">❌</button>
                        </div>
                    </div>
                `;

                const inspectBtn = slotElem.querySelector('.slot-inspect-btn');
                if (inspectBtn) {
                    inspectBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        openPokemonModal(slotData.id, slotData.name);
                    });
                }

                const clearBtn = slotElem.querySelector('.slot-clear-btn');
                if (clearBtn) {
                    clearBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        clearSlot(slotKey);
                    });
                }
            }
        });

        renderMatchupAnalysis(activeSlotKeys);
    }

    function renderMatchupAnalysis(activeSlotKeys) {
        if (!elements.matchupAnalysisContainer) return;

        const activePokemons = [];
        activeSlotKeys.forEach(key => {
            const item = state.matchup.slots[key];
            if (item && item.details) {
                activePokemons.push({ slotKey: key, ...item });
            }
        });

        if (activePokemons.length === 0) {
            elements.matchupAnalysisContainer.innerHTML = `
                <div class="empty-results-card">
                    <div class="empty-icon">⚔️</div>
                    <h3>Selecciona un Pokémon en pista</h3>
                    <p>Agrega Pokémon a los slots aliados o rivales para calcular la línea temporal de velocidad, fortalezas, debilidades y coberturas.</p>
                </div>
            `;
            return;
        }

        let html = '';

        // 1. SPEED TIER TIMELINE VISUAL
        const sortedBySpeed = [...activePokemons].sort((a, b) => b.details.stats.speed - a.details.stats.speed);
        const maxSpeed = Math.max(...sortedBySpeed.map(p => p.details.stats.speed), 1);

        html += `
            <div class="analysis-section-card">
                <h3 class="analysis-title">⏱️ Orden de Velocidad (Speed Tier Timeline)</h3>
                <p class="type-chart-description">Ordenados de mayor a menor Velocidad Base en pista:</p>
                <div class="speed-tier-timeline">
                    ${sortedBySpeed.map((p, idx) => {
                        const pct = Math.min(100, Math.max(15, Math.round((p.details.stats.speed / maxSpeed) * 100)));
                        const isAlly = p.slotKey.startsWith('ally');
                        const sideTag = isAlly ? '🛡️' : '⚔️';

                        return `
                            <div class="speed-tier-item">
                                <div class="speed-pokemon-name">
                                    <span>#${idx + 1} ${sideTag}</span>
                                    <img src="${getPokemonSpriteUrl(p.name)}" alt="${capitalize(p.name)}">
                                    <span>${capitalize(p.name)}</span>
                                </div>
                                <span class="speed-val-tag">${p.details.stats.speed}</span>
                                <div class="speed-bar-wrapper">
                                    <div class="speed-bar-fill" style="width: ${pct}%; background: ${isAlly ? 'linear-gradient(90deg, #2A75D3, #6390F0)' : 'linear-gradient(90deg, #E3350D, #EF4444)'}"></div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;

        // 2. COBERTURA COLECTIVA EN DOBLES (Shared Weaknesses)
        if (state.matchup.format === '2v2') {
            const ally1 = state.matchup.slots.ally1?.details;
            const ally2 = state.matchup.slots.ally2?.details;

            html += `<div class="analysis-section-card">`;
            html += `<h3 class="analysis-title">🚨 Cobertura Colectiva de Aliados (Dobles 2v2)</h3>`;

            if (ally1 && ally2) {
                const def1 = calculateDefenseMatchups(ally1.types[0], ally1.types[1] || null);
                const def2 = calculateDefenseMatchups(ally2.types[0], ally2.types[1] || null);

                const weakTypes1 = [...def1.x4.map(t => ({ id: t.id, name: t.name, color: t.color, mult: 4 })), ...def1.x2.map(t => ({ id: t.id, name: t.name, color: t.color, mult: 2 }))];
                const weakTypes2 = [...def2.x4.map(t => ({ id: t.id, name: t.name, color: t.color, mult: 4 })), ...def2.x2.map(t => ({ id: t.id, name: t.name, color: t.color, mult: 2 }))];

                const sharedWeaknesses = [];

                weakTypes1.forEach(w1 => {
                    const matchIn2 = weakTypes2.find(w2 => w2.id === w1.id);
                    if (matchIn2) {
                        sharedWeaknesses.push({
                            type: w1,
                            mult1: w1.mult,
                            mult2: matchIn2.mult
                        });
                    }
                });

                if (sharedWeaknesses.length === 0) {
                    html += `
                        <div class="status-tag active-tag" style="padding: 0.5rem 1rem; font-size: 0.85rem;">
                            ✅ ¡Gran Cobertura! Ambos Pokémon de tu equipo no comparten ninguna debilidad elemental en común.
                        </div>
                    `;
                } else {
                    html += `<p class="type-chart-description" style="margin-bottom: 0.75rem;">¡Alerta! Tu equipo de 2 Pokémon en pista sufre daño super efectivo (x2 o x4) ante estos mismos tipos:</p>`;
                    sharedWeaknesses.forEach(sw => {
                        html += `
                            <div class="double-weakness-alert">
                                <div class="alert-type-badge">
                                    <span class="type-badge" style="background-color: ${sw.type.color}">${sw.type.name}</span>
                                    <span class="alert-text">⚠️ Ambos sufren daño aumentado (${capitalize(ally1.name)} x${sw.mult1} y ${capitalize(ally2.name)} x${sw.mult2})</span>
                                </div>
                            </div>
                        `;
                    });
                }
            } else {
                html += `<p class="placeholder-text">Selecciona los 2 Pokémon Aliados en pista para analizar las debilidades compartidas de tu equipo.</p>`;
            }

            html += `</div>`;
        }

        // 3. DESGLOSE DETALLADO DE FORTALEZAS Y DEBILIDADES CONTRA EL ENEMIGO
        const alliesInField = activePokemons.filter(p => p.slotKey.startsWith('ally'));
        const rivalsInField = activePokemons.filter(p => p.slotKey.startsWith('rival'));

        if (alliesInField.length > 0 && rivalsInField.length > 0) {
            html += `
                <div class="analysis-section-card">
                    <h3 class="analysis-title">🛡️ vs ⚔️ Análisis Detallado: Fortalezas y Debilidades</h3>
                    <p class="type-chart-description">Desglose táctico directo de ventajas y vulnerabilidades entre Aliados y Rivales:</p>

                    <div class="matchup-grid-cards">
            `;

            alliesInField.forEach(a => {
                rivalsInField.forEach(r => {
                    // Fortalezas del Aliado sobre el Rival
                    const strengths = [];
                    // Debilidades del Aliado frente al Rival
                    const weaknesses = [];

                    // Evaluamos ataques STAB del Aliado -> Rival
                    a.details.types.forEach(aType => {
                        const m1 = TYPE_CHART[aType][r.details.types[0]] || 1;
                        const m2 = r.details.types[1] ? (TYPE_CHART[aType][r.details.types[1]] || 1) : 1;
                        const total = m1 * m2;
                        const aTInfo = POKEMON_TYPES[aType];

                        if (total >= 2) {
                            strengths.push(`🎯 Ataque de tipo <strong>${aTInfo.name}</strong> causa daño súper efectivo <strong>(x${total})</strong> a ${capitalize(r.name)}.`);
                        } else if (total === 0) {
                            weaknesses.push(`🛡️ Ataques de tipo <strong>${aTInfo.name}</strong> no tienen efecto <strong>(x0)</strong> contra ${capitalize(r.name)}.`);
                        } else if (total < 1) {
                            weaknesses.push(`⚠️ Ataques de tipo <strong>${aTInfo.name}</strong> son poco efectivos <strong>(x${total})</strong> contra ${capitalize(r.name)}.`);
                        }
                    });

                    // Evaluamos ataques STAB del Rival -> Aliado
                    r.details.types.forEach(rType => {
                        const m1 = TYPE_CHART[rType][a.details.types[0]] || 1;
                        const m2 = a.details.types[1] ? (TYPE_CHART[rType][a.details.types[1]] || 1) : 1;
                        const total = m1 * m2;
                        const rTInfo = POKEMON_TYPES[rType];

                        if (total >= 2) {
                            weaknesses.push(`🚨 Amenaza: ${capitalize(r.name)} te ataca con tipo <strong>${rTInfo.name}</strong> súper efectivo <strong>(x${total})</strong>.`);
                        } else if (total === 0) {
                            strengths.push(` Inmunidad: Eres inmune <strong>(x0)</strong> a los ataques tipo <strong>${rTInfo.name}</strong> de ${capitalize(r.name)}.`);
                        } else if (total < 1) {
                            strengths.push(` Resistencia: Resistes <strong>(x${total})</strong> los ataques tipo <strong>${rTInfo.name}</strong> de ${capitalize(r.name)}.`);
                        }
                    });

                    html += `
                        <div class="matchup-card strength-card">
                            <h4 class="matchup-card-title">
                                <img src="${getPokemonSpriteUrl(a.name)}" width="24" height="24">
                                ${capitalize(a.name)} - Fortalezas vs ${capitalize(r.name)}
                            </h4>
                            ${strengths.length > 0
                                ? strengths.map(s => `<div class="matchup-item">${s}</div>`).join('')
                                : '<div class="matchup-item" style="color: var(--text-muted); font-style: italic;">Sin ventajas directas de tipo.</div>'}
                        </div>

                        <div class="matchup-card weakness-card">
                            <h4 class="matchup-card-title">
                                <img src="${getPokemonSpriteUrl(a.name)}" width="24" height="24">
                                ${capitalize(a.name)} - Debilidades vs ${capitalize(r.name)}
                            </h4>
                            ${weaknesses.length > 0
                                ? weaknesses.map(w => `<div class="matchup-item">${w}</div>`).join('')
                                : '<div class="matchup-item" style="color: var(--text-muted); font-style: italic;">Sin amenazas ni desventajas directas de tipo.</div>'}
                        </div>
                    `;
                });
            });

            html += `
                    </div>
                </div>
            `;
        }

        elements.matchupAnalysisContainer.innerHTML = html;
    }

    function initMatchupEvents() {
        if (elements.format1v1Btn) {
            elements.format1v1Btn.addEventListener('click', () => setMatchupFormat('1v1'));
        }
        if (elements.format2v2Btn) {
            elements.format2v2Btn.addEventListener('click', () => setMatchupFormat('2v2'));
        }
        if (elements.selectModalCloseBtn) {
            elements.selectModalCloseBtn.addEventListener('click', closeSlotSelectModal);
        }
        if (elements.selectPokemonModal) {
            elements.selectPokemonModal.addEventListener('click', (e) => {
                if (e.target === elements.selectPokemonModal) closeSlotSelectModal();
            });
        }
        if (elements.slotSearchInput) {
            elements.slotSearchInput.addEventListener('input', (e) => {
                filterSlotModalPokemon(e.target.value);
            });
        }
    }

    // Inicialización de la aplicación
    initNavigation();
    initPokedexEvents();
    loadMyTeamFromStorage();
    fetchPokedex();
    initTypeButtons();
    initTypeChartEvents();
    initMatchupEvents();
});
