import { NextResponse } from 'next/server';
import { pb } from '@/lib/pocketbase';

function formatICSDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

function escapeICS(str: string): string {
  return str.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
}

export async function GET(request: Request) {
  const events: Array<{
    uid: string;
    summary: string;
    description: string;
    start: Date;
    end: Date;
    location?: string;
  }> = [];

  try {
    // 1. Ambil data sesi konsultasi / booking dari PocketBase
    const bookings = await pb.collection('consultation_bookings').getFullList({
      filter: 'payment_status = "paid"',
      expand: 'user_id,service_id',
    });

    bookings.forEach((b) => {
      const startTime = b.scheduled_time ? new Date(b.scheduled_time) : new Date(b.created);
      const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // 1 jam sesi
      const clientEmail = b.expand?.user_id?.email || 'Klien Terdaftar';
      const serviceTitle = b.expand?.service_id?.title || 'Konseling Privat';

      events.push({
        uid: `consultation-${b.id}@hrtech.id`,
        summary: `[Konseling] ${serviceTitle} - ${clientEmail}`,
        description: `Sesi Konseling HRTech\\nKlien: ${clientEmail}\\nLayanan: ${serviceTitle}\\nTopik: ${b.topic || '-'}\\nID Booking: ${b.id}`,
        start: startTime,
        end: endTime,
        location: 'Online via WhatsApp / Google Meet',
      });
    });

    // 2. Ambil data lamaran kandidat yang statusnya interview
    const interviews = await pb.collection('job_applications').getFullList({
      filter: 'status = "interview"',
      expand: 'job_id,candidate_id.user_id',
    });

    interviews.forEach((app) => {
      const startTime = new Date(app.updated || app.created);
      const endTime = new Date(startTime.getTime() + 45 * 60 * 1000); // 45 menit
      const jobTitle = app.expand?.job_id?.title || 'Lowongan';
      const candidateEmail = app.expand?.candidate_id?.expand?.user_id?.email || `Kandidat #${app.candidate_id}`;

      events.push({
        uid: `interview-${app.id}@hrtech.id`,
        summary: `[Interview Kerja] ${jobTitle} - ${candidateEmail}`,
        description: `Wawancara Rekrutmen HRTech\\nPosisi: ${jobTitle}\\nKandidat: ${candidateEmail}\\nSkor Match: ${app.match_score ?? '-'}%\\nSkor Tes: ${app.test_score ?? '-'}`,
        start: startTime,
        end: endTime,
        location: 'Virtual Interview Room',
      });
    });
  } catch (err) {
    console.error('Error fetching data for ICS calendar:', err);
  }

  // Jika database kosong, sediakan dummy events agar admin bisa langsung preview karakteristik sinkronisasi
  if (events.length === 0) {
    const now = new Date();
    const tomorrow10AM = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 10, 0, 0);
    const dayAfter2PM = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2, 14, 0, 0);
    const dayAfter4PM = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 3, 16, 0, 0);

    events.push(
      {
        uid: 'demo-interview-1@hrtech.id',
        summary: '[Interview] Senior Frontend Engineer - rizky.kandidat@gmail.com',
        description: 'Sesi Interview Tahap 2\\nPosisi: Senior Frontend Engineer\\nMatch Score: 94%\\nSkor Tes: 88/100',
        start: tomorrow10AM,
        end: new Date(tomorrow10AM.getTime() + 45 * 60 * 1000),
        location: 'Google Meet (meet.google.com/hrtech-demo)',
      },
      {
        uid: 'demo-consultation-2@hrtech.id',
        summary: '[Konseling] Decision-Making & Life-Path Coaching - anisa.b2c@gmail.com',
        description: 'Sesi Konseling Privat\\nTopik: Transisi Karier & Negosiasi Kontrak Kerja\\nPembayaran: LUNAS',
        start: dayAfter2PM,
        end: new Date(dayAfter2PM.getTime() + 60 * 60 * 1000),
        location: 'WhatsApp Call / Video Room',
      },
      {
        uid: 'demo-interview-3@hrtech.id',
        summary: '[Interview] HR Generalist UMKM - bayu.recruiter@gmail.com',
        description: 'Interview Kandidat HR Generalist untuk Mitra Retail UMKM\\nSkor Psikometri: 92/100',
        start: dayAfter4PM,
        end: new Date(dayAfter4PM.getTime() + 45 * 60 * 1000),
        location: 'Virtual Interview',
      }
    );
  }

  // Buat string kalender format standar iCalendar (RFC 5545)
  let icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//HRTech Industrial//Interview & Consultation Calendar//ID',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:HRTech Interview & Konseling',
    'X-WR-TIMEZONE:Asia/Jakarta',
  ];

  events.forEach((ev) => {
    icsContent.push(
      'BEGIN:VEVENT',
      `UID:${ev.uid}`,
      `DTSTAMP:${formatICSDate(new Date())}`,
      `DTSTART:${formatICSDate(ev.start)}`,
      `DTEND:${formatICSDate(ev.end)}`,
      `SUMMARY:${escapeICS(ev.summary)}`,
      `DESCRIPTION:${escapeICS(ev.description)}`,
      ev.location ? `LOCATION:${escapeICS(ev.location)}` : '',
      'STATUS:CONFIRMED',
      'END:VEVENT'
    );
  });

  icsContent.push('END:VCALENDAR');

  const fileBody = icsContent.filter(Boolean).join('\r\n');

  return new NextResponse(fileBody, {
    status: 200,
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': 'attachment; filename="hrtech-interviews.ics"',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  });
}
