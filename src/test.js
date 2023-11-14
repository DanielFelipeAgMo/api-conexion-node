const { program } = require('commander') // Se requiere el modulo para crear funciones para ejecutar por comandos
const fs = require('fs') // Se requiere a FileSystem
const WooCommerceRestApi = require("@woocommerce/woocommerce-rest-api").default; // Requerir api de woocommerce

//Version de la aplicacion de comandos
program.version('0.0.1').description("TaskComander es una aplicación de consola, construida en NodeJS para ejecutar tareas mediante comandos para procesar información de un ERP a un eCommerce.")

//Comando de ejemplo para probar
program.command('proyecto <comando>').action((comando) => {
    console.log('Hacer algo para el proyecto con el siguiente comando: ' + comando)
})

// Obtener categorias ecommerce
program.command('obtener-categorias <proyecto>').action((proyecto) => {

    // Obtener configuracion del proyecto
    let config = require('./config/'+proyecto+'.json')
    // Conectar con WooCommerce
    let WooCommerce = new WooCommerceRestApi(config.WooApiConexion)
    // Obtener categorias
    WooCommerce.get("products/categories", {per_page:20})
    .then((response) => {
        console.log(response.data); // Se puede obtener datos asi response.data[0].id
        console.log('Total: ' + response.data.length)
    })
    .catch((error) => {
        console.log(error.response.data);
    });
    //console.log(config.WooApiConexion)
})

// Obtener productos Ecommerce
program.command('obtener-productos <proyecto>').action((proyecto) => {

    // Obtener configuracion del proyecto
    let config = require('./config/'+proyecto+'.json')
    // Conectar con WooCommerce
    let WooCommerce = new WooCommerceRestApi(config.WooApiConexion)
    
    // Obtener productos
    WooCommerce.get("products")
    .then((response) => {
        console.log(response.data); // Se puede obtener datos asi response.data[0].id
        
        console.log('Total: ' + response.data.length + ' productos')
        //console.log(response.data.length)
    })
    .catch((error) => {
        console.log(error.response.data);
    });
    //console.log(config.WooApiConexion)
})

// Obtener Ordenes ecommerce
program.command('obtener-ordenes <proyecto>').action((proyecto) => {

    // Obtener configuracion del proyecto
    let config = require('./config/'+proyecto+'.json')
    // Conectar con WooCommerce
    let WooCommerce = new WooCommerceRestApi(config.WooApiConexion)
    // Obtener productos
    WooCommerce.get("orders")
    .then((response) => {
        console.log(response.data); // Se puede obtener datos asi response.data[0].id
        
        console.log('Total: ' + response.data.length + ' ordenes')
        //console.log(response.data.length)
    })
    .catch((error) => {
        console.log(error.response.data);
    });
    //console.log(config.WooApiConexion)
})

// Procesar plano de productos
program.command('procesar-productos <proyecto>').action((proyecto) => {
    
    // Aqui se debe cargar la configuracion del proyecto

    // Se obtiene el plano del proyecto
    let plano = fs.readFileSync('./src/projects/'+proyecto+'/productos.txt', 'utf-8').split('\n')
    let fnProducto = require('./functions/producto') // Requerir funcion para armar el producto
    let encabezado = plano[0].split('|') // Encabezado en la primera linea

    let productos = []
    for (let i = 1; i < plano.length; i++) {
        const fila = plano[i].split('|');
        let producto = new fnProducto(encabezado, fila)
        productos.push(producto.producto())
        //console.log('Producto ' + i + ' procesado')
    }
    console.log(productos)
})

// Procesar categorias desde el plano de productos para el ecommerce
program.command('procesar-categorias <proyecto>').action((proyecto) => {
    let plano = fs.readFileSync('./src/projects/'+proyecto+'/productos.txt', 'utf-8').split('\n')
    let fnProducto = require('./functions/producto') // Funcion para formatear el producto
    let config = require('./config/'+proyecto+'.json') // Configuracion del proyecto
    let encabezado = plano[config.headerPosition].split(config.columnDelimiter) // Establecer encabezado
    let WooCommerce = new WooCommerceRestApi(config.WooApiConexion) // Conectar con WooCommerce
    // Iterar los productos
    let crear = []
    for (let i = 1; i < plano.length; i++) {
        let fila = plano[i].split(config.columnDelimiter)
        let contador = 5
        while (contador < 9) {
            crear.push({name: fila[contador]})
            contador++
        }
    }
    let categorias = {create:crear}
    WooCommerce.post("products/categories/batch", categorias)
    .then((response) => {
        console.log(response.data); // Se puede obtener datos asi response.data[0].id
        
        let arrItems = response.data.create
        let creados = 0
        let noCreados = 0
        for (let i = 0; i < arrItems.length; i++) {
            const elemento = arrItems[i];
            if (elemento.id != 0) {
                creados = creados + 1
            }else{
                noCreados = noCreados + 1
            }
        }
        console.log('Creados: ' + creados)
        console.log('No creados: ' + noCreados + ' (Categorias repetidas)')
        console.log('Total: ' + response.data.create.length + ' categorias procesadas')
    })
    .catch((error) => {
        console.log(error.response.data);
    })

})

