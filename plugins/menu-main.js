// menu-main.js

function showMenu() {
    const commands = [
        { command: '.help', description: 'Muestra la lista de comandos disponibles' },
        { command: '.info', description: 'Proporciona información sobre el bot' },
        { command: '.exit', description: 'Cierra el menú' }
    ];

    const menuHeader = `
        <div style="text-align: center;">
            <img src="https://i.postimg.cc/sDKhjV8B/IMG-20250111-WA0042.jpg" alt="Foto de perfil" style="width: 100px; height: 100px;">
            <h2>Menú de Comandos</h2>
        </div>
    `;

    const menuBody = commands.map(cmd => `
        <p><strong>${cmd.command}</strong> - ${cmd.description}</p>
    `).join('');

    const menu = `
        <div style="border: 1px solid black; padding: 10px;">
            ${menuHeader}
            ${menuBody}
        </div>
    `;

    console.log(menu);
}

// Ejemplo de cómo se llamaría a la función showMenu cuando se escribe .menu
const input = '.menu';
if (input === '.menu') {
    showMenu();
}
