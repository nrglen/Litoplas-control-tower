import storageService from "./storage-service.js";
import timelineEngine from "./timeline-engine.js";
import dataService from "./data-service.js";

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

        // Re-obtener elementos por si no estaban disponibles en el constructor
        if(!this.modal){
            this.modal = document.getElementById("modalEtapa");
        }

        if(!this.form){
            this.form = document.getElementById("formEtapa");
        }

        if(!this.form){
            console.warn("formEtapa no encontrado en DOM");
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

    async guardar(){

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

let trackings =
    storageService
        .getTrackings();

let tracking =
    trackings.find(

        item =>
            item.cargaId ===
            cargaId

    );

if(!tracking){

    const baseTracking =
        await dataService.getTracking();

    tracking =
        baseTracking.find(
            item => item.cargaId === cargaId
        ) || {
            cargaId: Number(cargaId),
            estadoActual: "Solicitud Cliente",
            etapas: []
        };

    if(!tracking.etapas || tracking.etapas.length === 0){
        const procesos = await dataService.getProcesos();
        const cargas = await dataService.getCargas();
        const cargaActual = cargas.find(item => item.id === cargaId);

        if(cargaActual && procesos[cargaActual.pais] && procesos[cargaActual.pais][cargaActual.proceso]){
            const proceso = procesos[cargaActual.pais][cargaActual.proceso];
            tracking.etapas = (proceso.etapas || []).map(etapa => ({
                ...etapa,
                estado: "futuro",
                documentos: [],
                documentosRequeridos: etapa.documentosRequeridos || [],
                observaciones: "",
                responsable: etapa.responsable || "",
                fechaPlan: null,
                fechaReal: null,
                fechaProyectada: null,
                retraso: 0
            }));
        }
    }

    storageService.updateTracking(cargaId, tracking);
    trackings = storageService.getTrackings();
}

const indice =
    tracking.etapas.findIndex(

        item =>
            item.nombre ===
            nombreEtapa

    );

if(indice < 0){

    alert(
        "Etapa no encontrada"
    );

    return;
}

tracking.etapas =
    tracking.etapas.map(
        (etapa, index) => {
            if(index < indice){
                return {
                    ...etapa,
                    estado: "completado",
                    responsable: etapa.responsable || responsable,
                    observaciones: etapa.observaciones || observaciones
                };
            }

            if(index === indice){
                return {
                    ...etapa,
                    fechaReal,
                    responsable,
                    observaciones,
                    estado: "completado"
                };
            }

            if(index === indice + 1){
                return {
                    ...etapa,
                    estado: "actual"
                };
            }

            return {
                ...etapa,
                estado: "futuro"
            };
        }
    );

const etapaActual =
    tracking.etapas.find(
        etapa => etapa.estado === "actual"
    );

tracking.estadoActual =
    etapaActual
        ? etapaActual.nombre
        : "Finalizado";

tracking.etapas =
    timelineEngine
        .recalcularEtapas(
            tracking.etapas
        );

tracking.porcentajeCompletado =
    timelineEngine
        .calcularAvance(
            tracking.etapas
        );

let retraso = 0;

tracking.etapas.forEach(
    etapa => {
        if(etapa.retraso > 0){
            retraso += etapa.retraso;
        }
    }
);

tracking.retrasoAcumuladoDias = retraso;

storageService
    .updateTracking(
        cargaId,
        tracking
    );

const cargasGuardadas =
    storageService.getCargas();

const cargaIndex =
    cargasGuardadas.findIndex(
        item => item.id == cargaId
    );

if(cargaIndex >= 0){
    cargasGuardadas[cargaIndex] = {
        ...cargasGuardadas[cargaIndex],
        estadoActual: tracking.estadoActual
    };

    storageService.set(
        storageService.keys.cargas,
        cargasGuardadas
    );
}

storageService
.registrarHistorial(
        cargaId,
        "Usuario",
        "Actualización de etapa",
        `${nombreEtapa} completada`
    );

window.dispatchEvent(
    new CustomEvent(
        "trackingActualizado",
        {
            detail: {
                cargaId
            }
        }
    )
);

alert(
    "Etapa actualizada"
);

this.cerrar();

    }

}

export default new EtapaForm();