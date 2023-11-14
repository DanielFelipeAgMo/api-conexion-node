const express = require('express')
const app = express()

app.get('/', (req, res) => {
    res.send('Hola mundo')
})

/* Obtener productos de siesa */
app.get('/get-products/project', (req, res) => {
    res.send('Consultar productos de siesa')
})

/* Procesar categorias de los productos */
app.get('/process-categories/project', (req, res) => {
    res.send('Procesar categorias de los productos')
})

/* Enviar productos procesados al ecommerce */
app.get('/send-products-ecommerce/project', (req, res) => {
    res.send('Enviar productos al ecommerce')
})

/* Procesar fotografias de los productos en el ecommerce */
app.get('/process-photos/project', (req, res) => {
    res.send('Procesar fotos de los productos en el ecommerce')
})

/* Crear usuarios del ecommerce en siesa */
app.get('/create-users-siesa/project', (req, res) => {
    res.send('Crear usuarios en siesa')
})

/* Enviar ordenes del ecommerce en siesa */
app.get('/send-orders-siesa/project', (req, res) => {
    res.send('Enviar ordenes del ecommerce a siesa')
})


app.listen(3000, () => {
    console.log('Aplicacion funcionando en el puerto 3000')
})