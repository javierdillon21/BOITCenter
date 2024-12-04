declare module "react-file-reader";

const Autorization =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJqZGlsbG9uIiwib3ZyIjoiZmFsc2UiLCJuYmYiOjE3MjY3ODUzMTIsImV4cCI6MTc1ODMyMTMxMiwiaWF0IjoxNzI2Nzg1MzEyLCJpc3MiOiJwcm9hY3RpdmFuZXQiLCJhdWQiOiJhcGkifQ.g78AVbXLmqpAYw6ZgQ6ETs-xTqJ5teTnLmh4hi0iw8E";
const vm = "8104ebf2-73e4-4294-befc-17ad240d9583";

interface Registro {
  id: string;
  fecha_recepcion: string; //"00-00-000";
  fecha_entrega: string; //"00-00-000";
  hostname: string;
  ip: string;
  area: string;
  proyecto: string;
  alertas: string;
  puerto: string;
  estado: string;
  observacion_estado: string;
  observacion_informe: string;
}

interface RequestProperties {
  operation: Query | Mutation | OperationRequest;
  id: string | "all";
  limit?: number;
  data?: Table;
}

interface APIResponse {
  query: string;
  items: [];
}

type Query = "listInforme" | "listRegistro";
type Mutation =
  | "DeleteInforme"
  | "DeleteRegistro"
  | "CreateInforme"
  | "CreateRegistro"
  | "UpdateInforme"
  | "UpdateRegistro";

type OperationRequest = "CargarInforme";

type Table = Registro | Informe;

type InputValues =
  | CreateEquipoInput
  | CreateEquipoVulnerabilidadInput
  | CreateInformeEquipoInput
  | CreateInformeInput
  | CreateInformeVulnerabilidadInput
  | CreateVulnerabilidadInput
  | submitInformeInput
  | updateEstadoVulnerabilidadInput
  | updateEstadoVulnerabilidad
  | updatePropsVulnerabilidad
  | updateInformeCompromisoInput
  | updateInformeEntregaInput;

type RequestType =
  | "createInforme"
  | "createEquipo"
  | "createVulnerabilidad"
  | "createInformeEquipo"
  | "createInformeVulnerabilidad"
  | "createEquipoVulnerabilidad"
  | "submitInforme"
  | "listInforme"
  | "getInforme"
  | "updateEstadoVulnerabilidad"
  | "updatePropsVulnerabilidad"
  | "updateInformeCompromiso"
  | "updateInformeEntrega" | "deleteInforme"

interface Equipo {
  id: number;
  id_proactiva: string;
  sistema_operativo: string;
  clasificaciones: string;
  localizacion: string;
  hipervisor: string;
  responsable_boitc: string;
  responsable_servicio: string;
  responsable_so: string;
  descripcion: string;
  tipo: string;
  ips: string[]; // INET[] se mapea a un array de strings en TypeScript
  hostname: string;
}

interface Vulnerabilidad {
  id: number;
  nombre: string;
  descripcion: string;
  cve?: string; // El campo cve es opcional
  mitigacion_sugerida: string;
  referencia?: string; // El campo referencia es opcional
  observacion?: string; // El campo observacion es opcional
  estado: EstadoVulnerabilidad;
}

interface VulnerabilidadDataTable {
  id?: string;
  vulnerabilidad?: string;
  descripcion?: string;
  hostname?: string;
  ips?: string[];
  cve?: string;
  mitigacion_sugerida?: string;
  referencia?: string; // El campo referencia es opcional
  observacion?: string; // El campo observacion es opcional
  estado?: EstadoVulnerabilidad | string;
  id_proactiva?: string;
  id_equipo?: string;
  responsable_boitc?: string;
  responsable_servicio?: string;
}



interface Informe {
  id: number;
  nombre: string;
  emisor: string;
  fecha_recepcion: Date | string;
  fecha_compromiso: Date[] | string;
  fecha_entrega: Date | string;
  estado: string;
}

interface InformeEquipo {
  informe_id: number;
  equipo_id: number;
}

interface InformeVulnerabilidad {
  informe_id: number;
  vulnerabilidad_id: number;
  estado: string;
}

interface EquipoVulnerabilidad {
  equipo_id: number;
  vulnerabilidad_id: number;
}

interface EquipoVulnerabilidadesResult{
  id_informe: string
  id_vulnerabilidad: string
  informe: string
  vulnerabilidad: string
  descripcion: string
  cve: string
  mitigacion_sugerida: string
  referencia: string
  observacion: string
  estado: string
}

