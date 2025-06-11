"use client"

import React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { CalendarIcon, Download, FileText, QrCode, Loader2, Clock } from "lucide-react"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import QRCode from "qrcode"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

interface FormData {
  nama_lengkap: string
  tempat_lahir: string
  tanggal_lahir: Date | undefined
  jenis_kelamin: string
  pekerjaan: string
  alamat_lengkap: string
  tanggal_meninggal: Date | undefined
  waktu_meninggal: string
  lokasi_meninggal: string
  penyebab_kematian: string
  tanggal_surat: Date | undefined
  nama_kasi_pelayanan: string
  include_qr: boolean
}

export default function SkkGenerator() {
  const [formData, setFormData] = useState<FormData>({
    nama_lengkap: "",
    tempat_lahir: "",
    tanggal_lahir: undefined,
    jenis_kelamin: "",
    pekerjaan: "",
    alamat_lengkap: "",
    tanggal_meninggal: undefined,
    waktu_meninggal: "",
    lokasi_meninggal: "",
    penyebab_kematian: "",
    tanggal_surat: new Date(),
    nama_kasi_pelayanan: "",
    include_qr: false,
  })

  const [qrCodeUrl, setQrCodeUrl] = useState<string>("")
  const [showPreview, setShowPreview] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = (field: keyof FormData, value: string | Date | undefined | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const formatTTL = () => {
    if (!formData.tempat_lahir || !formData.tanggal_lahir) return ""
    return `${formData.tempat_lahir}, ${format(formData.tanggal_lahir, "dd MMMM yyyy", { locale: id })}`
  }

  const formatTanggalMeninggal = () => {
    if (!formData.tanggal_meninggal) return ""
    return format(formData.tanggal_meninggal, "dd MMMM yyyy", { locale: id })
  }

  const formatTanggalSurat = () => {
    if (!formData.tanggal_surat) return ""
    return format(formData.tanggal_surat, "dd MMMM yyyy", { locale: id })
  }

  const generateQRCode = async () => {
    if (!formData.include_qr) return ""

    const qrData = {
      nomor_surat: "474.3/SKM/IV/2025",
      nama: formData.nama_lengkap,
      tanggal_meninggal: formatTanggalMeninggal(),
      tanggal_terbit: formatTanggalSurat(),
      desa: "Kiarasari, Sukajaya, Bogor",
    }

    const qrText = `Surat Keterangan Kematian\nNo: ${qrData.nomor_surat}\nNama: ${qrData.nama}\nTanggal Meninggal: ${qrData.tanggal_meninggal}\nTerbit: ${qrData.tanggal_terbit}\nDesa: ${qrData.desa}`

    try {
      const url = await QRCode.toDataURL(qrText, {
        width: 80,
        margin: 1,
        color: {
          dark: "#2563eb", // Warna biru
          light: "#FFFFFF",
        },
      })
      setQrCodeUrl(url)
      return url
    } catch (error) {
      console.error("Error generating QR code:", error)
      return ""
    }
  }

  // Generate QR code when relevant data changes
  React.useEffect(() => {
    if (formData.include_qr) {
      generateQRCode()
    }
  }, [formData.include_qr, formData.nama_lengkap, formData.tanggal_meninggal, formData.tanggal_surat])

  const handlePrint = () => {
    const printContent = document.getElementById("surat-content")
    if (!printContent) return

    const printWindow = window.open("", "_blank")
    if (!printWindow) return

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Surat Keterangan Kematian</title>
        <style>
          @page {
            size: A4;
            margin: 2cm;
          }
          body {
            font-family: 'Times New Roman', Times, serif;
            font-size: 12pt;
            line-height: 1.3;
            margin: 0;
            padding: 0;
            color: black;
          }
          .font-bold { font-weight: bold; }
          .underline { text-decoration: underline; }
          .text-center { text-align: center; }
          .mb-1 { margin-bottom: 0.25rem; }
          .mb-2 { margin-bottom: 0.5rem; }
          .mb-3 { margin-bottom: 0.75rem; }
          .mb-4 { margin-bottom: 1rem; }
          .mb-20 { margin-bottom: 5rem; }
          .flex { display: flex; }
          .items-start { align-items: flex-start; }
          .justify-end { justify-content: flex-end; }
          .flex-shrink-0 { flex-shrink: 0; }
          .flex-1 { flex: 1; }
          .mr-2 { margin-right: 0.5rem; }
          .mr-4 { margin-right: 1rem; }
          .w-40 { width: 10rem; }
          .inline-block { display: inline-block; }
          .font-medium { font-weight: 500; }
          .space-y-0\\.5 > * + * { margin-top: 0.125rem; }
          .space-y-1 > * + * { margin-top: 0.25rem; }
          .relative { position: relative; }
          .absolute { position: absolute; }
          .border-b-2 { border-bottom: 2px solid black; }
          .border-black { border-color: black; }
          .object-contain { object-fit: contain; }
        </style>
      </head>
      <body>
        ${printContent.innerHTML}
      </body>
      </html>
    `)

    printWindow.document.close()
    printWindow.focus()

    setTimeout(() => {
      printWindow.print()
      printWindow.close()
    }, 250)
  }

  const handleDownloadPDF = async () => {
    setIsLoading(true)

    try {
      if (formData.include_qr && !qrCodeUrl) {
        await generateQRCode()
      }

      const html2pdf = (await import("html2pdf.js")).default
      const element = document.getElementById("surat-content")
      if (!element) return

      const opt = {
        margin: [15, 15, 15, 15], // top, right, bottom, left in mm
        filename: `Surat_Keterangan_Kematian_${formData.nama_lengkap || "Draft"}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          letterRendering: true,
        },
        jsPDF: {
          unit: "mm",
          format: "a4",
          orientation: "portrait",
          compress: true,
          putOnlyUsedFonts: true,
        },
        pagebreak: { mode: ["avoid-all"] },
      }

      await html2pdf().set(opt).from(element).save()
    } catch (error) {
      console.error("Error generating PDF:", error)
      alert("Gagal membuat PDF. Silakan coba cetak surat.")
    } finally {
      setIsLoading(false)
    }
  }

  // Hitung sisa karakter untuk alamat (maksimal 120 karakter untuk 2 baris)
  const maxAlamatChars = 120
  const remainingChars = maxAlamatChars - formData.alamat_lengkap.length

  const [showTimePicker, setShowTimePicker] = useState(false)

  const generateTimeOptions = () => {
    const times = []
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`
        times.push(timeString)
      }
    }
    return times
  }

  const handleTimeSelect = (time: string) => {
    handleInputChange("waktu_meninggal", `${time} WIB`)
    setShowTimePicker(false)
  }

  const getHariMeninggal = () => {
    if (!formData.tanggal_meninggal) return ""
    return format(formData.tanggal_meninggal, "EEEE", { locale: id })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Generator Surat Keterangan Kematian</h1>
          <p className="text-gray-600">Desa Kiarasari, Kecamatan Sukajaya, Kabupaten Bogor</p>
        </div>

        <div className="flex justify-center">
          <div className="w-full">
            {/* Form Input Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Data Almarhum/Almarhumah
                </CardTitle>
                <CardDescription>
                  Lengkapi semua data yang diperlukan untuk membuat surat keterangan kematian
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nama_lengkap">Nama Lengkap</Label>
                  <Input
                    id="nama_lengkap"
                    value={formData.nama_lengkap}
                    onChange={(e) => handleInputChange("nama_lengkap", e.target.value)}
                    placeholder="Masukkan nama lengkap"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tempat_lahir">Tempat Lahir</Label>
                    <Input
                      id="tempat_lahir"
                      value={formData.tempat_lahir}
                      onChange={(e) => handleInputChange("tempat_lahir", e.target.value)}
                      placeholder="Kota/Kabupaten"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Tanggal Lahir</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.tanggal_lahir ? format(formData.tanggal_lahir, "dd/MM/yyyy") : "Pilih tanggal"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={formData.tanggal_lahir}
                          onSelect={(date) => handleInputChange("tanggal_lahir", date)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Jenis Kelamin</Label>
                  <Select
                    value={formData.jenis_kelamin}
                    onValueChange={(value) => handleInputChange("jenis_kelamin", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih jenis kelamin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Laki-laki">Laki-laki</SelectItem>
                      <SelectItem value="Perempuan">Perempuan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pekerjaan">Pekerjaan</Label>
                  <Input
                    id="pekerjaan"
                    value={formData.pekerjaan}
                    onChange={(e) => handleInputChange("pekerjaan", e.target.value)}
                    placeholder="Masukkan pekerjaan"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="alamat_lengkap">
                    Alamat Lengkap
                    <span className={`text-sm ml-2 ${remainingChars < 0 ? "text-red-500" : "text-gray-500"}`}>
                      (Sisa {remainingChars}/{maxAlamatChars} karakter)
                    </span>
                  </Label>
                  <Textarea
                    id="alamat_lengkap"
                    value={formData.alamat_lengkap}
                    onChange={(e) => handleInputChange("alamat_lengkap", e.target.value)}
                    placeholder="RT/RW, Kampung/Dusun, dll. (Maksimal 2 baris)"
                    rows={3}
                    maxLength={maxAlamatChars}
                  />
                  {remainingChars < 0 && (
                    <p className="text-sm text-red-500">
                      Alamat terlalu panjang! Kurangi {Math.abs(remainingChars)} karakter.
                    </p>
                  )}
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-medium text-lg mb-2">Informasi Kematian</h3>
                </div>

                <div className="space-y-2">
                  <Label>Tanggal Meninggal</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.tanggal_meninggal
                          ? format(formData.tanggal_meninggal, "dd/MM/yyyy")
                          : "Pilih tanggal"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.tanggal_meninggal}
                        onSelect={(date) => handleInputChange("tanggal_meninggal", date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-1">
                    <Clock className="h-4 w-4" /> Waktu Meninggal
                  </Label>
                  <Popover open={showTimePicker} onOpenChange={setShowTimePicker}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <Clock className="mr-2 h-4 w-4" />
                        {formData.waktu_meninggal || "Pilih waktu"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <div className="max-h-60 overflow-y-auto p-2">
                        <div className="grid grid-cols-4 gap-1">
                          {generateTimeOptions().map((time) => (
                            <Button
                              key={time}
                              variant="ghost"
                              size="sm"
                              onClick={() => handleTimeSelect(time)}
                              className="h-8 text-xs"
                            >
                              {time}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>Lokasi Meninggal</Label>
                  <Select
                    value={formData.lokasi_meninggal}
                    onValueChange={(value) => handleInputChange("lokasi_meninggal", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih lokasi meninggal" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Rumah">Rumah</SelectItem>
                      <SelectItem value="Rumah Sakit">Rumah Sakit</SelectItem>
                      <SelectItem value="Puskesmas">Puskesmas</SelectItem>
                      <SelectItem value="Klinik">Klinik</SelectItem>
                      <SelectItem value="Rumah Duka">Rumah Duka</SelectItem>
                      <SelectItem value="Jalan Raya">Jalan Raya</SelectItem>
                      <SelectItem value="Tempat Kerja">Tempat Kerja</SelectItem>
                      <SelectItem value="Lainnya">Lainnya</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Penyebab Kematian</Label>
                  <Select
                    value={formData.penyebab_kematian}
                    onValueChange={(value) => handleInputChange("penyebab_kematian", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih penyebab kematian" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Sakit">Sakit</SelectItem>
                      <SelectItem value="Kecelakaan Lalu Lintas">Kecelakaan Lalu Lintas</SelectItem>
                      <SelectItem value="Kecelakaan Kerja">Kecelakaan Kerja</SelectItem>
                      <SelectItem value="Bunuh Diri">Bunuh Diri</SelectItem>
                      <SelectItem value="Pembunuhan">Pembunuhan</SelectItem>
                      <SelectItem value="Bencana Alam">Bencana Alam</SelectItem>
                      <SelectItem value="Usia Lanjut">Usia Lanjut</SelectItem>
                      <SelectItem value="Tidak Diketahui">Tidak Diketahui</SelectItem>
                      <SelectItem value="Lainnya">Lainnya</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-medium text-lg mb-2">Informasi Surat</h3>
                </div>

                <div className="space-y-2">
                  <Label>Tanggal Surat</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.tanggal_surat ? format(formData.tanggal_surat, "dd/MM/yyyy") : "Pilih tanggal"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.tanggal_surat}
                        onSelect={(date) => handleInputChange("tanggal_surat", date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nama_kasi_pelayanan">Nama Kasi Pelayanan</Label>
                  <Input
                    id="nama_kasi_pelayanan"
                    value={formData.nama_kasi_pelayanan}
                    onChange={(e) => handleInputChange("nama_kasi_pelayanan", e.target.value)}
                    placeholder="Nama lengkap Kasi Pelayanan"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include_qr"
                    checked={formData.include_qr}
                    onCheckedChange={(checked) => handleInputChange("include_qr", checked)}
                  />
                  <Label htmlFor="include_qr" className="flex items-center gap-2">
                    <QrCode className="h-4 w-4" />
                    Tambahkan QR Code untuk verifikasi
                  </Label>
                </div>

                <div className="flex justify-center">
                  <Dialog open={showPreview} onOpenChange={setShowPreview}>
                    <DialogTrigger asChild>
                      <Button className="w-full" size="lg">
                        <FileText className="mr-2 h-4 w-4" />
                        Preview Surat
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Preview Surat Keterangan Kematian</DialogTitle>
                      </DialogHeader>

                      {/* Preview Surat Content */}
                      <div
                        id="surat-content"
                        className="bg-white p-8 text-black font-serif"
                        style={{ fontFamily: 'Times, "Times New Roman", serif', fontSize: "12pt", lineHeight: "1.3" }}
                      >
                        {/* Header Kop Surat dengan Logo */}
                        <div className="flex items-start mb-3">
                          <div className="flex-shrink-0 mr-4">
                            <img
                              src="/logo-bogor.png"
                              alt="Logo Kabupaten Bogor"
                              className="object-contain"
                              style={{ height: "110px", width: "auto" }}
                            />
                          </div>
                          <div className="flex-1 text-center">
                            <div className="font-bold mb-0.5" style={{ fontSize: "14pt" }}>
                              PEMERINTAH KABUPATEN BOGOR
                            </div>
                            <div className="font-bold mb-0.5" style={{ fontSize: "14pt" }}>
                              KECAMATAN SUKAJAYA
                            </div>
                            <div className="font-bold mb-2" style={{ fontSize: "14pt" }}>
                              DESA KIARASARI
                            </div>
                            <div className="text-xs mb-0.5" style={{ fontSize: "10pt" }}>
                              Alamat: Jl. Raya Taman Nasional Gunung Halimun KM. 21, Kode Pos 16661
                            </div>
                            <div className="text-xs mb-1" style={{ fontSize: "10pt" }}>
                              Email:{" "}
                              <a href="mailto:kiarasaridesa@gmail.com" style={{ color: "blue" }}>
                                kiarasaridesa@gmail.com
                              </a>{" "}
                              || Website:{" "}
                              <a
                                href="https://desakiarasari.desa.id"
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ color: "blue" }}
                              >
                                https://desakiarasari.desa.id
                              </a>
                            </div>
                          </div>
                        </div>
                        <div className="border-b-2 border-black mb-3"></div>

                        {/* Judul Surat */}
                        <div className="text-center mb-4">
                          <div className="font-bold underline mb-1" style={{ fontSize: "14pt" }}>
                            SURAT KETERANGAN KEMATIAN
                          </div>
                          <div style={{ fontSize: "12pt" }}>Nomor: 474.3/SKM/IV/2025</div>
                        </div>

                        {/* Isi Surat */}
                        <div className="mb-3" style={{ textAlign: "justify", fontSize: "12pt" }}>
                          <div className="mb-3">
                            Yang bertanda tangan di bawah ini, Kepala Desa Kiarasari, Kecamatan Sukajaya, Kabupaten
                            Bogor, dengan ini menerangkan bahwa:
                          </div>

                          {/* Data Almarhum/Almarhumah */}
                          <div className="mb-4 space-y-0.5" style={{ lineHeight: "1.5" }}>
                            <div className="flex">
                              <span className="inline-block w-40 flex-shrink-0">Nama Lengkap</span>
                              <span className="mr-2 flex-shrink-0">:</span>
                              <span className="font-medium">{formData.nama_lengkap || "<nama_lengkap>"}</span>
                            </div>
                            <div className="flex">
                              <span className="inline-block w-40 flex-shrink-0">Tempat/Tanggal Lahir</span>
                              <span className="mr-2 flex-shrink-0">:</span>
                              <span className="font-medium">{formatTTL() || "<ttl>"}</span>
                            </div>
                            <div className="flex">
                              <span className="inline-block w-40 flex-shrink-0">Jenis Kelamin</span>
                              <span className="mr-2 flex-shrink-0">:</span>
                              <span className="font-medium">{formData.jenis_kelamin || "<jenis_kelamin>"}</span>
                            </div>
                            <div className="flex">
                              <span className="inline-block w-40 flex-shrink-0">Pekerjaan</span>
                              <span className="mr-2 flex-shrink-0">:</span>
                              <span className="font-medium">{formData.pekerjaan || "<pekerjaan>"}</span>
                            </div>
                            <div className="flex items-start">
                              <span className="inline-block w-40 flex-shrink-0">Alamat</span>
                              <span className="mr-2 flex-shrink-0">:</span>
                              <span className="font-medium">
                                {formData.alamat_lengkap || "<isian_alamat_lengkap>"}, Desa Kiarasari, Kecamatan
                                Sukajaya, Kabupaten Bogor.
                              </span>
                            </div>
                          </div>

                          <div className="mb-2">Nama tersebut di atas telah meninggal dunia pada:</div>

                          <div className="mb-4 space-y-0.5 pl-4" style={{ lineHeight: "1.5" }}>
                            <div className="flex">
                              <span className="inline-block w-40 flex-shrink-0">Hari</span>
                              <span className="mr-2 flex-shrink-0">:</span>
                              <span className="font-medium">{getHariMeninggal() || "<hari>"}</span>
                            </div>
                            <div className="flex">
                              <span className="inline-block w-40 flex-shrink-0">Tanggal</span>
                              <span className="mr-2 flex-shrink-0">:</span>
                              <span className="font-medium">{formatTanggalMeninggal() || "<tanggal>"}</span>
                            </div>
                            <div className="flex">
                              <span className="inline-block w-40 flex-shrink-0">Pukul</span>
                              <span className="mr-2 flex-shrink-0">:</span>
                              <span className="font-medium">
                                {formData.waktu_meninggal || "<contoh: pukul 10.30 WIB>"}
                              </span>
                            </div>
                            <div className="flex">
                              <span className="inline-block w-40 flex-shrink-0">Di</span>
                              <span className="mr-2 flex-shrink-0">:</span>
                              <span className="font-medium">
                                {formData.lokasi_meninggal ||
                                  "<lokasi_meninggal, contoh: Rumah Duka/Rumah Sakit/Alamat>"}
                              </span>
                            </div>
                            <div className="flex">
                              <span className="inline-block w-40 flex-shrink-0">Disebabkan karena</span>
                              <span className="mr-2 flex-shrink-0">:</span>
                              <span className="font-medium">{formData.penyebab_kematian || "<penyebab_kematian>"}</span>
                            </div>
                          </div>

                          <div className="mb-4" style={{ textAlign: "justify" }}>
                            Demikian surat keterangan ini dibuat berdasarkan keterangan yang sebenarnya untuk dapat
                            dipergunakan sebagaimana mestinya.
                          </div>

                          {/* Tanda Tangan */}
                          <div className="flex justify-end mt-6">
                            <div className="text-center relative" style={{ width: "45%" }}>
                              <div className="mb-1">Kiarasari, {formatTanggalSurat() || "<Tanggal, Bulan, Tahun>"}</div>
                              <div className="mb-1">a.n. KEPALA DESA KIARASARI</div>
                              <div className="mb-20">Kasi Pelayanan</div>

                              {/* QR Code */}
                              {formData.include_qr && qrCodeUrl && (
                                <div
                                  className="absolute"
                                  style={{
                                    top: "75px",
                                    left: "50%",
                                    transform: "translateX(-50%)",
                                    zIndex: 10,
                                  }}
                                >
                                  <img
                                    src={qrCodeUrl || "/placeholder.svg"}
                                    alt="QR Code Verifikasi"
                                    style={{ width: "64px", height: "64px" }}
                                  />
                                </div>
                              )}

                              <div style={{ textDecoration: "underline" }}>
                                ({formData.nama_kasi_pelayanan || "<nama_kasi_pelayanan>"})
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-4 mt-4">
                        <Button onClick={handlePrint} className="flex-1" size="lg">
                          <Download className="mr-2 h-4 w-4" />
                          Cetak Surat
                        </Button>
                        <Button
                          onClick={handleDownloadPDF}
                          variant="outline"
                          className="flex-1"
                          size="lg"
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Memproses...
                            </>
                          ) : (
                            <>
                              <FileText className="mr-2 h-4 w-4" />
                              Unduh PDF
                            </>
                          )}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          * {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          
          body {
            margin: 0 !important;
            padding: 0 !important;
          }
          
          body * {
            visibility: hidden;
          }
          
          .print\\:border-0,
          .print\\:border-0 * {
            visibility: visible;
          }
          
          .print\\:border-0 {
            position: absolute;
            left: 50% !important;
            top: 0 !important;
            transform: translateX(-50%) !important;
            width: 210mm !important;
            max-width: 210mm !important;
            margin: 0 !important;
            padding: 2.5cm !important;
            font-family: 'Times New Roman', Times, serif !important;
            font-size: 12pt !important;
            line-height: 1.3 !important;
            color: black !important;
            background: white !important;
          }
          
          /* QR Code positioning untuk print */
          .qr-code-signature {
            position: absolute !important;
            top: 60px !important;
            left: 50% !important;
            transform: translateX(-50%) !important;
            z-index: 10 !important;
          }
          
          @page {
            size: A4;
            margin: 0;
          }
        }
        
        /* Font fallback untuk browser yang tidak support Times New Roman */
        .font-serif {
          font-family: 'Times New Roman', Times, serif !important;
        }
      `}</style>
    </div>
  )
}
