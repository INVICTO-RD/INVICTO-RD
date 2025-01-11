const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const chalk = require('chalk');
const config = require('../config/config.js'); // Importar configuración

const client = new Client({
    authStrategy: new LocalAuth()
});

client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('Bot is ready!');
});

client.on('disconnected', (reason) => {
    console.log('Desconectado del servidor, reconectando...');
});

client.on('authenticated', () => {
    console.log('Conectado al servidor...');
});

client.on('message', message => {
    const sender = message.from;
    const content = message.body;
    const isGroup = message.isGroupMsg;
    const groupName = isGroup ? `Grupo: ${message.chat.name}` : '';

    // Log message details in Termux
    console.log(chalk.blue(`Mensaje de: ${sender}\nContenido: ${content}\n${groupName}`));

    if (content.toLowerCase() === '.registrar' || content.toLowerCase() === '/registrar' || content.toLowerCase() === '#registrar') {
        message.reply('¿Prefieres QR o código? Responde con "QR" o "código".');
    } else if (content.toLowerCase() === '.qr' || content.toLowerCase() === '/qr' || content.toLowerCase() === '#qr') {
        client.on('qr', (qr) => {
            qrcode.generate(qr, { small: true });
            message.reply('Escanea este QR para registrarte.');
        });
    } else if (content.toLowerCase() === '.código' || content.toLowerCase() === '/código' || content.toLowerCase() === '#código') {
        message.reply('Por favor, ingresa tu número de teléfono en el formato +1234567890.');
    } else if (content.startsWith('+')) {
        const phoneNumber = content.trim();
        if (/^\+\d{10,15}$/.test(phoneNumber)) {
            message.reply(`Número ${phoneNumber} registrado exitosamente.`);
        } else {
            message.reply('Formato de número no válido. Intenta nuevamente.');
        }
    } else if (content.toLowerCase() === '.listahoy' || content.toLowerCase() === '/listahoy' || content.toLowerCase() === '#listahoy') {
        if (listaHoy.length === 0) {
            message.reply('No hay personas en la lista de hoy.');
        } else {
            const lista = listaHoy.map((persona, index) => {
                return `${index + 1}. ${persona.numero} [✅]\nFecha de unión: ${persona.fecha}`;
            }).join('\n');
            message.reply(`Lista de hoy:\n${lista}\n\n¿Quieres unirte a la lista? Responde con "Si".`);
        }
    } else if (content.toLowerCase() === '.listamñ' || content.toLowerCase() === '/listamñ' || content.toLowerCase() === '#listamñ') {
        if (listaManana.length >= config.LIMITE_PERSONAS) {
            message.reply('El límite de personas para mañana ya está completo.');
        } else {
            message.reply('Por favor, regístrate con un apodo. Ejemplo: /apodo Juan');
        }
    } else if (content.toLowerCase().startsWith('/apodo ')) {
        const apodo = content.substring(7).trim();
        if (apodo) {
            const persona = {
                numero: sender,
                apodo: apodo,
                fecha: new Date().toLocaleString()
            };
            listaManana.push(persona);
            fs.writeFileSync('./data/listaManana.json', JSON.stringify(listaManana));
            message.reply('Te has agregado a la lista para mañana.');
            // Notificar al dueño del bot
            client.sendMessage(config.OWNER_NUMBER, `Nuevo usuario agregado a la lista:\nNúmero: ${sender}\nApodo: ${apodo}`);
        } else {
            message.reply('Formato de apodo no válido. Intenta nuevamente.');
        }
    } else if (content.toLowerCase() === '.menúlista' || content.toLowerCase() === '/menúlista' || content.toLowerCase() === '#menúlista') {
        const listaHoyTexto = listaHoy.length === 0 ? 'No hay personas en la lista de hoy.' : listaHoy.map((persona, index) => `${index + 1}. ${persona.numero} - ${persona.fecha}`).join('\n');
        const listaMananaTexto = listaManana.length === 0 ? 'No hay personas en la lista de mañana.' : listaManana.map((persona, index) => `${index + 1}. ${persona.numero} - ${persona.fecha}`).join('\n');

        message.reply(`Lista de hoy:\n${listaHoyTexto}\n\nLista de mañana:\n${listaMananaTexto}`);
    } else if (content.toLowerCase() === '.borrar lista' || content.toLowerCase() === '/borrar lista' || content.toLowerCase() === '#borrar lista') {
        if (sender === config.OWNER_NUMBER) {
            listaHoy = [];
            listaManana = [];
            fs.writeFileSync('./data/listaHoy.json', JSON.stringify(listaHoy));
            fs.writeFileSync('./data/listaManana.json', JSON.stringify(listaManana));
            message.reply('Todas las listas han sido borradas.');
        } else {
            message.reply('No tienes permisos para borrar la lista.');
        }
    } else if (content.toLowerCase() === '.borrar lista de hoy' || content.toLowerCase() === '/borrar lista de hoy' || content.toLowerCase() === '#borrar lista de hoy') {
        if (sender === config.OWNER_NUMBER) {
            listaHoy = listaManana;
            listaManana = [];
            fs.writeFileSync('./data/listaHoy.json', JSON.stringify(listaHoy));
            fs.writeFileSync('./data/listaManana.json', JSON.stringify(listaManana));
            message.reply('La lista de hoy ha sido eliminada. La lista de mañana ahora es la lista de hoy y se ha creado una nueva lista para mañana.');
        } else {
            message.reply('No tienes permisos para borrar la lista.');
        }
    } else if (content.toLowerCase() === '.si' || content.toLowerCase() === '/si' || content.toLowerCase() === '#si') {
        if (listaHoy.some(persona => persona.numero === sender)) {
            message.reply('No puedes ser agregado más de una vez en la lista, espera que el dueño borre la lista de hoy para unirte.');
        } else if (listaManana.some(persona => persona.numero === sender)) {
            message.reply('Estás en la lista de mañana, no puedes unirte a la lista de hoy.');
        } else {
            if (listaHoy.length >= config.LIMITE_PERSONAS) {
                message.reply('Se logró el límite de personas para hoy. ¿Quieres apuntarte para mañana? Escribe listaMñ.');
            } else {
                message.reply('Por favor, regístrate con un apodo. Ejemplo: /apodo Juan');
            }
        }
    } else {
        message.reply('Comando no reconocido. Usa ".listahoy", ".listamñ", ".menúlista", ".borrar lista" o ".borrar lista de hoy".');
    }
});

client.initialize(); 
