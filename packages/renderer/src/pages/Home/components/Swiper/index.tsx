import { memo } from 'react';
import Slider from 'react-slick';
import aImg from '@/assets/swipers/a.png';
import bImg from '@/assets/swipers/b.png';
import cImg from '@/assets/swipers/c.png';
import styles from './index.module.scss';

function Swiper() {
  const swiperImgs = [
    aImg,
    bImg,
    cImg,
  ];
  return (
    <Slider
      arrows={false}
      centerMode
      slidesToShow={1}
      className={styles.swiper}
      infinite
      adaptiveHeight
    >
      {
        swiperImgs.map((img, index) => {
          return (
            <img
              src={img}
              className={styles.img}
              alt="swiperImg"
              key={`swiper_${index}`}
            />
          );
        })
      }
    </Slider>
  );
}

export default memo(Swiper);