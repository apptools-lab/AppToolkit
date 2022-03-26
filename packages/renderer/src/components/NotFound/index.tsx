import { Link } from 'ice';

export interface Props {
  name: string;
}

const Greeting = ({ name }: Props) => {
  return (
    <div>
      <h2>404</h2>
      <div><Link to="/">Home {name}</Link></div>
      <div><Link to="/dashboard">Dashboard</Link></div>
    </div>
  );
};

export default Greeting;
