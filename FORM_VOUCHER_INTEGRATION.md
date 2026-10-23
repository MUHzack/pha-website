# Form & Voucher Integration Guide

## Overview

Dokumen ini menjelaskan integrasi antara **pha-development** (kiosk app) dan **pha-website** (web download) untuk fitur:
1. Form feedback sebelum download
2. Generate voucher setelah submit form
3. Frame selection untuk foto satuan

---

## Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              PHA-DEVELOPMENT (KIOSK)                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Sesi Foto → Preview → Cetak → SoftfileQrScreen                            │
│                                      ↓                                      │
│                            Generate QR Code                                 │
│                     (URL: https://phaqr.my.id/{sessionId})                  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                       │
                                       │ User scan QR
                                       ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│                                PHA-WEBSITE (WEB)                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  1. Check form status: GET /form/{sessionId}                     │
│     Response: { submitted: false }                                          │
│                                                                             │
│  2. Display Form Page                                                       │
│     ┌─────────────────────────────────────┐                                │
│     │  Customer Review          │                                │
│     │  - Rating 1-5, nama, gender, tanggal lahir                  │                                │
│     │  - No. HP dan email (opsional)                 │                                │
│     │  - Pesan (wajib)                │                                │
│     │                │                                │
│     │  [Submit]                           │                                │
│     └─────────────────────────────────────┘                                │
│                                                                             │
│  3. Submit form: POST /form/{sessionId}/submit                          │
│     Body: { rating, name, gender, birthDate, email, phone, feedback }                                  │
│     Response: {                                                             │
│       success: true,                                                        │
│       voucher: {                                                            │
│         code: "A7X9B",                                                      │
│         discountPercent: 10,                                                │
│         discountAmount: 3500,                                               │
│         message: "Voucher berlaku untuk 1x transaksi berikutnya"            │
│       }                                                                     │
│     }                                                                       │
│                                                                             │
│  4. Display Voucher Page                                                    │
│     ┌─────────────────────────────────────┐                                │
│     │  Terima kasih atas feedback Anda!   │                                │
│     │                                     │                                │
│     │  Kode Voucher: A7X9B                │                                │
│     │  Diskon: 10% untuk transaksi        │                                │
│     │         berikutnya                  │                                │
│     │                                     │                                │
│     │  [Lanjut Download]                  │                                │
│     └─────────────────────────────────────┘                                │
│                                                                             │
│  5. Download Page                                                           │
│     ┌─────────────────────────────────────┐                                │
│     │  Download Hasil Foto                │                                │
│     │                                     │                                │
│     │  [Strip Photo]  [GIF]               │                                │
│     │  [Live Photo]   [Foto Satuan]       │                                │
│     │                                     │                                │
│     │  * Foto Satuan: Pilih Frame         │                                │
│     │    - Frame 1   - Frame 2            │                                │
│     │    - Frame 3   - Frame 4            │                                │
│     │    [Download dengan Frame]          │                                │
│     └─────────────────────────────────────┘                                │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                       │
                                       │ User kembali ke kiosk
                                       ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│                              PHA-DEVELOPMENT (KIOSK)                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  User input voucher code saat pembayaran sesi foto baru                     │
│     ↓                                                                       │
│  Validate: photobox.vouchers.redeem(code)                                   │
│     Response: { ok: true, discountMode: 'percent', discountValue: 10 }      │
│     ↓                                                                       │
│  Apply discount 10% (Rp 3.500 dari Rp 35.000)                               │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## API Endpoints

### 1. Check Form Status

The website checks `photobox_download_forms` in Supabase directly through its same-origin Route Handler. This avoids depending on the kiosk's local HTTP server for the form gate.

The kiosk also exposes `GET /form/{sessionId}` on its configured download-server port for other clients.

**Response:**
```json
{
  "submitted": false
}
```

atau jika sudah submit:
```json
{
  "submitted": true,
  "submittedAt": "2026-10-21T18:30:00Z"
}
```

---

### 2. Submit Form

**Website endpoint:** `POST /api/form/{sessionId}`

Website validates the session and calls the `submit_photobox_customer_review` Supabase function. The database transaction creates the voucher and saves the review together, enforcing one submission per session. The kiosk's legacy endpoint remains `POST /form/{sessionId}/submit`.

**Request Body:**
```json
{
  "rating": 5,
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "08123456789",
  "gender": "female",
  "birthDate": "1995-06-15",
  "feedback": "Pengalaman yang menyenangkan!"
}
```

**Response (Success):**
```json
{
  "success": true,
  "voucher": {
    "code": "A7X9B",
    "discountPercent": 10,
    "discountAmount": 3500,
    "message": "Voucher berlaku untuk 1x transaksi berikutnya di Photogenics"
  }
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "Form sudah pernah diisi untuk session ini"
}
```

---

## Database Schema

### Table: `photobox_download_forms`

```sql
CREATE TABLE IF NOT EXISTS photobox_download_forms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL REFERENCES photobox_sessions(session_id) ON DELETE CASCADE,
  name text,
  gender text,
  birth_date date,
  email text,
  phone text,
  rating smallint CHECK (rating BETWEEN 1 AND 5),
  feedback text NOT NULL,
  voucher_code text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(session_id)
);

CREATE INDEX idx_download_forms_session ON photobox_download_forms(session_id);
CREATE INDEX idx_download_forms_voucher ON photobox_download_forms(voucher_code);

-- Additions for existing installations; old rows can keep rating NULL
ALTER TABLE photobox_download_forms ADD COLUMN IF NOT EXISTS gender text;
ALTER TABLE photobox_download_forms ADD COLUMN IF NOT EXISTS birth_date date;
ALTER TABLE photobox_download_forms ADD COLUMN IF NOT EXISTS rating smallint CHECK (rating BETWEEN 1 AND 5);
```

### Table: `photobox_vouchers` (Existing - with new field)

```sql
ALTER TABLE photobox_vouchers ADD COLUMN IF NOT EXISTS source text;
-- source values: 'manual' | 'form_feedback'
```

### Table: `photobox_payment_settings` (Existing - with new field)

```sql
ALTER TABLE photobox_payment_settings 
ADD COLUMN IF NOT EXISTS form_voucher_discount_percent bigint DEFAULT 10;
```

---

## Voucher Code Generation

### Algorithm:

```typescript
function generateVoucherCode(): string {
  // Karakter mudah dibaca, exclude ambigu: I, O, 0, 1
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const randomBytes = crypto.randomBytes(5)
  let code = ''
  for (let i = 0; i < 5; i++) {
    code += chars[randomBytes[i] % chars.length]
  }
  return code
}

// Example outputs: "A7X9B", "K3MP2", "H8NJ5"
```

### Characteristics:
- 5 karakter alphanumeric
- Exclude huruf ambigu (I, O) dan angka (0, 1) untuk menghindari kebingungan
- Di-hash dengan SHA256 sebelum disimpan ke database
- Plain code ditampilkan sekali ke user saat generate
- `usage_limit: 1` (hanya bisa dipakai sekali)

---

## PHA-WEBSITE Integration

### 1. Environment Variables

```env
# Vercel server-side secret. Never prefix this with NEXT_PUBLIC_.
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Enable the frame selector for single photos only when the feature is ready.
# Defaults to disabled when unset or set to false.
ENABLE_SINGLE_PHOTO_FRAMES=false
```

Browser website memanggil Route Handler same-origin `/api/form/{sessionId}`. Status dibaca dari Supabase dan submit diproses server-side dengan service-role key. Browser tidak menerima key tersebut dan tidak memerlukan koneksi ke server kiosk. Frame selector foto satuan dinonaktifkan secara default; set `ENABLE_SINGLE_PHOTO_FRAMES=true` di environment Vercel untuk mengaktifkannya, lalu redeploy.

### 2. API Client

```typescript
// lib/api.ts
// Browser calls go through the website's same-origin Route Handler.

export async function checkFormStatus(sessionId: string): Promise<{ submitted: boolean; submittedAt?: string }> {
  const res = await fetch(`/api/form/${encodeURIComponent(sessionId)}`)
  return res.json()
}

export async function submitForm(
  sessionId: string, 
  data: { rating: number; name?: string; gender?: string; birthDate?: string; email?: string; phone?: string; feedback: string }
): Promise<{
  success: boolean
  voucher?: {
    code: string
    discountPercent: number
    discountAmount: number
    message: string
  }
  error?: string
}> {
  const res = await fetch(`/api/form/${encodeURIComponent(sessionId)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  return res.json()
}
```

### 3. Form Page Example

```tsx
// app/form/[sessionId]/page.tsx
'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { checkFormStatus, submitForm } from '@/lib/api'

export default function FormPage() {
  const params = useParams()
  const router = useRouter()
  const sessionId = params.sessionId as string
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    feedback: ''
  })
  const [loading, setLoading] = useState(false)
  const [voucher, setVoucher] = useState<any>(null)
  const [checking, setChecking] = useState(true)
  const [alreadySubmitted, setAlreadySubmitted] = useState(false)

  React.useEffect(() => {
    checkFormStatus(sessionId).then((result) => {
      setAlreadySubmitted(result.submitted)
      setChecking(false)
    })
  }, [sessionId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const result = await submitForm(sessionId, formData)
      if (result.success) {
        setVoucher(result.voucher)
      } else {
        alert(result.error)
      }
    } catch (error) {
      alert('Terjadi kesalahan, silakan coba lagi')
    } finally {
      setLoading(false)
    }
  }

  if (checking) {
    return <div>Loading...</div>
  }

  if (alreadySubmitted) {
    router.push(`/download/${sessionId}`)
    return null
  }

  if (voucher) {
    return (
      <div className="voucher-page">
        <h1>Terima kasih atas feedback Anda!</h1>
        <div className="voucher-card">
          <p>Kode Voucher:</p>
          <h2 className="voucher-code">{voucher.code}</h2>
          <p>Diskon {voucher.discountPercent}% untuk transaksi berikutnya</p>
          <p className="voucher-note">{voucher.message}</p>
        </div>
        <button onClick={() => router.push(`/download/${sessionId}`)}>
          Lanjut Download
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="form-page">
      <h1>Feedback Photogenics</h1>
      
      <input
        type="text"
        placeholder="Nama (opsional)"
        value={formData.name}
        onChange={(e) => setFormData({...formData, name: e.target.value})}
      />
      
      <input
        type="email"
        placeholder="Email (opsional)"
        value={formData.email}
        onChange={(e) => setFormData({...formData, email: e.target.value})}
      />
      
      <input
        type="tel"
        placeholder="No. HP (opsional)"
        value={formData.phone}
        onChange={(e) => setFormData({...formData, phone: e.target.value})}
      />
      
      <textarea
        placeholder="Bagaimana pengalaman Anda? *"
        value={formData.feedback}
        onChange={(e) => setFormData({...formData, feedback: e.target.value})}
        required
      />
      
      <button type="submit" disabled={loading || !formData.feedback}>
        {loading ? 'Menyimpan...' : 'Submit'}
      </button>
    </form>
  )
}
```

### 4. Frame Selection for Foto Satuan

Frame selection diimplementasikan di PHA-WEBSITE dengan data dari `photobox_templates` table.

**API Endpoint:**
```
GET /api/templates?kind=frame
```

**Response:**
```json
{
  "templates": [
    {
      "id": "frame-1",
      "name": "Classic Frame",
      "previewUrl": "https://storage.../frame-1-preview.jpg",
      "overlayUrl": "https://storage.../frame-1-overlay.png"
    }
  ]
}
```

Frame overlay diaplikasikan ke foto satuan menggunakan library seperti `sharp` atau `canvas` di server-side.

---

## Admin Configuration

### Payment Settings

Di halaman Admin → Payment Settings, tersedia field baru:

**Form Voucher Discount (%)**
- Persentase diskon untuk voucher dari form feedback
- Default: 10%
- Contoh: 10% dari Rp 35.000 = Rp 3.500

### Settings Type

```typescript
interface PhotoboxSettings {
  // ... existing fields
  
