export type FlatObject = Record<string, any>;
export type CountryRecord = Record<string, boolean>;
export type APIError = { message: string };

export interface APICountry {
  // table
  name: {
    common: string;
    official: string;
  };
  flag: string;
  population: number;
  languages: FlatObject;
  currencies?: {
    [key: string]: {
      name: string;
      symbol?: string;
    };
  };

  // detailed view
  capital: string[];
  cioc: string;
  coatOfArms?: {
    png: string;
  };
  flags: {
    png: string;
    alt: string;
  };
  maps: {
    googleMaps: string;
  };
  region: string;
}

export interface Country {
  name: string;
  flag: string;
  currencies: string;
  languages: string;
  population: number;

  details: {
    capital: string[];
    cioc: string;
    coatOfArms?: {
      png: string;
    };
    flags: {
      png: string;
      alt: string;
    };
    maps: {
      googleMaps: string;
    };
    region: string;
  };
}
