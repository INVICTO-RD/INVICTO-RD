const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');

const client = new Client({
    authStrategy: new LocalAuth()
});

let listaHoy = JSON.parse(fs.readFileSync('./data/listaHoy.json', 'utf8'));
let listaManana = JSON.parse(fs.readFileSync('./data/listaManana.json', 'utf8'));
const LIMITE_PERSONAS = 35;

client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('Bot is ready!');
});

client.on('message', message => {
    if (message.body.toLowerCase() === 'listahoy') {
        if (listaHoy.length === 0) {
            message.reply('No hay personas en la lista de hoy.');
        } else {
            const lista = listaHoy.map((persona, index) => {
                return `${index + 1}. ${persona.numero} [✅]\nFecha de unión: ${persona.fecha}`;
            }).join('\n');
            message.reply(`Lista de hoy:\n${lista}\n\n¿Quieres unirte a la lista? Responde con "Si".`);
        }
    } else if (message.body.toLowerCase() === 'listamñ') {
        if (listaManana.length >= LIMITE_PERSONAS) {
            message.reply('El límite de personas para mañana ya está completo.');
        } else {
            const persona = {
                numero: message.from,
                fecha: new Date().toLocaleString()
            };
            listaManana.push(persona);
            fs.writeFileSync('./data/listaManana.json', JSON.stringify(listaManana));
            message.reply('Te has agregado a la lista para mañana.');
        }
    } else if (message.body.toLowerCase() === 'menúlista') {
        const listaHoyTexto = listaHoy.length === 0 ? 'No hay personas en la lista de hoy.' : listaHoy.map((persona, index) => `${index + 1}. ${persona.numero} - ${persona.fecha}`).join('\n');
        const listaMananaTexto = listaManana.length === 0 ? 'No hay personas en la lista de mañana.' : listaManana.map((persona, index) => `${index + 1}. ${persona.numero} - ${persona.fecha}`).join('\n');

        message.reply(`Lista de hoy:\n${listaHoyTexto}\n\nLista de mañana:\n${listaMananaTexto}`);
    } else if (message.body.toLowerCase() === 'borrar lista') {
        listaHoy = [];
        listaManana = [];
        fs.writeFileSync('./data/listaHoy.json', JSON.stringify(listaHoy));
        fs.writeFileSync('./data/listaManana.json', JSON.stringify(listaManana));
        message.reply('Todas las listas han sido borradas.');
    } else if (message.body.toLowerCase() === 'si') {
        if (listaHoy.some(persona => persona.numero === message.from)) {
            message.reply('No puedes ser agregado más de una vez en la lista, espera que el dueño borre la lista de hoy para unirte.');
        } else if (listaManana.some(persona => persona.numero === message.from)) {
            message.reply('Estás en la lista de mañana, no puedes unirte a la lista de hoy.');
        } else {
            if (listaHoy.length >= LIMITE_PERSONAS) {
                message.reply('Se logró el límite de personas para hoy. ¿Quieres apuntarte para mañana? Escribe listaMñ.');
            } else {
                const persona = {
                    numero: message.from,
                    fecha: new Date().toLocaleString()
                };
                listaHoy.push(persona);
                fs.writeFileSync('./data/listaHoy.json', JSON.stringify(listaHoy));
                message.reply('Te has agregado a la lista de hoy.');
            }
        }
    } else {
        message.reply('Comando no reconocido. Usa "listahoy", "listamñ", "menúlista" o "borrar lista".');
    }
});

client.initialize();
