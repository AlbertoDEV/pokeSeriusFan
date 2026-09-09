/**
 * Pokémon Champions Companion - Types Data Module
 * Base de datos local de la matriz de efectividad de tipos Pokémon Gen 6+
 */

const POKEMON_TYPES = {
    normal:   { id: 'normal',   name: 'Normal',   color: '#A8A77A', textBg: '#2d2d20' },
    fire:     { id: 'fire',     name: 'Fuego',    color: '#EE8130', textBg: '#3d1f0a' },
    water:    { id: 'water',    name: 'Agua',     color: '#6390F0', textBg: '#122347' },
    grass:    { id: 'grass',    name: 'Planta',   color: '#7AC74C', textBg: '#1b330e' },
    electric: { id: 'electric', name: 'Eléctrico',color: '#F7D02C', textBg: '#3b3102' },
    ice:      { id: 'ice',      name: 'Hielo',    color: '#96D9D6', textBg: '#1a3736' },
    fighting: { id: 'fighting', name: 'Lucha',    color: '#C22E28', textBg: '#3a0806' },
    poison:   { id: 'poison',   name: 'Veneno',   color: '#A33EA2', textBg: '#2b0b2b' },
    ground:   { id: 'ground',   name: 'Tierra',   color: '#E2BF65', textBg: '#382e12' },
    flying:   { id: 'flying',   name: 'Volador',  color: '#A98FF3', textBg: '#251b40' },
    psychic:  { id: 'psychic',  name: 'Psíquico', color: '#F95587', textBg: '#3d0a1b' },
    bug:      { id: 'bug',      name: 'Bicho',    color: '#A6B91A', textBg: '#272d02' },
    rock:     { id: 'rock',     name: 'Roca',     color: '#B6A136', textBg: '#2e2808' },
    ghost:    { id: 'ghost',    name: 'Fantasma', color: '#735797', textBg: '#1d1329' },
    dragon:   { id: 'dragon',   name: 'Dragón',   color: '#6F35FC', textBg: '#1a0b45' },
    dark:     { id: 'dark',     name: 'Siniestro', color: '#705746', textBg: '#211812' },
    steel:    { id: 'steel',    name: 'Acero',    color: '#B7B7CE', textBg: '#2a2a33' },
    fairy:    { id: 'fairy',    name: 'Hada',     color: '#D685AD', textBg: '#381c2b' }
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
