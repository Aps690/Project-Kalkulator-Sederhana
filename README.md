# Project-Kalkulator-Sederhana

DOKUMENTASI KALKULATOR SEDERHANA

1. Ikhtisar Produk

Kalkulator Sederhana adalah aplikasi perangkat lunak yang dirancang untuk melakukan operasi aritmatika dasar dengan antarmuka yang mudah digunakan.

2. Spesifikasi Teknis

2.1. Platform

· Desktop: Windows, macOS, Linux
· Web: Browser modern (Chrome, Firefox, Safari, Edge)
· Mobile: Android, iOS

2.2. Persyaratan Sistem

· RAM: Minimal 512MB
· Storage: 10MB ruang kosong
· Resolusi layar: 800x600 minimum

3. Fitur dan Fungsi

3.1. Operasi Dasar

· Penjumlahan (+): Menambahkan dua angka atau lebih
· Pengurangan (-): Mengurangkan angka dari angka lain
· Perkalian (×): Mengalikan dua angka atau lebih
· Pembagian (÷): Membagi angka dengan angka lain

3.2. Fungsi Tambahan

· Persen (%): Menghitung persentase
· Tanda plus/minus (±): Mengubah tanda bilangan
· Clear (C): Menghapus input saat ini
· All Clear (AC): Mengatur ulang kalkulator ke kondisi awal
· Desimal (.): Menambahkan titik desimal

3.3. Kapabilitas

· Penghitungan berantai
· Tampilan riwayat perhitungan
· Presisi hingga 12 digit
· Penanganan error untuk input tidak valid

4. Panduan Penggunaan

4.1. Instalasi

1. Download file instalasi
2. Jalankan file installer
3. Ikuti petunjuk instalasi
4. Buka aplikasi dari menu Start/Applications

4.2. Contoh Penggunaan

Contoh 1: Penjumlahan

```
5 + 3 = 8
```

Contoh 2: Perkalian dan Pembagian

```
10 × 2 ÷ 4 = 5
```

Contoh 3: Persentase

```
100 + 10% = 110
```

4.3. Tata Letak Tombol

```
[ C ] [ ± ] [ % ] [ ÷ ]
[ 7 ] [ 8 ] [ 9 ] [ × ]
[ 4 ] [ 5 ] [ 6 ] [ - ]
[ 1 ] [ 2 ] [ 3 ] [ + ]
[ 0 ] [ . ] [ = ]
```

5. Penanganan Kesalahan

Pesan Error Penyebab Solusi
Error: Division by Zero Pembagian dengan angka 0 Masukkan angka selain 0 sebagai pembagi
Error: Overflow Hasil perhitungan terlalu besar Kurangi bilangan yang dihitung
Error: Invalid Input Input karakter tidak valid Hanya masukkan angka dan operator matematika

6. Dokumentasi API (Untuk Versi Programmable)

6.1. Fungsi Tersedia

```javascript
// Contoh fungsi JavaScript
calculate(operation, num1, num2) {
    // Logika perhitungan
    return result;
}
```

6.2. Parameter

· operation: String operasi ('add', 'subtract', 'multiply', 'divide')
· num1, num2: Angka untuk dihitung

7. Pemeliharaan dan Dukungan

7.1. Troubleshooting

Masalah Penyelesaian
Kalkulator tidak merespons Restart aplikasi
Hasil perhitungan salah Pastikan input angka benar
Tombol tidak berfungsi Periksa input device atau restart

7.2. FAQ

Q: Apakah kalkulator ini bisa menghitung bilangan negatif?
A: Ya, gunakan tombol ± untuk mengubah tanda bilangan.

Q: Bisakah menghitung lebih dari dua angka?
A: Ya, kalkulator mendukung operasi berantai.

8. Log Perubahan (Changelog)

Versi 1.0.0 (Initial Release)

· Fitur operasi aritmatika dasar
· Tampilan riwayat perhitungan
· Penanganan error dasar

Versi 1.1.0

· Penambahan fungsi persentase
· Peningkatan responsivitas UI
· Perbaikan bug pada operasi desimal

LAMPIRAN

A. Diagram Alir Logika Perhitungan

```
[Input Angka Pertama] → [Pilih Operator] → [Input Angka Kedua] → [Tekan '='] → [Tampilkan Hasil]
```
B. Glosarium

· Operand: Angka yang digunakan dalam perhitungan
· Operator: Simbol matematika (+, -, ×, ÷)
· Display: Area tampilan input dan output