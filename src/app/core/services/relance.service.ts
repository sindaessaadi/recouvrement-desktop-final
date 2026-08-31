import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, switchMap, shareReplay } from 'rxjs/operators';
import { API_BASE_URL } from '../api-config';
import { Relance, TypeRelance } from '../models/relance';

export const CANAUX: string[] = ['Email', 'Tel', 'Courrier'];

interface RelanceApiResponse {
  id: number;
  dateHeure: string;
  memoireId: number | null;
  memoireNumero: string | null;
  client: string | null;
  type: TypeRelance;
  canal: string | null;
  utilisateur: string | null;
  resultat: string | null;
  message: string | null;
}

interface MemoireApiResponse {
  id: number;
  numero: string;
  client: string | null;
}

function isoVersDateHeureLabel(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function versRelance(r: RelanceApiResponse): Relance {
  return {
    date: isoVersDateHeureLabel(r.dateHeure),
    client: r.client ?? '-',
    memoire: r.memoireNumero ?? '-',
    type: r.type,
    canal: r.canal ?? '-',
    user: r.utilisateur ?? '-',
    resultat: r.resultat ?? '-',
    message: r.message ?? '',
  };
}

@Injectable({
  providedIn: 'root',
})
export class RelanceService {
  private refresh$ = new BehaviorSubject<void>(undefined);

  readonly relances$: Observable<Relance[]> = this.refresh$.pipe(
    switchMap(() => this.http.get<RelanceApiResponse[]>(`${API_BASE_URL}/relances`)),
    map((liste) => liste.map(versRelance)),
    shareReplay(1),
  );

  constructor(private http: HttpClient) {}

  getMemoireNumeros(): Observable<{ numero: string; client: string }[]> {
    return this.http
      .get<MemoireApiResponse[]>(`${API_BASE_URL}/memoires`)
      .pipe(map((liste) => liste.map((m) => ({ numero: m.numero, client: m.client ?? '-' }))));
  }

  /** Enregistre une relance en base pour le memoire designe par son numero (ex. MEM-2026-0015). */
  ajouterRelance(r: Relance): void {
    this.http.get<MemoireApiResponse[]>(`${API_BASE_URL}/memoires`).subscribe((liste) => {
      const trouve = liste.find((m) => m.numero === r.memoire);
      if (!trouve) {
        console.error("Memoire introuvable pour l'ajout de la relance :", r.memoire);
        return;
      }
      const body = {
        memoireId: trouve.id,
        type: r.type,
        canal: r.canal,
        utilisateur: r.user,
        resultat: r.resultat,
        message: r.message,
      };
      this.http.post(`${API_BASE_URL}/relances`, body).subscribe(() => this.refresh$.next());
    });
  }
}
