// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.8.2 <0.9.0;

import "./CreacionCadena.sol";

contract FinCadena {
    CreacionCadena contrato; // Variable para acceder al contrato Contrato99

    constructor(address _contratoAddress) {
        contrato = CreacionCadena(_contratoAddress);
    }


    // Funcion para saber si todos los productos fueron entregados sin problemas
    function acuerdoFinPerfecto(uint _acuerdoId) public view returns (bool) {
        require(_acuerdoId <= contrato.contadorAcuerdos(), "El acuerdo no existe");

        for (uint i = 0; i < contrato.getAcuerdo(_acuerdoId).cantidad; i++) {
            if (contrato.getProductoDeUnAcuerdo(_acuerdoId, i + 1).estado != 
                CreacionCadena.EstadoDelProducto.RecibidoPorPuntoVenta) {
                return false;  // Al menos un producto no está en el estado correcto
            }
        }
        return true;  // Todos los productos están en el estado correcto
    }
    
    function acuerdoFinalizado(uint _acuerdoId) public view returns (bool) {
        require(_acuerdoId <= contrato.contadorAcuerdos(), "El acuerdo no existe");

        for (uint i = 0; i < contrato.getAcuerdo(_acuerdoId).cantidad; i++) {
            if (contrato.getProductoDeUnAcuerdo(_acuerdoId, i + 1).estado != 
                CreacionCadena.EstadoDelProducto.RecibidoPorPuntoVenta && contrato.getProductoDeUnAcuerdo(_acuerdoId, i + 1).estado != CreacionCadena.EstadoDelProducto.Descartado) {
                return false;
            }    
        }
        return true;  // Todos los productos están o descartados o recibidos por el punto de venta
    }

    // Funcion para calcular la indemnizacion
    function indemnizacion(uint _acuerdoId) public view returns (uint) {
        require(_acuerdoId <= contrato.contadorAcuerdos(), "El acuerdo no existe");
        uint numDescartes = 0;
        // Calculo cuanto se ha de pagar por unidad descartada
        // Se devuelve la division entera de lo que vale cada unidad +1 Wei extra
        uint penalizacionPorProducto =
            (contrato.getAcuerdo(_acuerdoId).monto / contrato.getAcuerdo(_acuerdoId).cantidad) +
            1;

        for (uint i = 0; i < contrato.getAcuerdo(_acuerdoId).cantidad; i++) {
            if (
                contrato.getProductoDeUnAcuerdo(_acuerdoId, i + 1).estado !=
                CreacionCadena.EstadoDelProducto.RecibidoPorPuntoVenta
            ) {
                numDescartes++; // Añado un nuevo producto descartado
            }
        }
        return penalizacionPorProducto * numDescartes;
    }

    // Funcion para que el fabricante indemnice al punto de venta
    function devolverDineroPuntoVenta(uint _acuerdoFabVentaId) public payable {
        require(_acuerdoFabVentaId <= contrato.contadorAcuerdos(), "El acuerdo no existe");
        require(
            msg.sender == contrato.getAcuerdo(_acuerdoFabVentaId).fabricante,
            "Usted no es el fabricante de este acuerdo"
        );
        require(
            contrato.getAcuerdo(_acuerdoFabVentaId).firmadoFabricante &&contrato.getAcuerdo(_acuerdoFabVentaId).firmadoPuntoVenta,
            "El acuerdo no fue firmado por ambas partes"
        );
        require(acuerdoFinalizado(_acuerdoFabVentaId), "El acuerdo introducido todavia esta en proceso de envio");
        require(!acuerdoFinPerfecto(_acuerdoFabVentaId), "El acuerdo finalizo sin incidencias");

        uint montoIndemnizacion = indemnizacion(_acuerdoFabVentaId);
        require(
            msg.value == montoIndemnizacion,
            string(
                abi.encodePacked(
                    "La cantidad de Eth (Wei) introducida no coincide con la de la indemnizacion (",
                    Strings.toString(montoIndemnizacion),
                    " )"
                )
            )
        );
        address payable puntoVenta = payable(contrato.getAcuerdo(_acuerdoFabVentaId).puntoVenta);
        puntoVenta.transfer(msg.value);
    }

    // Funcion para chequear que un transportista tiene asignado cierto acuerdoFabVentaId
    function responsableAcuerdoFabVenta(uint _acuerdoTransFabId, uint _acuerdoFabVentaId)
        private
        view
        returns (bool)
    {
        uint[] memory arrayFabVentaId = contrato.getAcuerdoTransFab(_acuerdoTransFabId).acuerdoFabVentaId;
        // Chequeo todos los acuerdosFabVenta que tiene asignados y si esta incluido
        for (uint i = 0; i < arrayFabVentaId.length; i++) {
            if (arrayFabVentaId[i] == _acuerdoFabVentaId) {
                return true;
            }
        }
        return false;
    }

    // Funcion para que el transportista indemnice al fabricante
    function devolverDineroFabricante(uint _acuerdoTransFabId, uint _acuerdoFabVentaId) public payable {
        require(_acuerdoTransFabId <= contrato.contadorAcuerdos2(), "El acuerdoTransFab no existe");
        require(_acuerdoFabVentaId <= contrato.contadorAcuerdos(), "El acuerdoFabventa no existe");
        require(
            msg.sender == contrato.getAcuerdoTransFab(_acuerdoTransFabId).transportista,
            "Usted no es el transportista de este acuerdo"
        );
        require(
            contrato.getAcuerdoTransFab(_acuerdoTransFabId).firmadoFabricante &&
                contrato.getAcuerdoTransFab(_acuerdoTransFabId).firmadoTransportista,
            "El acuerdo no fue firmado por ambas partes"
        );
        require(acuerdoFinalizado(_acuerdoFabVentaId), "El acuerdoFabVenta introducido todavia esta en proceso de envio");
        require(!acuerdoFinPerfecto(_acuerdoFabVentaId), "El acuerdoFabVenta finalizo sin incidencias");
        require(
            responsableAcuerdoFabVenta(_acuerdoTransFabId, _acuerdoFabVentaId),
            "El acuerdoFabVenta introducido no pertenece a este acuerdoTransFab"
        );

        uint montoIndemnizacion = indemnizacion(_acuerdoFabVentaId);
        require(
            msg.value == montoIndemnizacion,
            string(
                abi.encodePacked(
                    "La cantidad de Eth (Wei) introducida no coincide con la de la indemnizacion (",
                    Strings.toString(montoIndemnizacion),
                    " )"
                )
            )
        );
        address payable fabricante = payable(contrato.getAcuerdoTransFab(_acuerdoTransFabId).fabricante);
        fabricante.transfer(msg.value);
    }   
}
