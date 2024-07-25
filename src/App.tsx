import { useCallback, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ColDef, GridReadyEvent } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";

import { APICountry, Country, FlatObject } from "./types";
import { DetailModal } from "./components/DetailModal";

import "./App.scss";

// TODO: favs

const getCurrencies = (currencies?: FlatObject) => {
  if (!currencies) return "";

  return Object.values(currencies).reduce(
    (acc, curr) => `${acc} ${curr.name}`,
    ""
  );
};

const getLanguages = (langs?: FlatObject) => {
  if (!langs) return "";

  return Object.values(langs).reduce((acc, curr, i, arr) => {
    let comma = "";
    if (i !== arr.length - 1) comma = ",";

    return `${acc} ${curr}${comma}`;
  }, "");
};

const normalizeCountryData = (country: APICountry): Country => {
  return {
    name: country.name.common,
    flag: country.flag,
    currencies: getCurrencies(country.currencies),
    languages: getLanguages(country.languages),
    population: country.population,

    details: {
      capital: country.capital,
      cioc: country.cioc,
      coatOfArms: country.coatOfArms,
      flags: country.flags,
      maps: country.maps,
      region: country.region,
    }
  };
};

function App() {
  const gridRef = useRef<AgGridReact>(null);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [rowData, setRowData] = useState<Country[]>([]);
  const defaultColDef = useMemo<ColDef>(() => ({
    flex: 1,
  }), []);

  const onGridReady = useCallback((params: GridReadyEvent) => {
    fetch("https://restcountries.com/v3.1/all")
      .then((resp) => resp.json())
      .then((data: APICountry[]) => {
        const formattedData = data.map(normalizeCountryData);
        setRowData(formattedData);
      })
      .catch(reject => alert(reject)); // TODO: change alert
  }, []);

  const onRowClicked = (e: { data: Country }) => {
    setSelectedCountry(e.data);
  };

  return (
    <div className="App">
      <div className="App__table ag-theme-alpine">
        <AgGridReact
          ref={gridRef}
          rowData={rowData}
          columnDefs={[ // TODO: useMemo
            {
              field: "name",
              headerCheckboxSelection: true,
              headerCheckboxSelectionFilteredOnly: true,
              checkboxSelection: true,
              filter: true,
            },
            { field: "flag", sortable: false },
            { field: "currencies", filter: true, },
            { field: "languages", filter: true, },
            { field: "population" },
          ]}
          defaultColDef={defaultColDef}
          onGridReady={onGridReady}
          onRowClicked={onRowClicked}
          rowSelection="multiple"
          suppressRowClickSelection
          gridOptions={{ // TODO: useMemo
            pagination: true,
          }}
        />
      </div>
      {selectedCountry &&
        createPortal(
          <DetailModal {...selectedCountry} onClose={() => setSelectedCountry(null)} />,
          document.body
        )}
    </div>
  );
}

export default App;
