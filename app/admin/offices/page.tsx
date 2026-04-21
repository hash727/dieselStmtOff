// app/admin/offices/page.tsx
import AddOfficeForm from "@/components/office/add-office-form"
import { prisma } from "@/lib/prisma"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default async function AdminOfficesPage() {
  const offices = await prisma.office.findMany({
    orderBy: { name: 'asc' }
  })

  return (
    <div className="container mx-auto py-10 px-4 space-y-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Office Management</h1>
        <p className="text-muted-foreground">Manage and monitor all registered exchange locations.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-10 items-start">
        {/* Left Side: The Form */}
        <AddOfficeForm />

        {/* Right Side: Existing Offices List */}
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Existing Offices</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Office Name</TableHead>
                <TableHead>Location</TableHead>
                <TableHead className="text-right">Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {offices.map((office) => (
                <TableRow key={office.id}>
                  <TableCell className="font-medium">{office.name}</TableCell>
                  <TableCell>{office.location || "N/A"}</TableCell>
                  <TableCell className="text-right text-muted-foreground text-xs">
                    {new Date(office.createdAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
