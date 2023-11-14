const formato = {
    producto : function(producto, categorias){
        let elemento = {
            sku: producto.sku,
            name: producto.name,
            description: producto.description,
            type: producto.type,
            regular_price: producto.price,
            stock_quantity: producto.stock,
            manage_stock: true,
            categories: categorias
        }
        
        return elemento
    }
}

module.exports = formato;