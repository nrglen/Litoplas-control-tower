class TimelineEngine {

    constructor() {

        this.DIA =
            1000 * 60 * 60 * 24;

    }

    /*
    =====================================
    FECHAS
    =====================================
    */

    calcularDias(fechaInicio, fechaFin){

        const inicio = new Date(fechaInicio);
        const fin = new Date(fechaFin);

        return Math.round(
            (fin - inicio) / this.DIA
        );

    }

    /*
    =====================================
    RETRASO DE UNA ETAPA
    =====================================
    */

    calcularRetraso(fechaPlan, fechaReal){

        if(!fechaPlan || !fechaReal){

            return 0;

        }

        return this.calcularDias(
            fechaPlan,
            fechaReal
        );

    }

    /*
    =====================================
    RECALCULAR ETAPAS FUTURAS
    =====================================
    */

    recalcularEtapas(etapas){

        let retrasoAcumulado = 0;

        etapas.forEach(etapa => {

            if(
                etapa.fechaPlan &&
                etapa.fechaReal
            ){

                const retraso =
                    this.calcularRetraso(
                        etapa.fechaPlan,
                        etapa.fechaReal
                    );

                etapa.retraso =
                    retraso;

                if(retraso > 0){

                    retrasoAcumulado +=
                        retraso;

                }

            }

            if(
                etapa.estado === "futuro" &&
                etapa.fechaPlan
            ){

                const nuevaFecha =
                    new Date(
                        etapa.fechaPlan
                    );

                nuevaFecha.setDate(
                    nuevaFecha.getDate() +
                    retrasoAcumulado
                );

                etapa.fechaProyectada =
                    nuevaFecha
                        .toISOString()
                        .split("T")[0];

                etapa.retraso =
                    retrasoAcumulado;

            }

        });

        return etapas;

    }

    /*
    =====================================
    ESTADO ACTUAL
    =====================================
    */

    obtenerEtapaActual(etapas){

        return etapas.find(
            etapa =>
                etapa.estado === "actual"
        );

    }

    /*
    =====================================
    ETAPAS COMPLETADAS
    =====================================
    */

    obtenerCompletadas(etapas){

        return etapas.filter(
            etapa =>
                etapa.estado ===
                "completado"
        );

    }

    /*
    =====================================
    ETAPAS FUTURAS
    =====================================
    */

    obtenerFuturas(etapas){

        return etapas.filter(
            etapa =>
                etapa.estado ===
                "futuro"
        );

    }

    /*
    =====================================
    ETA FINAL
    =====================================
    */

    obtenerETA(etapas){

        const ultimaEtapa =
            etapas[etapas.length - 1];

        return (

            ultimaEtapa.fechaProyectada ||

            ultimaEtapa.fechaReal ||

            ultimaEtapa.fechaPlan

        );

    }

    /*
    =====================================
    PORCENTAJE AVANCE
    =====================================
    */

    calcularAvance(etapas){

        const total = etapas.length;

        const completadas =
            etapas.filter(
                etapa =>
                    etapa.estado ===
                    "completado"
            ).length;

        return Math.round(
            (completadas / total) * 100
        );

    }

    /*
    =====================================
    DOCUMENTOS ETAPA
    =====================================
    */

    contarDocumentos(etapa){

        if(!etapa.documentos){

            return 0;

        }

        return etapa.documentos.length;

    }

    /*
    =====================================
    DOCUMENTOS TOTALES
    =====================================
    */

    contarDocumentosCarga(etapas){

        let total = 0;

        etapas.forEach(etapa => {

            total +=
                this.contarDocumentos(
                    etapa
                );

        });

        return total;

    }

    /*
    =====================================
    RESUMEN TIMELINE
    =====================================
    */

    generarResumen(etapas){

        const etapasActualizadas =
            this.recalcularEtapas(
                etapas
            );

        return {

            avance:
                this.calcularAvance(
                    etapasActualizadas
                ),

            etapaActual:
                this.obtenerEtapaActual(
                    etapasActualizadas
                ),

            eta:
                this.obtenerETA(
                    etapasActualizadas
                ),

            completadas:
                this.obtenerCompletadas(
                    etapasActualizadas
                ),

            futuras:
                this.obtenerFuturas(
                    etapasActualizadas
                ),

            documentos:
                this.contarDocumentosCarga(
                    etapasActualizadas
                ),

            etapas:
                etapasActualizadas

        };

    }

    /*
    =====================================
    CREA TIMELINE DESDE PROCESO
    =====================================
    */

    generarTimelineInicial(
        proceso,
        fechaInicio
    ){

        const timeline = [];

        let fechaActual =
            new Date(fechaInicio);

        (proceso.etapas || []).forEach(
            etapa => {

                timeline.push({

                    nombre:
                        etapa.nombre,

                    orden:
                        etapa.orden,

                    responsable:
                        etapa.responsable || "",

                    estado:
                        "futuro",

                    fechaPlan:
                        fechaActual
                            .toISOString()
                            .split("T")[0],

                    fechaReal:
                        null,

                    fechaProyectada:
                        null,

                    documentos: [],

                    observaciones: ""

                });

                fechaActual.setDate(

                    fechaActual.getDate() +

                    (etapa.duracionDias || 1)

                );

            }
        );

        if(timeline.length > 0){

            timeline[0].estado =
                "actual";

        }

        return timeline;

    }

}

export default new TimelineEngine();