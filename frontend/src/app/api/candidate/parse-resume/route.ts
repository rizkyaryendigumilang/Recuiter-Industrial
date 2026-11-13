import { NextRequest, NextResponse } from 'next/server';
import { extractTextFromPdfBuffer, detectIndustrialCompetencies } from '@/lib/pdf-parser';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('resume');

    if (!file || typeof file === 'string' || !(file instanceof Blob)) {
      return NextResponse.json(
        { error: 'File resume PDF wajib disertakan.' },
        { status: 400 }
      );
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Ukuran file melebihi batas 10MB.' },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 1. Ekstrak teks riil dari struktur PDF stream
    const rawText = extractTextFromPdfBuffer(buffer);

    // 2. Deteksi kompetensi manufaktur
    const skills = detectIndustrialCompetencies(rawText);

    return NextResponse.json({
      success: true,
      text_length: rawText.length,
      snippet: rawText.slice(0, 200),
      detected_skills: skills,
    });
  } catch (err: any) {
    console.error('Error parsing resume PDF:', err);
    return NextResponse.json(
      { error: err?.message || 'Gagal memproses resume PDF' },
      { status: 500 }
    );
  }
}
