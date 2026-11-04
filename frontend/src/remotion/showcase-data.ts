export interface ShowcaseSlideData {
  id: string;
  stepNumber: string;
  tabLabel: string;
  routePath: string;
  kicker: string;
  headline: string;
  highlightWord: string;
  subheadline: string;
  /** Penjelasan fitur lebih mendalam dengan bahasa sehari-hari yang mudah dipahami */
  elaboratedDescription: string;
  /** Langkah cara pakai fitur (kalimat aktif sesuai standar Technical Writer) */
  workflowSteps: string[];
  /** Caption khusus untuk postingan slide tunggal / penjelasan per scene */
  slideCaption: string;
  webImage: string;
  mobileImage: string;
  /** Focal point (percentage 0-100) for the Web View zoom-in effect */
  zoomTarget: {
    originX: number;
    originY: number;
    maxScale: number;
    focusLabel: string;
  };
  metrics: {
    value: string;
    label: string;
  }[];
  technicalBullets: string[];
  accentColor: string;
  theme: 'dark' | 'light';
}

export const SHOWCASE_SLIDES: ShowcaseSlideData[] = [
  {
    id: '00-cover',
    stepNumber: '00',
    tabLabel: 'Ringkasan Aplikasi',
    routePath: '/recruiter',
    kicker: 'APLIKASI REKRUTMEN PABRIK · WEB & HP (ANDROID / iOS)',
    headline: 'Aplikasi Rekrutmen Pabrik, Cek CV Otomatis, dan',
    highlightWord: 'Tes Koran HP.',
    subheadline:
      'Satu aplikasi Web dan HP untuk menyeleksi operator produksi, teknisi mesin, dan staf QC. Mulai dari baca CV PDF otomatis, ujian hitung cepat Kraepelin, sampai cetak rapor psikotes 1 halaman.',
    elaboratedDescription:
      'Dirancang khusus untuk menjawab tiga kendala utama HRD pabrik: tumpukan ratusan file CV PDF yang harus dibaca satu per satu, tes hitung koran (Kraepelin/Pauli) di kertas lebar yang memakan waktu koreksi berjam-jam, serta jadwal wawancara yang berantakan di grup chat. Seluruh proses seleksi kini berjalan otomatis dari browser komputer HRD maupun layar HP pelamar.',
    workflowSteps: [
      'Pelamar memilih lowongan kawasan industri dan mengunggah file CV PDF dari HP.',
      'Sistem otomatis membaca isi CV, menandai keahlian mesin, lalu mengarahkan pelamar ke ruang ujian hitung cepat (Kraepelin) dan tes karakter kerja (DISC).',
      'HRD langsung menerima lembar hasil psikotes (psikogram) 1 halaman dan memindahkan status pelamar di papan seleksi.',
    ],
    slideCaption:
      'Masih periksa ratusan CV PDF dan koreksi kertas tes koran secara manual? Recruiter Industrial merangkum seluruh tahapan seleksi pabrik ke dalam satu aplikasi Web & HP (Android/iOS). Geser slide untuk melihat cara kerja 10 fiturnya secara langsung.',
    webImage: '01-home-web.png',
    mobileImage: '05-kraepelin-mobile.png',
    zoomTarget: {
      originX: 50,
      originY: 42,
      maxScale: 1.28,
      focusLabel: '3 Jalur Utama: Perusahaan, Pelamar, & Psikotes (Akurasi 94,2%)',
    },
    metrics: [
      { value: '94,2%', label: 'Kecocokan Baca CV' },
      { value: '60 FPS', label: 'Tombol Hitung Cepat' },
      { value: '1 Halaman', label: 'Rapor Psikotes PDF' },
    ],
    technicalBullets: [
      'Buka langsung di browser komputer HRD atau pasang sebagai aplikasi HP Android (.APK) dan iPhone (.IPA)',
      'Hemat waktu koreksi manual: skor kecepatan hitung, ketelitian, dan grafik fokus terhitung otomatis begitu ujian selesai',
      'Aman dipakai di area pabrik yang sinyalnya kurang stabil berkat penyimpanan cadangan lokal di perangkat',
    ],
    accentColor: '#D97706',
    theme: 'dark',
  },
  {
    id: '01-home',
    stepNumber: '01',
    tabLabel: 'Tab 1 · Halaman Utama',
    routePath: '/recruiter',
    kicker: 'TAB 01 / 10 · BERANDA & PEMBAGIAN JALUR PENGGUNA',
    headline: 'Halaman Utama Terpisah untuk Pelamar, HRD, dan',
    highlightWord: 'Layanan Psikotes.',
    subheadline:
      'Tampilan depan langsung membagi jalur akses sesuai kebutuhan: pelamar mencari lowongan pabrik, perusahaan menguji kandidat, dan biro psikologi membuka jadwal konsultasi.',
    elaboratedDescription:
      'Pengunjung tidak perlu bingung mencari menu. Halaman depan menyajikan ringkasan angka pencapaian sistem, penjelasan alur seleksi dari tahap daftar sampai tanda tangan kontrak, serta tombol ganti bahasa Indonesia dan Inggris secara instan.',
    workflowSteps: [
      'Pilih salah satu dari 3 kartu layanan utama di bagian atas halaman sesuai peran Anda.',
      'Pelajari 5 tahapan alur seleksi pada bagan alur kerja interaktif di tengah halaman.',
      'Klik tombol bendera ID / EN di pojok kanan atas untuk mengubah bahasa tampilan tanpa memuat ulang halaman.',
    ],
    slideCaption:
      'Tab 1:Halaman Utama yang rapi dan mudah dipahami. Begitu dibuka di laptop maupun HP, pengguna langsung diarahkan ke 3 jalur jelas: Bursa Lowongan Pabrik, Sistem Seleksi Perusahaan, atau Katalog Layanan Psikotes.',
    webImage: '01-home-web.png',
    mobileImage: '01-home-mobile.png',
    zoomTarget: {
      originX: 50,
      originY: 78,
      maxScale: 1.35,
      focusLabel: 'Zoom-In: Ringkasan Akurasi 94,2%, Cetak PDF, & Kalender Wawancara',
    },
    metrics: [
      { value: '3 Jalur', label: 'HRD, Pelamar, & Biro' },
      { value: 'ID / EN', label: '2 Bahasa Instan' },
      { value: '< 1,2 dtk', label: 'Buka Halaman Cepat' },
    ],
    technicalBullets: [
      'Menampilkan 4 indikator utama di layar depan: akurasi pencocokan CV 94,2%, 3 jalur pengguna, cetak rapor PDF, dan jadwal kalender',
      'Menyediakan bagan alur rekrutmen 5 langkah agar pelamar baru memahami urutan tahapan tes sebelum mendaftar',
      'Mendukung penggantian bahasa Indonesia dan Inggris sekali klik untuk perusahaan penanaman modal asing (PMA)',
    ],
    accentColor: '#D97706',
    theme: 'light',
  },
  {
    id: '02-jobs',
    stepNumber: '02',
    tabLabel: 'Tab 2 · Info Lowongan',
    routePath: '/recruiter/jobs',
    kicker: 'TAB 02 / 10 · PAPAN LOWONGAN KERJA MANUFAKTUR',
    headline: 'Cari Lowongan Pabrik Berdasarkan Kawasan dan',
    highlightWord: 'Keahlian Mesin.',
    subheadline:
      'Pelamar bisa menyaring lowongan kerja berdasarkan lokasi kawasan industri (Karawang, Cikarang, Jababeka, Cikande), jenis kontrak, serta syarat sertifikasi teknik.',
    elaboratedDescription:
      'Berbeda dari portal lowongan umum, papan lowongan ini dirancang khusus untuk dunia industri dan pabrik. Setiap lowongan mencantumkan kawasan industri secara spesifik, kisaran gaji bulanan yang jelas, serta label keahlian teknis yang wajib dimiliki pelamar.',
    workflowSteps: [
      'Ketik nama posisi (contoh: Operator CNC atau QC Inspector) atau pilih filter kawasan industri.',
      'Periksa label syarat keahlian teknis dan kisaran gaji pada kartu lowongan.',
      'Klik tombol Lamar Sekarang untuk mengirim CV atau klik Latihan Tes untuk mencoba simulasi ujian hitung cepat.',
    ],
    slideCaption:
      'Tab 2:Papan Lowongan Kerja Khusus Kawasan Industri. Pelamar bisa langsung memfilter lowongan di KIIC Karawang, MM2100 Cikarang, Jababeka, hingga Cikande lengkap dengan info gaji dan syarat keahlian mesin.',
    webImage: '02-jobs-web.png',
    mobileImage: '02-jobs-mobile.png',
    zoomTarget: {
      originX: 30,
      originY: 58,
      maxScale: 1.38,
      focusLabel: 'Zoom-In: Detail Lowongan PT Astra Otoparts & Label Keahlian Mesin',
    },
    metrics: [
      { value: '24+ Skill', label: 'Label Keahlian Pabrik' },
      { value: '4 Kawasan', label: 'Filter Lokasi Pabrik' },
      { value: '1 Klik', label: 'Lamar & Latihan Tes' },
    ],
    technicalBullets: [
      'Setiap kartu lowongan memuat nama perusahaan, lokasi kawasan industri, kisaran gaji transparan, dan batas kuota pelamar',
      'Dilengkapi label keahlian pabrik spesifik: PLC Siemens S7, CNC Milling 3-Axis, ISO 9001:2015, Ahli K3 Umum, dan SIO Forklift',
      'Menyediakan tombol pintas ke ruang latihan tes koran agar pelamar bisa melakukan pemanasan sebelum mengirim lamaran',
    ],
    accentColor: '#D97706',
    theme: 'dark',
  },
  {
    id: '03-services',
    stepNumber: '03',
    tabLabel: 'Tab 3 · Katalog Layanan',
    routePath: '/recruiter/services',
    kicker: 'TAB 03 / 10 · PENJUALAN PAKET PSIKOTES & KONSELING',
    headline: 'Jual Paket Psikotes Massal, Konseling Kerja, dan',
    highlightWord: 'Bedah CV.',
    subheadline:
      'Selain dipakai rekrutmen internal, aplikasi ini siap menghasilkan pemasukan tambahan dari penjualan paket tes karyawan perusahaan, review CV teknik, dan konsultasi karir.',
    elaboratedDescription:
      'Cocok bagi biro psikologi, konsultan HR, maupun pemilik platform yang ingin membuka layanan berbayar. Klien perusahaan bisa memesan paket asesmen psikotes massal atau audit kelelahan kerja shift, sedangkan pelamar individu bisa memesan sesi bedah CV dan latihan wawancara.',
    workflowSteps: [
      'Pilih tab kategori layanan: Semua Layanan, Konseling Individu, Paket Perusahaan (B2B), atau Bedah CV.',
      'Bandingkan durasi sesi, rincian fasilitas yang didapat, serta tarif resmi pada tiap kartu paket.',
      'Klik tombol Pesan Jadwal untuk memilih tanggal sesi dan melanjutkan ke halaman pembayaran.',
    ],
    slideCaption:
      'Tab 3:Katalog Layanan Psikotes & Konseling Berbayar. Ubah aplikasi ini menjadi sumber pendapatan rutin dengan menjual paket psikotes massal untuk pabrik, audit beban kerja shift, hingga sesi bedah CV pelamar.',
    webImage: '03-services-web.png',
    mobileImage: '03-services-mobile.png',
    zoomTarget: {
      originX: 65,
      originY: 62,
      maxScale: 1.34,
      focusLabel: 'Zoom-In: Paket Psikotes Massal Pabrik & Audit Beban Kerja Shift',
    },
    metrics: [
      { value: '4 Kategori', label: 'Pilihan Paket Layanan' },
      { value: 'B2B & B2C', label: 'Klien Pabrik & Umum' },
      { value: 'Tanpa Kode', label: 'Ubah Harga via Admin' },
    ],
    technicalBullets: [
      'Menyediakan penyaring kategori instan untuk memisahkan layanan perusahaan (B2B) dan layanan pelamar perorangan',
      'Setiap kartu layanan menampilkan harga resmi, durasi pengerjaan, dan daftar fasilitas secara jelas',
      'Admin dapat menambah paket baru, mengubah harga, atau menonaktifkan layanan kapan saja dari dashboard tanpa mengubah kode',
    ],
    accentColor: '#10B981',
    theme: 'light',
  },
  {
    id: '04-booking',
    stepNumber: '04',
    tabLabel: 'Tab 4 · Bayar Kode Unik',
    routePath: '/recruiter/booking/srv-02',
    kicker: 'TAB 04 / 10 · PEMBAYARAN TRANSFER BANK & KODE UNIK',
    headline: 'Bayar Pesanan via Transfer Bank dengan',
    highlightWord: '3 Angka Kode Unik.',
    subheadline:
      'Sistem otomatis menambahkan 3 angka unik di ujung harga (contoh: Rp 250.507) agar admin langsung mengenali siapa yang mentransfer tanpa biaya potongan pihak ketiga.',
    elaboratedDescription:
      'Anda tidak perlu mendaftar payment gateway berbelit atau terkena potongan biaya transaksi Rp 4.000–Rp 5.000 per pembayaran. Setiap pesanan otomatis diberi 3 angka kode unik di belakang nominal tagihan sehingga pengecekan mutasi rekening BCA atau Mandiri berlangsung cepat dan akurat.',
    workflowSteps: [
      'Pilih tanggal dan jam sesi konsultasi atau psikotes, lalu isi nama, nomor WhatsApp, dan catatan tambahan.',
      'Klik tombol Salin Nominal Tepat dan Salin Nomor Rekening agar tidak salah ketik saat transfer di m-banking.',
      'Unggah foto bukti transfer di halaman yang sama atau klik tombol Konfirmasi via WhatsApp Admin.',
    ],
    slideCaption:
      'Tab 4:Checkout & Verifikasi Transfer dengan 3 Angka Kode Unik. Bebas potongan biaya payment gateway! Sistem otomatis membuat nominal unik (misal Rp 250.507) lengkap dengan tombol salin nominal dan unggah bukti bayar.',
    webImage: '04-booking-web.png',
    mobileImage: '04-booking-mobile.png',
    zoomTarget: {
      originX: 50,
      originY: 46,
      maxScale: 1.42,
      focusLabel: 'Zoom-In: Tagihan Tepat Rp 250.507 & Tombol Salin Rekening 1-Klik',
    },
    metrics: [
      { value: 'Rp 0', label: 'Potongan Biaya Admin' },
      { value: '3 Angka', label: 'Kode Unik Otomatis' },
      { value: '1 Klik', label: 'Salin Nominal & Rek' },
    ],
    technicalBullets: [
      'Tombol Salin Nominal Tepat dan Salin Nomor Rekening (Mandiri & BCA) mencegah salah transfer dari aplikasi mobile banking',
      'Dilengkapi kolom unggah foto bukti pembayaran langsung beserta indikator status verifikasi secara langsung (real-time)',
      'Tersedia tombol kirim konfirmasi cepat ke WhatsApp Admin dengan teks pesan yang sudah terisi otomatis beserta nomor pesanan',
    ],
    accentColor: '#D97706',
    theme: 'dark',
  },
  {
    id: '05-kraepelin',
    stepNumber: '05',
    tabLabel: 'Tab 5 · Tes Koran HP',
    routePath: '/recruiter/candidate/practice',
    kicker: 'TAB 05 / 10 · UJIAN HITUNG CEPAT KRAEPELIN / PAULI DIGITAL',
    headline: 'Tes Hitung Cepat (Kraepelin) di HP dengan',
    highlightWord: 'Layar Anti-Curang.',
    subheadline:
      'Uji kecepatan hitung, ketelitian, dan daya tahan fokus pelamar lewat penjumlahan angka beruntun per kolom waktu. Tidak perlu lagi cetak dan koreksi kertas koran manual.',
    elaboratedDescription:
      'Tes koran (Kraepelin/Pauli) adalah ujian wajib di pabrik untuk melihat apakah calon operator tetap teliti dan stabil saat bekerja shift panjang. Di aplikasi ini, pelamar cukup menjumlahkan dua angka berdekatan dan menekan angka satuannya menggunakan satu jempol di layar HP maupun keyboard laptop.',
    workflowSteps: [
      'Pilih mode tata letak tombol angka yang paling nyaman di jempol: Mode 5-Kolom Ringkas atau Mode Kalkulator 3x4.',
      'Jumlahkan dua angka yang disorot lalu tekan digit terakhirnya (contoh: 8 + 7 = 15, cukup tekan angka 5) sebelum waktu kolom habis.',
      'Sistem otomatis mengunci layar penuh (fullscreen) dan mencatat peringatan jika peserta mencoba keluar tab atau membuka kalkulator lain.',
    ],
    slideCaption:
      'Tab 5:Tes Koran (Kraepelin/Pauli) Digital 60 FPS di HP & Laptop. Ucapkan selamat tinggal pada lembaran kertas koran lebar! Pelamar cukup menekan angka satuan dengan satu jempol, lengkap dengan kunci layar penuh anti-curang.',
    webImage: '05-kraepelin-web.png',
    mobileImage: '05-kraepelin-mobile.png',
    zoomTarget: {
      originX: 35,
      originY: 56,
      maxScale: 1.36,
      focusLabel: 'Zoom-In: Kolom Penjumlahan Angka & Tombol Ketik 1-Jempol di HP',
    },
    metrics: [
      { value: '2 Mode', label: 'Tombol Angka HP' },
      { value: 'Maks 3x', label: 'Batas Pindah Layar' },
      { value: 'Otomatis', label: 'Pindah Kolom & Skor' },
    ],
    technicalBullets: [
      'Tombol angka sangat responsif (60 FPS tanpa jeda) meskipun ditekan berkali-kali dengan cepat saat waktu hampir habis',
      'Tersedia 2 pilihan susunan tombol di layar HP: Mode 5-Kolom (hemat ruang layar) dan Mode 3x4 ala kalkulator standar',
      'Dilengkapi pengawas kecurangan otomatis yang mengunci layar penuh dan memberi peringatan jika peserta berpindah aplikasi',
    ],
    accentColor: '#D97706',
    theme: 'light',
  },
  {
    id: '06-candidate',
    stepNumber: '06',
    tabLabel: 'Tab 6 · Baca CV Otomatis',
    routePath: '/recruiter/candidate',
    kicker: 'TAB 06 / 10 · PORTAL PELAMAR & PEMINDAI CV PDF OTOMATIS',
    headline: 'Unggah CV PDF dan Sistem Langsung Mengenali',
    highlightWord: 'Sertifikat Pabrik.',
    subheadline:
      'Begitu pelamar mengunggah file CV PDF, sistem langsung membaca isinya dan menandai keahlian mesin, lisensi K3, serta persentase kecocokan dengan posisi yang dilamar.',
    elaboratedDescription:
      'Pelamar tidak perlu mengetik ulang puluhan kolom formulir riwayat kerja yang membosankan. Cukup pilih file CV berformat PDF dari HP atau laptop, lalu mesin pembaca otomatis akan mendeteksi daftar keahlian mesin, sertifikat pelatihan pabrik, dan menghitung persentase kecocokan profil.',
    workflowSteps: [
      'Buka Portal Pelamar lalu pilih atau tarik file CV berformat PDF ke kotak unggah.',
      'Periksa daftar keahlian teknik dan sertifikat resmi yang berhasil dikenali otomatis oleh sistem.',
      'Pantau status lamaran kerja yang sedang berjalan beserta tautan langsung menuju lembar hasil psikotes.',
    ],
    slideCaption:
      'Tab 6:Pemindai CV PDF Otomatis Khusus Keahlian Pabrik. Pelamar cukup upload CV PDF, dan sistem langsung mendeteksi sertifikat K3, keahlian PLC/CNC, ISO 9001, hingga menghitung skor kecocokan 94% secara instan.',
    webImage: '06-candidate-web.png',
    mobileImage: '06-candidate-mobile.png',
    zoomTarget: {
      originX: 67,
      originY: 50,
      maxScale: 1.38,
      focusLabel: 'Zoom-In: 8 Keahlian Terbaca Otomatis (PLC Siemens, CNC, K3, ISO 9001)',
    },
    metrics: [
      { value: '8+ Skill', label: 'Terbaca Otomatis' },
      { value: '94%', label: 'Skor Kecocokan CV' },
      { value: '3 Detik', label: 'Proses Baca PDF' },
    ],
    technicalBullets: [
      'Mengenali otomatis istilah teknis pabrik: PLC Siemens S7-1200, CNC Milling 3-Axis, 7 QC Tools, Kaizen, dan SIO Forklift',
      'Memisahkan lisensi resmi Kemnaker RI dan sertifikasi ISO 9001:2015 agar tim HRD mudah melakukan pengecekan keaslian berkas',
      'Menampilkan daftar riwayat posisi yang pernah dilamar lengkap dengan tahap seleksi terkini di satu layar',
    ],
    accentColor: '#10B981',
    theme: 'dark',
  },
  {
    id: '07-results',
    stepNumber: '07',
    tabLabel: 'Tab 7 · Rapor Psikogram',
    routePath: '/recruiter/candidate/results',
    kicker: 'TAB 07 / 10 · LEMBAR HASIL PSIKOTES (PSIKOGRAM) SIAP CETAK',
    headline: 'Rapor Psikogram 1 Halaman Siap Cetak: Grafik Stamina dan',
    highlightWord: 'Gaya Kerja DISC.',
    subheadline:
      'Setelah ujian selesai, sistem langsung menyusun lembar hasil psikotes (psikogram) yang merangkum kecepatan kerja, tingkat ketelitian, grafik naik-turun fokus, dan karakter kerja pelamar.',
    elaboratedDescription:
      'Biasanya psikolog atau staf HRD butuh waktu lama untuk menghitung skor tes koran dan menggambar grafik profil kandidat. Di halaman ini, seluruh hasil hitungan langsung tersaji rapi dalam format 1 halaman siap cetak (Print-to-PDF) yang mudah dibaca oleh kepala pabrik maupun manajer HRD.',
    workflowSteps: [
      'Lihat 4 kotak nilai utama di bagian atas: Kecepatan Kerja, Tingkat Ketelitian, Keajegan (Konsistensi), dan Daya Tahan Stamina.',
      'Amati diagram jaring (Radar DISC) di sebelah kiri untuk melihat karakter kerja pelamar dan grafik garis di sebelah kanan untuk melihat kestabilan fokus tiap kolom.',
      'Klik tombol Cetak / Simpan PDF di pojok kanan atas untuk mengunduh dokumen psikogram resmi ukuran A4.',
    ],
    slideCaption:
      'Tab 7:Rapor Hasil Psikotes (Psikogram) 1 Halaman Siap Cetak PDF. Tidak perlu hitung rumus manual! Kecepatan kerja, persentase ketelitian 97%, grafik stamina per kolom, hingga karakter kerja DISC langsung terbit otomatis.',
    webImage: '07-results-web.png',
    mobileImage: '07-results-mobile.png',
    zoomTarget: {
      originX: 50,
      originY: 68,
      maxScale: 1.36,
      focusLabel: 'Zoom-In: Diagram Karakter DISC & Grafik Kestabilan Stamina 8 Kolom',
    },
    metrics: [
      { value: '54 angka/m', label: 'Kecepatan Hitung' },
      { value: '97%', label: 'Tingkat Ketelitian' },
      { value: '93%', label: 'Kestabilan Fokus' },
    ],
    technicalBullets: [
      'Menyajikan diagram 4 karakter kerja DISC (Dominance/Tegas, Influence/Komunikatif, Steadiness/Tekun, Compliance/Teliti mengikuti SOP)',
      'Menampilkan grafik garis naik-turun kecepatan hitung per kolom untuk mendeteksi apakah pelamar mudah lelah saat shift panjang',
      'Dilengkapi tabel pembanding otomatis terhadap standar nilai minimum Operator Produksi, Staf QC, dan Teknisi Mesin',
    ],
    accentColor: '#D97706',
    theme: 'light',
  },
  {
    id: '08-employer',
    stepNumber: '08',
    tabLabel: 'Tab 8 · Papan Seleksi HRD',
    routePath: '/recruiter/employer',
    kicker: 'TAB 08 / 10 · DASHBOARD HRD & PAPAN TAHAPAN SELEKSI',
    headline: 'Pantau Ratusan Pelamar di Papan Tahapan Seleksi dan',
    highlightWord: 'Panggil via WA.',
    subheadline:
      'Tim HRD cukup menggeser kartu nama pelamar dari tahap Cek Berkas, Psikotes, Wawancara, hingga Diterima, lalu mengirim pesan panggilan tes ke WhatsApp dalam satu klik.',
    elaboratedDescription:
      'Memudahkan tim rekrutmen pabrik memantau ratusan pelamar tanpa takut ada berkas yang terlewat di spreadsheet. Setiap kartu pelamar menampilkan nilai gabungan kecocokan CV dan hasil psikotes, tombol lihat rapor psikogram, serta tombol kirim undangan wawancara otomatis.',
    workflowSteps: [
      'Pilih tampilan Papan Kolom (Kanban) atau Tabel Daftar, lalu saring pelamar berdasarkan skor tertinggi.',
      'Geser (drag-and-drop) kartu pelamar ke kolom tahap berikutnya: Screening Berkas, Psikotes, Wawancara, Diterima, atau Ditolak.',
      'Klik tombol Panggil Wawancara untuk mengirim pesan WhatsApp/Email otomatis sekaligus mengunduh pengingat kalender (.ICS).',
    ],
    slideCaption:
      'Tab 8:Dashboard HRD & Papan Seleksi Pelamar (ATS). Geser kartu pelamar antar-tahap seleksi, cek rapor psikotes di tempat, kirim undangan interview ke WhatsApp 1 klik, dan ekspor rekap pelamar ke Excel/CSV.',
    webImage: '08-employer-web.png',
    mobileImage: '08-employer-mobile.png',
    zoomTarget: {
      originX: 48,
      originY: 60,
      maxScale: 1.38,
      focusLabel: 'Zoom-In: 5 Kolom Tahapan Seleksi, Skor Pelamar, & Panggilan WA',
    },
    metrics: [
      { value: '5 Tahap', label: 'Papan Kolom Seleksi' },
      { value: 'Excel/CSV', label: 'Unduh Rekap Data' },
      { value: 'WA & Email', label: 'Panggilan Tes Otomatis' },
    ],
    technicalBullets: [
      'Menyediakan 2 mode layar kerja: Papan 5 Kolom (drag-and-drop) dan Tabel Daftar dengan fitur centang banyak pelamar sekaligus',
      'Setiap kartu pelamar menampilkan rangkuman skor CV + skor psikotes serta tombol buka lembar psikogram tanpa pindah halaman',
      'Dilengkapi pembuat pesan panggilan wawancara otomatis ke WhatsApp, Email, dan file pengingat Google/Apple Calendar (.ICS)',
    ],
    accentColor: '#D97706',
    theme: 'dark',
  },
  {
    id: '09-admin',
    stepNumber: '09',
    tabLabel: 'Tab 9 · Panel Admin',
    routePath: '/recruiter/admin',
    kicker: 'TAB 09 / 10 · PUSAT PENGATURAN ADMIN & VERIFIKASI BAYAR',
    headline: 'Atur Lowongan, Bank Soal Psikotes, dan Cek Pembayaran di',
    highlightWord: 'Satu Panel Admin.',
    subheadline:
      'Pemilik sistem bisa menambah lowongan kerja baru, mengubah daftar harga layanan, mengatur soal tes kepribadian, serta menyetujui bukti transfer tanpa perlu mengubah kode program.',
    elaboratedDescription:
      'Seluruh kendali operasional berkumpul di satu halaman administrator. Tersedia pula tombol Isi Data Contoh (Seed Dummy Data) yang sangat berguna ketika Anda ingin mendemonstrasikan aplikasi ini di hadapan calon klien perusahaan atau investor baru.',
    workflowSteps: [
      'Buka 6 sub-menu manajemen di bagian atas: Layanan, Kalender Wawancara, Cek Pembayaran, Lowongan Kerja, Bank Soal, dan Data Pelamar.',
      'Cocokkan 3 angka kode unik pada menu Cek Pembayaran lalu klik tombol Setujui untuk mengaktifkan pesanan klien.',
      'Gunakan tombol Salin Tautan Kalender (.ICS) agar seluruh jadwal wawancara tampil otomatis di kalender HP atau laptop admin.',
    ],
    slideCaption:
      'Tab 9:Panel Kendali Administrator Terpusat. Kelola 6 modul sekaligus: tambah lowongan pabrik, ubah tarif layanan, edit bank soal psikotes, verifikasi transfer kode unik, hingga sinkronisasi jadwal interview ke kalender HP.',
    webImage: '09-admin-web.png',
    mobileImage: '09-admin-mobile.png',
    zoomTarget: {
      originX: 50,
      originY: 62,
      maxScale: 1.34,
      focusLabel: 'Zoom-In: Jadwal Kalender Wawancara & Tombol Pengaturan 6 Modul',
    },
    metrics: [
      { value: '6 Menu', label: 'Kelola Data Penuh' },
      { value: '1 Klik', label: 'Isi Data Contoh Demo' },
      { value: 'Otomatis', label: 'Sinkron Kalender HP' },
    ],
    technicalBullets: [
      'Mencakup 6 menu pengelolaan lengkap: Katalog Layanan, Kalender Wawancara, Verifikasi Pembayaran, Info Lowongan, Bank Soal, dan Pelamar',
      'Dilengkapi tombol Isi Data Contoh Pabrik (1-Klik) untuk langsung menampilkan simulasi data lengkap saat presentasi ke klien',
      'Mendukung penyalinan tautan kalender (.ICS Feed) agar setiap jadwal wawancara baru otomatis muncul di Google Calendar atau iPhone',
    ],
    accentColor: '#10B981',
    theme: 'light',
  },
  {
    id: '10-help-login',
    stepNumber: '10',
    tabLabel: 'Tab 10 · Panduan & Login',
    routePath: '/recruiter/help',
    kicker: 'TAB 10 / 10 · PANDUAN PESERTA TES & LOGIN DEMO 1-KLIK',
    headline: 'Panduan Cara Hitung Tes Koran dan Tombol',
    highlightWord: 'Coba Demo Instan.',
    subheadline:
      'Pelamar baru bisa membaca contoh cara menjumlahkan angka satuan sebelum ujian dimulai, sedangkan calon pembeli aplikasi bisa langsung mencoba akun Admin, HRD, dan Pelamar dengan 1 klik.',
    elaboratedDescription:
      'Mengurangi pertanyaan berulang ke admin HRD berkat halaman panduan bergambar dan daftar tanya-jawab (FAQ) yang jelas. Di halaman masuk (Login), pengguna bisa masuk memakai akun Google, GitHub, Telegram, atau menekan tombol Akun Demo Instan untuk langsung menjelajahi isi aplikasi.',
    workflowSteps: [
      'Baca panduan contoh penjumlahan satuan (misal 8 + 7 = 15, ketik 5) dan tips menjaga kestabilan fokus di halaman Bantuan.',
      'Buka halaman Login lalu pilih masuk menggunakan akun Google, GitHub, Telegram, atau email perusahaan.',
      'Saat mempresentasikan aplikasi ke calon pembeli, cukup klik salah satu dari 3 tombol Masuk Demo Instan (Admin / HRD / Pelamar).',
    ],
    slideCaption:
      'Tab 10:Pusat Panduan Peserta & Login Multi-Akses (Termasuk Tombol Demo 1-Klik). Pelamar paham cara mengerjakan tes koran tanpa bingung, sementara klien bisa langsung mencoba akun Admin, HRD, dan Kandidat sekali klik!',
    webImage: '10-help-web.png',
    mobileImage: '11-login-mobile.png',
    zoomTarget: {
      originX: 50,
      originY: 64,
      maxScale: 1.34,
      focusLabel: 'Zoom-In: Panduan Rumus Hitung Cepat & Tombol Login Demo 3 Peran',
    },
    metrics: [
      { value: '3 Akun', label: 'Demo Admin, HRD, Pelamar' },
      { value: 'Login Cepat', label: 'Google, GitHub, Telegram' },
      { value: 'Full Code', label: 'Siap Pakai & Jual Ulang' },
    ],
    technicalBullets: [
      'Halaman panduan memuat ilustrasi rumus penjumlahan angka satuan, tips menjaga grafik fokus, serta daftar tanya-jawab (FAQ)',
      'Halaman login menyediakan 3 tombol Akses Demo 1-Klik (Admin, Perusahaan/HRD, dan Pelamar) untuk memudahkan uji coba pembeli',
      'Paket penjualan mencakup kode sumber penuh (Full Source Code) yang siap dipasang di server sendiri maupun dibangun menjadi APK Android & iOS',
    ],
    accentColor: '#D97706',
    theme: 'dark',
  },
];

