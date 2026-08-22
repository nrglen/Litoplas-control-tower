import dataService from "./data-service.js";
import timelineEngine from "./timeline-engine.js";
import documentsView from "./documents-view.js";
import etapaForm from "./etapa-form.js";
import storageService from "./storage-service.js";
import cargaForm from "./carga-form.js";
class TrackingView {

    configurarCargaDocumentos(){

    const zonas =
        document.querySelectorAll(
            ".dropzone-documentos"
        );

    zonas.forEach(zona=>{

        const input =
            zona.querySelector(
                ".input-documento"
            );

        zona.addEventListener(

            "click",

            ()=>{

                input.click();

            }

        );

   input.addEventListener(

    "change",

    event=>{

        const archivo =
            event.target.files[0];

        if(!archivo){
            return;
        }

        const reader =
            new FileReader();

        reader.onload = ()=>{

    const contenido =
        reader.result;

    const cargaId =
        Number(
            zona.dataset.carga
        );

    const nombreEtapa =
        zona.dataset.etapa;

    const trackings =
        storageService.getTrackings();

    const tracking =
        trackings.find(
            item =>
                item.cargaId === cargaId
        );

    if(!tracking){
        return;
    }

    const etapa =
        tracking.etapas.find(
            item =>
                item.nombre === nombreEtapa
        );

    if(!etapa){
        return;
    }

    etapa.documentos =
        etapa.documentos || [];

    etapa.documentos.push({

        id: Date.now(),

        nombre:
            archivo.name,

        tipo:
            archivo.name,

        fechaCarga:
            new Date()
                .toISOString(),

        tamano:
            archivo.size,

        archivo:
            contenido

    });

    storageService.updateTracking(
        cargaId,
        tracking
    );

    storageService.registrarHistorial(

        cargaId,

        "Usuario",

        "Documento cargado",

        archivo.name

    );

    window.dispatchEvent(

        new CustomEvent(

            "trackingActualizado",

            {

                detail:{
                    cargaId
                }

            }

        )

    );

    alert(
        "Documento cargado correctamente"
    );

};

        reader.readAsDataURL(
            archivo
        );

    }

);

    });

}


    configurarAccionesCarga(cargaId){

    const btnEliminar =
        document.getElementById(
            "btnEliminarCarga"
        );

    if(btnEliminar){

        btnEliminar.addEventListener(
            "click",
            ()=>{

                const confirmar =
                    confirm(
                        "¿Desea eliminar esta carga?"
                    );

                if(!confirmar){
                    return;
                }

                storageService.deleteCarga(
                    cargaId
                );

                location.reload();

            }
        );

    }

   const btnEditar =
    document.getElementById(
        "btnEditarCarga"
    );

if(btnEditar){

    btnEditar.addEventListener(

        "click",

        ()=>{

            const carga =
                storageService
                    .getCargas()
                    .find(
                        item =>
                            item.id == cargaId
                    );

            if(!carga){
                return;
            }

            cargaForm.abrirEdicion(
                carga
            );

        }

    );

}

}

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