type EstadoVulnerabilidad =
  | "Mitigada"
  | "Pendiente"
  | "Autorización Pendiente"
  | "Escalada"
  | "Mitigación programada"
  | "No mitigada";

type EstadoColor = {
  [key in string]: string;
};

interface updateInformeCompromisoInput {
  id: string;
  fecha_compromiso: string;
}

interface updateInformeEntregaInput {
  id_informe: string;
  fecha_entrega: string;
}

type updateEstadoVulnerabilidadInput = updateEstadoVulnerabilidad[];
interface updateEstadoVulnerabilidad {
  id_vulnerabilidad: string;
  id_informe: string;
  estado: string;
}

interface updatePropsVulnerabilidad {
  id_vulnerabilidad: string;
  id_informe: string;
  estado: string;
  observacion: string;
}

interface getInformeVulnerabilidadesResponse {
  clasificaciones: string;
  equipo_descripcion: string;
  equipo_id: string;
  equipo_tipo: string;
  estado_vulnerabilidad: string;
  cve: string;
  mitigacion_sugerida: string;
  observacion: string;
  referencia: string;
  hipervisor: string;
  hostname: string;
  id_proactiva: string;
  informe_estado: string;
  ips: string[];
  localizacion: string;
  responsable_boitc: string;
  responsable_servicio: string;
  responsable_so: string;
  sistema_operativo: string;
  descripcion: string;
  vulnerabilidad_id: string;
  vulnerabilidad: string;
}

type DataPie = ItemPie[];
interface ItemPie {
  value: number;
  label: string;
  color: string;
}
/********MUTATIONS TYPES PGDB */

interface CreateInformeInput {
  nombre: string;
  emisor: string;
  fecha_recepcion: Date;
  fecha_compromiso: Date;
  estado: string;
}

interface CreateEquipoVulnerabilidadInput {
  equipo_id: number;
  vulnerabilidad_id: number;
}
interface CreateInformeVulnerabilidadInput {
  informe_id: number;
  vulnerabilidad_id: number;
  estado: string;
}
interface CreateInformeEquipoInput {
  informe_id: number;
  equipo_id: number;
}
interface CreateVulnerabilidadInput {
  nombre: string;
  descripcion: string;
  cve?: string; // El campo cve es opcional
  mitigacion_sugerida: string;
  referencia?: string; // El campo referencia es opcional
  observacion?: string; // El campo observacion es opcional
}
interface CreateEquipoInput {
  id_proactiva: string;
  sistema_operativo: string;
  clasificaciones: string;
  localizacion: string;
  hipervisor: string;
  responsable_boitc: string;
  responsable_servicio: string;
  responsable_so: string;
  descripcion: string;
  tipo: string;
  ips: string[]; // INET[] se mapea a un array de strings en TypeScript
  hostname: string;
}

interface TableFields {
  columID: number;
  dataTypeID: number;
  dataTypeModifier: number;
  dataTypeSize: number;
  format: string;
  name: string;
  tableID: number;
}

//////***** XLSX TYPES*/

type BodyXLSX = RowXLSX[];

interface HeaderXLSX {
  informe: string;
  emisor: string;
  fecha_recepcion: string;
  fecha_compromiso: string;
}

interface RowXLSX {
  CVE: string;
  Descripción: string;
  IP: string;
  "Mitigación sugerida": string;
  Referencia: string;
  Vulnerabilidad: string;
}

interface DataSheetXLSX {
  encabezado: HeaderXLSX;
  cuerpo: BodyXLSX;
}

//////***** */

interface EquipoXLSX {
  ips: string[];
  id_proactiva: string;
  hostname: string;
  responsable_boitc: string;
  responsable_so: string;
  responsable_servicio: string;
  sistema_operativo: string;
  descripcion: string;
  tipo: string;
  clasificaciones: string;
  localizacion: string;
  hipervisor: string;
}

interface RecordXLSX {
  CVE: string;
  Descripción: string;
  IP: string[];
  "Mitigación sugerida": string;
  Referencia: string;
  Vulnerabilidad: string;
  id_proactiva: string;
  hostname: string;
  responsable_boitc: string;
  responsable_so: string;
  responsable_servicio: string;
  sistema_operativo: string;
  descripcion: string;
  tipo: string;
  clasificaciones: string;
  localizacion: string;
  hipervisor: string;
}
interface deleteInformeInput {
  id_informe: string
}

interface submitInformeInput {
  records: RecordXLSX[];
  metadata: HeaderXLSX;
}
//PROACTIVANET TYPES
type QueryPanet = "listPcsRaw" | "getPcByHostname" | "listPcsIP" | "listPcs";

interface RequestPanetProperties {
  id?: string;
  limit?: number;
  fields?: string[];
  query?: QueryPanet;
}

