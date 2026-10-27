import { useState } from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function DownloadTicket({
  reference,
  token,
}: {
  reference: string;
  token: string;
}) {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  async function download() {
    setBusy(true);
    setError('');
    try {
      const response = await fetch(
        `/api/reservations/${encodeURIComponent(reference)}/ticket`,
        {
          credentials: 'same-origin',
          headers: { 'X-Reservation-Token': token },
        },
      );
      if (!response.ok)
        throw new Error(
          'Unable to download your ticket. Check the reference and access token, then try again.',
        );
      const url = URL.createObjectURL(await response.blob());
      const link = document.createElement('a');
      link.href = url;
      link.download = `Jomeca-${reference.replace(/[^A-Z0-9-]/g, '')}.pdf`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 30000);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to download ticket.');
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="ticket-download">
      <Button
        type="button"
        variant="outline"
        disabled={busy}
        onClick={() => void download()}
      >
        <Download size={17} />
        {busy ? 'Preparing ticket…' : 'Download ticket (PDF)'}
      </Button>
      {error && <p role="alert">{error}</p>}
      <p className="field-hint">
        The ticket shows the status when downloaded. Staff verify its reference
        in the live dashboard.
      </p>
    </div>
  );
}
