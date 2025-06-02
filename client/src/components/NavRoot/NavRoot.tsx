import NavMobile from "./NavMobile/NavMobile";
import NavPC from "./NavPC/NavPC";
import "./NavRoot.css";
import RoadAddictLogo from "../../assets/Logos/road-addict-NavBar.svg"; // Importez le SVG

interface NavRootProps {
  namePage: string;
}

function NavRoot(Props: NavRootProps) {
  const { namePage } = Props;
  return (
    <header className="headerRoot">
      <NavMobile namePage={namePage} />
      <NavPC namePage={namePage} />
      {/* Ajoutez le logo SVG ici */}
      <img src={RoadAddictLogo} alt="RoadAddict Logo" className="navLogo" />
    </header>
  );
}

export default NavRoot;
