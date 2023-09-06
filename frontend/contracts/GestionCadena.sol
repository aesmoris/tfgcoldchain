// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.8.2 <0.9.0;

import "./CreacionCadena.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract GestionCadena {
    CreacionCadena contrato; // Variable para acceder al contrato CreacionCadena

    event TemperaturaActualizadaYChequeada(uint indexed acuerdoId, int16 indexed ultimaTemperatura, bool temperaturaCorrecta);

    constructor(address _contratoAddress) {
        contrato = CreacionCadena(_contratoAddress);
    }


    // Funcion para verificar que un producto ha sido recibido en el tiempo estipulado
    function verificarEntregaCorrecta(uint _acuerdoId, uint _productoId) private {
        require(_acuerdoId <= contrato.contadorAcuerdos(), "El acuerdo no existe");
        require(_productoId <= contrato.getAcuerdo(_acuerdoId).cantidad, "_productoId inexistente");

        uint fechaRecepcion = block.timestamp;
        // Calculo la fecha limite que hay para que no se considere un producto como caducado
        uint fechaLimite = contrato.getAcuerdo(_acuerdoId).diasCaducidad * 24 * 60 * 60 + contrato.getProductoDeUnAcuerdo(_acuerdoId, _productoId).fechaFabricacion;

        // Si la fecha de recepcion supera a la fecha limite estipulada se descarta el producto
        if (fechaRecepcion > fechaLimite){
            contrato.setEstado(_acuerdoId, _productoId, 3);
        }
    }


    // Función auxiliar para verificar los permisos y el estado del producto
    // El transportista solo ha de poder cambiar el estado cuando actualmente este sea "Fabricado" y solo
    // puede cambiarlo a "RecibidoPorTransportista", el punto de venta solo ha de poder cambiar el estado
    // cuando este sea "RecibidoPorTransportista" y solo puede cambiarlo al estado de "RecibidoPorPuntoVenta".
    // Cuando un producto se descarta se hace automáticamente al incumplir la temperatura así que no necesitamos
    // que nadie lo cambie de forma manual y el fabricante no debería tener que cambiar nunca el estado.
    function verificarPermisosEstadoProducto(uint _acuerdoId, uint _productoId, uint8 _estado) private view {
        require(_productoId > 0 && _productoId <= contrato.getAcuerdo(_acuerdoId).cantidad, string(abi.encodePacked("El producto ", _productoId, " no existe")));
        require(msg.sender == contrato.getProductoDeUnAcuerdo(_acuerdoId, _productoId).transportista || msg.sender == contrato.getProductoDeUnAcuerdo(_acuerdoId, _productoId).puntoVenta, "No posees permisos para cambiar el estado");

        if (contrato.getProductoDeUnAcuerdo(_acuerdoId, _productoId).estado == CreacionCadena.EstadoDelProducto.Fabricado) {
            require(msg.sender == contrato.getProductoDeUnAcuerdo(_acuerdoId, _productoId).transportista, string(abi.encodePacked("Solo el transportista puede cambiar el estado del producto", Strings.toString(_productoId), " actualmente")));
            require(_estado == 1, string(abi.encodePacked("No tienes permiso para cambiar el estado del producto", Strings.toString(_productoId), " a ese estado")));
        } else if (contrato.getProductoDeUnAcuerdo(_acuerdoId, _productoId).estado == CreacionCadena.EstadoDelProducto.RecibidoPorTransportista) {
            require(msg.sender == contrato.getProductoDeUnAcuerdo(_acuerdoId, _productoId).puntoVenta, string(abi.encodePacked("Solo el punto de venta puede cambiar el estado del producto con id",Strings.toString(_productoId), " actualmente")));
            require(_estado == 2, string(abi.encodePacked("No tienes permiso para cambiar el estado del producto con id", Strings.toString(_productoId), " a ese estado")));
        } else {
            revert(string(abi.encodePacked("Accion no disponible, el producto con id", Strings.toString(_productoId), " ha sido recibido por el punto de venta o ha sido descartado")));
        }
    }

    // Funcion para cambiar el estado de uno o varios productos de un acuerdo
    function cambiarEstadoProducto(uint _acuerdoId, uint[] memory _productoId, uint8 _estado) public {
        require(_acuerdoId <= contrato.contadorAcuerdos(), "El acuerdo no existe");
        require(_productoId.length <= contrato.getAcuerdo(_acuerdoId).cantidad, "Has introducido mas productosId de los que existen en el acuerdo");

        // Para cada producto del array de ids de productos verifico que pueda cambiar el estado y cambio al nuevo estado
        for (uint i = 0; i < _productoId.length; i++) {
            uint productoId = _productoId[i];
            require(productoId <= contrato.getAcuerdo(_acuerdoId).cantidad, string(abi.encodePacked("El producto con id", Strings.toString(productoId), " no existe en este acuerdo")));

            verificarPermisosEstadoProducto(_acuerdoId, productoId, _estado);
            contrato.setEstado(_acuerdoId, productoId, _estado);
            // Chequeo que si el punto de venta ha recibido el producto (y terminado la cadena) se verifique que ha sido en la fecha estipulada
            if (_estado == 2) {
                verificarEntregaCorrecta(_acuerdoId, productoId);
            }
        }
    }
    
    // Funcion para cambiar directamente todos los productos de un acuerdo
    function cambiarEstadoTodosLosProductos(uint _acuerdoId, uint8 _estado) public {
        require(_acuerdoId <= contrato.contadorAcuerdos(), "El acuerdo no existe");

        // Logica semejante al de la anterior funcion pero para todos los productos de un acuerdo
        for (uint i = 0; i < contrato.getAcuerdo(_acuerdoId).cantidad; i++) {
            uint productoId = i + 1;

            verificarPermisosEstadoProducto(_acuerdoId, productoId, _estado);
            contrato.setEstado(_acuerdoId, productoId, _estado);
            // Chequeo que si el punto de venta ha recibido el producto (y terminado la cadena) se verifique que ha sido en la fecha estipulada
            if (_estado == 2) {
                verificarEntregaCorrecta(_acuerdoId, productoId);
            }
        }
    }
    
    // Funcion para actualizar la temperatura de los productos de un acuerdo y ver si esta en el rango
    function actualizarYChequearTemperaturaTodos(uint _acuerdoId, int16 _ultimaTemperatura) public {
        require(_acuerdoId <= contrato.contadorAcuerdos(), "El acuerdo no existe");

        for (uint i = 0; i < contrato.getAcuerdo(_acuerdoId).cantidad; i++) {
            uint productoId = i + 1;
            
            // Se actualiza la temperatura y se chequea el estado solo si no ha sido ya descartado
            if (contrato.getProductoDeUnAcuerdo(_acuerdoId, productoId).estado != CreacionCadena.EstadoDelProducto.Descartado){
                contrato.setTemperatura(_acuerdoId, productoId, _ultimaTemperatura);
                // Si la temperatura esta fuera del rango permitido se descarta el producto
                if (_ultimaTemperatura > contrato.getAcuerdo(_acuerdoId).temperaturaMaxima || _ultimaTemperatura < contrato.getAcuerdo(_acuerdoId).temperaturaMinima){
                    //Se descarta
                    contrato.setEstado(_acuerdoId, productoId, 3);
                    emit TemperaturaActualizadaYChequeada(_acuerdoId, _ultimaTemperatura, false);
                } else {
                    emit TemperaturaActualizadaYChequeada(_acuerdoId, _ultimaTemperatura, true);
                }   
            }
        }
    }

    // Funcion para actualizar la temperatura de uno o mas productos y ver si esta en el rango permitido
    function actualizarYChequearTemperatura(uint _acuerdoId, int16 _ultimaTemperatura, uint[] memory _productoId) public {
        require(_acuerdoId <= contrato.contadorAcuerdos(), "El acuerdo no existe");
        require(_productoId.length <= contrato.getAcuerdo(_acuerdoId).cantidad, "Has introducido mas productosId de los que existen en el acuerdo");

        for (uint i = 0; i < _productoId.length; i++) {
            uint productoId = _productoId[i];
            require(productoId <= contrato.getAcuerdo(_acuerdoId).cantidad, string(abi.encodePacked("El producto con id", Strings.toString(productoId), " no existe en este acuerdo")));

            if (contrato.getProductoDeUnAcuerdo(_acuerdoId, productoId).estado != CreacionCadena.EstadoDelProducto.Descartado){
                contrato.setTemperatura(_acuerdoId, productoId, _ultimaTemperatura);
                // Si la temperatura esta fuera del rango permitido se descarta el producto
                if (_ultimaTemperatura > contrato.getAcuerdo(_acuerdoId).temperaturaMaxima || _ultimaTemperatura < contrato.getAcuerdo(_acuerdoId).temperaturaMinima){
                    contrato.setEstado(_acuerdoId, productoId, 3);
                    emit TemperaturaActualizadaYChequeada(_acuerdoId, _ultimaTemperatura, false);
                } else {
                    emit TemperaturaActualizadaYChequeada(_acuerdoId, _ultimaTemperatura, true);
                }
            }            
        }
    }
}