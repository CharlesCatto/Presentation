import { Link } from "react-router-dom";
import LogoVroom from "../../assets/Logos/LogoVroom.png";
import styles from "./Header.module.css";

interface HeaderProps {
  title: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
  return (
    <header className={styles.header}>
      <Link to="/">
        <img className={styles.logo} src={LogoVroom} alt="Logo" />
      </Link>
      <h1 className={styles.title}>{title}</h1>
      <div className={styles.balance}> </div>
    </header>
  );
};

export default Header;
