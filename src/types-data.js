/**
 * Pokémon Champions Companion - Types Data Module
 * Base de datos local de la matriz de efectividad de tipos Pokémon Gen 6+
 */

const POKEMON_TYPES = {
    normal:   { id: 'normal',   name: 'Normal',   color: '#A8A77A', textBg: '#2d2d20', icon: '<svg viewBox="0 0 24 24" width="100%" height="100%" fill="currentColor"><circle cx="12" cy="12" r="8" stroke="currentColor" stroke-width="2" fill="none"/><circle cx="12" cy="12" r="3"/></svg>' },
    fire:     { id: 'fire',     name: 'Fuego',    color: '#EE8130', textBg: '#3d1f0a', icon: '<svg viewBox="0 0 24 24" width="100%" height="100%" fill="currentColor"><path d="M12 2C10.5 4.5 10 7 11.5 9.5C12.5 11 12 12.5 10.5 13C9 13.5 7.5 12 7.5 10C5 12.5 5 16 7.5 18.5C10 21 14 21 16.5 18.5C19 16 19 12 16.5 9.5C15 11 13.5 11 13 9.5C12.5 8 14 6 12 2Z"/></svg>' },
    water:    { id: 'water',    name: 'Agua',     color: '#6390F0', textBg: '#122347', icon: '<svg viewBox="0 0 24 24" width="100%" height="100%" fill="currentColor"><path d="M12 2.5C12 2.5 5 11 5 15.5C5 19.1 7.9 22 11.5 22C15.1 22 18 19.1 18 15.5C18 11 12 2.5 12 2.5ZM12 19.5C9.5 19.5 7.5 17.5 7.5 15C7.5 13.5 9.5 9.5 12 6.3C14.5 9.5 16.5 13.5 16.5 15C16.5 17.5 14.5 19.5 12 19.5Z"/></svg>' },
    grass:    { id: 'grass',    name: 'Planta',   color: '#7AC74C', textBg: '#1b330e', icon: '<svg viewBox="0 0 24 24" width="100%" height="100%" fill="currentColor"><path d="M17 3C10 3 6 8 6 14C6 18.5 9.5 21 12 21C14.5 21 18 18.5 18 14C18 11 17 3 17 3ZM12 19C10.5 19 8 17 8 14C8 10 10.5 6.5 15 5C14.5 9 15.5 14 12 19Z"/><path d="M12 11V21" stroke="currentColor" stroke-width="2"/></svg>' },
    electric: { id: 'electric', name: 'Eléctrico',color: '#F7D02C', textBg: '#3b3102', icon: '<svg viewBox="0 0 24 24" width="100%" height="100%" fill="currentColor"><path d="M11 2L4 13H11L9 22L18 10H12L14 2H11Z"/></svg>' },
    ice:      { id: 'ice',      name: 'Hielo',    color: '#96D9D6', textBg: '#1a3736', icon: '<svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 2V22M2 12H22M5 5L19 19M5 19L19 5"/></svg>' },
    fighting: { id: 'fighting', name: 'Lucha',    color: '#C22E28', textBg: '#3a0806', icon: '<svg viewBox="0 0 24 24" width="100%" height="100%" fill="currentColor"><path d="M19 10C19 8.9 18.1 8 17 8H15V6C15 4.9 14.1 4 13 4H10C8.9 4 8 4.9 8 6V8H7C5.9 8 5 8.9 5 10V18C5 19.1 5.9 20 7 20H17C18.1 20 19 19.1 19 18V10ZM10 6H13V8H10V6Z"/></svg>' },
    poison:   { id: 'poison',   name: 'Veneno',   color: '#A33EA2', textBg: '#2b0b2b', icon: '<svg viewBox="0 0 24 24" width="100%" height="100%" fill="currentColor"><path d="M12 2C8 2 5 5 5 9C5 12 7 14 8 15V18C8 19 9 20 10 20H14C15 20 16 19 16 18V15C17 14 19 12 19 9C19 5 16 2 12 2ZM9 9C9 8 10 7 11 7C11.5 7 12 7.5 12 8C12 8.5 11.5 9 11 9H9ZM15 9H13C12.5 9 12 8.5 12 8C12 7.5 12.5 7 13 7C14 7 15 8 15 9Z"/></svg>' },
    ground:   { id: 'ground',   name: 'Tierra',   color: '#E2BF65', textBg: '#382e12', icon: '<svg viewBox="0 0 24 24" width="100%" height="100%" fill="currentColor"><path d="M12 3L2 12H6V20H18V12H22L12 3ZM12 7.5L16 11H14V18H10V11H8L12 7.5Z"/></svg>' },
    flying:   { id: 'flying',   name: 'Volador',  color: '#A98FF3', textBg: '#251b40', icon: '<svg viewBox="0 0 24 24" width="100%" height="100%" fill="currentColor"><path d="M12 3C8 3 4 6 2 9C5 9 8 8 10 7C8 10 7 13 8 15C10 12 13 10 16 9C14 12 14 15 15 17C17 14 19 11 22 9C20 6 16 3 12 3Z"/></svg>' },
    psychic:  { id: 'psychic',  name: 'Psíquico', color: '#F95587', textBg: '#3d0a1b', icon: '<svg viewBox="0 0 24 24" width="100%" height="100%" fill="currentColor"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="4"/><path d="M12 2A10 10 0 0 0 2 12" fill="none" stroke="currentColor" stroke-width="2"/></svg>' },
    bug:      { id: 'bug',      name: 'Bicho',    color: '#A6B91A', textBg: '#272d02', icon: '<svg viewBox="0 0 24 24" width="100%" height="100%" fill="currentColor"><circle cx="12" cy="12" r="6"/><path d="M12 3V6M6 7L8 9M18 7L16 9M4 12H6M18 12H20M6 17L8 15M18 17L16 15M12 18V21" stroke="currentColor" stroke-width="2"/></svg>' },
    rock:     { id: 'rock',     name: 'Roca',     color: '#B6A136', textBg: '#2e2808', icon: '<svg viewBox="0 0 24 24" width="100%" height="100%" fill="currentColor"><path d="M12 2L4 7V17L12 22L20 17V7L12 2ZM12 4.5L17.5 8L12 11.5L6.5 8L12 4.5Z"/></svg>' },
    ghost:    { id: 'ghost',    name: 'Fantasma', color: '#735797', textBg: '#1d1329', icon: '<svg viewBox="0 0 24 24" width="100%" height="100%" fill="currentColor"><path d="M12 3C7.6 3 4 6.6 4 11V21L8 19L12 21L16 19L20 21V11C20 6.6 16.4 3 12 3ZM9 10C9.8 10 10.5 10.7 10.5 11.5C10.5 12.3 9.8 13 9 13C8.2 13 7.5 12.3 7.5 11.5C7.5 10.7 8.2 10 9 10ZM15 10C15.8 10 16.5 10.7 16.5 11.5C16.5 12.3 15.8 13 15 13C14.2 13 13.5 12.3 13.5 11.5C13.5 10.7 14.2 10 15 10Z"/></svg>' },
    dragon:   { id: 'dragon',   name: 'Dragón',   color: '#6F35FC', textBg: '#1a0b45', icon: '<svg viewBox="0 0 24 24" width="100%" height="100%" fill="currentColor"><path d="M12 2C8 2 4 5 4 10C4 15 7 19 12 22C17 19 20 15 20 10C20 5 16 2 12 2ZM12 6C13.5 6 15 7.5 15 9C15 10.5 13.5 12 12 12C10.5 12 9 10.5 9 9C9 7.5 10.5 6 12 6Z"/></svg>' },
    dark:     { id: 'dark',     name: 'Siniestro', color: '#705746', textBg: '#211812', icon: '<svg viewBox="0 0 24 24" width="100%" height="100%" fill="currentColor"><path d="M12 2A10 10 0 1 0 22 12A8 8 0 0 1 12 2Z"/></svg>' },
    steel:    { id: 'steel',    name: 'Acero',    color: '#B7B7CE', textBg: '#2a2a33', icon: '<svg viewBox="0 0 24 24" width="100%" height="100%" fill="currentColor"><path d="M12 2L2 7V17L12 22L22 17V7L12 2ZM12 4.2L19.5 8L12 11.8L4.5 8L12 4.2ZM4 9.6L11 13.1V19.8L4 16.3V9.6ZM13 19.8V13.1L20 9.6V16.3L13 19.8Z"/></svg>' },
    fairy:    { id: 'fairy',    name: 'Hada',     color: '#D685AD', textBg: '#381c2b', icon: '<svg viewBox="0 0 24 24" width="100%" height="100%" fill="currentColor"><path d="M12 2L14.5 8.5L21 9.2L16 13.5L17.5 20L12 16.5L6.5 20L8 13.5L3 9.2L9.5 8.5L12 2Z"/></svg>' }
};