// Crear productos desde el plano
program.command('crear-productos <proyecto>').action((proyecto) => {
    
    // Aqui se debe cargar la configuracion del proyecto
    let config = require('./config/'+proyecto+'.json') // Configuracion del proyecto
    // Se obtiene el plano del proyecto
    let plano = fs.readFileSync('./src/projects/'+proyecto+'/productos.txt', 'utf-8').split('\n')
    let fnProducto = require('./functions/producto') // Requerir funcion para armar el producto
    let fnFormato = require('./functions/formatWoo')
    let encabezado = plano[config.headerPosition].split(config.columnDelimiter) // Establecer encabezado

    let WooCommerce = new WooCommerceRestApi(config.WooApiConexion) // Conectar con WooCommerce

    
    // Obtener Categorias
    WooCommerce.get("products/categories", {per_page: 20})
    .then((response) => {
        //console.log(response.data);
        let productos = []
        let categorias = [] // Array vacio para categorias obtenidas del ecommerce

        // Iterar las categorias para obtener nombre y id
        for (let i = 0; i < response.data.length; i++) {
            const element = response.data[i];
            let clave = element.name
            let valor = element.id
            categorias[clave] = valor
        }
        //console.log(categorias)
        //console.log(categorias.find(({name}) => name === 'CORONA').id)
        

        for (let i = 1; i < plano.length; i++) {
            const fila = plano[i].split(config.columnDelimiter);
            let producto = new fnProducto(encabezado, fila) // Asociar producto con encabezado
            let categories = [] // Array Categorias definitivas
            
            let categoria1 = producto.producto().category_1
            let categoria2 = producto.producto().category_2
            let categoria3 = producto.producto().category_3
            let categoria4 = producto.producto().category_4

            let categoriesProduct = [
                categorias[categoria1],
                categorias[categoria2],
                categorias[categoria3],
                categorias[categoria4]
            ]

            let counter = 0
            /* console.log(categorias[categoria1], categorias[categoria2], categorias[categoria3], categorias[categoria4]) */
            while (counter < 4) {
                //console.log(categoriesProduct[counter])
                if (categoriesProduct[counter] != null) {
                    categories.push({id:categoriesProduct[counter]})
                }
                counter++
            }
            //console.log(categories)
            //let cat1 = categorias.find(({name}) => name === categoria1).id
            //console.log(cat1)
            //let nombre = producto.producto().category_1
            //console.log(nombre)
            //console.log(producto.producto())
            //console.log('Producto ' + i + ' procesado')
            //console.log(fnFormato.producto(producto.producto(), categories))
            productos.push(fnFormato.producto(producto.producto(), categories)) // Formatear producto para woocommerce e insertar en productos
        }
        
        WooCommerce.post("products/batch", {create:productos})
        .then((response) => {
            console.log(response.data); // Se puede obtener datos asi response.data[0].id
            
            let arrItems = response.data.create
            let creados = 0
            let noCreados = 0
            for (let i = 0; i < arrItems.length; i++) {
                const elemento = arrItems[i];
                if (elemento.id != 0) {
                    creados = creados + 1
                }else{
                    noCreados = noCreados + 1
                }
            }
            console.log('Creados: ' + creados)
            console.log('No creados: ' + noCreados)
            console.log('Total: ' + response.data.create.length)
        })
        .catch((error) => {
            console.log(error.response.data);
        })

    })
    .catch((error) => {
        console.log(error.response.data);
    });

    
    /* let productos = []
    for (let i = 1; i < plano.length; i++) {
        const fila = plano[i].split('|');
        let producto = new fnProducto(encabezado, fila) // Asociar producto con encabezado
        productos.push(fnFormato.producto(producto.producto())) // Formatear producto para woocommerce e insertar en productos
        //console.log('Producto ' + i + ' procesado')
        //console.log(fnFormato.producto(producto.producto()))
    } */

    /* WooCommerce.post("products/batch", {create:productos})
    .then((response) => {
        console.log(response.data); // Se puede obtener datos asi response.data[0].id
        
        let arrItems = response.data.create
        let creados = 0
        let noCreados = 0
        for (let i = 0; i < arrItems.length; i++) {
            const elemento = arrItems[i];
            if (elemento.id != 0) {
                creados = creados + 1
            }else{
                noCreados = noCreados + 1
            }
        }
        console.log('Creados: ' + creados)
        console.log('No creados: ' + noCreados)
        console.log('Total: ' + response.data.create.length)
    })
    .catch((error) => {
        console.log(error.response.data);
    }) */
    //console.log(productos)

})

