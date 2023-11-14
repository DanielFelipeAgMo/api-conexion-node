const { program } = require('commander') // Se requiere el modulo para crear funciones para ejecutar por comandos
const fs = require('fs') // Se requiere a FileSystem

//Version de la aplicacion de comandos
program.version('0.0.1').description("PlanosCommander es una aplicación de consola, construida en NodeJS para procesar archivos planos para ecommerce")

// Procesar plano de clientes
program.command('procesar-clientes').action(() => {
    
    // Aqui se debe cargar la configuracion del proyecto

    // Se obtiene el plano del proyecto
    let plano = fs.readFileSync('./src/planos/import/clientes.txt', 'utf-8').split('\n')

    let clientes = ''

    fs.writeFileSync('./src/planos/export/clientes.txt', '', {encoding: "utf-8"}) // Se crea el plano en blanco
    for (let i = 0; i < plano.length; i++) {
        const fila = plano[i].split('|');
        clientes += fila[0] + '|'
        clientes += fila[7] + '|'
        clientes += fila[3] + '|'
        clientes += fila[4] + '|'
        clientes += fila[5] + '|'
        clientes += fila[8] + '\n'
    }
    fs.writeFileSync('./src/planos/export/clientes.txt', clientes, {encoding: "utf-8", flag:"a+"})
    console.log('Planos procesados')
})


// Procesa los comandos creados
program.parse(process.argv)