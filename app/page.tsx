import SkdGenerator from "../skd-generator"
import SpkckGenerator from "../spkck-generator"
import SkkGenerator from "../skk-generator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function Page() {
  return (
    <div className="container mx-auto p-4">
      <Tabs defaultValue="domisili" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6 bg-blue-100">
          <TabsTrigger value="domisili">Surat Keterangan Domisili</TabsTrigger>
          <TabsTrigger value="spkck">Surat Pengantar SKCK</TabsTrigger>
          <TabsTrigger value="kematian">Surat Keterangan Kematian</TabsTrigger>
        </TabsList>
        <TabsContent value="domisili">
          <SkdGenerator />
        </TabsContent>
        <TabsContent value="spkck">
          <SpkckGenerator />
        </TabsContent>
        <TabsContent value="kematian">
          <SkkGenerator />
        </TabsContent>
      </Tabs>
    </div>
  )
}
