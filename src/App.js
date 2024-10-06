import React, { useState, useEffect } from 'react';
import { BrowserMultiFormatReader } from '@zxing/library';

function App() {
  const [productos, setProductos] = useState([]);
  const [producto, setProducto] = useState({ codigo: '', nombre: '', costo: 0.00, precio: 0.00, precio2: 0.00, marca: '', existencias: 0 });
  const [escaneando, setEscaneando] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    cargarProductos();
  }, []);

  const cargarProductos = async () => {
    try {
      const response = await fetch('https://appmatriz.suministrosmaldonado.com/api/Productos/ultimos30', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        throw new Error('Error al cargar los productos');
      }
      const productos = await response.json();
      setProductos(productos);
    } catch (error) {
      console.error('Error:', error);
      setError('Error al cargar los productos');
    }
  };

  const guardarProducto = async () => {
    try {
      const response = await fetch('https://appmatriz.suministrosmaldonado.com/api/Productos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ...producto })
      });

      if (!response.ok) {
        throw new Error('Error al enviar el producto');
      }

      console.log('Producto enviado exitosamente');
      await cargarProductos(); // Recargar los productos en lugar de recargar la página
      setProducto({ codigo: '', nombre: '', costo: 0.00, precio: 0.00, precio2: 0.00, marca: '', existencias: 0 }); // Limpiar el formulario
    } catch (error) {
      console.error('Error:', error);
      setError('Error al guardar el producto');
    }
  };

  const iniciarEscaneo = async () => {
    setEscaneando(true);
    setError('');
    const codeReader = new BrowserMultiFormatReader();
    try {
        const videoInputDevices = await codeReader.listVideoInputDevices();
        // Filtrar para encontrar la cámara trasera
        const rearCamera = videoInputDevices.find(device => device.label.toLowerCase().includes('back') || device.label.toLowerCase().includes('trasera'));
        const selectedDeviceId = rearCamera ? rearCamera.deviceId : videoInputDevices[0].deviceId;
        
        const result = await codeReader.decodeOnceFromVideoDevice(selectedDeviceId, 'video');
        setProducto({ ...producto, codigo: result.text });
    } catch (error) {
        console.error(error);
        setError('Error al escanear. Asegúrate de que la cámara esté habilitada.');
    } finally {
        codeReader.reset();
        setEscaneando(false);
    }
};


  return (
    <div>
      <h1>Gestor de Productos (SUC. Matriz)</h1>
      
      {error && <p style={{color: 'red'}}>{error}</p>}

      {escaneando ? (
        <div>
          <video id="video" width="300" height="200"></video>
          <button onClick={() => setEscaneando(false)}>Detener escaneo</button>
        </div>
      ) : (
        <button onClick={iniciarEscaneo}>Escanear código de barras</button>
      )}

      <form onSubmit={(e) => { e.preventDefault(); guardarProducto(); }}>
        <label htmlFor="codigo">Código:
          <input 
            type="text" 
            id="codigo"
            value={producto.codigo} 
            onChange={(e) => setProducto({ ...producto, codigo: e.target.value })} 
            placeholder="Código"
          />
        </label>

        <label htmlFor="nombre">Nombre:
          <input 
            type="text" 
            id="nombre"
            value={producto.nombre} 
            onChange={(e) => setProducto({ ...producto, nombre: e.target.value })} 
            placeholder="Nombre"
          />
        </label>

        <label htmlFor="costo">Costo:
          <input 
            type="number" 
            id="costo"
            value={producto.costo} 
            onChange={(e) => setProducto({ ...producto, costo: parseFloat(e.target.value) })} 
            placeholder="Costo"
          />
        </label>

        <label htmlFor="precio">Precio:
          <input 
            type="number" 
            id="precio"
            value={producto.precio} 
            onChange={(e) => setProducto({ ...producto, precio: parseFloat(e.target.value) })} 
            placeholder="Precio"
          />
        </label>

        <label htmlFor="precio2">Precio 2:
          <input 
            type="number" 
            id="precio2"
            value={producto.precio2} 
            onChange={(e) => setProducto({ ...producto, precio2: parseFloat(e.target.value) })} 
            placeholder="Precio 2"
          />
        </label>

        <label htmlFor="existencias">Existencias:
          <input 
            type="number" 
            id="existencias"
            value={producto.existencias} 
            onChange={(e) => setProducto({ ...producto, existencias: parseInt(e.target.value) })} 
            placeholder="Existencias"
          />
        </label>

        <label htmlFor="marca">Marca:
          <input 
            type="text" 
            id="marca"
            value={producto.marca} 
            onChange={(e) => setProducto({ ...producto, marca: e.target.value })} 
            placeholder="Marca"
          />
        </label>

        <button type="submit">Guardar Producto</button>
      </form>

      <h2>Lista de Productos (Últimos 30)</h2>


      {productos.map((p) => (
      <details>
  <summary> {p.nombre}</summary>
  <p><strong>Código:</strong> {p.codigo}</p>
  <p><strong>Nombre:</strong> {p.nombre}</p>
  <p><strong>Precio:</strong> ${p.precio}</p>
</details>
 ))}

    </div>
  );
}

export default App;