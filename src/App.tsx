import { useCallback, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ColDef, FirstDataRenderedEvent, GridOptions } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import debounce from "lodash.debounce";
import { ToastContainer, toast } from "react-toastify";

import { APICountry, Country, APIError, CountryRecord } from "./types";
import { DetailModal } from "./components/DetailModal";
import { getSavedCountriesFromStorage, normalizeCountryData } from "./utils";

import "./App.scss";

const CONTAINER_STYLE = { height: "calc(100% - 70px)" };

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
  const columnDefs = useMemo<ColDef[]>(
    () => [
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
    ],
    []
  );

  const onDetailClose = () => {
    setSelectedCountry(null);
  };

  const onGridReady = useCallback(() => {
    fetch("https://restcountries.com/v3.1/all")
      .then((resp) => resp.json())
      .then((data: APICountry[] | APIError) => {
        if ("message" in data) {
          throw new Error(data.message);
        }

        const formattedData = data.map(normalizeCountryData);
        setRowData(formattedData);
      })
      .catch((error) => {
        toast.error(error.message);
      });
  }, []);

  const onRowClicked = ({ data }: { data: Country }) => {
    setSelectedCountry(data);
  };

  const onRowSelected = useCallback(
    (e: { data: Country; event?: unknown; source: string }) => {
      if (!e.event && e.source !== "uiSelectAllFiltered") return;

      setSavedCountryNames((prevSaved) => {
        const newSaved = { ...prevSaved };
        const { name } = e.data;

        if (newSaved[name]) {
          delete newSaved[name];
        } else {
          newSaved[name] = true;
        }

        localStorage.setItem("saved_country_names", JSON.stringify(newSaved));
        return newSaved;
      });
    },
    []
  );

  const gridOptions = useMemo<GridOptions>(
    () => ({
      pagination: true,
      rowSelection: "multiple",
      suppressRowClickSelection: true,
      onGridReady,
      onRowClicked,
      onRowSelected,
      onFirstDataRendered: (params: FirstDataRenderedEvent<Country>) => {
        params.api.forEachNode((node) => {
          if (savedCountryNames[node.data!.name]) {
            node.setSelected(true);
          }
        });
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const onFilterTextBoxChanged = debounce(() => {
    gridRef.current!.api.setGridOption(
      "quickFilterText",
      (document.getElementById("filter-text-box") as HTMLInputElement).value
    );
  }, 400);

  return (
    <>
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
            containerStyle={CONTAINER_STYLE}
            ref={gridRef}
            rowData={rowData}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            gridOptions={gridOptions}
          />
        </div>
        {selectedCountry &&
          createPortal(
            <DetailModal {...selectedCountry} onClose={onDetailClose} />,
            document.body
          )}
      </div>
      <ToastContainer />
    </>
  );
}

export default App;
