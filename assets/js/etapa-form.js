import storageService from "./storage-service.js";
import timelineEngine from "./timeline-engine.js";

class EtapaForm {

    constructor(){

        this.modal =
            document.getElementById(
                "modalEtapa"
            );

        this.form =
            document.getElementById(
                "formEtapa"
            );

    }

    init(){

        if(!this.form){
            return;
        }

        this.form.addEventListener(

            "submit",

            (event)=>{

                event.preventDefault();

                this.guardar();

            }

        );

        document
            .getElementById(
                "cerrarModalEtapa"
            )

            ?.addEventListener(

                "click",

                ()=>{

                    this.cerrar();

                }

            );

    }

    abrir(cargaId, etapa){

        document
            .getElementById(
                "cargaId"
            ).value = cargaId;

        document
            .getElementById(
                "nombreEtapa"
            ).value = etapa.nombre;

        document
            .getElementById(
                "fechaReal"
            ).value = etapa.fechaReal || "";

        document
            .getElementById(
                "responsableEtapa"
            ).value =
                etapa.responsable || "";

        document
            .getElementById(
                "observacionEtapa"
            ).value =
                etapa.observaciones || "";

        this.modal.classList.remove(
            "hidden"
        );

    }

    cerrar(){

        this.modal.classList.add(
            "hidden"
        );

    }

    guardar(){

        const cargaId =
            Number(
                document
                .getElementById(
                    "cargaId"
                ).value
            );

        const nombreEtapa =
            document
            .getElementById(
                "nombreEtapa"
            ).value;

        const fechaReal =
            document
            .getElementById(
                "fechaReal"
            ).value;

        const responsable =
            document
            .getElementById(
                "responsableEtapa"
            ).value;

        const observaciones =
            document
            .getElementById(
                "observacionEtapa"
            ).value;

        const trackings =
            storageService
                .getTrackings();

        const tracking =
            trackings.find(

                item =>
                    item.cargaId ===
                    cargaId

            );

        if(!tracking){

            alert(
                "Tracking no encontrada"
            );

            return;
        }

        const etapa =
            tracking.etapas.find(

                item =>
                    item.nombre ===
                    nombreEtapa

            );

        if(!etapa){

            alert(
                "Etapa no encontrada"
            );

            return;
        }

        etapa.fechaReal =
            fechaReal;

        etapa.responsable =
            responsable;

        etapa.observaciones =
            observaciones;

        etapa.estado =
            "completado";

        const indice =
            tracking.etapas.findIndex(

                item =>
                    item.nombre ===
                    nombreEtapa

            );

        const siguiente =
            tracking.etapas[
                indice + 1
            ];

        if(
            siguiente &&
            siguiente.estado ===
            "futuro"
        ){

            siguiente.estado =
                "actual";

            tracking.estadoActual =
                siguiente.nombre;

        }

        tracking.etapas =
            timelineEngine
                .recalcularEtapas(

                    tracking.etapas

                );

        storageService
            .updateTracking(

                cargaId,

                tracking

            );

        storageService
            .registrarHistorial(

                cargaId,

                "Usuario",

                "Actualización de etapa",

                `${nombreEtapa} completada`

            );

        alert(
            "Etapa actualizada"
        );

        this.cerrar();

    }

}

export default new EtapaForm();