import businessRules from "./business-rules.js";

class DashboardEngine {

    /*
    ===================================
    CARGAS ACTIVAS
    ===================================
    */

    cargasActivas(cargas){

        return cargas.filter(carga =>

            carga.estadoActual !== "Entregado" &&
            carga.estadoActual !== "Entrega Cliente"

        ).length;

    }


    /*
    ===================================
    ENTREGADAS
    ===================================
    */

    cargasEntregadas(cargas){

        return cargas.filter(carga =>

            carga.estadoActual === "Entregado" ||
            carga.estadoActual === "Entrega Cliente"

        ).length;

    }


    /*
    ===================================
    RETRASADAS
    ===================================
    */

    cargasRetrasadas(trackings){

        return trackings.filter(tracking =>

            tracking.retrasoAcumuladoDias > 0

        ).length;

    }


    /*
    ===================================
    OTIF
    ===================================
    */

    obtenerOTIF(cargas){

        return businessRules.calcularOTIF(
            cargas
        );

    }


    /*
    ===================================
    POR PAIS
    ===================================
    */

    cargasPorPais(cargas){

        const resultado = {};

        cargas.forEach(carga => {

            if(!resultado[carga.pais]){

                resultado[carga.pais] = 0;

            }

            resultado[carga.pais]++;

        });

        return resultado;

    }


    /*
    ===================================
    POR CLIENTE
    ===================================
    */

    cargasPorCliente(cargas){

        const resultado = {};

        cargas.forEach(carga => {

            if(!resultado[carga.cliente]){

                resultado[carga.cliente] = 0;

            }

            resultado[carga.cliente]++;

        });

        return resultado;

    }


    /*
    ===================================
    POR PROCESO
    ===================================
    */

    cargasPorProceso(cargas){

        const resultado = {};

        cargas.forEach(carga => {

            if(!resultado[carga.proceso]){

                resultado[carga.proceso] = 0;

            }

            resultado[carga.proceso]++;

        });

        return resultado;

    }


    /*
    ===================================
    DOCUMENTOS PENDIENTES
    ===================================
    */

    documentosPendientes(
        trackings,
        configuracionDocumental
    ){

        let pendientes = 0;

        trackings.forEach(tracking => {

            tracking.etapas.forEach(etapa => {

                const cargados =
                    etapa.documentos
                    ? etapa.documentos.length
                    : 0;

                if(
                    etapa.documentosRequeridos
                ){

                    const requeridos =
                        etapa.documentosRequeridos.length;

                    if(cargados < requeridos){

                        pendientes +=
                            requeridos - cargados;
                    }

                }

            });

        });

        return pendientes;
    }


    /*
    ===================================
    ALERTAS ABIERTAS
    ===================================
    */

    alertasPendientes(alertas){

        return alertas.filter(

            alerta => !alerta.leida

        ).length;

    }


    /*
    ===================================
    RETRASO PROMEDIO
    ===================================
    */

    retrasoPromedio(trackings){

        if(trackings.length === 0){

            return 0;

        }

        const acumulado =
            trackings.reduce((total, tracking)=>{

                return total +
                    (tracking.retrasoAcumuladoDias || 0)

            },0);

        return Math.round(
            acumulado / trackings.length
        );

    }


    /*
    ===================================
    PROXIMAS ENTREGAS
    ===================================
    */

    proximasEntregas(
        cargas,
        dias = 7
    ){

        const hoy = new Date();

        return cargas.filter(carga => {

            if(!carga.fechaCompromiso){

                return false;

            }

            const entrega =
                new Date(
                    carga.fechaCompromiso
                );

            const diferencia =
                Math.floor(

                    (entrega - hoy)

                    /

                    (1000*60*60*24)

                );

            return diferencia >= 0
                &&
                diferencia <= dias;

        });

    }


    /*
    ===================================
    DASHBOARD COMPLETO
    ===================================
    */

    generarDashboard(

        cargas,
        trackings,
        alertas

    ){

        return {

            cargasActivas:

                this.cargasActivas(
                    cargas
                ),

            cargasEntregadas:

                this.cargasEntregadas(
                    cargas
                ),

            cargasRetrasadas:

                this.cargasRetrasadas(
                    trackings
                ),

            otif:

                this.obtenerOTIF(
                    cargas
                ),

            alertas:

                this.alertasPendientes(
                    alertas
                ),

            retrasoPromedio:

                this.retrasoPromedio(
                    trackings
                ),

            paises:

                this.cargasPorPais(
                    cargas
                ),

            clientes:

                this.cargasPorCliente(
                    cargas
                ),

            procesos:

                this.cargasPorProceso(
                    cargas
                ),

            proximasEntregas:

                this.proximasEntregas(
                    cargas
                )

        };

    }

}

export default new DashboardEngine();