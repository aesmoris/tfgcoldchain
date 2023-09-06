import React, { useState } from 'react';
import { connectToWeb3 } from '../../Hooks/utils.js';
import Swal from 'sweetalert2';

function CrearAcuerdoFabVenta({ role }) {
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState('');
  const [loading, setLoading] = useState(false);

  const isFabricante = role === 'fabricante';

  const [nombreProducto, setNombreProducto] = useState('');
  const [productoId, setProductoId] = useState('');
  const [puntoVenta, setPuntoVenta] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [monto, setMonto] = useState('');
  const [temperaturaMinima, setTemperaturaMinima] = useState('');
  const [temperaturaMaxima, setTemperaturaMaxima] = useState('');
  const [diasCaducidad, setDiasCaducidad] = useState('');

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

        contract.events.AcuerdoCreado()
        .on('data', (event) => {
          const idAcuerdoCreado = event.returnValues.id;

          Swal.fire({
            icon: 'success',
            title: 'Éxito',
            text: `AcuerdoFabVenta creado correctamente con ID: ${idAcuerdoCreado}`,
          });
        });

        await contract.methods
          .crearAcuerdoPuntoVenta(
            nombreProducto,
            parseInt(productoId),
            puntoVenta,
            parseInt(cantidad),
            monto,
            parseInt(temperaturaMinima),
            parseInt(temperaturaMaxima),
            parseInt(diasCaducidad)
          )
          .send({ from: account });
          
        setLoading(false);

      // Limpiar los campos después de enviar el acuerdo
      setNombreProducto('');
      setProductoId('');
      setPuntoVenta('');
      setCantidad('');
      setMonto('');
      setTemperaturaMinima('');
      setTemperaturaMaxima('');
      setDiasCaducidad('');
    } catch (error) {
      setLoading(false);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Revise la consola para mas información",
      });
      console.error('Error calling contract function:', error);
    }
  };

  return (
    <div>
      <h3>Conecta tu wallet e ingresa los datos</h3>
      <button onClick={handleConnectToWeb3}>Connect to Web3</button>
      {isFabricante && (
        <div>
          <label>
            Nombre del producto:
            <input type="text" value={nombreProducto} onChange={(e) => setNombreProducto(e.target.value)} style={{ width: '90%' }}/>
          </label>
          <br />
          <label>
            ID del tipo de producto:
            <input type="text" value={productoId} onChange={(e) => setProductoId(e.target.value)} style={{ width: '90%' }}/>
          </label>
          <br />
          <br />
          <label>
            Direccion Eth Punto de Venta:
            <input type="text" value={puntoVenta} onChange={(e) => setPuntoVenta(e.target.value)} style={{ width: '90%' }}/>
          </label>
          <br />
          <br />
          <label>
            Cantidad:
            <input type="text" value={cantidad} onChange={(e) => setCantidad(e.target.value)} style={{ width: '90%' }}/>
          </label>
          <br />
          <br />
          <label>
            Monto (Wei):
            <input type="number" value={monto} onChange={(e) => setMonto(e.target.value)} style={{ width: '90%' }}/>
          </label>
          <br />
          <br />
          <label>
            Temperatura Minima:
            <input type="text" value={temperaturaMinima} onChange={(e) => setTemperaturaMinima(e.target.value)} style={{ width: '90%' }}/>
          </label>
          <br />
          <br />
          <label>
            Temperatura Maxima:
            <input type="text" value={temperaturaMaxima} onChange={(e) => setTemperaturaMaxima(e.target.value)} style={{ width: '90%' }}/>
          </label>
          <br />
          <br />
          <label>
            Dias caducidad:
            <input type="text" value={diasCaducidad} onChange={(e) => setDiasCaducidad(e.target.value)} style={{ width: '90%' }} />
          </label>
          <br />
          <button onClick={handleButtonClick} disabled={!web3 || !contract || loading}>
            Crear acuerdo con punto de venta
          </button>
        </div>
      )}
    </div>
  );
}

export default CrearAcuerdoFabVenta;
