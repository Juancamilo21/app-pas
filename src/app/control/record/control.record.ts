/**
 * Interfaz que representa el registro de los datos que vienen desde firebase.
 */
export interface Record {
  date: string;
  level: number;
}

/**
 * Interfaz que extiende la interfaz `Record` e incluye un valor adicional para los decibelios (dB).
 */
export interface RecorddB extends Record {
  dB: number;
}
