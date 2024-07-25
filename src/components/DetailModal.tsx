import { useRef, useEffect } from "react";
import { Country } from "../types";
import "./DetailModal.scss";

type DetailModalProps = Country & {
  onClose: () => void;
};

export const DetailModal = (props: DetailModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        props.onClose();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        props.onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);


    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="Modal">
      <div className="Modal__overlay">
        <div className="Modal__detail" ref={modalRef}>
          <button className="Modal__detail__close" onClick={props.onClose}>
            ❌
          </button>
          <span className="Modal__detail__field">
            <strong>Country Name:</strong> {props.name}, {props.details.cioc}
          </span>
          <span className="Modal__detail__field">
            <strong>Capital:</strong> {props.details.capital}
          </span>
          <div className="Modal__detail__field Modal__detail__field-img">
            <strong>Flag:</strong>
            <div
              className="Modal__detail__field__picture"
              style={{ backgroundImage: `url("${props.details.flags.png}")` }}
            ></div>
          </div>
          {props.details.coatOfArms?.png && (
            <div className="Modal__detail__field Modal__detail__field-img">
              <strong>Coat Of Arms:</strong>
              <div
                className="Modal__detail__field__picture"
                style={{
                  backgroundImage: `url("${props.details.coatOfArms.png}")`,
                }}
              ></div>
            </div>
          )}
          <span className="Modal__detail__field">
            <strong>Currency:</strong> {props.currencies}
          </span>
          <span className="Modal__detail__field">
            <strong>Language(s):</strong> {props.languages}
          </span>
          <span className="Modal__detail__field">
            <strong>Population:</strong> {props.population.toLocaleString()}
          </span>
          <span className="Modal__detail__field">
            <strong>Region:</strong> {props.details.region}
          </span>
          <span className="Modal__detail__field">
            <strong>Google Maps:</strong>
            <a
              href={props.details.maps.googleMaps}
              target="_blank"
              rel="noopener noreferrer"
            >
              {" "}
              View on Map
            </a>
          </span>
        </div>
      </div>
    </div>
  );
};
