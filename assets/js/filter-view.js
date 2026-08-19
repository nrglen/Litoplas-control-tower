class FilterView {

    llenarSelect(
        id,
        datos,
        campo
    ){

        const select =
            document.getElementById(id);

        if(!select){
            return;
        }

        select.innerHTML = "";

        datos.forEach(item=>{

            const option =
                document.createElement(
                    "option"
                );

            const valor =
                typeof item === "object" && item !== null
                    ? (item.value ?? item[campo] ?? "")
                    : item;

            const texto =
                typeof item === "object" && item !== null
                    ? (item.label ?? item[campo] ?? valor)
                    : item;

            option.value = valor;
            option.textContent = texto;

            select.appendChild(option);

        });

    }

    obtenerValores(id){

        const select =
            document.getElementById(id);

        if(!select){
            return [];
        }

        return [...select.selectedOptions]

            .map(
                option => option.value
            );

    }

    renderFiltrosActivos(
        filtros
    ){

        const container =
            document.getElementById(
                "filtrosActivos"
            );

        if(!container){
            return;
        }

        let html = "";

        Object.values(filtros)

            .flat()

            .forEach(valor=>{

                if(!valor){
                    return;
                }

                html += `
                    <span class="filter-tag">
                        ${valor}
                    </span>
                `;

            });

        container.innerHTML =
            html;
    }

}

export default new FilterView();