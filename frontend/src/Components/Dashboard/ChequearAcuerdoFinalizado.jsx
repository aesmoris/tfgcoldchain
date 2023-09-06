import React, { useState } from 'react';
import { connectToFinCadena } from '../../Hooks/utils.js'; // Importa la función connectToGestionCadena desde el archivo utils.js
import Swal from 'sweetalert2';

function ChequearAcuerdoFinalizado({ role }) {
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState('');
  const [loading, setLoading] = useState(false);
  const [acuerdoId, setAcuerdoId] = useState('');

  const handleConnectToWeb3 = async () => {
    const web3Data = await connectToFinCadena(); // Utiliza la función connectToFinCadena para conectar con FinCadena y obtener web3 y contract
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
      
      const acuerdoFinalizado = await contract.methods.acuerdoFinalizado(parseInt(acuerdoId)).call({ from: account });
      const finPerfecto = await contract.methods.acuerdoFinPerfecto(parseInt(acuerdoId)).call({ from: account });

      console.log(acuerdoFinalizado);
      console.log(finPerfecto);

      if (acuerdoFinalizado) {
        if (finPerfecto) {
            Swal.fire({
                icon: "success",
                title: "Exito",
                text: "El acuerdo finalizó sin incidencias",
              });
        } else {
            Swal.fire({
                icon: "warning",
                title: "Atención",
                text: "El acuerdo finalizó con alguna incidencia",
              });
        }
      } else {
        Swal.fire({
            icon: "warning",
            title: "Atención",
            text: "El acuerdo no ha finalizado",
          });
      }


      setLoading(false);
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
          <h3>Conecta tu wallet e ingresa el ID del acuerdo que quieres revisar</h3>
          <button onClick={handleConnectToWeb3}>Connect to Web3</button>
            <div>
              <br></br>
              <label>
                ID del acuerdo:
                <input type="text" value={acuerdoId} onChange={(e) => setAcuerdoId(e.target.value)} />
              </label>
              <br />
              <button onClick={handleButtonClick} disabled={!web3 || !contract || loading}>
                Comprobar finalización
              </button>
            </div>
        </div>
      );

}

export default ChequearAcuerdoFinalizado;