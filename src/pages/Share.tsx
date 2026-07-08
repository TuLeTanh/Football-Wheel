import { useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Download, Share2 } from 'lucide-react';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { useHistoryStore } from '@/stores/useHistoryStore';
import { useToastStore } from '@/stores/useToastStore';
import { downloadDataUrl, renderNodeToPng, shareImage } from '@/utils/exportImage';
import { haptic } from '@/utils/haptics';
import BackHeader from '@/components/BackHeader';
import TeamBadge from '@/components/TeamBadge';
import type { CategoryId } from '@/types';

interface ShareResult {
  teamId: string;
  teamName: string;
  teamCode: string;
  category: CategoryId;
}

/**
 * PRD 11 – Share Screen: renders the result card to a PNG via html-to-image
 * ("render tu HTML Canvas") for Save Image / Share.
 */
export default function SharePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const resolvedTheme = useSettingsStore((s) => s.resolvedTheme);
  const reduceMotion = useSettingsStore((s) => s.reduceMotion);
  const lastHistory = useHistoryStore((s) => s.results[0]);
  const show = useToastStore((s) => s.show);
  const cardRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);

  const stateResult = (location.state as { result?: ShareResult } | null)?.result;
  const result: ShareResult | null =
    stateResult ??
    (lastHistory
      ? {
          teamId: lastHistory.teamId,
          teamName: lastHistory.teamName,
          teamCode: lastHistory.teamCode,
          category: lastHistory.category
        }
      : null);

  async function handleSave() {
    if (!cardRef.current) return;
    setBusy(true);
    try {
      const dataUrl = await renderNodeToPng(cardRef.current);
      downloadDataUrl(dataUrl, `team-wheel-${Date.now()}.png`);
      haptic('light');
      show(t('toast.imageSaved'), 'success');
    } finally {
      setBusy(false);
    }
  }

  async function handleShare() {
    if (!cardRef.current || !result) return;
    setBusy(true);
    try {
      const dataUrl = await renderNodeToPng(cardRef.current);
      const text = t('share.shareText', { team: result.teamName }) as string;
      const outcome = await shareImage(dataUrl, `team-wheel-${Date.now()}.png`, text);
      haptic('light');
      if (outcome === 'copied') {
        show(t('toast.copied'), 'success');
      } else if (outcome === 'unsupported') {
        downloadDataUrl(dataUrl, `team-wheel-${Date.now()}.png`);
        show(t('toast.imageSaved'), 'success');
      } else if (outcome === 'failed') {
        show(t('toast.shareFailed'), 'danger');
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={`app ${resolvedTheme}${reduceMotion ? ' reduceMotion' : ''}`}>
      <section className="shell">
        <BackHeader title={t('result.share')} onBack={() => navigate(-1)} />

        {!result ? (
          <div className="emptyResult">{t('share.noResult')}</div>
        ) : (
          <>
            <div className="shareCardWrap">
              <div ref={cardRef} className={`shareCard shareCard-${resolvedTheme}`}>
                <p className="shareCardEyebrow">{t('share.title')}</p>
                <TeamBadge teamId={result.teamId} name={result.teamName} code={result.teamCode} size="large" />
                <h2>{result.teamName}</h2>
                <p className="shareCardCategory">{t(`category.${result.category}`)}</p>
                <p className="shareCardFooter">{t('share.generatedBy')}</p>
              </div>
            </div>

            <div className="actions">
              <button className="primary" onClick={handleSave} disabled={busy}>
                <Download size={18} />
                {t('share.save')}
              </button>
              <button className="secondary" onClick={handleShare} disabled={busy}>
                <Share2 size={18} />
                {t('share.shareBtn')}
              </button>
            </div>

            <button className="secondary block" onClick={() => navigate('/home')}>
              {t('result.backHome')}
            </button>
          </>
        )}
      </section>
    </div>
  );
}
