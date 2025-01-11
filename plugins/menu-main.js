
// plugins/menu-main.js

const { Client } = require('whatsapp-web.js');
const fs = require('fs');
const path = require('path');
const config = require('../config/config.js'); // Importar configuración

function handleMenuCommands(client, message, listaHoy, listaManana) {
    const sender = message.from;
    const content = message.body.toLowerCase();

    switch(content) {
        case '.registrar':
        case '/registrar':
        case '#registrar':
            message.reply('¿Prefieres QR o código? Responde con "QR" o "código".');
            break;
        case '.qr':
        case '/qr':
        case '#qr':
            client.on('qr', (qr) => {
                qrcode.generate(qr, { small: true });
                message.reply('Escanea este QR para registrarte.');
            });
            break;
        case '.código':
        case '/código':
        case '#código':
            message.reply('Por favor, ingresa tu número de teléfono en el formato +1234567890.');
            break;
        case '.listahoy':
        case '/listahoy':
        case '#listahoy':
            showList(message, listaHoy, 'hoy');
            break;
        case '.listamñ':
        case '/listamñ':
        case '#listamñ':
            if (listaManana.length >= config.LIMITE_PERSONAS) {
                message.reply('El límite de personas para mañana ya está completo.');
            } else {
                message.reply('Por favor, regístrate con un apodo. Ejemplo: /apodo Juan');
            }
            break;
        case '.menúlista':
        case '/menúlista':
        case '#menúlista':
            showLists(message, listaHoy, listaManana);
            break;
        case '.borrar lista':
        case '/borrar lista':
        case '#borrar lista':
            if (sender === config.OWNER_NUMBER) {
                clearLists(message, listaHoy, listaManana);
            } else {
                message.reply('No tienes permisos para borrar la lista.');
            }
            break;
        case '.borrar lista de hoy':
        case '/borrar lista de hoy':
        case '#borrar lista de hoy':
            if (sender === config.OWNER_NUMBER) {
                clearTodayList(message, listaHoy, listaManana);
            } else {
                message.reply('No tienes permisos para borrar la lista.');
            }
            break;
        case '.si':
        case '/si':
        case '#si':
            addToList(message, sender, listaHoy, listaManana);
            break;
        default:
            message.reply('Comando no reconocido. Usa ".listahoy", ".listamñ", ".menúlista", ".borrar lista" o ".borrar lista de hoy".');
            break;
    }
}

function showList(message, list, day) {
    if (list.length === 0) {
        message.reply(`No hay personas en la lista de ${day}.`);
    } else {
        const lista = list.map((persona, index) => {
            return `${index + 1}. ${persona.numero} [✅]\nFecha de unión: ${persona.fecha}`;
        }).join('\n');
        message.reply(`Lista de ${day}:\n${lista}\n\n¿Quieres unirte a la lista? Responde con "Si".`);
    }
}

function showLists(message, listaHoy, listaManana) {
    const listaHoyTexto = listaHoy.length === 0 ? 'No hay personas en la lista de hoy.' : listaHoy.map((persona, index) => `${index + 1}. ${persona.numero} - ${persona.fecha}`).join('\n');
    const listaMananaTexto = listaManana.length === 0 ? 'No hay personas en la lista de mañana.' : listaManana.map((persona, index) => `${index + 1}. ${persona.numero} - ${persona.fecha}`).join('\n');

    const menuImagePath = path.join(__dirname, '..', 'images', 'menu.jpg');
    const media = MessageMedia.fromFilePath(menuImagePath);
    message.reply(media);
    message.reply(`Lista de hoy:\n${listaHoyTexto}\n\nLista de mañana:\n${listaMananaTexto}`);
}

function clearLists(message, listaHoy, listaManana) {
    listaHoy.length = 0;
    listaManana.length = 0;
    fs.writeFileSync('./data/listaHoy.json', JSON.stringify(listaHoy));
    fs.writeFileSync('./data/listaManana.json', JSON.stringify(listaManana));
    message.reply('Todas las listas han sido borradas.');
}

function clearTodayList(message, listaHoy, listaManana) {
    listaHoy = listaManana.slice();
    listaManana.length = 0;
    fs.writeFileSync('./data/listaHoy.json', JSON.stringify(listaHoy));
    fs.writeFileSync('./data/listaManana.json', JSON.stringify(listaManana));
    message.reply('La lista de hoy ha sido eliminada. La lista de mañana ahora es la lista de hoy y se ha creado una nueva lista para mañana.');
}

function addToList(message, sender, listaHoy, listaManana) {
    if (listaHoy.some(persona => persona.numero === sender)) {
        message.reply('No puedes ser agregado más de una vez en la lista, espera que el dueño borre la lista de hoy para unirte.');
        message.react('❌');
    } else if (listaManana.some(persona => persona.numero === sender)) {
        message.reply('Estás en la lista de mañana, no puedes unirte a la lista de hoy.');
        message.react('❌');
    } else {
        if (listaHoy.length >= config.LIMITE_PERSONAS) {
            message.reply('Se logró el límite de personas para hoy. ¿Quieres apuntarte para mañana? Escribe listaMñ.');
        } else {
            message.reply('Por favor, regístrate con un apodo. Ejemplo: /apodo Juan');
            message.react('✅');
        }
    }
}

module.exports = handleMenuCommands;
