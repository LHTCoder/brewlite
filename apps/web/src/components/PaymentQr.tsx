'use client';
import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { formatVND } from '@/lib/pricing';

/** Nội dung mã QR: gắn với đúng một đơn (mã đơn + số tiền + id đơn) nên mỗi đơn có một QR khác nhau */
export function qrPayload(order: { id: string; code: string; total: number }): string {
  const qs = new URLSearchParams({ order: order.code, amount: String(order.total), ref: order.id });
  return `brewlite://pay?${qs.toString()}`;
}

/** FR-08 Mã QR minh họa để khách quét khi thanh toán bằng ví (mô phỏng, không chuyển tiền thật) */
export function PaymentQr({ order }: { order: { id: string; code: string; total: number } }) {
  const payload = qrPayload(order);
  const [svg, setSvg] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    QRCode.toString(payload, { type: 'svg', margin: 1, errorCorrectionLevel: 'M', color: { dark: '#3b2417', light: '#ffffff' } })
      .then((s) => alive && setSvg(s))
      .catch(() => alive && setSvg(null));
    return () => {
      alive = false;
    };
  }, [payload]);

  return (
    <div className="mt-3 flex flex-col items-center rounded-2xl border border-brew-200 bg-white p-4 text-center" data-testid="payment-qr" data-qr-payload={payload}>
      <p className="text-sm font-semibold">Quét mã để thanh toán đơn {order.code}</p>
      <div className="mt-3 h-52 w-52">
        {svg ? (
          <img src={`data:image/svg+xml;utf8,${encodeURIComponent(svg)}`} alt={`Mã QR thanh toán đơn ${order.code}`} className="h-full w-full" />
        ) : (
          <div className="h-full w-full animate-pulse rounded-xl bg-brew-50" />
        )}
      </div>
      <p className="mt-2 text-lg font-bold text-brew-700">{formatVND(order.total)}</p>
      <p className="mt-1 text-xs text-brew-400">
        Mở ứng dụng ngân hàng và quét mã, rồi bấm nút bên dưới. Mã QR là minh họa (mô phỏng), không chuyển tiền thật.
      </p>
    </div>
  );
}
