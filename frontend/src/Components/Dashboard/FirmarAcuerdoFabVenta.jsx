import React, { useState } from 'react';
import { connectToWeb3 } from '../../Hooks/utils.js';
import Swal from 'sweetalert2';

function FirmarAcuerdoFabVenta({ role }) {
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState('');
  const [loading, setLoading] = useState(false);

  const isFabricante = role === 'fabricante';
  const isPuntoVenta = role === 'puntoventa';

  const [acuerdoId, setAcuerdoId] = useState('');

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

      if (isFabricante){
        const acuerdo = await contract.methods.acuerdos(acuerdoId).call();

        if (acuerdo.fabricante !== account) {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Usted no es el fabricante de este acuerdo o ha introducido un ID de acuerdo inválido",
          });
          setLoading(false);
          return;
        }

        await contract.methods.firmarAcuerdoFabVenta(parseInt(acuerdoId)).send({ from: account });

        Swal.fire({
          icon: "success",
          title: "Éxito",
          text: "AcuerdoFabVenta firmado correctamente",
        });

      } else if (isPuntoVenta) {
        const acuerdo = await contract.methods.acuerdos(acuerdoId).call();
        const montoAcuerdo = acuerdo.monto;

        if (acuerdo.puntoVenta !== account) {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Usted no es el puntoVenta de este acuerdo o ha introducido un ID inválido",
          });
          setLoading(false);
          return;
        }

        if (!acuerdo.firmadoFabricante) {
          console.error('El acuerdo no ha sido firmado por el fabricante');
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Acuerdo no firmado por el fabricante",
          });
          setLoading(false);
          return;
        }

        await contract.methods
        .firmarAcuerdoFabVenta(parseInt(acuerdoId))
        .send({ from: account, value: montoAcuerdo });

        Swal.fire({
          icon: "success",
          title: "Éxito",
          text: "AcuerdoFabVenta firmado correctamente",
        });
      }

      setLoading(false);

      // Limpiar el campo después de enviar la transacción
      setAcuerdoId('');
    } catch (error) {
      setLoading(false);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Consulte la consola para más información",
      });
      console.error('Error calling contract function:', error);
    }
  };

  return (
    <div>
      <h3>Conecta tu wallet e ingresa el ID del acuerdo a firmar</h3>
      <button onClick={handleConnectToWeb3}>Connect to Web3</button>
      {(isFabricante || isPuntoVenta) && (
        <div>
          <label>
            ID del acuerdo a firmar:
            <input type="text" value={acuerdoId} onChange={(e) => setAcuerdoId(e.target.value)} />
          </label>
          <br />
          <button onClick={handleButtonClick} disabled={!web3 || !contract || loading}>
            Firmar Acuerdo
          </button>
        </div>
      )}
    </div>
  );
}

export default FirmarAcuerdoFabVenta;
