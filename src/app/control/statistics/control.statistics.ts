/**
 * Interface que representa las estadísticas básicas calculadas a partir de los registros 
 * de sonido.
 */
export interface BasicStatistics {
  maxAnalog: number;
  minAnalog: number;
  rangeAnalog: number;
  meanAnalog: number;
  maxdB: number;
  mindB: number;
  rangedB: number;
  meandB: number;
}