// Orden oficial para presentación
const TYPE_KEYS = Object.keys(POKEMON_TYPES);

/**
 * Matriz de efectividad de ataque -> defensa
 * [Atacante][Defensor] = multiplicador
 */
const TYPE_CHART = {
    normal: {
        normal: 1, fire: 1, water: 1, grass: 1, electric: 1, ice: 1, fighting: 1, poison: 1, ground: 1, flying: 1, psychic: 1, bug: 1, rock: 0.5, ghost: 0, dragon: 1, dark: 1, steel: 0.5, fairy: 1
    },
    fire: {
        normal: 1, fire: 0.5, water: 0.5, grass: 2, electric: 1, ice: 2, fighting: 1, poison: 1, ground: 1, flying: 1, psychic: 1, bug: 2, rock: 0.5, ghost: 1, dragon: 0.5, dark: 1, steel: 2, fairy: 1
    },
    water: {
        normal: 1, fire: 2, water: 0.5, grass: 0.5, electric: 1, ice: 1, fighting: 1, poison: 1, ground: 2, flying: 1, psychic: 1, bug: 1, rock: 2, ghost: 1, dragon: 0.5, dark: 1, steel: 1, fairy: 1
    },
    grass: {
        normal: 1, fire: 0.5, water: 2, grass: 0.5, electric: 1, ice: 1, fighting: 1, poison: 0.5, ground: 2, flying: 0.5, psychic: 1, bug: 0.5, rock: 2, ghost: 1, dragon: 0.5, dark: 1, steel: 0.5, fairy: 1
    },
    electric: {
        normal: 1, fire: 1, water: 2, grass: 0.5, electric: 0.5, ice: 1, fighting: 1, poison: 1, ground: 0, flying: 2, psychic: 1, bug: 1, rock: 1, ghost: 1, dragon: 0.5, dark: 1, steel: 1, fairy: 1
    },
    ice: {
        normal: 1, fire: 0.5, water: 0.5, grass: 2, electric: 1, ice: 0.5, fighting: 1, poison: 1, ground: 2, flying: 2, psychic: 1, bug: 1, rock: 1, ghost: 1, dragon: 2, dark: 1, steel: 0.5, fairy: 1
    },
    fighting: {
        normal: 2, fire: 1, water: 1, grass: 1, electric: 1, ice: 2, fighting: 1, poison: 0.5, ground: 1, flying: 0.5, psychic: 0.5, bug: 0.5, rock: 2, ghost: 0, dragon: 1, dark: 2, steel: 2, fairy: 0.5
    },
    poison: {
        normal: 1, fire: 1, water: 1, grass: 2, electric: 1, ice: 1, fighting: 1, poison: 0.5, ground: 0.5, flying: 1, psychic: 1, bug: 1, rock: 0.5, ghost: 0.5, dragon: 1, dark: 1, steel: 0, fairy: 2
    },
    ground: {
        normal: 1, fire: 2, water: 1, grass: 0.5, electric: 2, ice: 1, fighting: 1, poison: 2, ground: 1, flying: 0, psychic: 1, bug: 0.5, rock: 2, ghost: 1, dragon: 1, dark: 1, steel: 2, fairy: 1
    },
    flying: {
        normal: 1, fire: 1, water: 1, grass: 2, electric: 0.5, ice: 1, fighting: 2, poison: 1, ground: 1, flying: 1, psychic: 1, bug: 2, rock: 0.5, ghost: 1, dragon: 1, dark: 1, steel: 0.5, fairy: 1
    },
    psychic: {
        normal: 1, fire: 1, water: 1, grass: 1, electric: 1, ice: 1, fighting: 2, poison: 2, ground: 1, flying: 1, psychic: 0.5, bug: 1, rock: 1, ghost: 1, dragon: 1, dark: 0, steel: 0.5, fairy: 1
    },
    bug: {
        normal: 1, fire: 0.5, water: 1, grass: 2, electric: 1, ice: 1, fighting: 0.5, poison: 0.5, ground: 1, flying: 0.5, psychic: 2, bug: 1, rock: 1, ghost: 0.5, dragon: 1, dark: 2, steel: 0.5, fairy: 0.5
    },
    rock: {
        normal: 1, fire: 2, water: 1, grass: 1, electric: 1, ice: 2, fighting: 0.5, poison: 1, ground: 0.5, flying: 2, psychic: 1, bug: 2, rock: 1, ghost: 1, dragon: 1, dark: 1, steel: 0.5, fairy: 1
    },
    ghost: {
        normal: 0, fire: 1, water: 1, grass: 1, electric: 1, ice: 1, fighting: 1, poison: 1, ground: 1, flying: 1, psychic: 2, bug: 1, rock: 1, ghost: 2, dragon: 1, dark: 0.5, steel: 1, fairy: 1
    },
    dragon: {
        normal: 1, fire: 1, water: 1, grass: 1, electric: 1, ice: 1, fighting: 1, poison: 1, ground: 1, flying: 1, psychic: 1, bug: 1, rock: 1, ghost: 1, dragon: 2, dark: 1, steel: 0.5, fairy: 0
    },
    dark: {
        normal: 1, fire: 1, water: 1, grass: 1, electric: 1, ice: 1, fighting: 0.5, poison: 1, ground: 1, flying: 1, psychic: 2, bug: 1, rock: 1, ghost: 2, dragon: 1, dark: 0.5, steel: 1, fairy: 0.5
    },
    steel: {
        normal: 1, fire: 0.5, water: 0.5, grass: 1, electric: 0.5, ice: 2, fighting: 1, poison: 1, ground: 1, flying: 1, psychic: 1, bug: 1, rock: 2, ghost: 1, dragon: 1, dark: 1, steel: 0.5, fairy: 2
    },
    fairy: {
        normal: 1, fire: 0.5, water: 1, grass: 1, electric: 1, ice: 1, fighting: 2, poison: 0.5, ground: 1, flying: 1, psychic: 1, bug: 1, rock: 1, ghost: 1, dragon: 2, dark: 2, steel: 0.5, fairy: 1
    }
};

