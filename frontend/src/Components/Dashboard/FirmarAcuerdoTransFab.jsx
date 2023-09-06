import React, { useState } from 'react';
import { connectToWeb3 } from '../../Hooks/utils.js';
import Swal from 'sweetalert2';

function FirmarAcuerdoTransFab({ role }) {
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState('');
  const [loading, setLoading] = useState(false);

  const isFabricante = role === 'fabricante';
  const isTransportista = role === 'transportista';

  const [acuerdoTransFabId, setAcuerdoTransFabId] = useState('');

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

      if (isTransportista) {
        const acuerdoTransFab = await contract.methods.getAcuerdoTransFab(acuerdoTransFabId).call({ from: account });

        console.log(acuerdoTransFab)

        // Chequeo que el acuerdoFabVenta no haya sido ya asignado
        for (let i = 0; i < acuerdoTransFab.acuerdoFabVentaId.length; i++) {
          const acuerdoFabVentaId = acuerdoTransFab.acuerdoFabVentaId[i];
          const asignado = await contract.methods.acuerdoFabVentaAsignado(acuerdoFabVentaId).call({ from: account });
          
          if (asignado) {
            console.log(`El acuerdoFabVenta con id ${acuerdoFabVentaId} ya fue asignado, contacte con el fabricante.`);
            Swal.fire({
              icon: "error",
              title: "Error",
              text: `El acuerdoFabVenta con id ${acuerdoFabVentaId} ya fue asignado, contacte con el fabricante.`,
            });
            setLoading(false);
            return;
          } else {
            console.log(`El acuerdoFabVenta con id ${acuerdoFabVentaId} si se puede asignar`);
          }
        }

        if (acuerdoTransFab.transportista !== account) {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Usted no es el transportista de este acuerdo o ha introducido un acuerdoTransFab inválido",
          });
          setLoading(false);
          return;
        }

        await contract.methods.firmarAcuerdoTransFab(parseInt(acuerdoTransFabId)).send({ from: account });

        Swal.fire({
          icon: "success",
          title: "Éxito",
          text: "AcuerdoTransFab firmado correctamente",
        });
      } else if (isFabricante) {
        const acuerdoTransFab = await contract.methods.acuerdos2(acuerdoTransFabId).call();
        const montoAcuerdoTransFab = acuerdoTransFab.monto;

        if (acuerdoTransFab.fabricante !== account) {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Usted no es el fabricante de este acuerdo o ha introducido un acuerdoTransFab inválido",
          });
          setLoading(false);
          return;
        }

        if (!acuerdoTransFab.firmadoTransportista) {
            console.error('El acuerdo no ha sido firmado por el transportista');
            Swal.fire({
              icon: "error",
              title: "Error",
              text: "Acuerdo no firmado por el transportista",
            });
            setLoading(false);
            return;
          }

        await contract.methods
          .firmarAcuerdoTransFab(parseInt(acuerdoTransFabId))
          .send({ from: account, value: montoAcuerdoTransFab });

          Swal.fire({
            icon: "success",
            title: "Éxito",
            text: "AcuerdoTransFab firmado correctamente",
          });
      }

      setLoading(false);

      // Limpiar el campo después de enviar la transacción
      setAcuerdoTransFabId('');
    } catch (error) {
      setLoading(false);
      // Cualquier otro aviso
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
      <h3>Conecta tu wallet e ingresa el ID del acuerdo TransFab a firmar</h3>
      <button onClick={handleConnectToWeb3}>Connect to Web3</button>
      {(isFabricante || isTransportista) && (
        <div>
          <label>
            ID del acuerdo TransFab a firmar:
            <input
              type="text"
              value={acuerdoTransFabId}
              onChange={(e) => setAcuerdoTransFabId(e.target.value)}
            />
          </label>
          <br />
          <button onClick={handleButtonClick} disabled={!web3 || !contract || loading}>
            {isTransportista ? 'Firmar Acuerdo como Transportista' : 'Firmar Acuerdo con Transportista'}
          </button>
        </div>
      )}
    </div>
  );
}

export default FirmarAcuerdoTransFab;
