class FilterEngine {

    /*
    =====================================
    NORMALIZAR VALORES
    =====================================
    */

    normalizar(valor){

        if(valor === null || valor === undefined){

            return "";

        }

        return valor
            .toString()
            .trim()
            .toLowerCase();

    }

    /*
    =====================================
    FILTRO TEXTO
    =====================================
    */

    matchTexto(valor, filtro){

        if(!filtro){

            return true;

        }

        return this.normalizar(valor)
            .includes(
                this.normalizar(filtro)
            );

    }

    /*
    =====================================
    FILTRO MULTISELECT
    =====================================
    */

    matchMultiple(valor, lista){

        if(
            !lista ||
            lista.length === 0
        ){

            return true;

        }

        return lista
            .map(item =>
                this.normalizar(item)
            )
            .includes(
                this.normalizar(valor)
            );

    }

    /*
    =====================================
    FILTRO FECHA POR MES
    =====================================
    */

    matchMes(fecha, meses){

        if(
            !meses ||
            meses.length === 0
        ){

            return true;

        }

        if(!fecha){

            return false;

        }

        const fechaReal =
            fecha.includes("/")
                ? new Date(
                    fecha.split("/").reverse().join("-")
                )
                : new Date(fecha);

        if(isNaN(fechaReal.getTime())){
            return false;
        }

        const mesKey = `${fechaReal.getFullYear()}-${String(fechaReal.getMonth() + 1).padStart(2, "0")}`;

        return meses.some(valor => {
            const valorNormalizado = this.normalizar(valor);
            const mesNormalizado = this.normalizar(mesKey);
            const mesNumero = this.normalizar(String(fechaReal.getMonth() + 1));

            return (
                valorNormalizado === mesNormalizado ||
                valorNormalizado === mesNumero
            );
        });

    }

    /*
    =====================================
    FILTRO PRINCIPAL
    =====================================
    */

    filtrarCargas(cargas, filtros){

        return cargas.filter(carga => {

            const paisValido =
                this.matchMultiple(
                    carga.pais,
                    filtros.paises
                );

            const clienteValido =
                this.matchMultiple(
                    carga.cliente,
                    filtros.clientes
                );

            const procesoValido =
                this.matchMultiple(
                    carga.proceso,
                    filtros.procesos
                );

            const estadoValido =
                this.matchMultiple(
                    carga.estadoActual,
                    filtros.estados
                );

            const mesValido =
                this.matchMes(
                    carga.fechaCompromiso,
                    filtros.meses
                );

            return (

                paisValido

                &&

                clienteValido

                &&

                procesoValido

                &&

                estadoValido

                &&

                mesValido

            );

        });

    }

    /*
    =====================================
    BUSQUEDA GLOBAL
    =====================================
    */

    busquedaGlobal(cargas, texto){

        if(!texto){

            return cargas;

        }

        const criterio =
            this.normalizar(texto);

        return cargas.filter(carga => {

            return [

                carga.ciim,

                carga.expo,

                carga.oc,

                carga.oci,

                carga.container,

                carga.cliente,

                carga.pais,

                carga.proceso,

                carga.estadoActual

            ]

                .join(" ")

                .toLowerCase()

                .includes(criterio);

        });

    }

    /*
    =====================================
    ORDENAR
    =====================================
    */

    ordenar(cargas, campo, direccion){

        if(!campo){

            return cargas;

        }

        return [...cargas].sort((a,b)=>{

            const valorA =
                a[campo] || "";

            const valorB =
                b[campo] || "";

            if(valorA < valorB){

                return direccion === "desc"
                    ? 1
                    : -1;

            }

            if(valorA > valorB){

                return direccion === "desc"
                    ? -1
                    : 1;

            }

            return 0;

        });

    }

    /*
    =====================================
    PAGINACION
    =====================================
    */

    paginar(
        registros,
        pagina,
        tamanio
    ){

        const inicio =
            (pagina - 1) * tamanio;

        const fin =
            inicio + tamanio;

        return registros.slice(
            inicio,
            fin
        );

    }

    /*
    =====================================
    RESUMEN FILTROS
    =====================================
    */

    resumenFiltros(filtros){

        return {

            paises:
                filtros.paises?.length || 0,

            clientes:
                filtros.clientes?.length || 0,

            procesos:
                filtros.procesos?.length || 0,

            estados:
                filtros.estados?.length || 0,

            meses:
                filtros.meses?.length || 0

        };

    }

}

export default new FilterEngine();