/**
 * Calcula los multiplicadores defensivos para 1 o 2 tipos
 * @param {string} type1 - Clave del primer tipo
 * @param {string|null} type2 - Clave del segundo tipo (opcional)
 * @returns {Object} Objeto categorizado por multiplicador
 */
function calculateDefenseMatchups(type1, type2 = null) {
    const results = {
        x4: [],
        x2: [],
        x1: [],
        x05: [],
        x025: [],
        x0: []
    };

    if (!type1 || !POKEMON_TYPES[type1]) return results;

    TYPE_KEYS.forEach(attackerType => {
        const mult1 = TYPE_CHART[attackerType][type1];
        const mult2 = type2 && POKEMON_TYPES[type2] ? TYPE_CHART[attackerType][type2] : 1;
        const totalMult = mult1 * mult2;

        const typeInfo = POKEMON_TYPES[attackerType];

        if (totalMult === 4) {
            results.x4.push(typeInfo);
        } else if (totalMult === 2) {
            results.x2.push(typeInfo);
        } else if (totalMult === 1) {
            results.x1.push(typeInfo);
        } else if (totalMult === 0.5) {
            results.x05.push(typeInfo);
        } else if (totalMult === 0.25) {
            results.x025.push(typeInfo);
        } else if (totalMult === 0) {
            results.x0.push(typeInfo);
        }
    });

    return results;
}

