import { IconDownload, IconUpload } from '@tabler/icons-react';
import { useState, type ChangeEvent } from 'react';
import { BackupError, backupFileName, parseBackup, type Backup } from '../domain/backup';
import { useAppStore } from '../store/appStore';
import { downloadJson } from './download';

const count = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

/** "té 3 plats propis i 42 dies apuntats", sense frases com "té cap plat". */
function contents({ dishes, days }: Backup): string {
  const d = count(dishes.length, 'plat propi', 'plats propis');
  const n = count(days.length, 'dia apuntat', 'dies apuntats');
  if (dishes.length && days.length) return `té ${d} i ${n}`;
  if (days.length) return `té ${n} (sense plats propis)`;
  if (dishes.length) return `té ${d} (sense dies apuntats)`;
  return 'és buit: no té plats propis ni dies apuntats';
}

const buttonClass =
  'flex h-12 cursor-pointer items-center justify-center gap-2 rounded-(--radius-rajola) bg-rajola px-2 text-sm font-medium transition-colors hover:bg-rajola/70 active:bg-rajola/50 has-focus-visible:outline-2 has-focus-visible:outline-offset-3 has-focus-visible:outline-tinta';

type Message = { kind: 'ok' | 'error'; text: string };

/** Ajustos · còpia de seguretat: exportar i importar (substituint) totes les dades. */
export function BackupSection() {
  const today = useAppStore((s) => s.today);
  const hasData = useAppStore((s) => s.days.length > 0 || s.dishes.some((d) => d.source === 'user'));
  const exportBackup = useAppStore((s) => s.exportBackup);
  const importBackup = useAppStore((s) => s.importBackup);

  const [pending, setPending] = useState<Backup | null>(null);
  const [keepCopy, setKeepCopy] = useState(true);
  const [message, setMessage] = useState<Message | null>(null);
  const [busy, setBusy] = useState(false);

  async function exportNow() {
    const fileName = backupFileName(today);
    downloadJson(fileName, await exportBackup());
    setMessage({ kind: 'ok', text: `Fet! S’ha baixat ${fileName}.` });
  }

  async function chooseFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ''; // Per poder tornar a triar el mateix fitxer.
    if (!file) return;
    setMessage(null);
    try {
      setPending(parseBackup(await file.text()));
      setKeepCopy(true);
    } catch (error) {
      if (!(error instanceof BackupError)) throw error;
      setPending(null);
      setMessage({ kind: 'error', text: error.message });
    }
  }

  async function replace() {
    if (!pending || busy) return;
    setBusy(true);
    try {
      if (hasData && keepCopy) {
        downloadJson(backupFileName(today, 'abans-d-importar'), await exportBackup());
      }
      await importBackup(pending);
      setPending(null);
      setMessage({ kind: 'ok', text: 'Fet! Ja tens les dades del fitxer.' });
    } catch {
      setMessage({ kind: 'error', text: 'No s’ha pogut importar. No s’ha canviat res: torna-ho a provar.' });
    } finally {
      setBusy(false);
    }
  }

  return (
    <section aria-labelledby="backup-title" className="mt-6">
      <h2 id="backup-title" className="font-semibold">
        Còpia de seguretat
      </h2>
      <p className="mt-0.5 text-sm text-tinta-suau">Per passar les dades a un altre mòbil.</p>

      {/* Mentre es confirma, els botons no pinten res: la confirmació n'ocupa el lloc. */}
      {!pending && (
        <div className="mt-3 grid gap-0.5 min-[400px]:grid-cols-2">
          <button type="button" onClick={exportNow} className={buttonClass}>
            <IconDownload size={20} stroke={1.75} aria-hidden="true" />
            Baixar una còpia
          </button>
          <label className={buttonClass}>
            <input type="file" accept="application/json,.json" onChange={chooseFile} className="sr-only" />
            <IconUpload size={20} stroke={1.75} aria-hidden="true" />
            Recuperar una còpia
          </label>
        </div>
      )}

      {pending && (
        <div className="mt-3 rounded-(--radius-rajola) bg-rajola p-3">
          <p className="text-pretty">
            Aquest fitxer {contents(pending)}. Substituirà tot el que hi ha en aquest mòbil i no es pot desfer.
          </p>
          {hasData && (
            <label className="mt-2 flex min-h-11 cursor-pointer items-center gap-3 text-sm font-medium">
              <input
                type="checkbox"
                checked={keepCopy}
                onChange={(e) => setKeepCopy(e.target.checked)}
                className="size-5 shrink-0 accent-tinta"
              />
              Abans, baixa una còpia del que hi ha ara
            </label>
          )}
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setPending(null)}
              className="h-12 rounded-(--radius-rajola) border-2 border-tinta/25 font-medium transition-colors hover:border-tinta/50"
            >
              Deixar-ho com està
            </button>
            <button
              type="button"
              onClick={replace}
              disabled={busy}
              className="h-12 rounded-(--radius-rajola) bg-tinta font-semibold text-ciment transition-colors hover:bg-tinta/90 disabled:opacity-70"
            >
              Substituir les dades
            </button>
          </div>
        </div>
      )}

      <p
        role="status"
        className={`mt-2 min-h-5 text-sm font-medium ${message?.kind === 'error' ? 'text-capritx-tinta' : 'text-tinta'}`}
      >
        {message?.text}
      </p>
    </section>
  );
}
