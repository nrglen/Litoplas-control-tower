class StorageService {

    constructor(){

        this.keys = {

            cargas: "litoplas_cargas",

            tracking: "litoplas_tracking",

            historial: "litoplas_historial",

            documentos: "litoplas_documentos",

            alertas: "litoplas_alertas"

        };

    }

    /*
    =====================================
    GENERICOS
    =====================================
    */

    get(key){

        const data =
            localStorage.getItem(key);

        if(!data){

            return [];

        }

        try{

            return JSON.parse(data);

        }
        catch(error){

            console.error(error);

            return [];

        }

    }

    set(key,data){

        localStorage.setItem(

            key,

            JSON.stringify(data)

        );

    }

    generarId(){

        return Date.now();

    }

    /*
    =====================================
    CARGAS
    =====================================
    */

    getCargas(){

        return this.get(
            this.keys.cargas
        );

    }

    saveCarga(carga){

        const cargas =
            this.getCargas();

        cargas.push(carga);

        this.set(

            this.keys.cargas,

            cargas

        );

        return carga;

    }

    updateCarga(id,cambios){

        const cargas =
            this.getCargas();

        const index = cargas.findIndex(

            carga =>
                carga.id == id

        );

        if(index < 0){

            return false;

        }

        cargas[index] = {

            ...cargas[index],

            ...cambios

        };

        this.set(

            this.keys.cargas,

            cargas

        );

        return true;

    }

    /*
    =====================================
    TRACKING
    =====================================
    */

    getTrackings(){

        return this.get(
            this.keys.tracking
        );

    }

    saveTracking(tracking){

        const trackings =
            this.getTrackings();

        trackings.push(tracking);

        this.set(

            this.keys.tracking,

            trackings

        );

        return tracking;

    }

    updateTracking(cargaId,trackingActualizado){

        const trackings =
            this.getTrackings();

        // Asegurar que cargaId sea un número
        const cargaIdNum = Number(cargaId);
        trackingActualizado.cargaId = cargaIdNum;

        const index =
            trackings.findIndex(

                item =>
                    Number(item.cargaId) ==
                    cargaIdNum

            );

        if(index < 0){
            trackings.push(trackingActualizado);
            this.set(
                this.keys.tracking,
                trackings
            );
            return true;
        }

        trackings[index] =
            trackingActualizado;

        this.set(

            this.keys.tracking,

            trackings

        );

        return true;

    }

    /*
    =====================================
    DOCUMENTOS
    =====================================
    */

    getDocumentos(){

        return this.get(
            this.keys.documentos
        );

    }

    saveDocumento(documento){

        const documentos =
            this.getDocumentos();

        documentos.push(documento);

        this.set(

            this.keys.documentos,

            documentos

        );

        return documento;

    }

    /*
    =====================================
    ALERTAS
    =====================================
    */

    getAlertas(){

        return this.get(
            this.keys.alertas
        );

    }

    saveAlerta(alerta){

        const alertas =
            this.getAlertas();

        alertas.push(alerta);

        this.set(

            this.keys.alertas,

            alertas

        );

        return alerta;

    }

    /*
    =====================================
    HISTORIAL
    =====================================
    */

    getHistorial(){

        return this.get(
            this.keys.historial
        );

    }

    registrarHistorial(
        cargaId,
        usuario,
        accion,
        detalle
    ){

        const historial =
            this.getHistorial();

        historial.push({

            id:
                this.generarId(),

            cargaId,

            fecha:
                new Date().toISOString(),

            usuario,

            accion,

            detalle

        });

        this.set(

            this.keys.historial,

            historial

        );

    }

    obtenerHistorialCarga(
        cargaId
    ){

        const historial =
            this.getHistorial();

        return historial.filter(

            item =>
                item.cargaId ==
                cargaId

        );

    }

    /*
    =====================================
    BOOTSTRAP INICIAL
    =====================================
    */

    inicializarDatos(
        cargas,
        tracking,
        alertas,
        documentos,
        historial
    ){

        if(
            this.getCargas().length === 0
        ){

            this.set(
                this.keys.cargas,
                cargas
            );

        }

        if(
            this.getTrackings().length === 0
        ){

            this.set(
                this.keys.tracking,
                tracking
            );

        }

        if(
            this.getAlertas().length === 0
        ){

            this.set(
                this.keys.alertas,
                alertas
            );

        }

        if(
            this.getDocumentos().length === 0
        ){

            this.set(
                this.keys.documentos,
                documentos
            );

        }

        if(
            this.getHistorial().length === 0
        ){

            this.set(
                this.keys.historial,
                historial
            );

        }

    }

    /*
    =====================================
    LIMPIEZA
    =====================================
    */

    reset(){

        Object.values(this.keys)

            .forEach(key => {

                localStorage.removeItem(
                    key
                );

            });

    }

}

export default new StorageService();