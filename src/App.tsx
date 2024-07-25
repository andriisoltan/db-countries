import { useCallback, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  ColDef,
  GridReadyEvent,
  IRowNode,
  FirstDataRenderedEvent,
} from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";

import { APICountry, Country, FlatObject } from "./types";
import { DetailModal } from "./components/DetailModal";

import "./App.scss";

type CountryRecord = Record<string, boolean>;

const getCurrencies = (currencies?: FlatObject) => {
  if (!currencies) return "";

  return Object.values(currencies).reduce((acc, curr, i, arr) => {
    let comma = "";
    if (i !== arr.length - 1) comma = ",";

    return `${acc} ${curr.name}${comma}`;
  }, "");
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
    },
  };
};

const getSavedCountriesFromStorage = () => {
  const saved = localStorage.getItem("saved_country_names");
  if (!saved) return { Grenada: true };

  return JSON.parse(saved) as CountryRecord;
};

function App() {
  const gridRef = useRef<AgGridReact>(null);
  const [savedCountryNames, setSavedCountryNames] = useState<CountryRecord>(
    getSavedCountriesFromStorage()
  );
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [rowData, setRowData] = useState<Country[]>([]);
  const defaultColDef = useMemo<ColDef>(
    () => ({
      flex: 1,
    }),
    []
  );

  const onFilterTextBoxChanged = useCallback(() => {
    gridRef.current!.api.setGridOption(
      "quickFilterText",
      (document.getElementById("filter-text-box") as HTMLInputElement).value
    );
  }, []);

  const onGridReady = useCallback((params: GridReadyEvent) => {
    fetch("https://restcountries.com/v3.1/all")
      .then((resp) => resp.json())
      .then((data: APICountry[]) => {
        const formattedData = data.map(normalizeCountryData);
        setRowData(formattedData);
      })
      .catch((reject) => alert(reject)); // TODO: change alert
  }, []);

  const onRowClicked = useCallback(({ data }: { data: Country }) => {
    setSelectedCountry(data);
  }, []);

  const onRowSelected = (e: { data: Country, event?: any }) => {
    if (!e.event) return;
    
    const { name } = e.data;

    if (savedCountryNames[name]) {
      delete savedCountryNames[name];
    } else {
      savedCountryNames[name] = true;
    }

    setSavedCountryNames(savedCountryNames);

    localStorage.setItem(
      "saved_country_names",
      JSON.stringify(savedCountryNames)
    );
  };

  return (
    <div className="App">
      <div className="App__table ag-theme-alpine">
        <div className="App__table__filter">
          <strong className="App__table__filter__label">Quick search:</strong>
          <input
            type="text"
            id="filter-text-box"
            placeholder="Search by name, currency or language"
            className="App__table__filter__input"
            onInput={onFilterTextBoxChanged}
          />
        </div>

        <AgGridReact
          containerStyle={{ height: "calc(100% - 70px) " }}
          ref={gridRef}
          rowData={rowData}
          columnDefs={[
            {
              field: "name",
              headerCheckboxSelection: true,
              headerCheckboxSelectionFilteredOnly: true,
              checkboxSelection: true,
              filter: true,
            },
            { field: "flag", sortable: false, getQuickFilterText: () => "" },
            { field: "currencies", filter: true },
            { field: "languages", filter: true },
            { field: "population", getQuickFilterText: () => "" },
          ]}
          defaultColDef={defaultColDef}
          onGridReady={onGridReady}
          onRowClicked={onRowClicked}
          onRowSelected={onRowSelected}
          gridOptions={{
            pagination: true,
            rowSelection: "multiple",
            suppressRowClickSelection: true,
            onFirstDataRendered: (params: FirstDataRenderedEvent<Country>) => {
              const nodesToSelect: IRowNode[] = [];
              params.api.forEachNode((node: IRowNode) => {
                if (savedCountryNames[node.data.name]) {
                  nodesToSelect.push(node);
                }
              });
              params.api.setNodesSelected({
                nodes: nodesToSelect,
                newValue: true,
              });
            },
          }}
        />
      </div>
      {selectedCountry &&
        createPortal(
          <DetailModal
            {...selectedCountry}
            onClose={() => setSelectedCountry(null)}
          />,
          document.body
        )}
    </div>
  );
}

export default App;
