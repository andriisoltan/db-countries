export type FlatObject = Record<string, any>;

export interface APICountry {
    name: {
        common: string;
        official: string;
    },
    flag: string;
    population: string;
    languages: FlatObject;
    currencies?: {
        [key: string]: {
            name: string;
            symbol?: string;
        }
    };
}

export interface Country {
    name: string;
    flag: string;
    currencies: string;
    languages: string;
}