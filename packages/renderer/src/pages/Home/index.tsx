import Swiper from './components/Swiper';
import Recommendation from './components/Recommendation';
import styles from './index.module.scss';

function App() {
  return (
    <div className={styles.container}>
      <Swiper />
      <Recommendation />
    </div>
  );
}


export default App;
