import storageService from "./storage-service.js";

class HistorialView {

    render(cargaId){

        const historial =
            storageService
                .getHistorial()
                .filter(
                    item =>
                        item.cargaId == cargaId
                )
                .sort(
                    (a,b)=>
                        new Date(b.fecha) -
                        new Date(a.fecha)
                );

        if(historial.length === 0){

            return `

                <div class="tracking-header">

                    <h2>
                        🕒 Historial
                    </h2>

                    <p>
                        No existen registros
                    </p>

                </div>

            `;

        }

        return `

            <div class="tracking-header">

                <h2>
                    🕒 Historial
                </h2>

            </div>

            <div class="historial-container">

                ${historial.map(item=>`

                    <div class="historial-item">

                        <div class="historial-fecha">

                            ${item.fecha}

                        </div>

                        <div class="historial-detalle">

                            <strong>

                                ${item.usuario}

                            </strong>

                            <p>

                                ${item.accion}

                            </p>

                            <span>

                                ${item.detalle}

                            </span>

                        </div>

                    </div>

                `).join("")}

            </div>

        `;

    }

}

export default new HistorialView();