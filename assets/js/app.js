import dataService from "./data-service.js";
import filterEngine from "./filter-engine.js";
import dashboardEngine from "./dashboard-engine.js";
import trackingView from "./tracking-view.js";
import filterView from "./filter-view.js";
import cargaForm from "./carga-form.js";
import storageService from "./storage-service.js";
import etapaForm from "./etapa-form.js";
class App {

    constructor(){

        this.cargas = [];
        this.trackings = [];
        this.alertas = [];
        this.cargaForm = cargaForm;
        this.etapaForm = etapaForm;

        this.filtros = {
            paises: [],
            clientes: [],
            procesos: [],
            estados: [],
            meses: [],
            textoGlobal: ""
        };

    }

    /*
    ============================
    INICIO
    ============================
    */

    async init(){

        await this.cargarDatos();
        await this.cargarCombos();
        await this.cargaForm.init();
        await this.cargaForm.cargarProcesos();
        await this.etapaForm.init();

        this.renderTabla();
        this.renderDashboard();
        this.configurarEventos();

        if(this.cargas.length > 0){
            trackingView.cargarTimeline(this.cargas[0].id, this.cargas[0]);
        }

        window.addEventListener("online", async () => {
            await this.cargarDatos();
            await this.cargarCombos();
            this.renderTabla();
            this.aplicarFiltros();
            this.renderDashboard();

            if(this.cargas.length > 0){
                trackingView.cargarTimeline(this.cargas[0].id, this.cargas[0]);
            }
        });

    }

    /*
    ============================
    CARGAR COMBOS
    ============================
    */

    async cargarCombos(){

        const paises =
            await dataService.getPaises();

        const clientes =
            await dataService.getClientes();

        const procesos =
            [...new Set(
                this.cargas
                    .map(carga => carga.proceso)
                    .filter(Boolean)
            )];

        const estados =
            [...new Set(
                this.cargas
                    .map(carga => carga.estadoActual)
                    .filter(Boolean)
            )];

        const mesesMap = new Map();

        this.cargas.forEach(carga => {
            if(!carga.fechaCompromiso){
                return;
            }

            const fecha =
                carga.fechaCompromiso.includes("/")
                    ? new Date(
                        carga.fechaCompromiso.split("/").reverse().join("-")
                    )
                    : new Date(carga.fechaCompromiso);

            if(isNaN(fecha.getTime())){
                return;
            }

            const year = fecha.getFullYear();
            const month = String(fecha.getMonth() + 1).padStart(2, "0");
            const value = `${year}-${month}`;
            const label = new Intl.DateTimeFormat("es-ES", {
                month: "short",
                year: "numeric"
            }).format(fecha);

            if(!mesesMap.has(value)){
                mesesMap.set(value, {
                    value,
                    label: label.replace(".", "").trim()
                });
            }
        });

        const meses = [...mesesMap.values()].sort((a, b) => {
            return new Date(`${a.value}-01`) - new Date(`${b.value}-01`);
        });

        filterView.llenarSelect(
            "filtroPais",
            paises.map(pais => ({
                value: pais.codigo,
                label: pais.nombre
            })),
            "value"
        );

        filterView.llenarSelect(
            "filtroCliente",
            clientes,
            "nombre"
        );

        filterView.llenarSelect(
            "filtroProceso",
            procesos.map(valor => ({ nombre: valor })),
            "nombre"
        );

        filterView.llenarSelect(
            "filtroEstado",
            estados.map(valor => ({ nombre: valor })),
            "nombre"
        );

        filterView.llenarSelect(
            "filtroMes",
            meses,
            "value"
        );

    }

    /*
    ============================
    CARGAR DATOS
    ============================
    */

    async cargarDatos(){

        try{

            this.cargas =
                await dataService.getCargas();

            this.trackings =
                await dataService.getTracking();

            this.alertas =
                await dataService.getAlertas();

            storageService.inicializarDatos(
                this.cargas,
                this.trackings,
                this.alertas,
                [],
                []
            );

        }
        catch(error){

            console.error(error);

        }

    }

    /*
    ============================
    TABLA
    ============================
    */

    renderTabla(){

        const tbody =
            document.querySelector(
                "#tablaCargas tbody"
            );

        if(!tbody){
            return;
        }

        let html = "";

        this.cargas.forEach(carga=>{

            html += `

            <tr
                data-id="${carga.id}"
                class="fila-carga"
            >

                <td>${carga.ciim}</td>

                <td>${carga.expo}</td>

                <td>${carga.oc}</td>

                <td>${carga.cliente}</td>

                <td>${carga.pais}</td>

                <td>${carga.proceso}</td>

                <td>${carga.estadoActual}</td>

            </tr>

            `;

        });

        tbody.innerHTML = html;

    }

    /*
    ============================
    FILTROS
    ============================
    */

    aplicarFiltros(){

        let resultado =
            filterEngine.filtrarCargas(
                this.cargas,
                this.filtros
            );

        resultado =
            filterEngine.busquedaGlobal(
                resultado,
                this.filtros.textoGlobal
            );

        this.actualizarTabla(resultado);
        filterView.renderFiltrosActivos(this.filtros);

    }

