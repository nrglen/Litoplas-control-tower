import dataService from "./data-service.js";
import timelineEngine from "./timeline-engine.js";
import documentsView from "./documents-view.js";
import etapaForm from "./etapa-form.js";
import storageService from "./storage-service.js";

class TrackingView {

    constructor(){

        this.container =
            document.getElementById(
                "trackingContainer"
            );

    }

    async cargarTimeline(cargaId, carga = null){

        const trackings =
            await dataService.getTracking();

        const procesos =
            await dataService.getProcesos();

        let tracking =
            trackings.find(
                item => item.cargaId == cargaId
            );

        if(!tracking){
            tracking = {
                cargaId,
                estadoActual: "Solicitud Cliente",
                etapas: []
            };
        }

        if(carga && procesos?.[carga.pais]?.[carga.proceso]){
            tracking = this.fusionarEtapasConProceso(
                tracking,
                procesos[carga.pais][carga.proceso]
            );
        }

        const trackingsGuardados = storageService.getTrackings();
        const existeTrackingGuardado = trackingsGuardados.some(item => item.cargaId == cargaId);

        if(!existeTrackingGuardado){
            storageService.updateTracking(cargaId, tracking);
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

    fusionarEtapasConProceso(tracking, proceso){

        const etapasBase = Array.isArray(proceso?.etapas)
            ? proceso.etapas
            : [];

        const etapasActuales = Array.isArray(tracking?.etapas)
            ? tracking.etapas
            : [];

        const etapasMap = new Map();

        etapasActuales.forEach(etapa => {
            if(etapa && etapa.nombre){
                etapasMap.set(etapa.nombre, etapa);
            }
        });

        const etapasCompletas = etapasBase.map(etapaBase => {
            const etapaActual = etapasMap.get(etapaBase.nombre) || {};
            return {
                ...etapaBase,
                ...etapaActual,
                estado: etapaActual.estado || "futuro",
                responsable: etapaActual.responsable || etapaBase.responsable || "",
                documentos: etapaActual.documentos || [],
                documentosRequeridos: etapaActual.documentosRequeridos || etapaBase.documentosRequeridos || [],
                observaciones: etapaActual.observaciones || "",
                fechaPlan: etapaActual.fechaPlan || etapaBase.fechaPlan || null,
                fechaReal: etapaActual.fechaReal || null,
                fechaProyectada: etapaActual.fechaProyectada || null,
                retraso: etapaActual.retraso || 0
            };
        });

        const etapaActual =
            etapasCompletas.find(etapa => etapa.estado === "actual") ||
            etapasCompletas[0] ||
            { nombre: tracking.estadoActual || "Solicitud Cliente" };

        return {
            ...tracking,
            estadoActual: tracking.estadoActual || etapaActual.nombre || "Solicitud Cliente",
            etapas: etapasCompletas
        };

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

            <p>
                Etapa actual:
                ${resumen.etapaActual?.nombre || tracking.estadoActual || "-"}
            </p>

        </div>

        <div class="timeline">

        `;

        resumen.etapas.forEach((etapa,index)=>{

            html += this.renderEtapa(
                etapa,
                tracking,
                index,
                resumen.etapaActual
            );

        });

        html += `
        </div>
        `;

        this.container.innerHTML = html;
        this.configurarBotonesEditar();
        this.configurarToggles();

    }

    renderEtapa(etapa, tracking, index, etapaActual){

        const isCurrent =
            etapa.estado === "actual" ||
            (etapaActual && (etapaActual.nombre === etapa.nombre || etapaActual === etapa.nombre)) ||
            tracking.estadoActual === etapa.nombre;

        const clase = isCurrent
            ? "current"
            : (etapa.estado === "completado" ? "done" : "future");

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

        const detalleVisible = isCurrent ? "block" : "none";
        const textoBoton = detalleVisible === "block" ? "Ocultar" : "Ver más";

        return `

        <div class="timeline-item ${clase}">

            <div class="timeline-connector"></div>

            <div class="icon">
                ${this.obtenerIcono(etapa.nombre)}
            </div>

            <div class="stage">

                <div class="stage-header">

                    <div class="stage-title-group">
                        <h4>${etapa.nombre}</h4>
                        <span class="stage-badge ${clase}">
                            ${isCurrent ? "Etapa actual" : (etapa.estado === "completado" ? "Completada" : "Pendiente")}
                        </span>
                    </div>

                    <div class="stage-actions">
                        <button
                            class="editar-etapa"
                            data-carga="${tracking.cargaId}"
                            data-etapa="${etapa.nombre}">
                            Actualizar
                        </button>

                        <button
                            class="toggle-stage"
                            type="button"
                            aria-expanded="${detalleVisible === "block" ? "true" : "false"}">
                            ${textoBoton}
                        </button>
                    </div>

                </div>

                <div class="stage-summary">
                    Fecha: ${fecha}
                </div>

                <div class="stage-detail" style="display:${detalleVisible}">

                    <p>
                        <strong>Responsable:</strong>
                        ${etapa.responsable || "-"}
                    </p>

                    <p>
                        <strong>Observaciones:</strong>
                        ${etapa.observaciones || "Sin observaciones"}
                    </p>

                    <p>
                        <strong>Completitud documental:</strong>
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
                storageService.getTrackings();

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