  // Form & Voucher Settings
  formVoucherDiscountPercent?: number  // Discount percentage (default: 10)
}
```

---

## Security Considerations

### 1. Form Submission
- Validasi `sessionId` exists dan belum expired
- Hanya bisa submit sekali per session (UNIQUE constraint di database)
- Feedback wajib diisi, field lain opsional

### 2. Voucher Code Security
- Hash SHA256 sebelum simpan ke database
- Plain code hanya ditampilkan sekali saat generate
- Tidak pernah expose `code_sha256` ke client
- `usage_limit: 1` memastikan hanya bisa dipakai sekali

### 3. Collision Handling
- Cek keunikan kode sebelum insert
- Retry sampai 10x untuk generate kode unik
- Jika gagal, return error ke user

---

## Testing Checklist

### PHA-DEVELOPMENT (Backend):
- [ ] Form status check API works
- [ ] Form submission API works
- [ ] Voucher generated correctly (5 chars, unique)
- [ ] Voucher stored in database with correct hash
- [ ] Discount applied correctly when redeemed
- [ ] Admin can configure discount percentage
- [ ] Form can only be submitted once per session

### PHA-WEBSITE (Frontend):
- [ ] Form page displays correctly
- [ ] Form validation works
- [ ] Voucher displayed after submission
- [ ] Download page shows all 4 file types
- [ ] Frame selection works for foto satuan

### Integration:
- [ ] QR scan → form → voucher → download flow works end-to-end
- [ ] Voucher can be redeemed in kiosk
- [ ] Voucher only usable once
- [ ] Form can only be submitted once per session

---

## Migration SQL

Run this migration to add new tables and fields:

```sql
-- 1. Create download forms table
CREATE TABLE IF NOT EXISTS photobox_download_forms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL REFERENCES photobox_sessions(session_id) ON DELETE CASCADE,
  name text,
  gender text,
  birth_date date,
  email text,
  phone text,
  rating smallint CHECK (rating BETWEEN 1 AND 5),
  feedback text NOT NULL,
  voucher_code text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(session_id)
);

