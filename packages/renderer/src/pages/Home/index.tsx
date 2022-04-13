function App() {
  return (
    <div className="App">
      <div onClick={async () => await openFile()}>Open File</div>
    </div>
  );
}

async function openFile() {
  const filePath = await window.electronAPI.openFile();
  console.log('filePath: ', filePath);
}

export default App;
