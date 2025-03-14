export interface Animal {
  id?: number;
  dispositivo: string;
  raza: string;
  cruza: string;
  sexo: string;
  edad_meses: number;
  edad_dias: number;
  propietario: string;
  nombre_propietario: string;
  ubicacion: string;
  tenedor: string;
  status_vida: string;
  status_trazabilidad: string;
  errores: string;
  fecha_identificacion: Date;
  fecha_registro: Date;
  created_at?: Date;
} 