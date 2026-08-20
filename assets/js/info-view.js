class InfoView {

    render(carga){

        if(!carga){

            return `
                <div class="tracking-header">
                    <h2>Información General</h2>
                    <p>No hay carga seleccionada</p>
                </div>
            `;

        }

        return `

            <div class="tracking-header">

                <h2>
                    📄 Información General
                </h2>

            </div>

            <div class="info-container">

                <div class="info-grid">

                    <div class="info-item">
                        <strong>CIIM</strong>
                        <span>${carga.ciim || "-"}</span>
                    </div>

                    <div class="info-item">
                        <strong>EXPO</strong>
                        <span>${carga.expo || "-"}</span>
                    </div>

                    <div class="info-item">
                        <strong>OC</strong>
                        <span>${carga.oc || "-"}</span>
                    </div>

                    <div class="info-item">
                        <strong>OCI</strong>
                        <span>${carga.oci || "-"}</span>
                    </div>

                    <div class="info-item">
                        <strong>Cliente</strong>
                        <span>${carga.cliente || "-"}</span>
                    </div>

                    <div class="info-item">
                        <strong>País</strong>
                        <span>${carga.pais || "-"}</span>
                    </div>

                    <div class="info-item">
                        <strong>Proceso</strong>
                        <span>${carga.proceso || "-"}</span>
                    </div>

                    <div class="info-item">
                        <strong>Estado</strong>
                        <span>${carga.estadoActual || "-"}</span>
                    </div>

                    <div class="info-item">
                        <strong>Container</strong>
                        <span>${carga.container || "-"}</span>
                    </div>

                    <div class="info-item">
                        <strong>Fecha Inicio</strong>
                        <span>${carga.fechaInicioProceso || "-"}</span>
                    </div>

                    <div class="info-item">
                        <strong>Fecha Compromiso</strong>
                        <span>${carga.fechaCompromiso || "-"}</span>
                    </div>

                    <div class="info-item">
                        <strong>Fecha Entrega</strong>
                        <span>${carga.fechaEntregaReal || "-"}</span>
                    </div>

                </div>

            </div>
        `;
    }

}

export default new InfoView();
