import { FC } from 'react';
import { useInView } from 'react-intersection-observer';
import PageHeader from '../PageHeader';

interface PageContainerProps {
  title: string;
  button?: React.ReactNode;
  style?: object;
}

const PageContainer: FC<PageContainerProps> = ({ children, title, style, button }) => {
  const { ref, inView } = useInView({
    threshold: 0.999,
  });
  console.log(inView);
  return (
    <div style={{ ...style }}>
      <PageHeader title={title} button={button} sticky={inView} />
      <div ref={ref}>{children}</div>
    </div>
  );
};

export default PageContainer;
