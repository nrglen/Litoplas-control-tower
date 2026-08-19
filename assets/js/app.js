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
            ciim: "",
            expo: "",
            oc: "",
            container: "",
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

            trackingView.cargarTimeline(
                this.cargas[0].id
            );

        }

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

    filterView.llenarSelect(
        "filtroPais",
        paises,
        "nombre"
    );

    filterView.llenarSelect(
        "filtroCliente",
        clientes,
        "nombre"
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

        this.actualizarTabla(
            resultado
        );

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

                await trackingView
                    .cargarTimeline(id);

            }
        );

        window.addEventListener(
            "trackingActualizado",
            async(event)=>{

                const cargaId =
                    event.detail.cargaId;

                await trackingView
                    .cargarTimeline(
                        cargaId
                    );

                this.renderDashboard();

            }
        );

        const buscador =
            document.getElementById(
                "busquedaGlobal"
            );

        if(buscador){

            buscador.addEventListener(
                "keyup",
                (event)=>{

                    this.filtros.textoGlobal =
                        event.target.value;

                    this.aplicarFiltros();

                }
            );

        }

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