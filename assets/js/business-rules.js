class BusinessRules {

    /*
    ========================================
    FECHAS
    ========================================
    */

    diasEntre(fechaInicial, fechaFinal){

        const inicio = new Date(fechaInicial);
        const fin = new Date(fechaFinal);

        const diferencia =
            fin.getTime() - inicio.getTime();

        return Math.round(
            diferencia / (1000 * 60 * 60 * 24)
        );
    }


    calcularRetraso(fechaPlan, fechaReal){

        if(!fechaPlan || !fechaReal){
            return 0;
        }

        return this.diasEntre(
            fechaPlan,
            fechaReal
        );
    }


    /*
    ========================================
    RECALCULAR TIMELINE
    ========================================
    */

    recalcularTimeline(etapas){

        let retrasoAcumulado = 0;

        const resultado = [];

        etapas.forEach(etapa => {

            const nuevaEtapa = {...etapa};

            if(
                etapa.fechaPlan &&
                etapa.fechaReal
            ){

                const retraso =
                    this.calcularRetraso(
                        etapa.fechaPlan,
                        etapa.fechaReal
                    );

                nuevaEtapa.retraso = retraso;

                if(retraso > 0){
                    retrasoAcumulado += retraso;
                }
            }

            if(etapa.estado === "futuro"){

                const fecha =
                    new Date(etapa.fechaPlan);

                fecha.setDate(
                    fecha.getDate() +
                    retrasoAcumulado
                );

                nuevaEtapa.fechaProyectada =
                    fecha.toISOString()
                    .split("T")[0];
            }

            resultado.push(nuevaEtapa);

        });

        return resultado;
    }


    /*
    ========================================
    ETA
    ========================================
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
    ========================================
    ESTADO ACTUAL
    ========================================
    */

    obtenerEstadoActual(etapas){

        const etapaActual =
            etapas.find(
                e => e.estado === "actual"
            );

        return etapaActual
            ? etapaActual.nombre
            : "No Definido";
    }


    /*
    ========================================
    PORCENTAJE COMPLETADO
    ========================================
    */

    porcentajeCompletado(etapas){

        const total = etapas.length;

        const completadas =
            etapas.filter(
                e => e.estado === "completado"
            ).length;

        return Math.round(
            (completadas / total) * 100
        );
    }


    /*
    ========================================
    RETRASO TOTAL
    ========================================
    */

    retrasoAcumulado(etapas){

        let retraso = 0;

        etapas.forEach(etapa=>{

            if(
                etapa.fechaPlan &&
                etapa.fechaReal
            ){

                const diferencia =
                    this.calcularRetraso(
                        etapa.fechaPlan,
                        etapa.fechaReal
                    );

                if(diferencia > 0){

                    retraso += diferencia;

                }

            }

        });

        return retraso;
    }


    /*
    ========================================
    DOCUMENTOS
    ========================================
    */

    porcentajeDocumental(
        documentosCargados,
        documentosRequeridos
    ){

        if(documentosRequeridos === 0){

            return 100;

        }

        return Math.round(
            (documentosCargados /
             documentosRequeridos) * 100
        );
    }


    validarDocumentosEtapa(
        documentosSubidos,
        documentosRequeridos
    ){

        return {

            requeridos:
                documentosRequeridos.length,

            cargados:
                documentosSubidos.length,

            porcentaje:
                this.porcentajeDocumental(
                    documentosSubidos.length,
                    documentosRequeridos.length
                ),

            completo:
                documentosSubidos.length >=
                documentosRequeridos.length
        };

    }


    /*
    ========================================
    OTIF
    ========================================
    */

    calcularOTIF(cargas){

        const entregadas =
            cargas.filter(
                c => c.fechaEntregaReal
            );

        if(entregadas.length === 0){

            return 0;

        }

        const aTiempo = entregadas.filter(
            c =>
                new Date(c.fechaEntregaReal)
                <=
                new Date(
                    c.fechaEntregaCompromiso
                )
        );

        return Math.round(
            (aTiempo.length /
             entregadas.length) * 100
        );

    }


    /*
    ========================================
    ALERTAS
    ========================================
    */

    generarAlertas(etapas){

        const alertas = [];

        etapas.forEach(etapa=>{

            if(
                etapa.fechaPlan &&
                etapa.fechaReal
            ){

                const retraso =
                    this.calcularRetraso(
                        etapa.fechaPlan,
                        etapa.fechaReal
                    );

                if(retraso > 3){

                    alertas.push({

                        tipo: "Retraso",

                        severidad: "Alta",

                        mensaje:
                         `${etapa.nombre}
                         presenta un retraso
                         de ${retraso} días`

                    });

                }

            }

        });

        return alertas;

    }


    /*
    ========================================
    ETA VENCIDA
    ========================================
    */

    validarETA(
        fechaCompromiso,
        fechaETA
    ){

        if(!fechaCompromiso || !fechaETA){

            return false;

        }

        return (
            new Date(fechaETA)
            >
            new Date(fechaCompromiso)
        );

    }

    /*
    ========================================
    RESUMEN DE CARGA
    ========================================
    */
}

export default new BusinessRules();
