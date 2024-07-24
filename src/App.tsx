import { useCallback, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ColDef, GridReadyEvent } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";

import { APICountry, Country, FlatObject } from "./types";
import "./App.scss";

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
  };
};

function App() {
  const gridRef = useRef<AgGridReact>(null);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [rowData, setRowData] = useState<Country[]>([]);
  const defaultColDef = useMemo<ColDef>(() => {
    return {
      flex: 1,
    };
  }, []);

  const onGridReady = useCallback((params: GridReadyEvent) => {
    fetch("https://restcountries.com/v3.1/all")
      .then((resp) => resp.json())
      .then((data: APICountry[]) => {
        const formattedData = data.map(normalizeCountryData);
        setRowData(formattedData);
      });
  }, []);

  const onFilterTextBoxChanged = useCallback(() => {
    gridRef.current!.api.setGridOption(
      "quickFilterText",
      (document.getElementById("filter-text-box") as HTMLInputElement).value
    );
  }, []);

  const onRowClicked = (e: { data: Country }) => {
    setSelectedCountry(e.data.name);
  };

  return (
    <div className="App">
      <input
        type="text"
        id="filter-text-box"
        placeholder="Filter..."
        onInput={onFilterTextBoxChanged}
      />
      <div
        className="ag-theme-alpine"
        style={{ height: "100%", width: "100%" }}
      >
        <AgGridReact
          ref={gridRef}
          rowData={rowData}
          columnDefs={[
            {
              field: "name",
              headerCheckboxSelection: true,
              headerCheckboxSelectionFilteredOnly: true,
              checkboxSelection: true,
            },
            { field: "flag", sortable: false },
            { field: "currencies" },
            { field: "languages" },
          ]}
          defaultColDef={defaultColDef}
          onGridReady={onGridReady}
          onRowClicked={onRowClicked}
          rowSelection="multiple"
        />
      </div>
      {selectedCountry &&
        createPortal(
          <div className="App__modal">Clicked {selectedCountry}</div>,
          document.body
        )}
    </div>
  );
}

export default App;
