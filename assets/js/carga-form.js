import dataService from "./data-service.js";
import timelineEngine from "./timeline-engine.js";
import storageService from "./storage-service.js";

class CargaForm {

    constructor(){

        this.form =
            document.getElementById(
                "formCarga"
            );

        this.modal =
            document.getElementById(
                "modalCarga"
            );

    }

    abrir(){

        if(this.modal){
            this.modal.classList.remove("hidden");
        }

    }

    cerrar(){

        if(this.modal){
            this.modal.classList.add("hidden");
        }

    }

    async init(){

        if(!this.form){
            return;
        }

        const botonAbrir =
            document.getElementById(
                "btnNuevaCarga"
            );

        if(botonAbrir){
            botonAbrir.addEventListener(
                "click",
                ()=> this.abrir()
            );
        }

        document.querySelectorAll(
            "[data-close-modal]"
        ).forEach(boton => {
            boton.addEventListener(
                "click",
                ()=> {
                    const modalId =
                        boton.dataset.closeModal;
                    const modal =
                        document.getElementById(
                            modalId
                        );

                    if(modal){
                        modal.classList.add("hidden");
                    }
                }
            );
        });

        await this.cargarPaises();

        this.form.addEventListener(

            "submit",

            (event)=>{

                event.preventDefault();

                this.guardar();

            }

        );

    }

    async cargarPaises(){

        const paises =
            await dataService.getPaises();

        const select =
            document.getElementById(
                "pais"
            );

        select.innerHTML = "";

        paises.forEach(pais=>{

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                pais.codigo;

            option.textContent =
                pais.nombre;

            select.appendChild(option);

        });

    }

    async guardar(){

        const datos = {

            id: Date.now(),

            ciim:
                document.getElementById(
                    "ciim"
                ).value,

            expo:
                document.getElementById(
                    "expo"
                ).value,

            oc:
                document.getElementById(
                    "oc"
                ).value,

            oci:
                document.getElementById(
                    "oci"
                ).value,

            cliente:
                document.getElementById(
                    "cliente"
                ).value,

            pais:
                document.getElementById(
                    "pais"
                ).value,

            proceso:
                document.getElementById(
                    "proceso"
                ).value,

            container:
                document.getElementById(
                    "container"
                ).value,

            fechaInicioProceso:
                document.getElementById(
                    "fechaInicioProceso"
                ).value,

            fechaCompromiso:
                document.getElementById(
                    "fechaCompromiso"
                ).value,

            facturaLP:
                document.getElementById(
                    "facturaLP"
                ).value,

            facturaQB:
                document.getElementById(
                    "facturaQB"
                ).value,

            observaciones:
                document.getElementById(
                    "observaciones"
                ).value,

            estadoActual:
                "Solicitud Cliente"
        };

        if(!datos.fechaInicioProceso){

            alert(
                "Debe indicar la fecha de inicio del proceso"
            );

            return;
        }

        console.log(
            "Nueva carga",
            datos
        );

        storageService.saveCarga(datos);

        await this.generarTracking(
            datos
        );   
        alert(
            "Carga creada correctamente"
        );

        this.form.reset();
        this.cerrar();

    }
    

    async generarTracking(carga){

        const procesos =
            await dataService.getProcesos();

        const proceso =

            procesos[
                carga.pais
            ][
                carga.proceso
            ];
           
            if(!proceso){

                alert(
                    "No se encontró el proceso seleccionado"
                );

                return;
            }

        const timeline =

            timelineEngine
                .generarTimelineInicial(

                    proceso,

                    carga.fechaInicioProceso

                );

        console.log(
            "Timeline Generada",
            timeline
        );

        storageService.saveTracking({

            id: Date.now(),

            cargaId: carga.id,

            estadoActual: "Solicitud Cliente",

            retrasoAcumuladoDias: 0,

            porcentajeCompletado: 0,

            etapas: timeline

        });

        storageService.registrarHistorial(

            carga.id,

            "Sistema",

            "Carga creada",

            `${carga.expo} creada`

        );


    }
    async cargarProcesos(){

    const selectorPais =
        document.getElementById(
            "pais"
        );

    selectorPais.addEventListener(
        "change",
        async () => {

            const procesos =
                await dataService
                    .getProcesos();

            const pais =
                selectorPais.value;

            const selectProceso =
                document.getElementById(
                    "proceso"
                );

            selectProceso.innerHTML = "";

            Object.keys(
                procesos[pais] || {}
            ).forEach(nombre=>{

                const option =
                    document.createElement(
                        "option"
                    );

                option.value =
                    nombre;

                option.textContent =
                    nombre;

                selectProceso.appendChild(
                    option
                );

            });

        }
    );

    selectorPais.dispatchEvent(
        new Event("change")
    );

}

}

export default new CargaForm();