import { useState } from "react";
import "./Caroussel.css";

// Importez vos images
import car1 from "../../assets/matiere/car1.jpg";
import car2 from "../../assets/matiere/car2.jpg";
import car3 from "../../assets/matiere/car3.jpg";
import car4 from "../../assets/matiere/car4.jpg";
import car5 from "../../assets/matiere/car5.jpg";
import car6 from "../../assets/matiere/car6.jpg";

const images = [
  { id: 1, src: car1 },
  { id: 2, src: car2 },
  { id: 3, src: car3 },
  { id: 4, src: car4 },
  { id: 5, src: car5 },
  { id: 6, src: car6 },
];

type SlidePosition = "prev" | "active" | "next";

function Caroussel() {
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  const nextSlide = (): void => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const prevSlide = (): void => {
    setCurrentIndex(
      (prevIndex) => (prevIndex - 1 + images.length) % images.length,
    );
  };

  const getSlidePosition = (index: number): SlidePosition | null => {
    if (index === currentIndex) return "active";
    if (index === (currentIndex + 1) % images.length) return "next";
    if (index === (currentIndex - 1 + images.length) % images.length)
      return "prev";
    return null;
  };

  return (
    <div className="carousel-container">
      {images.map((image, index) => {
        const position = getSlidePosition(index);
        return position ? (
          <div key={image.id} className={`slide ${position}`}>
            <img src={image.src} alt={`Slide ${index + 1}`} />
          </div>
        ) : null;
      })}

      <div className="carousel-controls">
        <button onClick={prevSlide} className="carousel-button" type="button">
          ❮
        </button>
        <button onClick={nextSlide} className="carousel-button" type="button">
          ❯
        </button>
      </div>
    </div>
  );
}

export default Caroussel;
