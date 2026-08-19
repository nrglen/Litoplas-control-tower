import dataService from "./data-service.js";
import timelineEngine from "./timeline-engine.js";
import documentsView from "./documents-view.js";
import etapaForm from "./etapa-form.js";

class TrackingView {

    constructor(){

        this.container =
            document.getElementById(
                "trackingContainer"
            );

    }

    async cargarTimeline(cargaId){

        const trackings =
            await dataService.getTracking();

        const procesos =
            await dataService.getProcesos();

        const tracking =
            trackings.find(
                item => item.cargaId == cargaId
            );

        if(!tracking){

            this.mostrarError();
            return;

        }

        const resumen =
            timelineEngine.generarResumen(
                tracking.etapas
            );

        this.render(
            tracking,
            resumen,
            procesos
        );

    }

    render(tracking,resumen,procesos){

        let html = `

        <div class="tracking-header">

            <h2>
                ${tracking.estadoActual}
            </h2>

            <p>
                ETA:
                ${resumen.eta || "-"}
            </p>

            <p>
                Avance:
                ${resumen.avance}%
            </p>

        </div>

        <div class="timeline">

        `;

        resumen.etapas.forEach(etapa=>{

            html += this.renderEtapa(
                etapa,
                tracking
            );

        });

        html += `
        </div>
        `;

        this.container.innerHTML = html;
        this.configurarBotonesEditar();
        this.configurarToggles();

    }

    renderEtapa(etapa, tracking){

        const clase = this.obtenerClase(
            etapa.estado
        );

        const fecha =

            etapa.fechaReal ||

            etapa.fechaProyectada ||

            etapa.fechaPlan ||

            "-";

        const documentos =
            etapa.documentos || [];

        const documentosRequeridos =
            etapa.documentosRequeridos || [];

        const completitud =
            documentsView.calcularCompletitud(
                documentos,
                documentosRequeridos
            );

        return `

        <div class="timeline-item ${clase}">

            <div class="icon">

                ${this.obtenerIcono(
                    etapa.nombre
                )}

            </div>

            <div class="stage">

                <div class="stage-header">

                    <h4>
                        ${etapa.nombre}
                    </h4>

                <div class="stage-header">
 
                    <button
                        class="editar-etapa"
                        data-carga="${tracking.cargaId}"
                        data-etapa="${etapa.nombre}">
                        Actualizar
                    </button>
 
                </div>
                <div class="stage-summary">

                    Fecha:
                    ${fecha}

                </div>

                <div class="stage-detail">

                    <p>

                        <strong>
                        Responsable:
                        </strong>

                        ${etapa.responsable || "-"}

                    </p>

                    <p>

                        <strong>
                        Observaciones:
                        </strong>

                        ${
                            etapa.observaciones ||
                            "Sin observaciones"
                        }

                    </p>

                    <p>

                        <strong>
                        Completitud documental:
                        </strong>

                        ${completitud}%

                    </p>

                    ${documentsView.renderDocumentos(

                        documentos,

                        documentosRequeridos

                    )}

                </div>

            </div>

        </div>

        `;
    }

    configurarToggles(){

        const botones =
            document.querySelectorAll(
                ".toggle-stage"
            );

        botones.forEach(boton=>{

            boton.addEventListener(
                "click",
                ()=>{

                    const detalle =
                        boton
                        .closest(".stage")
                        .querySelector(
                            ".stage-detail"
                        );

                    if(
                        detalle.style.display
                        === "block"
                    ){

                        detalle.style.display =
                            "none";

                        boton.innerText =
                            "Ver Más";

                    }else{

                        detalle.style.display =
                            "block";

                        boton.innerText =
                            "Ocultar";

                    }

                }
            );

        });

    }

    obtenerClase(estado){

        if(
            estado === "completado"
        ){
            return "done";
        }

        if(
            estado === "actual"
        ){
            return "current";
        }

        return "future";
    }

    obtenerIcono(nombre){

        const iconos = {

            "Solicitud Cliente":"📋",

            "Verificacion":"🔍",

            "Produccion":"🏭",

            "Transporte Puerto":"🚛",

            "Puerto Origen":"⚓",

            "Transito Maritimo":"🚢",

            "Puerto USA":"⚓",

            "Warehouse":"🏢",

            "Inland Freight":"🚚",

            "Entrega Cliente":"📦"

        };

        return iconos[nombre] || "📍";
    }

    mostrarError(){

        this.container.innerHTML = `

            <div
                style="
                padding:20px;
                ">

                Tracking no encontrado

            </div>

        `;
    }


configurarBotonesEditar(){

    const botones =

        document.querySelectorAll(
            ".editar-etapa"
        );

    botones.forEach(boton => {

        boton.addEventListener(

            "click",

            () => {

                const cargaId =
                    Number(
                        boton.dataset.carga
                    );

                const nombreEtapa =
                    boton.dataset.etapa;

                const trackings =
                    JSON.parse(
                        localStorage.getItem(
                            "litoplas_tracking"
                        )
                    ) || [];

                const tracking =
                    trackings.find(

                        item =>
                            item.cargaId ===
                            cargaId

                    );

                if(!tracking){

                    return;

                }

                const etapa =
                    tracking.etapas.find(

                        item =>
                            item.nombre ===
                            nombreEtapa

                    );

                if(!etapa){

                    return;

                }

                etapaForm.abrir(
                    cargaId,
                    etapa
                );

            }

        );

    });

}
}

export default new TrackingView();