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

            option.value =
                item[campo];

            option.textContent =
                item[campo];

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