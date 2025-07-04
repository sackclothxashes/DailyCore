'use client';

import * as React from 'react';
import { PageHeader } from '@/components/app/page-header';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PlusCircle } from 'lucide-react';
import { Patient, getColumns } from '@/components/app/patients/columns';
import { DataTable } from '@/components/app/patients/data-table';

const initialPatients: Patient[] = [
  {
    id: 'PAT-001',
    name: 'John Doe',
    age: 45,
    sex: 'Male',
    diagnosis: 'Hypertension',
    treatment: 'Lisinopril',
    status: 'Active',
  },
  {
    id: 'PAT-002',
    name: 'Jane Smith',
    age: 34,
    sex: 'Female',
    diagnosis: 'Type 2 Diabetes',
    treatment: 'Metformin',
    status: 'Active',
  },
  {
    id: 'PAT-003',
    name: 'Peter Jones',
    age: 62,
    sex: 'Male',
    diagnosis: 'Pneumonia',
    treatment: 'Amoxicillin',
    status: 'Recovered',
  },
  {
    id: 'PAT-004',
    name: 'Mary Johnson',
    age: 78,
    sex: 'Female',
    diagnosis: 'Heart Failure',
    treatment: 'Furosemide',
    status: 'Deceased',
  },
  {
    id: 'PAT-005',
    name: 'David Williams',
    age: 29,
    sex: 'Male',
    diagnosis: 'Asthma',
    treatment: 'Albuterol Inhaler',
    status: 'Active',
  },
];

const emptyPatient: Omit<Patient, 'id' | 'status'> = {
  name: '',
  age: 0,
  sex: 'Other',
  diagnosis: '',
  treatment: '',
};

export default function PatientsPage() {
  const [patients, setPatients] = React.useState<Patient[]>(initialPatients);
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [selectedPatient, setSelectedPatient] = React.useState<Patient | null>(
    null
  );
  const [patientFormData, setPatientFormData] = React.useState(emptyPatient);

  const handleEditClick = (patient: Patient) => {
    setSelectedPatient(patient);
    setPatientFormData(patient);
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (patient: Patient) => {
    setSelectedPatient(patient);
    setIsDeleteDialogOpen(true);
  };

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement> | string,
    field: keyof typeof patientFormData
  ) => {
    if (typeof e === 'string') {
      setPatientFormData((prev) => ({ ...prev, [field]: e }));
    } else {
      setPatientFormData((prev) => ({
        ...prev,
        [field]:
          e.target.type === 'number'
            ? e.target.valueAsNumber || 0
            : e.target.value,
      }));
    }
  };

  const handleAddPatient = () => {
    const newIdNumber =
      Math.max(...patients.map((p) => parseInt(p.id.split('-')[1], 10))) + 1;
    const newPatient: Patient = {
      ...patientFormData,
      id: `PAT-${String(newIdNumber).padStart(3, '0')}`,
      status: 'Active',
    };
    setPatients([...patients, newPatient]);
    setIsAddDialogOpen(false);
  };

  const handleUpdatePatient = () => {
    if (!selectedPatient) return;
    setPatients(
      patients.map((p) =>
        p.id === selectedPatient.id
          ? { ...p, ...(patientFormData as Patient) }
          : p
      )
    );
    setIsEditDialogOpen(false);
    setSelectedPatient(null);
  };

  const handleDeleteConfirm = () => {
    if (!selectedPatient) return;
    setPatients(patients.filter((p) => p.id !== selectedPatient.id));
    setIsDeleteDialogOpen(false);
    setSelectedPatient(null);
  };

  const columns = React.useMemo(
    () => getColumns({ onEdit: handleEditClick, onDelete: handleDeleteClick }),
    []
  );

  return (
    <div>
      <PageHeader
        title="Patient Log"
        description="A secure and organized way to manage patient records."
      >
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setPatientFormData(emptyPatient)}>
              <PlusCircle className="mr-2" />
              Add Patient
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Patient</DialogTitle>
              <DialogDescription>
                Enter the details for the new patient.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={patientFormData.name}
                  onChange={(e) => handleFormChange(e, 'name')}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    value={patientFormData.age}
                    onChange={(e) => handleFormChange(e, 'age')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sex">Sex</Label>
                  <Select
                    value={patientFormData.sex}
                    onValueChange={(value) => handleFormChange(value, 'sex')}
                  >
                    <SelectTrigger id="sex">
                      <SelectValue placeholder="Select sex" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="diagnosis">Diagnosis</Label>
                <Input
                  id="diagnosis"
                  value={patientFormData.diagnosis}
                  onChange={(e) => handleFormChange(e, 'diagnosis')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="treatment">Treatment</Label>
                <Input
                  id="treatment"
                  value={patientFormData.treatment}
                  onChange={(e) => handleFormChange(e, 'treatment')}
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button onClick={handleAddPatient}>Add Patient</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PageHeader>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Patient: {selectedPatient?.name}</DialogTitle>
            <DialogDescription>Update patient details below.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={patientFormData.name}
                onChange={(e) => handleFormChange(e, 'name')}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-age">Age</Label>
                <Input
                  id="edit-age"
                  type="number"
                  value={patientFormData.age}
                  onChange={(e) => handleFormChange(e, 'age')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-sex">Sex</Label>
                <Select
                  value={patientFormData.sex}
                  onValueChange={(value) => handleFormChange(value, 'sex')}
                >
                  <SelectTrigger id="edit-sex">
                    <SelectValue placeholder="Select sex" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-diagnosis">Diagnosis</Label>
              <Input
                id="edit-diagnosis"
                value={patientFormData.diagnosis}
                onChange={(e) => handleFormChange(e, 'diagnosis')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-treatment">Treatment</Label>
              <Input
                id="edit-treatment"
                value={patientFormData.treatment}
                onChange={(e) => handleFormChange(e, 'treatment')}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleUpdatePatient}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              record for <strong>{selectedPatient?.name}</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <DataTable columns={columns} data={patients} />
    </div>
  );
}
