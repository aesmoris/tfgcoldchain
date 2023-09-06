import React, { useState } from 'react';
import { connectToWeb3, getEstadoProductoText } from '../../Hooks/utils.js';
import Swal from 'sweetalert2';

function GetProductosDelAcuerdo({ role }) {
  const [loading, setLoading] = useState(false);
  const [acuerdoId, setAcuerdoId] = useState('');
  const [productos, setProductos] = useState([]);
  const [temperaturas, setTemperaturas] = useState([]);
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState('');
  const [isProductsVisible, setIsProductsVisible] = useState(false); // Estado para controlar la visibilidad de los productos

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

      if (!acuerdoId) {
        console.error('Please enter the agreement ID');
        return;
      }

      setLoading(true);
      const acuerdo = await contract.methods.getProductosDelAcuerdo(acuerdoId).call({ from: account });
      const temperaturasAcuerdo = await contract.methods.getAcuerdo(acuerdoId).call({ from: account });
      setProductos(acuerdo);
      setTemperaturas(temperaturasAcuerdo);
      setLoading(false);

      // Cambiar el estado de visibilidad de los productos cuando se obtienen
      setIsProductsVisible(true);
    } catch (error) {
      setLoading(false);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Revise la consola para más información",
      });
      console.error('Error calling contract function:', error);
    }
  };

  // Función para manejar la ocultación de los productos
  const handleProductsVisibility = () => {
    setIsProductsVisible((prevVisibility) => !prevVisibility);
  };

  return (
    <div>
      <h3>Ingresa el ID del acuerdoFabVenta para ver los productos</h3>
      <button onClick={handleConnectToWeb3}>Connect to Web3</button>
      <br />
      <label>
        ID del acuerdo:
        <input type="text" value={acuerdoId} onChange={(e) => setAcuerdoId(e.target.value)} />
      </label>
      <br />
      <button onClick={handleButtonClick} disabled={!web3 || !contract || loading}>
        Ver productos del acuerdo
      </button>
      {/* Mostrar/ocultar los productos */}
      {isProductsVisible && productos.length > 0 && (
        <div>
          <button onClick={handleProductsVisibility}>Ocultar productos</button>
          <h3>Productos del acuerdo:</h3>
            {productos.map((producto) => (
              <div key={producto.id}>
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
          ))}
        </div>
      )}
      {(!isProductsVisible || productos.length === 0) && (
        <button onClick={handleProductsVisibility}>Mostrar productos</button>
      )}
    </div>
  );
}

export default GetProductosDelAcuerdo;