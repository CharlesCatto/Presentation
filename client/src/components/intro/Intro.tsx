import "./Intro.css";
import home1 from "../../assets/matiere/intro.jpg";

function Intro() {
  return (
    <div className="intro-container">
      <div className="prezContainer">
        <p>
          <strong>RoadAddict</strong> est un service de mise en relation entre
          propriétaires et fans de véhicules. L’objectif est simple : permettre
          à chacun de découvrir et vivre sa passion.
        </p>

        <p>
          Nous sommes, nous aussi, des passionnés de mécanique. Nous souhaitions
          essayer de nouvelles voitures sans avoir à les acheter. Cependant,
          contacter des vendeurs sur internet pour demander des essais s'est
          révélé être une perte de temps, aussi bien pour nous que pour eux,
          surtout lorsque nous n’étions pas acheteurs.
        </p>

        <p>
          En effet, il n’y avait ni rétribution prévue, ni engagement, et
          l’espoir d’une vente s’évaporait rapidement. C’est pourquoi nous avons
          voulu offrir une solution qui permet à tous de :
        </p>

        <ul>
          <li>Gagner du temps</li>
          <li>Favoriser des échanges transparents</li>
          <li>Optimiser les dépenses</li>
        </ul>

        <p>
          En plus, vous pouvez accumuler des{" "}
          <strong>crédits échangeables</strong>... Qui sait ? Peut-être vous
          réservent-ils des surprises à l’avenir ! 😉
        </p>

        <img className="imgIntro" src={home1} alt="Présentation RoadAddict" />
      </div>
    </div>
  );
}

export default Intro;
