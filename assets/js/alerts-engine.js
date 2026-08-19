function validarRetrasos(etapas){

    const alertas = [];

    etapas.forEach(etapa=>{

        if(
            etapa.fechaPlan &&
            etapa.fechaReal
        ){

            const plan =
                new Date(etapa.fechaPlan);

            const real =
                new Date(etapa.fechaReal);

            const atraso =
                Math.round(
                    (real-plan) /
                    86400000
                );

            if(atraso > 3){

                alertas.push({

                    tipo:"Retraso",

                    mensaje:
                    `${etapa.nombre}
                     tiene ${atraso}
                     dias de retraso`

                });
            }
        }

    });

    return alertas;
}