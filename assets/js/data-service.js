class DataService {

async getCargas(){

    const response =
        await fetch(
            "assets/data/cargas.json"
        );

    return await response.json();

}

async getTracking(){

    const response =
        await fetch(
            "assets/data/tracking.json"
        );

    return await response.json();

}

async getDocumentos(){
    const response =
        await fetch(
            "assets/data/documentos.json"
        );

    return await response.json();

}


async getProcesos(){

    const response =
        await fetch(
            "assets/data/procesos.json"
        );

    return await response.json();

}

async getAlertas(){

    const response =
        await fetch(
            "assets/data/alertas.json"
        );

    return await response.json();

}
async getPaises(){

    const response =
        await fetch(
            "assets/data/paises.json"
        );

    return await response.json();
}

async getClientes(){

    const response =
        await fetch(
            "assets/data/clientes.json"
        );

    return await response.json();
}

}

export default new DataService();