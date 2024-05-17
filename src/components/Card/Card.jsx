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
  const [ShowAllPackaging, setShowAllPackaging] = useState(false);
  const [foundStoresState, setFoundStoresState] = useState({});
  const [initialLowestSellingPrice, setInitialLowestSellingPrice] = useState(
    {}
  );
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
        // const defaultLowestSellingPrice = {};
        const initialLowestPrices = {};

        data.data.saltSuggestions.forEach((medicine, index) => {
          defaultSelectedForm[index] = medicine.most_common.Form;
          defaultSelectedStrength[index] = medicine.most_common.Strength;
          defaultSelectedPackaging[index] = medicine.most_common.Packing;
          initialLowestPrices[index] = calculateLowestSellingPrice(
            medicine,
            defaultSelectedForm[index],
            defaultSelectedStrength[index],
            defaultSelectedPackaging[index],
            setFoundStoresState
          );
        });

        setSelectedForm(defaultSelectedForm);
        setSelectedStrength(defaultSelectedStrength);
        setSelectedPackaging(defaultSelectedPackaging);
        // setLowestSellingPrice(defaultLowestSellingPrice);
        setInitialLowestSellingPrice(initialLowestPrices);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setError(error.message);
      });
  }, [searchQuery]); // Fetch data whenever searchQuery changes

  const handleFormChange = (index, form, medicine) => {
    setSelectedForm({ ...selectedForm, [index]: form });

    // Set the default strength for the selected form
    const defaultStrength = Object.keys(medicine.salt_forms_json[form])[0]; // Assuming the default strength is the first one in the list
    setSelectedStrength({ ...selectedStrength, [index]: defaultStrength });
  };

  const handleStrengthChange = (index, strength) => {
    setSelectedStrength({ ...selectedStrength, [index]: strength });
  };
  const handlePackagingChange = (
    medicine,
    index,
    packaging,
    selectedForm,
    selectedStrength
  ) => {
    setSelectedPackaging({ ...selectedPackaging, [index]: packaging }); // Update selectedPackaging state

    const newLowestPrice = calculateLowestSellingPrice(
      medicine,
      selectedForm,
      selectedStrength,
      packaging,
      setFoundStoresState
    );

    setInitialLowestSellingPrice((prevState) => ({
      ...prevState,
      [index]: newLowestPrice,
    }));
  };

  const toggleShowAllForms = () => {
    setShowAllForms(!showAllForms);
  };

  const toggleShowAllStrengths = () => {
    setShowAllStrengths(!showAllStrengths);
  };
  const toggleShowAllPackaging = () => {
    setShowAllPackaging(!ShowAllPackaging);
  };

  const calculateLowestSellingPrice = (
    medicine,
    selectedForm,
    selectedStrength,
    selectedPackaging,
    setFoundStoresState // Assuming this is a state-setting function
  ) => {
    console.log("Inside calculate function ");
    const strengthData =
      medicine.salt_forms_json[selectedForm][selectedStrength];
    const pricesData = strengthData[selectedPackaging];

    console.log(pricesData, "Prices", strengthData, "Strenght");
    let foundStores = {}; // Initialize foundStores object

    if (pricesData) {
      const productIds = Object.keys(pricesData);

      let allPrices = [];

      productIds.forEach((productId) => {
        if (productId && pricesData[productId]) {
          const prices = pricesData[productId];

          if (prices.length > 0) {
            // If prices are available, set foundStores to true and calculate the lowest price
            foundStores[productId] = true;
            allPrices.push(...prices.map((item) => item.selling_price));
          } else {
            // If pricesData is empty, set foundStores to false
            foundStores[productId] = false;
          }
        }
      });

      if (allPrices.length > 0) {
        // If prices are available for any product, set foundStoresState to true and return the lowest price
        setFoundStoresState({ ...foundStores }); // Update the state with foundStores
        return Math.min(...allPrices);
      } else {
        // If prices are not available for any product, set foundStoresState to false and return null
        setFoundStoresState({ ...foundStores }); // Update the state with foundStores
        return null;
      }
    }

    // If pricesData is null or undefined, set foundStoresState to false and return null
    setFoundStoresState(false);
    return null;
  };

  if (error) {
    return <div>Error: {error}</div>;
  }
  console.log(medicines, "medicies");
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
                              onChange={() =>
                                handleFormChange(index, option, medicine)
                              }
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
                                    packaging,
                                    selectedForm[index],
                                    selectedStrength[index]
                                  )
                                }
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
                  <div>
                    {initialLowestSellingPrice[index] !== undefined ? (
                      initialLowestSellingPrice[index] !== null ? (
                        <span>
                          <h2>From ₹{initialLowestSellingPrice[index]}</h2>
                        </span>
                      ) : (
                        <div className="notfound">
                          <p>No stores selling this product near you</p>
                        </div>
                      )
                    ) : (
                      <div className="loading">
                        <p>Loading...</p>
                      </div>
                    )}
                  </div>
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