/**
 * Calcula la efectividad ofensiva para 1 o 2 tipos atacantes contra todos los tipos defensores
 * @param {string} type1 - Clave del primer tipo
 * @param {string|null} type2 - Clave del segundo tipo (opcional)
 * @returns {Object} Objeto categorizado por multiplicador máximo de ataque
 */
function calculateOffenseMatchups(type1, type2 = null) {
    const results = {
        x2: [],
        x1: [],
        x05: [],
        x0: []
    };

    if (!type1 || !POKEMON_TYPES[type1]) return results;

    TYPE_KEYS.forEach(defenderType => {
        const mult1 = TYPE_CHART[type1][defenderType];
        const mult2 = type2 && POKEMON_TYPES[type2] ? TYPE_CHART[type2][defenderType] : null;

        // Si hay 2 tipos, para ofensiva se toma la mejor cobertura de stabs/movimientos
        const maxMult = mult2 !== null ? Math.max(mult1, mult2) : mult1;
        const typeInfo = POKEMON_TYPES[defenderType];

        if (maxMult === 2) {
            results.x2.push(typeInfo);
        } else if (maxMult === 1) {
            results.x1.push(typeInfo);
        } else if (maxMult === 0.5) {
            results.x05.push(typeInfo);
        } else if (maxMult === 0) {
            results.x0.push(typeInfo);
        }
    });

    return results;
}

// Exportación global para entorno de navegador tradicional
if (typeof window !== 'undefined') {
    window.POKEMON_TYPES = POKEMON_TYPES;
    window.TYPE_KEYS = TYPE_KEYS;
    window.TYPE_CHART = TYPE_CHART;
    window.calculateDefenseMatchups = calculateDefenseMatchups;
    window.calculateOffenseMatchups = calculateOffenseMatchups;
}

// Exportación para entornos Node.js (pruebas)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        POKEMON_TYPES,
        TYPE_KEYS,
        TYPE_CHART,
        calculateDefenseMatchups,
        calculateOffenseMatchups
    };
}
