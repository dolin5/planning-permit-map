export interface locations {
  [key:string]: Array<number>
}

export interface locationPair {
  "Location ID":number;
  "Property ID":string;
}


export interface permit {
  "Project ID": number,
  "Location ID": number,
  "Template name": string,
  "Permit Number": string,
  "Permit Title": string,
  "Permit Description": string,
  "Project Address": string,
  "Status": string,
  "Status Date": string  
}

export interface permits {
  [key:number] : Array<permit>;
}