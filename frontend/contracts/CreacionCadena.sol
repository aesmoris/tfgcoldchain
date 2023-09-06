// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.8.2 <0.9.0;

import "@openzeppelin/contracts/utils/Strings.sol";

contract CreacionCadena {
    enum EstadoDelProducto { 
        Fabricado, 
        RecibidoPorTransportista, 
        RecibidoPorPuntoVenta, 
        Descartado 
    }

    struct Producto {
        uint id;
        int16 ultimaTemperatura;
        EstadoDelProducto estado;
        address fabricante;
        address puntoVenta;
        address transportista;
        uint fechaFabricacion;
    }

    struct AcuerdoFabVenta {
        uint id;
        string nombreProducto;
        uint tipoProductoId;
        address fabricante;
        address puntoVenta;
        uint cantidad;
        uint monto;
        int16 temperaturaMinima;
        int16 temperaturaMaxima;
        uint diasCaducidad;
        bool firmadoFabricante;
        bool firmadoPuntoVenta;
    }

    struct AcuerdoTransFab {
        uint acuerdoTransFabId;
        uint[] acuerdoFabVentaId;
        address fabricante;
        address transportista;
        uint monto;
        bool firmadoFabricante;
        bool firmadoTransportista;
    }

    // Mapeo para relacionar el id único del acuerdo entre fabricante y punto de venta con un struct AcuerdoFabVenta que contiene los detalles del acuerdo
    mapping(uint => AcuerdoFabVenta) public acuerdos;
    // Mapeo para relacionar el id único del acuerdo entre fabricante y transportista con un struct  AcuerdoTransFab que contiene los detalles
    mapping(uint => AcuerdoTransFab) public acuerdos2;
    // Mapeo para asociar los productos a un acuerdo específico. Utilizo dos claves para acceder a un producto en particular: el id del acuerdo y el id del producto
    mapping(uint => mapping(uint => Producto)) public productosDelAcuerdo;

    uint public contadorAcuerdos;
    uint public contadorAcuerdos2;

    // Eventos
    event AcuerdoCreado(uint indexed id, string nombreProducto, uint tipoProductoId, address indexed fabricante, address indexed puntoVenta, uint cantidad, uint monto, int16 temperaturaMinima,
        int16 temperaturaMaxima, uint diasCaducidad);
    event AcuerdoFabVentaFirmado(uint indexed id, string nombreProducto, uint tipoProductoId, address indexed fabricante, address indexed puntoVenta, uint cantidad, uint monto, int16 temperaturaMinima,
        int16 temperaturaMaxima);
    event ProductoAgregado(uint indexed acuerdoId, uint indexed productoId, string nombreProducto, int16 temperaturaMinima, int16 temperaturaMaxima);
    event AcuerdoTransFabFirmado(uint indexed acuerdoTransFabId, uint[] acuerdoFabVentaId, address indexed fabricante, address indexed transportista, uint monto);
    event TransportistaDelProductoActualizado(uint indexed acuerdoId, uint indexed productoId, address indexed transportista);

    // Función privada con la lógica para crear un acuerdo por parte del fabricante con el punto de venta
    // diasCaducidad son los dias estipulados en el acuerdo que pueden pasar como maximo desde la fecha de fabricacion del producto hasta que se reciba sin que el producto se considere como caducado
    function crearAcuerdo(string memory _nombreProducto, uint _tipoProductoId, address _puntoVenta, uint _cantidad, uint _monto, int16 _temperaturaMinima,
        int16 _temperaturaMaxima, uint _diasCaducidad) private /*soloFabricante(contadorAcuerdos + 1)*/ {
        /*Aqui habria que crear un require que exija que el _tipoProductoId sea un numero que esta dentro del catalogo del fabricante*/
        require(_monto > 0, "El monto del acuerdo debe ser mayor a cero");

        contadorAcuerdos++;
        acuerdos[contadorAcuerdos] = AcuerdoFabVenta(contadorAcuerdos, _nombreProducto, _tipoProductoId, msg.sender, _puntoVenta, _cantidad, _monto, _temperaturaMinima, _temperaturaMaxima, _diasCaducidad, false, false);

        emit AcuerdoCreado(contadorAcuerdos, _nombreProducto, _tipoProductoId, msg.sender, _puntoVenta, _cantidad, _monto, _temperaturaMinima, _temperaturaMaxima, _diasCaducidad);
    }

    // Creacion del acuerdo fabricante con punto de venta
    function crearAcuerdoPuntoVenta(string memory _nombreProducto, uint _productoId, address _puntoVenta, uint _cantidad, uint _monto, int16 _temperaturaMinima,
        int16 _temperaturaMaxima, uint _diasCaducidad) public {
        crearAcuerdo(_nombreProducto, _productoId, _puntoVenta, _cantidad, _monto, _temperaturaMinima, _temperaturaMaxima, _diasCaducidad);
    }
    
    // Funcion privada para crear un acuerdo entre fabricante y transportista para el envio de uno o mas acuerdos de fabricante con punto de venta
    function crearAcuerdo2(uint[] memory _acuerdoFabVentaId, address _transportista, uint _monto) private {
        require(_monto > 0, "El monto del acuerdo debe ser mayor a 0");
        require(_acuerdoFabVentaId.length > 0, "Debe proporcionar al menos un acuerdoFabVentaId");

        // Para cada acuerdoFabVenta que se quiera asignar al transportista se chequea primero una serie de condiciones
        for (uint i = 0; i < _acuerdoFabVentaId.length; i++) {
            require(_acuerdoFabVentaId[i] <= contadorAcuerdos, string(abi.encodePacked("El acuerdoFabVenta con id", Strings.toString(_acuerdoFabVentaId[i]), " no existe")));
            require(acuerdos[_acuerdoFabVentaId[i]].fabricante == msg.sender, string(abi.encodePacked("Usted no es el fabricante del acuerdoFabVenta", Strings.toString(_acuerdoFabVentaId[i]), " ")));
            require(acuerdos[_acuerdoFabVentaId[i]].firmadoPuntoVenta == true && acuerdos[_acuerdoFabVentaId[i]].firmadoFabricante == true, string(abi.encodePacked("El acuerdoFabVenta con id", Strings.toString(_acuerdoFabVentaId[i]), " no ha sido firmado por ambas partes")));
        }

        contadorAcuerdos2++;
        acuerdos2[contadorAcuerdos2] = AcuerdoTransFab(contadorAcuerdos2, _acuerdoFabVentaId, msg.sender, _transportista, _monto, false, false);
    }

    // Creacion del acuerdo fabricante con el transportista
    function crearAcuerdoTransportista(uint[] memory _acuerdoFabVentaId, address _transportista, uint _monto) public {
        crearAcuerdo2(_acuerdoFabVentaId, _transportista, _monto);
    }
    
    // Función para que el fabricante firme un acuerdo y despues el punto de venta
    // Para optimizar el tamaño del smart contract se evita la declaración de variables en casos en que sólo se vayan a usar para su lectura
    function firmarAcuerdoFabVenta(uint _acuerdoId) public payable {
        require(_acuerdoId <= contadorAcuerdos, "El acuerdo no existe");

        if (msg.sender == acuerdos[_acuerdoId].fabricante) {
            require(!acuerdos[_acuerdoId].firmadoFabricante, "Fabricante ya ha firmado");
            acuerdos[_acuerdoId].firmadoFabricante = true;
        } else if (msg.sender == acuerdos[_acuerdoId].puntoVenta) {
            require(acuerdos[_acuerdoId].firmadoFabricante, "El acuerdo no ha sido firmado por el fabricante");
            require(!acuerdos[_acuerdoId].firmadoPuntoVenta, "PuntoVenta ya ha firmado");
            acuerdos[_acuerdoId].firmadoPuntoVenta = true;
        } else {
            revert("Usted no puede firmar este acuerdo");
        }

        // Cuando ambos hayan firmado
        if (acuerdos[_acuerdoId].firmadoFabricante && acuerdos[_acuerdoId].firmadoPuntoVenta) {
            require(msg.value == acuerdos[_acuerdoId].monto, "Eth(Wei) distinto del monto");

            // Punto de venta transfiere la cantidad de Ethereum(Wei) al fabricante
            payable(acuerdos[_acuerdoId].fabricante).transfer(msg.value);

            // Emitir el evento AcuerdoFirmado cuando ambos han firmado y se ha realizado la transferencia
            emit AcuerdoFabVentaFirmado(_acuerdoId, acuerdos[_acuerdoId].nombreProducto, acuerdos[_acuerdoId].tipoProductoId, acuerdos[_acuerdoId].fabricante, acuerdos[_acuerdoId].puntoVenta, acuerdos[_acuerdoId].cantidad, acuerdos[_acuerdoId].monto, acuerdos[_acuerdoId].temperaturaMinima, acuerdos[_acuerdoId].temperaturaMaxima);
            
            // Creo los productos individuales que se corresponden al acuerdo
            // ultimaTemperatura se inicializa con un valor especial de -999 para indicar que no está inicializada
            for (uint i = 0; i < acuerdos[_acuerdoId].cantidad; i++) {
                productosDelAcuerdo[_acuerdoId][i + 1] = Producto(
                    i + 1,
                    -999,
                    EstadoDelProducto.Fabricado,
                    acuerdos[_acuerdoId].fabricante,
                    acuerdos[_acuerdoId].puntoVenta,
                    address(0),
                    block.timestamp
                );
                emit ProductoAgregado(_acuerdoId, i + 1, acuerdos[_acuerdoId].nombreProducto, acuerdos[_acuerdoId].temperaturaMinima, acuerdos[_acuerdoId].temperaturaMaxima);
            }
        }
    }

    // Funcion para ver si un acuerdoFabVenta esta asignado a un fabricante o aun se puede asignar (True = ya esta asginado)
    function acuerdoFabVentaAsignado(uint _acuerdoId) public view returns (bool) {
        return productosDelAcuerdo[_acuerdoId][1].transportista != address(0);
    }

    // Funcion para firmar el acuerdo entre fabricante y transportista, primero tiene que firmar el transportista
    function firmarAcuerdoTransFab(uint _acuerdoTransFabId) public payable {
        require(_acuerdoTransFabId <= contadorAcuerdos2, "El acuerdo no existe");
        
        // Chequeo que el acuerdo no haya sido ya asignado
        for (uint i = 0; i < acuerdos2[_acuerdoTransFabId].acuerdoFabVentaId.length; i++){
            require(!acuerdoFabVentaAsignado(acuerdos2[_acuerdoTransFabId].acuerdoFabVentaId[i]), 
            string(abi.encodePacked(
                "El acuerdoFabVenta con id", Strings.toString(acuerdos2[_acuerdoTransFabId].acuerdoFabVentaId[i]), " ya fue asignado, contacte al fabricante.")));
        }

        if (msg.sender == acuerdos2[_acuerdoTransFabId].transportista) {
            require(!acuerdos2[_acuerdoTransFabId].firmadoTransportista, "Trasportista ya ha firmado");
            acuerdos2[_acuerdoTransFabId].firmadoTransportista = true;
        } else if (msg.sender == acuerdos2[_acuerdoTransFabId].fabricante) {
            require(acuerdos2[_acuerdoTransFabId].firmadoTransportista, "El acuerdo no ha sido firmado por el transportista");
            require(!acuerdos2[_acuerdoTransFabId].firmadoFabricante, "Fabricante ya ha firmado");
            acuerdos2[_acuerdoTransFabId].firmadoFabricante = true;
        } else {
            revert("Usted no puede firmar este acuerdo");
        }

        if (acuerdos2[_acuerdoTransFabId].firmadoFabricante && acuerdos2[_acuerdoTransFabId].firmadoTransportista) {
            require(msg.value == acuerdos2[_acuerdoTransFabId].monto, "Error: Eth(Wei) distinto del monto");

            // Fabricante transfiere la cantidad de Ethereum(Wei) acordada al transportista
            payable(acuerdos2[_acuerdoTransFabId].transportista).transfer(msg.value);

            // Emitir el evento AcuerdoTransFabFirmado cuando ambos han firmado y se ha realizado la transferencia
            emit AcuerdoTransFabFirmado(_acuerdoTransFabId, acuerdos2[_acuerdoTransFabId].acuerdoFabVentaId, acuerdos2[_acuerdoTransFabId].fabricante, acuerdos2[_acuerdoTransFabId].transportista, acuerdos2[_acuerdoTransFabId].monto);

            // Dentro de cada acuerdoFabVenta que se le ha asignado al transportista del acuerdoTransFab, le pongo a cada producto de ese acuerdo quien es su transportista
            for (uint i = 0; i < acuerdos2[_acuerdoTransFabId].acuerdoFabVentaId.length; i++) {
                for (uint j = 0; j < acuerdos[acuerdos2[_acuerdoTransFabId].acuerdoFabVentaId[i]].cantidad; j++) {
                    productosDelAcuerdo[acuerdos[acuerdos2[_acuerdoTransFabId].acuerdoFabVentaId[i]].id][j + 1].transportista = acuerdos2[_acuerdoTransFabId].transportista;
                    // Evento para notificar la actualizacion de transportista de cada acuerdoFabVenta
                    emit TransportistaDelProductoActualizado(acuerdos[acuerdos2[_acuerdoTransFabId].acuerdoFabVentaId[i]].id, j + 1, acuerdos2[_acuerdoTransFabId].transportista);
                }
            }
        }
    }

    // Funcion para obtener un acuerdoFabVenta dado un id
    function getAcuerdo(uint _acuerdoId) public view returns (AcuerdoFabVenta memory) {
        require(_acuerdoId > 0 && _acuerdoId <= contadorAcuerdos, "El acuerdo no existe");
        return acuerdos[_acuerdoId];
    }

    // Funcion para obtener un acuerdoTransFab dado un id
    function getAcuerdoTransFab(uint _acuerdoTransFabId) public view returns (AcuerdoTransFab memory) {
        require(_acuerdoTransFabId > 0 && _acuerdoTransFabId <= contadorAcuerdos2, "El acuerdoTransFab no existe");
        return acuerdos2[_acuerdoTransFabId];
    }

    // Funcion para ver la lista de productos pertenecientes a cada acuerdoFabVenta
    function getProductosDelAcuerdo(uint _acuerdoId) public view returns (Producto[] memory) {
        require(_acuerdoId <= contadorAcuerdos, "El acuerdo no existe");

        Producto[] memory listaProductos = new Producto[](acuerdos[_acuerdoId].cantidad);

        // Antes de revisar el contenido miro que el que quiere ver la informacion sea el fabricante, transportista o punto de venta del producto
        // Lo miro en el for en vez de antes porque no tengo al transportista en el acuerdoFabVenta, solo a fabricante y punto de venta, no se si quiza seria mejor añadir un campo extra en el struct para esto
        for (uint i = 0; i < acuerdos[_acuerdoId].cantidad; i++) {
            require(msg.sender == productosDelAcuerdo[_acuerdoId][i + 1].fabricante || 
            msg.sender == productosDelAcuerdo[_acuerdoId][i + 1].transportista || 
            msg.sender == productosDelAcuerdo[_acuerdoId][i + 1].puntoVenta, 
            "No tienes permiso para acceder a esta informacion");
            listaProductos[i] = productosDelAcuerdo[_acuerdoId][i + 1];
        }

        return listaProductos;
    }

    
    // Funcion para ver un producto en concreto de un acuerdo
    function getProductoDeUnAcuerdo(uint _acuerdoId, uint _productoId) public view returns(Producto memory) {
        require(_acuerdoId <= contadorAcuerdos, "El acuerdo no existe");
        require(_productoId <= acuerdos[_acuerdoId].cantidad, "_productoId inexistente");
        return productosDelAcuerdo[_acuerdoId][_productoId];
    }

    // Funcion para cambiar el valor del campo temperatura del producto de un acuerdo
    function setTemperatura(uint _acuerdoId, uint _productoId, int16 _nuevaTemperatura) public {
        productosDelAcuerdo[_acuerdoId][_productoId].ultimaTemperatura = _nuevaTemperatura;
    }

    // Funcion para cambiar el estado del producto de un acuerdo
    // He tenido que hacerlo con ints porque sino no me modificaba el estado cuando era llamada por los otros contratos 
    function setEstado(uint _acuerdoId, uint _productoId, uint8 _nuevoEstado) public {
        if (_nuevoEstado == 0){
            productosDelAcuerdo[_acuerdoId][_productoId].estado = EstadoDelProducto.Fabricado;
        } else if (_nuevoEstado == 1) {
            productosDelAcuerdo[_acuerdoId][_productoId].estado = EstadoDelProducto.RecibidoPorTransportista;
        } else if (_nuevoEstado == 2) {
            productosDelAcuerdo[_acuerdoId][_productoId].estado = EstadoDelProducto.RecibidoPorPuntoVenta;
        } else if (_nuevoEstado == 3) {
            productosDelAcuerdo[_acuerdoId][_productoId].estado = EstadoDelProducto.Descartado;
        }
    }

    // Funcion para que un fabricante o punto de venta sepa el id de los acuerdos que tiene (esten o no firmados)
    // Asi con esta funcion cuando se crea un acuerdo un fabricante o punto de venta puede ver que id tienen
    function saberAcuerdosFabVenta() public view returns (uint[] memory) {
        uint[] memory acuerdosInvolucrados;
        uint count = 0;

        // Recorrer todos los acuerdos
        for (uint i = 1; i <= contadorAcuerdos; i++) {
            // Verificar si el msg.sender está involucrado en el acuerdo como fabricante o punto de venta
            if (acuerdos[i].fabricante == msg.sender || acuerdos[i].puntoVenta == msg.sender) {
                // Aumentar el tamaño del array acuerdosInvolucrados en 1 y asignar el nuevo valor
                uint[] memory temp = new uint[](count + 1);
                for (uint j = 0; j < count; j++) {
                    temp[j] = acuerdosInvolucrados[j];
                }
                temp[count] = i;
                acuerdosInvolucrados = temp;

                count++;
            }
        }

        return acuerdosInvolucrados;
    }



    // Funcion para que un fabricante o transportista sepa el id de los acuerdos que tiene (esten o no firmados)
    // Asi con esta funcion cuando se crea un acuerdo un fabricante o punto de venta puede ver que id tienen
    function saberAcuerdosTransFab() public view returns (uint[] memory) {
        uint[] memory acuerdosInvolucrados;
        uint count = 0;

        // Recorrer todos los acuerdosTransFab
        for (uint i = 1; i <= contadorAcuerdos2; i++) {
            // Verificar si el msg.sender está involucrado en el acuerdo como fabricante o transportista
            if (acuerdos2[i].fabricante == msg.sender || acuerdos2[i].transportista == msg.sender) {
                // Aumentar el tamaño del array acuerdosInvolucrados en 1 y asignar el nuevo valor
                uint[] memory temp = new uint[](count + 1);
                for (uint j = 0; j < count; j++) {
                    temp[j] = acuerdosInvolucrados[j];
                }
                temp[count] = i;
                acuerdosInvolucrados = temp;

                count++;
            }
        }
        
        return acuerdosInvolucrados;
    }
}