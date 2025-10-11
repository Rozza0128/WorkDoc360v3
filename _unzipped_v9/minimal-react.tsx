function MinimalReact() {
  return (
    <div style={{
      padding: '20px',
      backgroundColor: '#ff0000',
      color: 'white',
      fontSize: '24px',
      fontWeight: 'bold'
    }}>
      <h1>MINIMAL REACT COMPONENT TEST</h1>
      <p>If you can see this red page, React is working.</p>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(8, 1fr)',
        gap: '4px',
        marginTop: '20px',
        padding: '10px',
        backgroundColor: 'white',
        color: 'black'
      }}>
        <div style={{padding: '10px', backgroundColor: '#e0e0e0'}}>Dashboard</div>
        <div style={{padding: '10px', backgroundColor: '#e0e0e0'}}>Generate</div>
        <div style={{padding: '10px', backgroundColor: '#e0e0e0'}}>Recommended</div>
        <div style={{padding: '10px', backgroundColor: '#e0e0e0'}}>Upload</div>
        <div style={{padding: '10px', backgroundColor: '#e0e0e0'}}>Library</div>
        <div style={{padding: '10px', backgroundColor: '#e0e0e0'}}>Users</div>
        <div style={{padding: '10px', backgroundColor: '#e0e0e0'}}>Billing</div>
        <div style={{padding: '10px', backgroundColor: '#e0e0e0'}}>Settings</div>
      </div>
      
      <p style={{marginTop: '20px'}}>
        Above should show 8 gray boxes in a row with the tab names.
      </p>
    </div>
  );
}

export default MinimalReact;