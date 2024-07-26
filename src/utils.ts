import { FlatObject, APICountry, Country } from "./types";

const getCurrencies = (currencies?: FlatObject) => {
  if (!currencies) return "";
  return Object.values(currencies)
    .map((curr) => curr.name)
    .join(", ");
};

const getLanguages = (langs?: FlatObject) => {
  if (!langs) return "";
  return Object.values(langs).join(", ");
};

export const normalizeCountryData = (country: APICountry): Country => ({
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
});

export const getSavedCountriesFromStorage = () => {
  const saved = localStorage.getItem("saved_country_names");
  return saved ? JSON.parse(saved) : {};
};
