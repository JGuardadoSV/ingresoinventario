import React, { useState, useEffect } from 'react';
import { BrowserMultiFormatReader } from '@zxing/library';

function App() {
  const [productos, setProductos] = useState([]);
  const [producto, setProducto] = useState({ codigo: '', nombre: '', precio: '' });
  const [escaneando, setEscaneando] = useState(false);

  useEffect(() => {
    cargarProductos();
  }, []);

  const cargarProductos = () => {
    // Aquí cargaríamos los productos desde el almacenamiento local o una API
    const productosGuardados = JSON.parse(localStorage.getItem('productos') || '[]');
    setProductos(productosGuardados);
  };

  const guardarProducto = () => {
    const nuevosProductos = [...productos, { ...producto, id: Date.now() }];
    setProductos(nuevosProductos);
    localStorage.setItem('productos', JSON.stringify(nuevosProductos));
    setProducto({ codigo: '', nombre: '', precio: '' });
  };

  const iniciarEscaneo = async () => {
    setEscaneando(true);
    const codeReader = new BrowserMultiFormatReader();
    try {
      const result = await codeReader.decodeOnceFromVideoDevice(undefined, 'video');
      setProducto({ ...producto, codigo: result.text });
    } catch (error) {
      console.error(error);
    } finally {
      codeReader.reset();
      setEscaneando(false);
    }
  };

  return (
    <div>
      <h1>Gestor de Productos</h1>
      
      {escaneando ? (
        <div>
          <video id="video" width="300" height="200"></video>
          <button onClick={() => setEscaneando(false)}>Detener escaneo</button>
        </div>
      ) : (
        <button onClick={iniciarEscaneo}>Escanear código de barras</button>
      )}

      <form onSubmit={(e) => { e.preventDefault(); guardarProducto(); }}>
        <input 
          type="text" 
          value={producto.codigo} 
          onChange={(e) => setProducto({ ...producto, codigo: e.target.value })} 
          placeholder="Código"
        />
        <input 
          type="text" 
          value={producto.nombre} 
          onChange={(e) => setProducto({ ...producto, nombre: e.target.value })} 
          placeholder="Nombre"
        />
        <input 
          type="number" 
          value={producto.precio} 
          onChange={(e) => setProducto({ ...producto, precio: e.target.value })} 
          placeholder="Precio"
        />
        <button type="submit">Guardar Producto</button>
      </form>

      <h2>Lista de Productos</h2>
      <ul>
        {productos.map((p) => (
          <li key={p.id}>{p.codigo} - {p.nombre} - ${p.precio}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;