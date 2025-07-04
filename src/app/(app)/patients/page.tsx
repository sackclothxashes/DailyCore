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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from "@/components/ui/calendar";
import { PlusCircle, Calendar as CalendarIcon } from 'lucide-react';
import { Patient, getColumns } from '@/components/app/patients/columns';
import { DataTable } from '@/components/app/patients/data-table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';


const initialPatients: Patient[] = [
  {
    id: 'PAT-001',
    name: 'John Doe',
    age: 45,
    sex: 'Male',
    diagnosis: 'Hypertension',
    treatment: 'Lisinopril',
    status: 'Active',
    presentingComplaints: 'Headaches, dizziness',
    comorbidities: 'None',
    admissionDate: new Date('2024-07-10'),
  },
  {
    id: 'PAT-002',
    name: 'Jane Smith',
    age: 34,
    sex: 'Female',
    diagnosis: 'Type 2 Diabetes',
    treatment: 'Metformin',
    status: 'Active',
    presentingComplaints: 'Fatigue, frequent urination',
    comorbidities: 'Obesity',
    admissionDate: new Date('2024-07-12'),
  },
  {
    id: 'PAT-003',
    name: 'Peter Jones',
    age: 62,
    sex: 'Male',
    diagnosis: 'Pneumonia',
    treatment: 'Amoxicillin',
    status: 'Discharged',
    presentingComplaints: 'Cough, fever, shortness of breath',
    comorbidities: 'COPD',
    adviceOnDischarge: 'Continue full course of antibiotics. Follow up in 1 week.',
    admissionDate: new Date('2024-07-01'),
    dischargeDate: new Date('2024-07-08'),
  },
  {
    id: 'PAT-004',
    name: 'Mary Johnson',
    age: 78,
    sex: 'Female',
    diagnosis: 'Heart Failure',
    treatment: 'Furosemide',
    status: 'Deceased',
    presentingComplaints: 'Shortness of breath, swelling in legs',
    comorbidities: 'Kidney disease',
    admissionDate: new Date('2024-06-20'),
  },
  {
    id: 'PAT-005',
    name: 'David Williams',
    age: 29,
    sex: 'Male',
    diagnosis: 'Asthma',
    treatment: 'Albuterol Inhaler',
    status: 'Active',
    presentingComplaints: 'Wheezing, chest tightness',
    comorbidities: 'Allergic rhinitis',
    admissionDate: new Date('2024-07-15'),
  },
];

const emptyPatient: Omit<Patient, 'id' | 'status' | 'dischargeDate'> = {
  name: '',
  age: 0,
  sex: 'Other',
  diagnosis: '',
  treatment: '',
  presentingComplaints: '',
  comorbidities: '',
  adviceOnDischarge: '',
  admissionDate: new Date(),
};

