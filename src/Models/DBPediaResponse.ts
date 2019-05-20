export interface DBPediaResponse {
    vars : string[];
    results: DBPediaResults;
}

export interface DBPediaResults {
    bindings: DBPediaResulEntity[]
}

export interface DBPediaResulEntity { 
    [key: string]: DBPediaResultValue; 
}

export interface DBPediaResultValue {
    type : string;
    datatype: string;
    value: string;
}