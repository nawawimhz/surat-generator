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
import { CalendarIcon, Download, FileText, QrCode, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import QRCode from "qrcode"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

interface FormData {
  nama_lengkap: string
  tempat_lahir: string
  tanggal_lahir: Date | undefined
  nik: string
  jenis_kelamin: string
  agama: string
  pekerjaan: string
  status_perkawinan: string
  alamat_lengkap: string
  tanggal_acc: Date | undefined
  tanggal_expired: Date | undefined
  nama_sekretaris_desa: string
  include_qr: boolean
}

export default function SuratGenerator() {
  const [formData, setFormData] = useState<FormData>({
    nama_lengkap: "",
    tempat_lahir: "",
    tanggal_lahir: undefined,
    nik: "",
    jenis_kelamin: "",
    agama: "",
    pekerjaan: "",
    status_perkawinan: "",
    alamat_lengkap: "",
    tanggal_acc: new Date(),
    tanggal_expired: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 tahun dari sekarang
    nama_sekretaris_desa: "",
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

  const formatTanggalAcc = () => {
    if (!formData.tanggal_acc) return ""
    return format(formData.tanggal_acc, "dd MMMM yyyy", { locale: id })
  }

  const formatTanggalExpired = () => {
    if (!formData.tanggal_expired) return ""
    return format(formData.tanggal_expired, "dd MMMM yyyy", { locale: id })
  }

  const generateQRCode = async () => {
    if (!formData.include_qr || !formData.tanggal_expired) return ""

    const qrData = {
      nomor_surat: "474/039/SKDIV/2025",
      nama: formData.nama_lengkap,
      tanggal_terbit: formatTanggalAcc(),
      tanggal_expired: formatTanggalExpired(),
      desa: "Kiarasari, Sukajaya, Bogor",
    }

    const qrText = `Surat Keterangan Domisili\nNo: ${qrData.nomor_surat}\nNama: ${qrData.nama}\nTerbit: ${qrData.tanggal_terbit}\nExpired: ${qrData.tanggal_expired}\nDesa: ${qrData.desa}`

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
  }, [formData.include_qr, formData.nama_lengkap, formData.tanggal_acc, formData.tanggal_expired])

  const handlePrint = () => {
    const printContent = document.getElementById("surat-content")
    if (!printContent) return

    const printWindow = window.open("", "_blank")
    if (!printWindow) return

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Surat Keterangan Domisili</title>
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
          .justify-between { justify-content: space-between; }
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
        filename: `Surat_Keterangan_Domisili_${formData.nama_lengkap || "Draft"}.pdf`,
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Generator Surat Keterangan Domisili</h1>
          <p className="text-gray-600">Desa Kiarasari, Kecamatan Sukajaya, Kabupaten Bogor</p>
        </div>

        <div className="flex justify-center">
          <div className="w-full">
            {/* Form Input Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Data Pemohon
                </CardTitle>
                <CardDescription>
                  Lengkapi semua data yang diperlukan untuk membuat surat keterangan domisili
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
                  <Label htmlFor="nik">NIK</Label>
                  <Input
                    id="nik"
                    value={formData.nik}
                    onChange={(e) => handleInputChange("nik", e.target.value)}
                    placeholder="16 digit NIK"
                    maxLength={16}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
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
                    <Label>Agama</Label>
                    <Select value={formData.agama} onValueChange={(value) => handleInputChange("agama", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih agama" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Islam">Islam</SelectItem>
                        <SelectItem value="Kristen">Kristen</SelectItem>
                        <SelectItem value="Katolik">Katolik</SelectItem>
                        <SelectItem value="Hindu">Hindu</SelectItem>
                        <SelectItem value="Buddha">Buddha</SelectItem>
                        <SelectItem value="Konghucu">Konghucu</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
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
                  <Label>Status Perkawinan</Label>
                  <Select
                    value={formData.status_perkawinan}
                    onValueChange={(value) => handleInputChange("status_perkawinan", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih status perkawinan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Belum Kawin">Belum Kawin</SelectItem>
                      <SelectItem value="Kawin">Kawin</SelectItem>
                      <SelectItem value="Cerai Hidup">Cerai Hidup</SelectItem>
                      <SelectItem value="Cerai Mati">Cerai Mati</SelectItem>
                    </SelectContent>
                  </Select>
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

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tanggal Surat</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.tanggal_acc ? format(formData.tanggal_acc, "dd/MM/yyyy") : "Pilih tanggal"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={formData.tanggal_acc}
                          onSelect={(date) => handleInputChange("tanggal_acc", date)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label>Tanggal Expired</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.tanggal_expired ? format(formData.tanggal_expired, "dd/MM/yyyy") : "Pilih tanggal"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={formData.tanggal_expired}
                          onSelect={(date) => handleInputChange("tanggal_expired", date)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nama_sekretaris_desa">Nama Sekretaris Desa</Label>
                  <Input
                    id="nama_sekretaris_desa"
                    value={formData.nama_sekretaris_desa}
                    onChange={(e) => handleInputChange("nama_sekretaris_desa", e.target.value)}
                    placeholder="Nama lengkap sekretaris"
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
                        <DialogTitle>Preview Surat Keterangan Domisili</DialogTitle>
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
                              Email: <a href="mailto:kiarasaridesa@gmail.com" style={{ color: 'blue' }}>kiarasaridesa@gmail.com</a> || Website: <a href="https://desakiarasari.desa.id" target="_blank" rel="noopener noreferrer" style={{ color: 'blue' }}>https://desakiarasari.desa.id</a>
                            </div>
                          </div>
                        </div>
                        <div className="border-b-2 border-black mb-3"></div>

                        {/* Judul Surat */}
                        <div className="text-center mb-4">
                          <div className="font-bold underline mb-1" style={{ fontSize: "14pt" }}>
                            SURAT KETERANGAN DOMISILI
                          </div>
                          <div style={{ fontSize: "12pt" }}>Nomor: 474/039/SKDIV/2025</div>
                        </div>

                        {/* Isi Surat */}
                        <div className="mb-3" style={{ textAlign: "justify", fontSize: "12pt" }}>
                          <div className="mb-2">Yang bertanda tangan di bawah ini:</div>
                          <div className="mb-2">Kepala Desa Kiarasari Kecamatan Sukajaya, Kabupaten Bogor.</div>
                          <div className="mb-2">Dengan ini menerangkan bahwa:</div>

                          {/* Data Pemohon */}
                          <div className="mb-3 space-y-0.5" style={{ lineHeight: "1.5" }}>
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
                              <span className="inline-block w-40 flex-shrink-0">NIK</span>
                              <span className="mr-2 flex-shrink-0">:</span>
                              <span className="font-medium">{formData.nik || "<nik>"}</span>
                            </div>
                            <div className="flex">
                              <span className="inline-block w-40 flex-shrink-0">Jenis Kelamin</span>
                              <span className="mr-2 flex-shrink-0">:</span>
                              <span className="font-medium">{formData.jenis_kelamin || "<jenis_kelamin>"}</span>
                            </div>
                            <div className="flex">
                              <span className="inline-block w-40 flex-shrink-0">Agama</span>
                              <span className="mr-2 flex-shrink-0">:</span>
                              <span className="font-medium">{formData.agama || "<agama>"}</span>
                            </div>
                            <div className="flex">
                              <span className="inline-block w-40 flex-shrink-0">Pekerjaan</span>
                              <span className="mr-2 flex-shrink-0">:</span>
                              <span className="font-medium">{formData.pekerjaan || "<pekerjaan>"}</span>
                            </div>
                            <div className="flex">
                              <span className="inline-block w-40 flex-shrink-0">Status Perkawinan</span>
                              <span className="mr-2 flex-shrink-0">:</span>
                              <span className="font-medium">{formData.status_perkawinan || "<status_perkawinan>"}</span>
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

                          <div className="mb-3" style={{ textAlign: "justify" }}>
                            Berdasarkan data yang ada pada kami dan sepengetahuan kami, nama tersebut di atas adalah
                            benar warga Desa Kiarasari dan hingga saat surat keterangan ini diterbitkan, yang
                            bersangkutan masih berdomisili sesuai alamat yang tertera di atas.
                          </div>

                          <div className="mb-4" style={{ textAlign: "justify" }}>
                            Demikian surat keterangan domisili ini dibuat untuk dapat dipergunakan sebagaimana mestinya.
                          </div>

                          {/* Tanda Tangan */}
                          <div className="flex justify-between mt-6">
                            <div className="text-center" style={{ width: "45%" }}>
                              <div className="mb-1">Mengetahui,</div>
                              <div className="mb-20">Tanda Tangan Bersangkutan,</div>
                              <div style={{ textDecoration: 'underline' }}>
                                ({formData.nama_lengkap || "<nama_lengkap>"})
                              </div>
                            </div>
                            <div className="text-center relative" style={{ width: "45%" }}>
                              <div className="mb-1">
                                Kiarasari, {formatTanggalAcc() || "<tanggal_acc, bulan tahun>"}
                              </div>
                              <div className="mb-20">Kepala Desa Kiarasari/Sekertaris Desa</div>

                              {/* QR Code - Posisi presisi di tengah area tanda tangan */}
                              {formData.include_qr && qrCodeUrl && (
                                <div
                                  className="absolute"
                                  style={{
                                    top: "60px",
                                    left: "50%",
                                    transform: "translateX(-50%)",
                                    zIndex: 10,
                                  }}
                                >
                                  <img
                                    src={qrCodeUrl || "/placeholder.svg"}
                                    alt="QR Code Verifikasi"
                                    className="w-16 h-16"
                                    style={{ width: "64px", height: "64px" }}
                                  />
                                </div>
                              )}

                              <div style={{ textDecoration: 'underline' }}>
                                ({formData.nama_sekretaris_desa || "<nama_sekretaris_desa>"})
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
    </div>
  )
}
