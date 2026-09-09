/**
 * Pokémon Champions Companion - Main Script
 */

document.addEventListener('DOMContentLoaded', () => {
    console.log('Pokémon Champions Companion inicializado.');

    // Notificación informativa para características deshabilitadas
    const disabledButtons = document.querySelectorAll('.nav-btn.disabled');

    disabledButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const tabName = button.getAttribute('data-tab');
            console.log(`Pestaña '${tabName}' seleccionada. Estará disponible en futuras versiones.`);
        });
    });
});
