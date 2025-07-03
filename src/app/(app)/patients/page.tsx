import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { Patient, columns } from "@/components/app/patients/columns";
import { DataTable } from "@/components/app/patients/data-table";

async function getData(): Promise<Patient[]> {
  // Fetch data from your API here.
  return [
    {
      id: "PAT-001",
      name: "John Doe",
      age: 45,
      sex: "Male",
      diagnosis: "Hypertension",
      treatment: "Lisinopril",
      status: "Active",
    },
    {
      id: "PAT-002",
      name: "Jane Smith",
      age: 34,
      sex: "Female",
      diagnosis: "Type 2 Diabetes",
      treatment: "Metformin",
      status: "Active",
    },
    {
      id: "PAT-003",
      name: "Peter Jones",
      age: 62,
      sex: "Male",
      diagnosis: "Pneumonia",
      treatment: "Amoxicillin",
      status: "Recovered",
    },
    {
      id: "PAT-004",
      name: "Mary Johnson",
      age: 78,
      sex: "Female",
      diagnosis: "Heart Failure",
      treatment: "Furosemide",
      status: "Deceased",
    },
    {
        id: "PAT-005",
        name: "David Williams",
        age: 29,
        sex: "Male",
        diagnosis: "Asthma",
        treatment: "Albuterol Inhaler",
        status: "Active",
    },
  ];
}

export default async function PatientsPage() {
  const data = await getData();

  return (
    <div>
      <PageHeader
        title="Patient Log"
        description="A secure and organized way to manage patient records."
      >
        <Button>
          <PlusCircle className="mr-2" />
          Add Patient
        </Button>
      </PageHeader>
      <DataTable columns={columns} data={data} />
    </div>
  );
}
