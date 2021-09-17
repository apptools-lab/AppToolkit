const BrowserNotInstalled = ({ browser }) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', flexDirection: 'column', paddingBottom: 20 }}>
      <img src="https://img.alicdn.com/tfs/TB11TaSopY7gK0jSZKzXXaikpXa-200-200.png" width={200} height={200} />
      <h3 style={{ marginTop: 20 }}>未在本地找到 {browser}，请先安装</h3>
    </div>
  );
};

export default BrowserNotInstalled;
