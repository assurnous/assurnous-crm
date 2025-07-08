import { useState } from "react";
import { Button } from "antd";

const Catalogue = () => {
  const [activeButton, setActiveButton] = useState(null);

  const buttons = [
    { label: "Assureurs", key: "assureurs" },
    { label: "Produits", key: "produits" },
    { label: "Partenaires", key: "partenaires" },
    { label: "Formation DDA", key: "formation" },
  ];

  const assureursLogos = [
    "https://via.placeholder.com/60?text=Logo+1",
    "https://via.placeholder.com/60?text=Logo+2",
    "https://via.placeholder.com/60?text=Logo+3",
    "https://via.placeholder.com/60?text=Logo+4",
    "https://via.placeholder.com/60?text=Logo+5",
  ];

  const produitsList = [
    "Santé Séniors",
    "2-Roues",
    "Empunteur",
    "Santé Actifs",
    "Santé TNS",
  ];

  const partenaires = [
    {
      logo: "https://via.placeholder.com/80?text=Partenaire+1",
      title: "Partenaire 1",
    },
    {
      logo: "https://via.placeholder.com/80?text=Partenaire+2",
      title: "Partenaire 2",
    },
    {
      logo: "https://via.placeholder.com/80?text=Partenaire+3",
      title: "Partenaire 3",
    },
  ];

  const handleButtonClick = (key) => {
    setActiveButton(key);
  };

  return (
    <section className="container mx-auto">
      <div className="mb-12 md:p-1 p-1">
        <div className="p-4 bg-white rounded-t-md shadow-sm">
          {/* Title and Top Button */}
          <div className="flex flex-col md:flex-row justify-between items-center">
            <h2 className="text-lg font-semibold text-purple-900 text-center md:text-left">
              Catalogue
            </h2>
            <Button type="primary" className="mt-4 md:mt-0">
              <span className="text-[12px] sm:text-xs whitespace-nowrap">
                DEMANDE D'OUVERTURE DE CODE
              </span>
            </Button>
          </div>

          {/* Navigation Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-6 w-full">
            {buttons.map((btn) => (
              <button
                key={btn.key}
                onClick={() => handleButtonClick(btn.key)}
                className={`w-full py-3 rounded-md border transition ${
                  activeButton === btn.key
                    ? "bg-purple-900 text-white"
                    : "bg-white text-black border-gray-300"
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>

          {/* Assureurs Section */}
          {activeButton === "assureurs" && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              {assureursLogos.map((logo, index) => (
                <div
                  key={index}
                  className="flex items-center justify-center h-40 border rounded-md shadow-sm bg-gray-50 col-span-1"
                >
                  <img
                    src={logo}
                    alt={`Assureur Logo ${index + 1}`}
                    className="object-contain h-16 w-16"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Produits Section */}
          {activeButton === "produits" && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              {produitsList.map((item, index) => (
                <button
                  key={index}
                  className="border rounded-md py-4 px-2 text-sm text-center bg-white hover:bg-purple-100 transition shadow-sm"
                >
                  {item}
                </button>
              ))}
            </div>
          )}

          {/* Partenaires Section */}
          {activeButton === "partenaires" && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8">
              {partenaires.map(({ logo, title }, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center border rounded-md p-4 shadow-sm bg-gray-50"
                >
                  <img
                    src={logo}
                    alt={title}
                    className="object-contain h-20 w-20 mb-3"
                  />
                  <h3 className="text-center font-medium text-gray-700">
                    {title}
                  </h3>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Catalogue;
