export interface Locations {
  [key: string]: Array<number>;
}

export interface LocationPair {
  "Location ID": number;
  "Property ID": string;
}


export interface Permit {
  "Project ID": number;
  "Location ID": number;
  "Template name": string;
  "Permit Number": string;
  "Permit Title": string;
  "Permit Description": string;
  "Project Address": string;
  "Status": string;
  "Status Date": string;  
}

export interface Permits {
  [key: number]: Array<Permit>;
}
