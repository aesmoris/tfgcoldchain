import React, { useState } from 'react';
import { connectToWeb3 } from '../../Hooks/utils.js';
import Swal from 'sweetalert2';

function GetAcuerdo({ role }) {
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState('');
  const [loading, setLoading] = useState(false);

  const [acuerdoId, setAcuerdoId] = useState('');
  const [acuerdoData, setAcuerdoData] = useState(null); // Variable de estado para los datos del acuerdo

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
  
      setLoading(true);
      const acuerdo = await contract.methods.getAcuerdo(acuerdoId).call({ from: account });
  
      // Chequeo si es fabricante o puntoVenta
      const isAuthorized =
        account.toLowerCase() === acuerdo.fabricante.toLowerCase() || account.toLowerCase() === acuerdo.puntoVenta.toLowerCase();
  
      if (isAuthorized) {
        // Si esta autorizadoo, muestro la info del acuerdo
        console.log('Acuerdo:', acuerdo);
        setAcuerdoData(acuerdo);
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Usted no posee permisos para ver ese acuerdo",
        });
        console.error('Unauthorized: Only the fabricante or puntoVenta can view the agreement details.');
      }
  
      setLoading(false);
      // Limpiar los campos después de enviar el acuerdo
      setAcuerdoId('');
    } catch (error) {
      setLoading(false);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Revise la consola para más información. Probablemente ha ingresado un ID de acuerdo inexistente",
      });
      console.error('Error calling contract function:', error);
    }
  };

  const AcuerdoDetails = ({ acuerdoData }) => {
    return (
      <div>
        <h3>Detalles del acuerdoFabVenta:</h3>
        <p>ID: {parseInt(acuerdoData.id)}</p>
        <p>Nombre del producto: {acuerdoData.nombreProducto}</p>
        <p>Tipo de producto ID: {parseInt(acuerdoData.tipoProductoId)}</p>
        <p>Fabricante: {acuerdoData.fabricante}</p>
        <p>Punto de venta: {acuerdoData.puntoVenta}</p>
        <p>Cantidad: {parseInt(acuerdoData.cantidad)}</p>
        <p>Monto (Wei): {parseInt(acuerdoData.monto)}</p>
        <p>Temperatura Minima: {parseInt(acuerdoData.temperaturaMinima)}</p>
        <p>Temperatura Maxima: {parseInt(acuerdoData.temperaturaMaxima)}</p>
        <p>Dias caducidad: {parseInt(acuerdoData.diasCaducidad)}</p>
        <p>Firmado por fabricante: {acuerdoData.firmadoFabricante.toString()}</p>
        <p>Firmado por punto de venta: {acuerdoData.firmadoPuntoVenta.toString()}</p>
      </div>
    );
  };

  const [showContent, setShowContent] = useState(false); // Variable para ir seteando la visibilidad

  const handleToggleContent = () => {
    setShowContent(!showContent);
  };

  return (
    <div>
      <h3>Conecta tu wallet e ingresa el id del acuerdo</h3>
      <button onClick={handleConnectToWeb3}>Connect to Web3</button>
      {(
        <div>
          <label>
            Id del acuerdo FabVenta:
            <input type="text" value={acuerdoId} onChange={(e) => setAcuerdoId(e.target.value)} />
          </label>
          <br />

          <button onClick={handleButtonClick} disabled={!web3 || !contract || loading}>
            Ver acuerdo
          </button>

          {/* Display acuerdo detalles */}
          {acuerdoData && (
            <div>
              {/* Cambiar boton visibilidad */}
              <button onClick={handleToggleContent}>
                {showContent ? 'Ocultar Detalles' : 'Mostrar Detalles'}
              </button>

              {/* Display detalles del acuerdo usando el componente AcuerdoDetails */}
              {showContent && <AcuerdoDetails acuerdoData={acuerdoData} />}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default GetAcuerdo;
