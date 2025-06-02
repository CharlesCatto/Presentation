import { Link } from "react-router-dom";
import styles from "./Button.module.css";
function Button() {
  return (
    <div className={styles.ContainerButton}>
      <Link to="/maps" className={styles.Button}>
        Trouve ton véhicule
      </Link>
    </div>
  );
}

export default Button;