export default function PatientsPage() {
  const [patients, setPatients] = React.useState<Patient[]>(initialPatients);
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [isDischargeDialogOpen, setIsDischargeDialogOpen] = React.useState(false);
  
  const [selectedPatient, setSelectedPatient] = React.useState<Patient | null>(null);
  const [patientFormData, setPatientFormData] = React.useState<Omit<Patient, 'id' | 'status'>>(emptyPatient);
  const [dischargeAdvice, setDischargeAdvice] = React.useState('');

  const [showAdmissionDatePicker, setShowAdmissionDatePicker] = React.useState(false);
  const [showEditAdmissionDatePicker, setShowEditAdmissionDatePicker] = React.useState(false);


  const handleEditClick = (patient: Patient) => {
    setSelectedPatient(patient);
    setPatientFormData(patient);
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (patient: Patient) => {
    setSelectedPatient(patient);
    setIsDeleteDialogOpen(true);
  };

  const handleDischargeClick = (patient: Patient) => {
    setSelectedPatient(patient);
    setDischargeAdvice(patient.adviceOnDischarge || '');
    setIsDischargeDialogOpen(true);
  };

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | string,
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
      Math.max(0, ...patients.map((p) => parseInt(p.id.split('-')[1], 10))) + 1;
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
          ? { ...selectedPatient, ...patientFormData }
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

  const handleDischargeConfirm = () => {
    if (!selectedPatient) return;
    setPatients(
      patients.map((p) =>
        p.id === selectedPatient.id
          ? { ...p, status: 'Discharged', adviceOnDischarge: dischargeAdvice, dischargeDate: new Date() }
          : p
      )
    );
    setIsDischargeDialogOpen(false);
    setSelectedPatient(null);
  };

  const columns = React.useMemo(
    () => getColumns({ onEdit: handleEditClick, onDelete: handleDeleteClick, onDischarge: handleDischargeClick }),
    []
  );

  const currentPatients = patients.filter(p => p.status === 'Active' || p.status === 'Deceased');
  const dischargedPatients = patients.filter(p => p.status === 'Discharged');

  return (
    <div>
      <PageHeader
        title="Patient Log"
        description="A secure and organized way to manage patient records."
      >
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setPatientFormData(emptyPatient);
              setShowAdmissionDatePicker(false);
            }}>
              <PlusCircle className="mr-2" />
              Add Patient
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Patient</DialogTitle>
              <DialogDescription>
                Enter the details for the new patient.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={patientFormData.name} onChange={(e) => handleFormChange(e, 'name')} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Input id="age" type="number" value={patientFormData.age} onChange={(e) => handleFormChange(e, 'age')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sex">Sex</Label>
                  <Select value={patientFormData.sex} onValueChange={(value) => handleFormChange(value, 'sex')}>
                    <SelectTrigger id="sex"><SelectValue placeholder="Select sex" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Admission Date</Label>
                 <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !patientFormData.admissionDate && "text-muted-foreground"
                    )}
                    onClick={() => setShowAdmissionDatePicker(!showAdmissionDatePicker)}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {patientFormData.admissionDate ? format(patientFormData.admissionDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                  {showAdmissionDatePicker && (
                    <Calendar
                      mode="single"
                      selected={patientFormData.admissionDate}
                      onSelect={(date) => {
                        setPatientFormData(prev => ({ ...prev, admissionDate: date || new Date() }));
                        setShowAdmissionDatePicker(false);
                      }}
                      initialFocus
                    />
                  )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="diagnosis">Diagnosis</Label>
                <Input id="diagnosis" value={patientFormData.diagnosis} onChange={(e) => handleFormChange(e, 'diagnosis')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="treatment">Treatment</Label>
                <Input id="treatment" value={patientFormData.treatment} onChange={(e) => handleFormChange(e, 'treatment')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="presenting-complaints">Presenting Complaints</Label>
                <Textarea id="presenting-complaints" value={patientFormData.presentingComplaints} onChange={(e) => handleFormChange(e, 'presentingComplaints')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="comorbidities">Comorbidities</Label>
                <Textarea id="comorbidities" value={patientFormData.comorbidities} onChange={(e) => handleFormChange(e, 'comorbidities')} />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
              <Button onClick={handleAddPatient}>Add Patient</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PageHeader>

      <Tabs defaultValue="current">
        <TabsList>
          <TabsTrigger value="current">Current Patients</TabsTrigger>
          <TabsTrigger value="discharged">Discharged Patients</TabsTrigger>
        </TabsList>
        <TabsContent value="current">
          <DataTable columns={columns} data={currentPatients} />
        </TabsContent>
        <TabsContent value="discharged">
          <DataTable columns={columns} data={dischargedPatients} />
        </TabsContent>
      </Tabs>


      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedPatient?.status === 'Discharged' ? 'Patient Details' : 'Edit Patient'}: {selectedPatient?.name}</DialogTitle>
            <DialogDescription>
              {selectedPatient?.status === 'Discharged' ? 'Viewing details for a discharged patient.' : 'Update patient details below.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input id="edit-name" value={patientFormData.name} onChange={(e) => handleFormChange(e, 'name')} disabled={selectedPatient?.status === 'Discharged'} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-age">Age</Label>
                <Input id="edit-age" type="number" value={patientFormData.age} onChange={(e) => handleFormChange(e, 'age')} disabled={selectedPatient?.status === 'Discharged'} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-sex">Sex</Label>
                <Select value={patientFormData.sex} onValueChange={(value) => handleFormChange(value, 'sex')} disabled={selectedPatient?.status === 'Discharged'}>
                  <SelectTrigger id="edit-sex"><SelectValue placeholder="Select sex" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Admission Date</Label>
                    <Button
                        variant={"outline"}
                        className={cn( "w-full justify-start text-left font-normal", !patientFormData.admissionDate && "text-muted-foreground")}
                        onClick={() => setShowEditAdmissionDatePicker(!showEditAdmissionDatePicker)}
                        disabled={selectedPatient?.status === 'Discharged'}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {patientFormData.admissionDate ? format(patientFormData.admissionDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                    {showEditAdmissionDatePicker && (
                        <Calendar
                        mode="single"
                        selected={patientFormData.admissionDate}
                        onSelect={(date) => {
                            setPatientFormData(prev => ({ ...prev, admissionDate: date || new Date() }));
                            setShowEditAdmissionDatePicker(false);
                        }}
                        initialFocus
                        />
                    )}
                </div>
                 {selectedPatient?.dischargeDate && (
                    <div className="space-y-2">
                        <Label>Discharge Date</Label>
                        <Input value={format(selectedPatient.dischargeDate, "PPP")} disabled />
                    </div>
                )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-diagnosis">Diagnosis</Label>
              <Input id="edit-diagnosis" value={patientFormData.diagnosis} onChange={(e) => handleFormChange(e, 'diagnosis')} disabled={selectedPatient?.status === 'Discharged'} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-treatment">Treatment</Label>
              <Input id="edit-treatment" value={patientFormData.treatment} onChange={(e) => handleFormChange(e, 'treatment')} disabled={selectedPatient?.status === 'Discharged'} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-presenting-complaints">Presenting Complaints</Label>
              <Textarea id="edit-presenting-complaints" value={patientFormData.presentingComplaints} onChange={(e) => handleFormChange(e, 'presentingComplaints')} disabled={selectedPatient?.status === 'Discharged'} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-comorbidities">Comorbidities</Label>
              <Textarea id="edit-comorbidities" value={patientFormData.comorbidities} onChange={(e) => handleFormChange(e, 'comorbidities')} disabled={selectedPatient?.status === 'Discharged'} />
            </div>
            {selectedPatient?.adviceOnDischarge && (
                 <div className="space-y-2">
                    <Label htmlFor="edit-advice">Advice on Discharge</Label>
                    <Textarea id="edit-advice" value={selectedPatient.adviceOnDischarge} disabled rows={4} />
                 </div>
            )}
          </div>
          <DialogFooter>
            {selectedPatient?.status === 'Discharged' ? (
                <DialogClose asChild><Button variant="outline">Close</Button></DialogClose>
            ) : (
                <>
                    <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                    <Button onClick={handleUpdatePatient}>Save Changes</Button>
                </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Discharge Dialog */}
      <Dialog open={isDischargeDialogOpen} onOpenChange={setIsDischargeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Discharge Patient: {selectedPatient?.name}</DialogTitle>
            <DialogDescription>Add discharge advice and confirm to discharge the patient.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="discharge-advice">Advice on Discharge</Label>
              <Textarea
                id="discharge-advice"
                value={dischargeAdvice}
                onChange={(e) => setDischargeAdvice(e.target.value)}
                placeholder="e.g., Continue medication, schedule follow-up..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button onClick={handleDischargeConfirm} variant="secondary">Confirm Discharge</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
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
            <AlertDialogAction onClick={handleDeleteConfirm}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}