// Actualizar stock y precio desde el plano
program.command('obtener-producto <proyecto>').action((proyecto) => {
    console.log('## Actualizar producto con precio y stock')
    console.log('Consultando configuración del proyecto...')
    let config = require('./config/'+proyecto+'.json') // Obtener configuracion del proyecto
    console.log('Conectando con ecommerce...')
    let WooCommerce = new WooCommerceRestApi(config.WooApiConexion) // Conectar con WooCommerce
    console.log('Consultando plano de productos...')
    let planos = fs.readFileSync('./src/projects/'+proyecto+'/productos.txt', 'utf-8').split('\n') // Cargar plano
    let fnProducto = require('./functions/producto') // Funcion para armar el producto con el header
    
    let encabezado = planos[config.headerPosition].split(config.columnDelimiter); // Encabezado del plano
    console.log('Iterando productos del plano.')
    console.log('-----------------------------')
    for (let i = 1; i < planos.length; i++) {
        const fila = planos[i].split(config.columnDelimiter)
        let producto = new fnProducto(encabezado, fila)
        console.log('Consultando producto en el ecommerce...')
        
        WooCommerce.get("products", {sku:producto.producto().sku})
        .then((response) => {
            console.log('Procesando producto id: '+response.data[0].id); // Se puede obtener datos asi response.data[0].id
            
            //console.log(response.data[0].name); // Nombre del producto

            // Actualizar informacion del producto
            let datos = {
                regular_price: producto.producto().price,
                stock_quantity: producto.producto().stock
            }

            WooCommerce.put("products/"+response.data[0].id, datos)
            .then((response) => {
                console.log('Producto con id:'+ response.data.id+' y sku: '+response.data.sku+' actualizado')
            })
            .catch((err) => {
                console.log(err);
            });
            //console.log(response.data.length)
        })
        .catch((error) => {
            console.log(error.response.data);
        });
        //productos.push(producto.producto())
        //console.log('Producto ' + i + ' procesado')
    }
    
    
})

// Actualizar imagenes de productos
program.command('fotos-producto <proyecto>').action((proyecto) => {
    const http = require('http')
    console.log('## Actualizar imagenes de productos')
    console.log('Consultando configuración del proyecto...')
    let config = require('./config/'+proyecto+'.json') // Obtener configuracion del proyecto
    console.log('Conectando con ecommerce...')
    let WooCommerce = new WooCommerceRestApi(config.WooApiConexion) // Conectar con WooCommerce
    console.log('Consultando productos...')

    
    WooCommerce.get("reports/products/totals")
    .then((response) => {
        let numItems = response.data[2].total // total de productos simples
        console.log('Total productos simples para procesar: ' + numItems)

        // Calcular cantidad de paginas dividido el total de productos
        let paginas = numItems / 100
        // Validar resultado si es numero entero o decimal
        if (Number.isInteger(paginas)) {
            console.log('Es entero')
        }else{
            //console.log('Es decimal')
            paginas++
        }
        // Validar si la cantidad de paginas es mayor a 1 o no
        if (parseInt(paginas) > 1) {
            console.log(parseInt(paginas) + ' paginas para '+ numItems+' elementos')
            console.log(paginas + ' paginas para '+ numItems+' elementos')
            let totalPaginas = parseInt(paginas) + 1

            
            // Iterar los productos
            for (let i = 1; i < totalPaginas; i++) {
                const pagina = i;
                //console.log('Pagina: '+pagina)
                // Obtener 100 productos por pagina
                WooCommerce.get("products", {page:pagina, per_page:100})
                .then((response) => {
                    let respuesta = response.data
                    for (let i = 0; i < respuesta.length; i++) {
                        const producto = respuesta[i];
                        let pathImg = config.urlImages+producto.sku+'.jpg'
                        http.get(pathImg, (resp) => {
                            console.log(producto.sku + ' - '+resp.statusCode)
                        })
                        .on("error", (err) => {
                            console.log("Error: " + err.message);
                        });
                    }
                    console.log('Procesados '+respuesta.length)
                })
                .catch((error) => {
                    console.log(error);
                });
            }
        }else{
            console.log(1 + ' pagina')
            WooCommerce.get("products", {page:1, per_page:100})
            .then((response) => {
                let respuesta = response.data
                for (let i = 0; i < respuesta.length; i++) {
                    const producto = respuesta[i];
                    let pathImg = config.urlImages+producto.sku+'.jpg'
                    http.get(pathImg, (resp) => {
                        console.log(producto.sku + ' - '+resp.statusCode)
                    })
                    .on("error", (err) => {
                        console.log("Error: " + err.message);
                    });
                }
                
            })
            .catch((error) => {
                console.log(error);
            });
        }
        
    })
    .catch((error) => {
        console.log(error);
    });
    
    
    
    
})

