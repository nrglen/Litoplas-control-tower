class DocumentsView {

    renderDocumentos(
        documentos = [],
        documentosRequeridos = []
    ){

        let html = "";

        html += `
        <div class="documents-section">

            <div class="documents-header">

                <h4>
                    📎 Documentos
                </h4>

            </div>
        `;

        documentosRequeridos.forEach(requerido=>{

            const existe =
                documentos.find(

                    doc =>
                    doc.tipo === requerido ||

                    doc.nombre === requerido

                );

            if(existe){

                html += `
                <div class="document-item complete">

                    ✅ ${requerido}

                </div>
                `;
            }
            else{

                html += `
                <div class="document-item missing">

                    ⚪ ${requerido}

                </div>
                `;
            }

        });

        html += "</div>";

        return html;

    }

    calcularCompletitud(
        documentos,
        requeridos
    ){

        if(requeridos.length === 0){

            return 100;

        }

        let encontrados = 0;

        requeridos.forEach(item=>{

            const existe = documentos.find(

                doc =>
                doc.tipo === item ||

                doc.nombre === item

            );

            if(existe){

                encontrados++;

            }

        });

        return Math.round(
            (encontrados /
             requeridos.length)
            * 100
        );

    }

}

export default new DocumentsView();