export interface Animal {
    id: number;
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
    fecha_identificacion: string;
    fecha_registro: string;
    created_at: string;

    // Nuevas propiedades para la tabla
    categoria?: string;
    altura_anca?: number;
    largo_pelvis?: number;
    ancho_pelvis?: number;
    condicion_corporal?: string;
    peso?: number;
    ultima_actualizacion?: string;
} 