export const INSTAGRAM_CAPTION_COPY = `APLIKASI REKRUTMEN PABRIK, BACA CV PDF OTOMATIS & TES KORAN (KRAEPELIN) DI HP:SIAP PAKAI (WEB + ANDROID + iOS)

Mengurus rekrutmen operator produksi, teknisi mesin, dan staf QC sering kali menguras waktu HRD karena 3 hal ini:
1. Harus membuka dan membaca ratusan file CV PDF pelamar satu per satu.
2. Menyiapkan kertas tes koran (Kraepelin/Pauli) ukuran besar dan mengoreksi ribuan angka hitungan secara manual.
3. Mengatur jadwal wawancara yang tercecer di banyak ruang chat WhatsApp.

Recruiter Industrial menggabungkan seluruh tahapan seleksi karyawan pabrik ke dalam satu aplikasi Web dan HP (bisa dibuka lewat browser, diinstal sebagai aplikasi Android .APK, maupun iPhone .IPA):

---

FITUR UTAMA YANG LANGSUNG BISA ANDA GUNAKAN:

1. Baca & Cek Kecocokan CV PDF Otomatis (Skor Akurasi 94,2%)
Pelamar cukup mengunggah file CV PDF dari HP. Dalam hitungan detik, sistem langsung menandai lebih dari 24 keahlian khusus pabrik seperti PLC Siemens S7-1200, CNC Milling 3-Axis, ISO 9001:2015, 7 QC Tools, sertifikat Ahli K3 Umum Kemnaker, hingga SIO Forklift.

2. Ujian Hitung Cepat Tes Koran (Kraepelin / Pauli) di HP + Anti-Curang
Tidak perlu lagi cetak kertas koran. Pelamar menjumlahkan angka beruntun menggunakan tombol angka 1-jempol yang sangat responsif (60 FPS tanpa jeda). Tersedia 2 pilihan susunan tombol (Mode 5-Kolom Ringkas & Mode Kalkulator 3x4) serta pengunci layar penuh otomatis yang mendeteksi jika peserta mencoba pindah aplikasi.

3. Rapor Hasil Psikotes (Psikogram) 1 Halaman Siap Cetak PDF
Begitu waktu tes habis, sistem langsung menerbitkan lembar psikogram 1 halaman ukuran A4 yang merangkum:
• Kecepatan hitung per menit (Panker)
• Persentase ketelitian kerja (Tianker)
• Kestabilan dan daya tahan fokus antar-kolom (Grafik Stamina)
• Diagram Radar 4 Karakter Kerja DISC (Dominance, Influence, Steadiness, Compliance)

4. Papan Seleksi HRD (Kanban ATS) & Panggilan Wawancara WhatsApp 1-Klik
Tim HRD cukup menggeser (drag-and-drop) kartu pelamar dari kolom Cek Berkas, Psikotes, Wawancara, hingga Diterima. Tersedia tombol kirim panggilan interview otomatis ke WhatsApp/Email, ekspor data ke Excel (.CSV), dan pengingat jadwal otomatis ke Google/Apple Calendar (.ICS).

5. Katalog Layanan Psikotes Berbayar & Pembayaran Kode Unik 3 Angka
Ingin membuka biro psikologi atau menjual paket tes ke perusahaan lain? Tersedia halaman katalog paket asesmen dan konseling lengkap dengan sistem pembayaran transfer bank berfitur 3 angka kode unik otomatis (contoh: Rp 250.507):bebas biaya potongan payment gateway!

6. Panel Admin Lengkap & Tombol Coba Demo 1-Klik
Kelola daftar lowongan, harga paket layanan, bank soal psikotes, dan verifikasi bukti transfer langsung dari menu Admin tanpa perlu menyentuh kode program.

---

SPESIFIKASI TEKNIS (UNTUK TIM IT / DEVELOPER):
• Frontend: Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4
• Aplikasi Mobile: Capacitor 8 (Siap build file .APK Android & .IPA iOS + PWA Offline-Safe)
• Backend & Database: PocketBase (Database Realtime, Login OAuth2 Google/GitHub/Telegram, Backup Otomatis)
• Animasi & Video Kit: Remotion Video Engine + Proyek Timeline Siap Edit di Aplikasi Concat

---

CARA MENCOBA DEMO & KEPEMILIKAN SOURCE CODE:
Ingin mencoba langsung tampilan Admin, HRD Perusahaan, dan Pelamar? Atau ingin membeli Full Source Code / Lisensi White-Label dengan nama perusahaan Anda sendiri?

• Klik link Demo Live di Bio (tersedia tombol Masuk Demo 1-Klik tanpa perlu daftar)
• Atau kirim DM dengan kata kunci "DEMO PABRIK" untuk mendapatkan akses lengkap dan penawaran harga spesial!

#AplikasiHRD #RekrutmenPabrik #TesKraepelinOnline #PsikotesOnline #AplikasiPsikotes #SoftwareHRD #SistemATS #PsikogramDigital #SourceCodeAplikasi #ManufakturIndonesia #HRTechIndonesia`;
