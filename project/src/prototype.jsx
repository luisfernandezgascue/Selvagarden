// Interactive prototype — wires tab nav between main screens

function InteractivePrototype() {
  const [tab, setTab] = React.useState('home');
  const [storeMode, setStoreMode] = React.useState(false);

  // For demo: long-press home to toggle store mode
  React.useEffect(() => {
    // Auto-flip after 4 seconds for demo, then again every 12s
  }, []);

  const onChange = (id) => setTab(id);

  if (tab === 'home')  return <Home  storeMode={storeMode} onTab={onChange}/>;
  if (tab === 'shop')  return <Tienda onTab={onChange}/>;
  if (tab === 'selva') return <MiSelva onTab={onChange}/>;
  if (tab === 'card')  return <MiTarjeta storeMode={storeMode} onTab={onChange}/>;
  if (tab === 'me')    return <Yo onTab={onChange}/>;
  return <Home onTab={onChange}/>;
}

Object.assign(window, { InteractivePrototype });