-- 1a. Add fields to installations that already have this table
ALTER TABLE photobox_download_forms ADD COLUMN IF NOT EXISTS gender text;
ALTER TABLE photobox_download_forms ADD COLUMN IF NOT EXISTS birth_date date;
ALTER TABLE photobox_download_forms ADD COLUMN IF NOT EXISTS rating smallint CHECK (rating BETWEEN 1 AND 5);

-- 2. Create indexes
CREATE INDEX IF NOT EXISTS idx_download_forms_session ON photobox_download_forms(session_id);
CREATE INDEX IF NOT EXISTS idx_download_forms_voucher ON photobox_download_forms(voucher_code);

-- 3. Add source column to vouchers
ALTER TABLE photobox_vouchers ADD COLUMN IF NOT EXISTS source text;

-- 4. Add form voucher discount setting
ALTER TABLE photobox_payment_settings 
ADD COLUMN IF NOT EXISTS form_voucher_discount_percent bigint DEFAULT 10;

-- 5. Keep customer review fields private to server-side service-role access
ALTER TABLE photobox_download_forms ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow anon all" ON photobox_download_forms;
REVOKE ALL ON TABLE photobox_download_forms FROM anon, authenticated;
GRANT ALL ON TABLE photobox_download_forms TO service_role;
```

Run `supabase/migrations/202610230002_submit_photobox_customer_review.sql` to install the server-only atomic submit function and permissions.

---

## Files Modified/Created

### Created:
- `src/main/services/forms.ts` - FormService class
- `docs/FORM_VOUCHER_INTEGRATION.md` - This documentation

### Modified:
- `src/main/services/downloadServer.ts` - Added form endpoints
- `src/shared/types.ts` - Added form-related types
- `src/renderer/src/pages/admin/PaymentSettings.tsx` - Added discount config UI

---

## Next Steps

1. **Run SQL migrations** di Supabase, termasuk `supabase/migrations/202610230002_submit_photobox_customer_review.sql`
2. **Setup PHA-WEBSITE** dengan halaman form dan download
3. **Test end-to-end** flow dari scan QR sampai redeem voucher
4. **Deploy** kedua aplikasi

---

*Dokumen ini dibuat pada: 2026-10-21*
*Terakhir diperbarui: 2026-10-21*