// Descargar datos del ecommerce
program.command('descargar-datos <proyecto>').action((proyecto) => {
    console.log('## Descargar datos del ecommerce ##')
    console.log('Consultando configuración del proyecto...')
    let config = require('./config/'+proyecto+'.json') // Obtener configuracion del proyecto
    console.log('Conectando con ecommerce...')
    let WooCommerce = new WooCommerceRestApi(config.WooApiConexion) // Conectar con WooCommerce
    console.log('Consultando productos...')

    // Obtener total de productos simples
    WooCommerce.get("reports/products/totals")
    .then((response) => {
        let numItems = response.data[2].total // total de productos simples
        console.log('Total productos simples: ' + numItems)

        // Calcular cantidad de paginas dividido el total de productos
        let paginas = numItems / 100
        // Validar resultado si es numero entero o decimal
        if (Number.isInteger(paginas)) {
            console.log('Es entero')
        }else{
            //console.log('Es decimal')
            paginas++
        }
        // Validar si la cantidad de paginas es mayor a 1 o no
        if (parseInt(paginas) > 1) {
            console.log(parseInt(paginas) + ' paginas para '+ numItems+' elementos')
            console.log(paginas + ' paginas para '+ numItems+' elementos')
            let totalPaginas = parseInt(paginas) + 1

            let urlDownload = './src/projects/'+proyecto+'/'+config.processFolder+'productos_ecommerce.txt'
            fs.writeFileSync(urlDownload, '', {encoding: "utf-8"})
            console.log('Creando fichero en :'+urlDownload);
            // Iterar los productos
            for (let i = 1; i < totalPaginas; i++) {
                const pagina = i;
                console.log('Pagina: '+pagina)
                // Obtener 100 productos por pagina
                WooCommerce.get("products", {page:pagina, per_page:100})
                .then((response) => {
                    let respuesta = response.data
                    let productos = ''
                    for (let i = 0; i < respuesta.length; i++) {
                        const producto = respuesta[i];
                        productos += producto.id + '|'
                        productos += producto.sku + '|'
                        productos += producto.name + '\n'
                    }
                    fs.writeFileSync(urlDownload, productos, {encoding: "utf-8", flag:"a+"})
                    console.log('Procesados '+respuesta.length)
                })
                .catch((error) => {
                    console.log(error);
                });
            }
        }else{
            console.log(1 + ' pagina')
            WooCommerce.get("products", {page:1, per_page:100})
            .then((response) => {
                let respuesta = response.data
                let productos = ''
                for (let i = 0; i < respuesta.length; i++) {
                    const producto = respuesta[i];
                    productos += producto.id + '|'
                    productos += producto.sku + '|'
                    productos += producto.name + '\n'
                }
                let urlDownload = './src/projects/'+proyecto+'/'+config.processFolder+'productos_ecommerce.txt'
                console.log('Creando fichero en :'+urlDownload);
                fs.writeFileSync(urlDownload, productos, {encoding: "utf-8"})
            })
            .catch((error) => {
                console.log(error);
            });
        }
        
    })
    .catch((error) => {
        console.log(error);
    });
    
    console.log('Consultando categorias...')
    WooCommerce.get("products/categories", {page:1, per_page:100})
    .then((response) => {
        let urlDownload = './src/projects/'+proyecto+'/'+config.processFolder+'categorias_ecommerce.txt'
        fs.writeFileSync(urlDownload, '', {encoding: "utf-8"})
        console.log('Creando fichero en :'+urlDownload);
        let categorias = ''
        let respuesta = response.data
        for (let i = 0; i < respuesta.length; i++) {
            const categoria = respuesta[i];
            categorias+= categoria.id + '|'
            categorias+= categoria.name + '\n'
        }
        fs.writeFileSync(urlDownload, categorias, {encoding: "utf-8", flag:"a+"})
        console.log('Categorias procesadas: '+respuesta.length)
    })
    .catch((error) => {
        console.log(error.response.data);
    });
    
    
})


// Validar url
program.command('test-url').action(() => {
    const http = require('http')
    http.get('http://unifelstoreb2b.bexsoluciones.com/wp-content/uploads/VV10155.jpg', (resp) => {
        console.log(resp.statusCode)

    })
    .on("error", (err) => {
        console.log("Error: " + err.message);
    });
})

// Procesa los comandos creados
program.parse(process.argv)