export interface ListaPersonalizada {
    id: string;
    nombre: string;
    fechaCreacion: Date;
    ultimaModificacion: Date;
    propietarios: {
        [key: string]: {
            nombre: string;
            animales: string[]; // Array de IDs de dispositivos
        }
    };
} 