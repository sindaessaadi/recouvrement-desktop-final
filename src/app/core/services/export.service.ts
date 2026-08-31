import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ExportService {
  /**
   * Genere et telecharge un fichier CSV (ouvrable dans Excel)
   * a partir d'en-tetes et de lignes de donnees.
   */
  exporterCsv(nomFichier: string, entetes: string[], lignes: (string | number)[][]): void {
    const echapper = (valeur: string | number): string => {
      const texte = String(valeur ?? '');
      if (texte.includes(';') || texte.includes('"') || texte.includes('\n')) {
        return `"${texte.replace(/"/g, '""')}"`;
      }
      return texte;
    };

    const contenu = [
      entetes.map(echapper).join(';'),
      ...lignes.map((ligne) => ligne.map(echapper).join(';')),
    ].join('\n');

    const blob = new Blob(['\uFEFF' + contenu], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const lien = document.createElement('a');
    lien.href = url;
    lien.download = nomFichier;
    lien.click();

    URL.revokeObjectURL(url);
  }
}