        if(
    !tracking &&
    carga &&
    procesos?.[carga.pais]?.[carga.proceso]
){

    const timeline =

        timelineEngine
            .generarTimelineInicial(

                procesos[
                    carga.pais
                ][
                    carga.proceso
                ],

                carga.fechaInicioProceso

            );

        tracking = {

            id: Date.now(),

            cargaId: carga.id,

            estadoActual:
                timeline[0]?.nombre ||

                "Solicitud Cliente",

            retrasoAcumuladoDias: 0,

            porcentajeCompletado: 0,

            etapas: timeline

        };

        storageService
            .saveTracking(
            tracking
            );

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

        html += `

    <div class="acciones-carga">

        <h3>
            Acciones de la carga
        </h3>

        <div class="acciones-carga-botones">

            <button
                id="btnEditarCarga"
                class="btn-accion"
            >
                ✏️ Editar carga
            </button>

            <button
                id="btnEliminarCarga"
                class="btn-danger"
            >
                🗑 Eliminar carga
            </button>

        </div>

    </div>

`;


        this.container.innerHTML = html;
        this.configurarAccionesCarga(
        tracking.cargaId
        );
        this.configurarBotonesEditar();
        this.configurarToggles();
        this.configurarCargaDocumentos();
        this.configurarDocumentos();


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

<div class="documentos-cargados">

    <div class="documentos-header">

        <h5>
            📂 Documentos cargados
        </h5>

    </div>

    ${
        documentos.length === 0

        ?

        `
        <p>No hay documentos cargados</p>
        `

        :

        documentos.map(doc => `

            <div class="documento-cargado">

                <span>
                    📄 ${doc.nombre}
                </span>

                <div class="documento-acciones">

                    <button
                        class="descargar-documento"
                        data-id="${doc.id}"
                        data-carga="${tracking.cargaId}"
                        data-etapa="${etapa.nombre}"
                    >
                        ⬇ Descargar
                    </button>

                    <button
                        class="eliminar-documento"
                        data-id="${doc.id}"
                        data-carga="${tracking.cargaId}"
                        data-etapa="${etapa.nombre}"
                    >
                        🗑
                    </button>

                </div>

            </div>

        `).join("")
    }

</div>

<div class="acciones-documentos-etapa">

    <button
        class="descargar-todos"
        data-carga="${tracking.cargaId}"
        data-etapa="${etapa.nombre}"
        ${documentos.length === 0 ? "disabled" : ""}
    >
        ⬇ Descargar todos los documentos
    </button>

</div>

<div
    class="dropzone-documentos"
    data-carga="${tracking.cargaId}"
    data-etapa="${etapa.nombre}"
>

    📂 Arrastre archivos aquí

    <br>

    o haga clic para seleccionar

    <input
        type="file"
        class="input-documento"
        hidden
    >

</div>

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
configurarDocumentos(){

    document
        .querySelectorAll(
    ".descargar-documento"
)
        .forEach(boton=>{

            boton.addEventListener(

                "click",

                ()=>{

                    const cargaId =
                        Number(
                            boton.dataset.carga
                        );

                    const etapaNombre =
                        boton.dataset.etapa;

                    const documentoId =
                        Number(
                            boton.dataset.id
                        );

                    const tracking =
                        storageService
                            .getTrackings()
                            .find(
                                t =>
                                    t.cargaId === cargaId
                            );

                    if(!tracking){
                        return;
                    }

                    const etapa =
                        tracking.etapas.find(
                            e =>
                                e.nombre === etapaNombre
                        );

                    if(!etapa){
                        return;
                    }

                    const documento =
                        etapa.documentos.find(
                            d =>
                                d.id === documentoId
                        );

                    if(!documento){
                        return;
                    }

                    const enlace =
    document.createElement(
        "a"
    );

enlace.href =
    documento.archivo;

enlace.download =
    documento.nombre;

document.body.appendChild(
    enlace
);

enlace.click();

enlace.remove();

                }

            );

        });
document
    .querySelectorAll(
        ".descargar-todos"
    )
    .forEach(boton=>{

        boton.addEventListener(

            "click",

            ()=>{

                const cargaId =
                    Number(
                        boton.dataset.carga
                    );

                const etapaNombre =
                    boton.dataset.etapa;

                const tracking =
                    storageService
                        .getTrackings()
                        .find(
                            item =>
                                item.cargaId === cargaId
                        );

                if(!tracking){
                    return;
                }

                const etapa =
                    tracking.etapas.find(
                        item =>
                            item.nombre === etapaNombre
                    );

                if(!etapa){
                    return;
                }

                const documentos =
                    etapa.documentos || [];

                documentos.forEach(doc=>{

                    const enlace =
                        document.createElement(
                            "a"
                        );

                    enlace.href =
                        doc.archivo;

                    enlace.download =
                        doc.nombre;

                    document.body.appendChild(
                        enlace
                    );

                    enlace.click();

                    enlace.remove();

                });

            }

        );

    });

        document
    .querySelectorAll(
        ".eliminar-documento"
    )
    .forEach(boton=>{

        boton.addEventListener(

            "click",

            ()=>{

                const confirmar =
                    confirm(
                        "¿Desea eliminar este documento?"
                    );

                if(!confirmar){
                    return;
                }

                const cargaId =
                    Number(
                        boton.dataset.carga
                    );

                const etapaNombre =
                    boton.dataset.etapa;

                const documentoId =
                    Number(
                        boton.dataset.id
                    );

                const tracking =
                    storageService
                        .getTrackings()
                        .find(
                            item =>
                                item.cargaId === cargaId
                        );

                if(!tracking){
                    return;
                }

                const etapa =
                    tracking.etapas.find(
                        item =>
                            item.nombre === etapaNombre
                    );

                if(!etapa){
                    return;
                }

                etapa.documentos =
                    etapa.documentos.filter(
                        doc =>
                            doc.id !== documentoId
                    );

                storageService.updateTracking(
                    cargaId,
                    tracking
                );

                storageService.registrarHistorial(

                    cargaId,

                    "Usuario",

                    "Documento eliminado",

                    `Documento ${documentoId}`

                );

                window.dispatchEvent(

                    new CustomEvent(

                        "trackingActualizado",

                        {
                            detail:{
                                cargaId
                            }
                        }

                    )

                );

            }

        );

    });

}
}

export default new TrackingView();

