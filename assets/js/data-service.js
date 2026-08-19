class DataService {

    leerCache(clave){

        try{
            const raw = localStorage.getItem(clave);
            return raw ? JSON.parse(raw) : null;
        }
        catch(error){
            console.warn("No fue posible leer caché", error);
            return null;
        }

    }

    guardarCache(clave, datos){

        try{
            localStorage.setItem(clave, JSON.stringify(datos));
        }
        catch(error){
            console.warn("No fue posible guardar caché", error);
        }

    }

    async fetchJson(ruta, clave){

        const cache = this.leerCache(clave);

        try{
            const response = await fetch(ruta);

            if(!response.ok){
                throw new Error(`HTTP ${response.status}`);
            }

            const datos = await response.json();
            this.guardarCache(clave, datos);
            return datos;
        }
        catch(error){
            if(cache !== null){
                console.warn(`Usando caché para ${ruta} por fallo de conexión.`);
                return cache;
            }

            console.error(`No se pudo cargar ${ruta}`, error);
            return [];
        }

    }

    async getCargas(){
        const cargasGuardadas = this.leerCache("litoplas_cargas");

        if(Array.isArray(cargasGuardadas) && cargasGuardadas.length > 0){
            return cargasGuardadas;
        }

        return this.fetchJson("assets/data/cargas.json", "litoplas_cache_cargas");
    }

    async getTracking(){
        const trackingGuardado = this.leerCache("litoplas_tracking");

        if(Array.isArray(trackingGuardado) && trackingGuardado.length > 0){
            return trackingGuardado;
        }

        return this.fetchJson("assets/data/tracking.json", "litoplas_cache_tracking");
    }

    async getDocumentos(){
        return this.fetchJson("assets/data/documentos.json", "litoplas_cache_documentos");
    }

    async getProcesos(){
        return this.fetchJson("assets/data/procesos.json", "litoplas_cache_procesos");
    }

    async getAlertas(){
        return this.fetchJson("assets/data/alertas.json", "litoplas_cache_alertas");
    }

    async getPaises(){
        return this.fetchJson("assets/data/paises.json", "litoplas_cache_paises");
    }

    async getClientes(){
        return this.fetchJson("assets/data/clientes.json", "litoplas_cache_clientes");
    }

}

export default new DataService();