interface GetPcResponseBody {
  Code: string;
  Hostname: string;
  Description: string;
  Notes: string;
  Label: string;
  ServiceTag: string;
  FromAgent: Boolean;
  TradeMark: string;
  PanComputerModels_id: string;
  ComputerModelName: string;
  PanUsers_idResponsible: string;
  UserNameResponsable: string;
  FullNameResponsable: string;
  PanUsers_idHabitual: string;
  UserNameHabitual: string;
  FullNameHabitual: string;
  ManualClassification: true;
  ManualLocation: Boolean;
  PanLocations_id: string;
  PanLocationsName: string;
  LocationTranslatedPath: string;
  PanDomains_id: string;
  ComputerDomainName: string;
  PanHardwareStatus_id: string;
  StatusName: string;
  PanOS_id: string;
  PanOSFamily_id: string;
  OsName: string;
  PanOSFamilyName: string;
  PanProcessors_id: string;
  ProcessorName: string;
  ProcSpeed: Number;
  ProcPhysicalCount: Number;
  ProcCoreCount: Number;
  ProcHTEnabled: Boolean;
  ProcCount: Number;
  MemoryInstalledMB: Number;
  HdSizeGB: Number;
  IsServer: true;
  ChassisType: string;
  RDSEnabled: string;
  RDSPort: string;
  FirewallEnabled: string;
  FirewallProvider: string;
  IsVM: Boolean;
  IsVirtualizer: Boolean;
  VMPlatform: string;
  IsClusterized: Boolean;
  ListIPs: string;
  ListMACs: string;
  clientLastAuditDate: string;
  serverLastAuditDate: string;
  LastEventDate: string;
  AssociatedCI: string;
  AssociatedCIName: string;
  PadSuppliers_id: string;
  PadSuppliersName: string;
  PadContracts_id: string;
  PadContractsName: string;
  UBR: string;
  Id: string;
  Links: [
    {
      Rel: "self";
      Href: string;
      Action: "GET";
    },
    {
      Rel: "view custom fields";
      Href: string;
      Action: "GET";
    },
    {
      Rel: "distributions";
      Href: string;
      Action: "GET";
    },
    {
      Rel: "commands";
      Href: string;
      Action: "GET";
    },
    {
      Rel: "logins";
      Href: string;
      Action: "GET";
    },
    {
      Rel: "software";
      Href: string;
      Action: "GET";
    },
    {
      Rel: "services";
      Href: string;
      Action: "GET";
    },
    {
      Rel: "serverRoles";
      Href: string;
      Action: "GET";
    },
    {
      Rel: "windowsUpdatesPending";
      Href: string;
      Action: "GET";
    },
    {
      Rel: "events";
      Href: string;
      Action: "GET";
    },
    {
      Rel: "classifications";
      Href: string;
      Action: "GET";
    },
    {
      Rel: "network adapters";
      Href: string;
      Action: "GET";
    },
    {
      Rel: "copyfiles";
      Href: string;
      Action: "GET";
    },
    {
      Rel: "computer model";
      Href: string;
      Action: "GET";
    },
    {
      Rel: "processor";
      Href: string;
      Action: "GET";
    },
    {
      Rel: "hardware status";
      Href: string;
      Action: "GET";
    },
    {
      Rel: "location";
      Href: string;
      Action: "GET";
    },
    {
      Rel: "operating system";
      Href: string;
      Action: "GET";
    },
    {
      Rel: "operating system family";
      Href: string;
      Action: "GET";
    }
  ];
}

interface GetPCNetworkAdaptersResponseBody {
  Name: string;
  NetworkCard: string;
  MAC: string;
  Type: string;
  DHCP: Boolean;
  DHCPServer: string;
  WINS: Boolean;
  PrimaryWins: string;
  SecondaryWins: string;
  WakeOnLAN: Boolean;
  Speed: Number;
  IPAssignmentDate: string;
  IPExpirationDate: string;
  Id: string;
  Links: [
    {
      Rel: "ips";
      Href: string;
      Action: "GET";
    }
  ];
}

interface CustomFieldPanet {
  CustomField_id: string;
  Href: string;
  name: string;
}
type CustomFieldsPanet = CustomFieldPanet[];

type PcListIp = { ListIPs: string; Id: string }[];
type PcListIps = { ListIPs: string | string[]; Id: string }[];

interface AlertProps {
  text: string;
  type: AlertType;
}

interface AlertType {
  icon: string;
  classname: string;
}

type DateFormats = "yyyy-mm-dd" | "dd-mm-yyyy" | "dd/mm/yyyy";