    actualizarTabla(registros){

        const tbody =
            document.querySelector(
                "#tablaCargas tbody"
            );

        let html = "";

        registros.forEach(carga=>{

            html += `

            <tr
                data-id="${carga.id}"
                class="fila-carga"
            >

                <td>${carga.ciim}</td>
                <td>${carga.expo}</td>
                <td>${carga.oc}</td>
                <td>${carga.cliente}</td>
                <td>${carga.pais}</td>
                <td>${carga.proceso}</td>
                <td>${carga.estadoActual}</td>

            </tr>

            `;

        });

        tbody.innerHTML = html;

    }

    /*
    ============================
    DASHBOARD
    ============================
    */

    renderDashboard(){

        const dashboard =

            dashboardEngine.generarDashboard(

                this.cargas,

                this.trackings,

                this.alertas

            );

        this.setTexto(
            "kpiCargasActivas",
            dashboard.cargasActivas
        );

        this.setTexto(
            "kpiEntregadas",
            dashboard.cargasEntregadas
        );

        this.setTexto(
            "kpiRetrasadas",
            dashboard.cargasRetrasadas
        );

        this.setTexto(
            "kpiOTIF",
            dashboard.otif + "%"
        );

        this.setTexto(
            "kpiAlertas",
            dashboard.alertas
        );

    }

    /*
    ============================
    EVENTOS
    ============================
    */

    configurarFiltros(){

        const campos = [
            { id: "filtroPais", clave: "paises" },
            { id: "filtroCliente", clave: "clientes" },
            { id: "filtroProceso", clave: "procesos" },
            { id: "filtroEstado", clave: "estados" },
            { id: "filtroMes", clave: "meses" }
        ];

        campos.forEach(({ id, clave }) => {
            const elemento = document.getElementById(id);
            if(!elemento){
                return;
            }

            const actualizar = () => {
                if(elemento.tagName === "SELECT"){
                    this.filtros[clave] = [...elemento.selectedOptions].map(option => option.value);
                } else {
                    this.filtros[clave] = elemento.value;
                }

                this.aplicarFiltros();
            };

            if(elemento.tagName === "SELECT"){
                elemento.addEventListener("mousedown", (event) => {
                    if(!elemento.multiple){
                        return;
                    }

                    const option = event.target.closest("option");
                    if(!option){
                        return;
                    }

                    option.selected = !option.selected;
                    event.preventDefault();
                    actualizar();
                });
                elemento.addEventListener("change", actualizar);
            } else {
                elemento.addEventListener("input", actualizar);
            }
        });

        const buscador = document.getElementById("busquedaGlobal");
        if(buscador){
            buscador.addEventListener("keyup", (event) => {
                this.filtros.textoGlobal = event.target.value;
                this.aplicarFiltros();
            });
        }

    }

    sincronizarEstadoCarga(cargaId, tracking){

        const cargasGuardadas = storageService.getCargas();
        const cargaGuardadaIndex = cargasGuardadas.findIndex(item => item.id == cargaId);

        if(cargaGuardadaIndex >= 0 && tracking && tracking.estadoActual){
            cargasGuardadas[cargaGuardadaIndex] = {
                ...cargasGuardadas[cargaGuardadaIndex],
                estadoActual: tracking.estadoActual
            };
            storageService.set(storageService.keys.cargas, cargasGuardadas);
        }

        const cargaIndex = this.cargas.findIndex(item => item.id == cargaId);
        if(cargaIndex >= 0 && tracking && tracking.estadoActual){
            this.cargas[cargaIndex] = {
                ...this.cargas[cargaIndex],
                estadoActual: tracking.estadoActual
            };
        }

        const trackingIndex = this.trackings.findIndex(item => item.cargaId == cargaId);
        if(trackingIndex >= 0){
            this.trackings[trackingIndex] = tracking;
        } else if(tracking){
            this.trackings.push(tracking);
        }

    }

    configurarEventos(){

        document.addEventListener(
            "click",
            async (event)=>{

                const fila =
                    event.target.closest(
                        ".fila-carga"
                    );

                if(!fila){
                    return;
                }

                const id =
                    fila.dataset.id;

                this.seleccionarFila(
                    fila
                );

                const carga =
                    this.cargas.find(
                        item => item.id == id
                    );

                await trackingView
                    .cargarTimeline(id, carga);

            }
        );

        window.addEventListener(
            "trackingActualizado",
            async(event)=>{

                const cargaId =
                    event.detail.cargaId;

                const tracking =
                    storageService.getTrackings().find(item => item.cargaId == cargaId);

                if(tracking){
                    this.sincronizarEstadoCarga(cargaId, tracking);
                }

                this.renderTabla();
                this.aplicarFiltros();
                this.renderDashboard();

                const carga =
                    this.cargas.find(item => item.id == cargaId);

                await trackingView
                    .cargarTimeline(
                        cargaId,
                        carga
                    );

            }
        );

        this.configurarFiltros();

    }

    /*
    ============================
    FILA ACTIVA
    ============================
    */

    seleccionarFila(fila){

        document

            .querySelectorAll(
                ".fila-carga"
            )

            .forEach(item=>{

                item.classList.remove(
                    "selected"
                );

            });

        fila.classList.add(
            "selected"
        );

    }

    /*
    ============================
    UTILIDADES
    ============================
    */

    setTexto(id, valor){

        const elemento =
            document.getElementById(id);

        if(elemento){

            elemento.textContent =
                valor;

        }

    }

}

const app = new App();

window.addEventListener(

    "DOMContentLoaded",

    async ()=>{

        await app.init();

    }

);

export default app;