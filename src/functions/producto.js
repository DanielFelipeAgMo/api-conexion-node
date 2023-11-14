function producto(header, producto){
    this.header = header,
    this.productoData = producto,
    this.producto = () => {
        if (this.header.length == this.productoData.length) {
            let elemento = {}
            for (let i = 0; i < this.header.length; i++) {
                const campo = this.header[i];
                //console.log(campo)
                if (campo == 'sku') {
                    elemento[campo] = this.productoData[i].replace(/ /g, "")
                }else{
                    elemento[campo] = this.productoData[i]
                }
            }
            return elemento
        }else{
            return 'Los campos del producto no coincide con los del encabezado'
        }
    }
}
module.exports = producto;