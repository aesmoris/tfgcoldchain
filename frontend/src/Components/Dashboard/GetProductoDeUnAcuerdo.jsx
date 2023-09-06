import React, { useState } from 'react';
import { connectToWeb3, getEstadoProductoText } from '../../Hooks/utils.js';
import Swal from 'sweetalert2';

function GetProductoDeUnAcuerdo({ role }) {
  const [loading, setLoading] = useState(false);
  const [acuerdoId, setAcuerdoId] = useState('');
  const [productoId, setProductoId] = useState('');
  const [producto, setProducto] = useState(null);
  const [temperaturas, setTemperaturas] = useState(null);
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState('');

  const handleConnectToWeb3 = async () => {
    const web3Data = await connectToWeb3();
    if (web3Data) {
      setWeb3(web3Data.web3);
      setContract(web3Data.contract);
      setAccount(web3Data.account);
    }
  };

  const handleButtonClick = async () => {
    try {
      if (!web3 || !contract) {
        console.error('Web3 or contract not initialized');
        return;
      }

      if (!acuerdoId || !productoId) {
        console.error('Please enter the agreement ID and the product ID');
        return;
      }

      setLoading(true);
      const acuerdo = await contract.methods.getProductoDeUnAcuerdo(acuerdoId, productoId).call({ from: account });
      const temperaturasAcuerdo = await contract.methods.getAcuerdo(acuerdoId).call({ from: account });
      setProducto(acuerdo);
      setTemperaturas(temperaturasAcuerdo);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Revise la consola para más información. Probablemente ha introducido un id de acuerdo o producto inválido (inexistente o todavía no firmado) o usted no tiene permisos para ver los detalles del producto.",
      });
      console.error('Error calling contract function:', error);
    }
  };

  return (
    <div>
      <h3>Ingresa el ID del acuerdoFabVenta y del producto para ver los detalles</h3>
      <button onClick={handleConnectToWeb3}>Connect to Web3</button>
      <br />
      <label>
        ID del acuerdo:
        <input type="text" value={acuerdoId} onChange={(e) => setAcuerdoId(e.target.value)} />
      </label>
      <br />
      <label>
        ID del producto:
        <input type="text" value={productoId} onChange={(e) => setProductoId(e.target.value)} />
      </label>
      <br />
      <button onClick={handleButtonClick} disabled={!web3 || !contract || loading}>
        Ver detalles del producto
      </button>
      {producto && temperaturas && (
        <div>
          <h3>Detalles del producto:</h3>
          <p>ID: {parseInt(producto.id)}</p>
          <p>Última temperatura: {parseInt(producto.ultimaTemperatura)}</p>
          <p>Estado: {getEstadoProductoText(parseInt(producto.estado))}</p>
          <p>Temperatura Máxima: {parseInt(temperaturas.temperaturaMaxima)}</p>
          <p>Temperatura Mínima: {parseInt(temperaturas.temperaturaMinima)}</p>
          <p>Fabricante: {producto.fabricante}</p>
          <p>Punto de venta: {producto.puntoVenta}</p>
          <p>Transportista: {producto.transportista}</p>
          <p>Fecha de fabricación: {new Date(parseInt(producto.fechaFabricacion) * 1000).toLocaleDateString()}</p>
          <p>Deadline entrega: {
                new Date((parseInt(producto.fechaFabricacion)) * 1000 + Number(temperaturas.diasCaducidad) * 24 * 60 * 60 * 1000).toLocaleDateString()
          }</p>
          <hr />
        </div>
      )}
    </div>
  );
}

export default GetProductoDeUnAcuerdo;
