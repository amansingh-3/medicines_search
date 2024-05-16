import React, { useState, useEffect } from "react";
import "./Card.css";

const Card = ({ searchQuery }) => {
  const [medicines, setMedicines] = useState([]);
  const [error, setError] = useState(null);
  const [selectedForm, setSelectedForm] = useState({});
  const [selectedStrength, setSelectedStrength] = useState({}); // New state for selected strength
  const [selectedPackaging, setSelectedPackaging] = useState({});
  const [lowestSellingPrice, setLowestSellingPrice] = useState({});
  const [showAllForms, setShowAllForms] = useState(false);
  const [showAllStrengths, setShowAllStrengths] = useState(false);
  const [ShowAllPackaging, setShowAllPShowAllPackaging] = useState(false);
  useEffect(() => {
    if (!searchQuery) return; // No need to fetch if there's no search query

    fetch(
      `https://backend.cappsule.co.in/api/v1/new_search?q=${encodeURIComponent(
        searchQuery
      )}&pharmacyIds=1,2,3`
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        return response.json();
      })
      .then((data) => {
        setMedicines(data.data.saltSuggestions);

        const defaultSelectedForm = {};
        const defaultSelectedStrength = {};
        const defaultSelectedPackaging = {};
        data.data.saltSuggestions.forEach((medicine, index) => {
          defaultSelectedForm[index] = medicine.most_common.Form;
          defaultSelectedStrength[index] = medicine.most_common.Strength;
          defaultSelectedPackaging[index] = medicine.most_common.Packing;
        });
        setSelectedForm(defaultSelectedForm);
        setSelectedStrength(defaultSelectedStrength);
        setSelectedPackaging(defaultSelectedPackaging);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setError(error.message);
      });
  }, [searchQuery]); // Fetch data whenever searchQuery changes

  const handleFormChange = (index, form) => {
    setSelectedForm({ ...selectedForm, [index]: form });
  };

  const handleStrengthChange = (index, strength) => {
    setSelectedStrength({ ...selectedStrength, [index]: strength });
  };

  const toggleShowAllForms = () => {
    setShowAllForms(!showAllForms);
  };

  const toggleShowAllStrengths = () => {
    setShowAllStrengths(!showAllStrengths);
  };
  const toggleShowAllPackaging = () => {
    setShowAllPShowAllPackaging(!ShowAllPackaging);
  };

  const handlePackagingChange = (medicine, index, packaging) => {
    setSelectedPackaging({ ...selectedPackaging, [index]: packaging });

    const strengthData =
      medicine.salt_forms_json[selectedForm[index]][selectedStrength[index]];

    const pricesData = strengthData[packaging];

    // Check if pricesData is not null or undefined
    if (pricesData) {
      const productIds = Object.keys(pricesData);

      let allPrices = [];

      productIds.forEach((productId) => {
        // Check if productId is not null and its value is not null
        if (productId && pricesData[productId]) {
          const prices = pricesData[productId];

          allPrices = [
            ...allPrices,
            ...prices.map((item) => item.selling_price),
          ];
        }
      });

      if (allPrices.length > 0) {
        // Calculate the lowest selling price
        const lowestSellingPrice = Math.min(...allPrices);

        // Update the lowest selling price state for the selected medicine
        setLowestSellingPrice({
          ...lowestSellingPrice,
          [index]: lowestSellingPrice,
        });
      } else {
        // If no prices are available
        setLowestSellingPrice({
          ...lowestSellingPrice,
          [index]: "Not available",
        });
      }
    } else {
      // If pricesData is null or undefined, set lowest selling price to null or any default value
      setLowestSellingPrice({
        ...lowestSellingPrice,
        [index]: "Not available",
      });
    }
  };

  // useEffect(() => {
  //   // Check if there's a default selected packaging
  //   // const defaultSelectedPackaging = selectedPackaging[0];

  //   // If there's a default selected packaging, calculate lowest selling price
  //   if (selectedPackaging) {
  //     // Get the default selected medicine
  //     // const defaultMedicine = medicines[0];

  //     // Calculate and set the lowest selling price for the default selected packaging
  //     handlePackagingChange(0, 0, selectedPackaging);
  //   }
  // }, []); // Empty dependency array to run the effect only once on mount

  console.log(medicines, "Medicines");
  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <>
      <div className="card-wrapper">
        <div className="container">
          {medicines.map((medicine, index) => (
            <div className="card-outer" key={medicine.id}>
              <div className="card-inner">
                <div className="med-details">
                  {/* FORMS of MEDICINE */}
                  <div className="selection">
                    <div className="heads">
                      <p>Form:</p>
                    </div>
                    <div className="details">
                      {(showAllForms
                        ? medicine.available_forms
                        : medicine.available_forms.slice(0, 4)
                      ).map((option, optionIndex) => {
                        const details = medicine.salt_forms_json[option];

                        const available =
                          details &&
                          Object.values(details).some((innerObj) =>
                            Object.values(innerObj).some((nestedObj) =>
                              Object.values(nestedObj).some(Array.isArray)
                            )
                          );
                        const isSelected = selectedForm[index] === option;
                        const isSelectedNotAvailable = isSelected && !available;

                        return (
                          <label
                            key={option}
                            className={`radio-label ${
                              isSelected ? "selected" : "not-selected"
                            } ${available ? "available" : "not-available"} ${
                              isSelectedNotAvailable
                                ? "selected-not-available"
                                : ""
                            }`}>
                            <input
                              type="radio"
                              name={`form_${index}`}
                              value={option}
                              checked={selectedForm[index] === option}
                              onChange={() => handleFormChange(index, option)}
                            />
                            {option}
                          </label>
                        );
                      })}
                      {medicine.available_forms.length > 4 && (
                        <button onClick={toggleShowAllForms}>
                          {showAllForms ? "hide" : "more..."}
                        </button>
                      )}
                    </div>
                  </div>
                  {/* Strength of the MEDICINES */}
                  {selectedForm[index] && ( // Render only if a form is selected
                    <div className="selection">
                      <div className="heads">
                        <p>Strength:</p>
                      </div>
                      <div className="details">
                        {(showAllStrengths
                          ? Object.keys(
                              medicine.salt_forms_json[selectedForm[index]]
                            )
                          : Object.keys(
                              medicine.salt_forms_json[selectedForm[index]]
                            ).slice(0, 4)
                        ).map((strength, idx) => {
                          const details =
                            medicine.salt_forms_json[selectedForm[index]][
                              strength
                            ];

                          const available =
                            details &&
                            Object.values(details).some((item) =>
                              Object.values(item).some(Array.isArray)
                            );

                          const isSelected =
                            selectedStrength[index] === strength;
                          const isSelectedNotAvailable =
                            isSelected && !available;

                          return (
                            <label
                              key={idx}
                              className={`radio-label ${
                                isSelected ? "selected" : "not-selected"
                              } ${available ? "available" : "not-available"} ${
                                isSelectedNotAvailable
                                  ? "selected-not-available"
                                  : ""
                              }`}>
                              <input
                                type="radio"
                                name={`strength_${index}`}
                                value={strength}
                                checked={selectedStrength[index] === strength}
                                onChange={() =>
                                  handleStrengthChange(index, strength)
                                }
                              />
                              {strength}
                              {
                                medicine.salt_forms_json[selectedForm[index]][
                                  strength
                                ].Packing
                              }
                            </label>
                          );
                        })}
                        {Object.keys(
                          medicine.salt_forms_json[selectedForm[index]]
                        ).length > 4 && (
                          <button onClick={toggleShowAllStrengths}>
                            {showAllStrengths ? "hide" : "more..."}
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                  {/* Packaging of MEDICINE */}
                  {selectedStrength[index] && ( // Render only if a strength is selected
                    <div className="selection">
                      <div className="heads">
                        <p>Packaging:</p>
                      </div>
                      <div className="details">
                        {(ShowAllPackaging
                          ? Object.entries(
                              medicine.salt_forms_json[selectedForm[index]][
                                selectedStrength[index]
                              ]
                            )
                          : Object.entries(
                              medicine.salt_forms_json[selectedForm[index]][
                                selectedStrength[index]
                              ]
                            ).slice(0, 4)
                        ).map(([packaging, details]) => {
                          const available =
                            details &&
                            Object.values(details).some(Array.isArray);
                          const isSelected =
                            selectedPackaging[index] === packaging;

                          const isSelectedNotAvailable =
                            isSelected && !available;

                          return (
                            <label
                              key={packaging}
                              className={`radio-label ${
                                isSelected ? "selected" : "not-selected"
                              } ${available ? "available" : "not-available"} ${
                                isSelectedNotAvailable
                                  ? "selected-not-available"
                                  : ""
                              }`}>
                              <input
                                type="radio"
                                name={`packaging_${index}`}
                                value={packaging}
                                checked={selectedPackaging[index] === packaging}
                                onChange={() =>
                                  handlePackagingChange(
                                    medicine,
                                    index,
                                    packaging
                                  )
                                }
                                // disabled={!available}
                              />
                              {packaging}
                            </label>
                          );
                        })}
                        {Object.entries(
                          medicine.salt_forms_json[selectedForm[index]][
                            selectedStrength[index]
                          ]
                        ).length > 4 && (
                          <button onClick={toggleShowAllPackaging}>
                            {ShowAllPackaging ? "hide" : "more..."}
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <div className="med-name">
                  <h3>{medicine.salt}</h3>
                  <p>
                    {selectedForm[index]} | {selectedStrength[index]} |{" "}
                    {selectedPackaging[index]}
                  </p>
                </div>
                <div className="med-price">
                  <span>
                    <h2>From ₹{lowestSellingPrice[index]}</h2>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Card;
