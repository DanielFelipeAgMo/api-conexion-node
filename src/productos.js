function productos(){
    this.header = ['sku', 'name', 'description', 'type'],
    this.productoData = ['112233', 'Nombre del Producto', '', 'simple'],
    this.producto = function(){
        var elemento = {}
        for (let i = 0; i < this.header.length; i++) {
            const campo = this.header[i];
            //console.log(campo)

            elemento[campo] = this.productoData[i]
            //console.log(elemento)
        }
        return elemento
    }
}
module.exports = productos;