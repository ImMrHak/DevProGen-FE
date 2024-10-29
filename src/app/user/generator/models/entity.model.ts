export interface Field {
  name: string;
  type: string;
  required: boolean;
}

export interface Relationship {
  name: string;
  type: string;
  targetEntity: string;
  required: boolean;
}

export interface AccessControl {
  role: string;
  allowed: boolean;
}

export interface InheritanceControl {
  inheritance: boolean;
}

export interface Entity {
  name: string;
  fields: Field[];
  relationships: Relationship[];
  accessControl: AccessControl[];
  inheritanceControl: InheritanceControl[];
}

export interface YamlContent {
  entities: Entity[];
}
