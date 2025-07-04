"use client"

import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, ArrowUpDown } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export type Patient = {
  id: string
  name: string
  age: number
  sex: "Male" | "Female" | "Other"
  diagnosis: string
  treatment: string
  status: "Active" | "Discharged" | "Deceased"
  presentingComplaints: string
  comorbidities: string
  adviceOnDischarge?: string
}

const statusVariantMap: { [key in Patient["status"]]: "default" | "secondary" | "destructive" } = {
    Active: "default",
    Discharged: "secondary",
    Deceased: "destructive",
};

type GetColumnsProps = {
  onEdit: (patient: Patient) => void;
  onDelete: (patient: Patient) => void;
  onDischarge: (patient: Patient) => void;
}

export const getColumns = ({ onEdit, onDelete, onDischarge }: GetColumnsProps): ColumnDef<Patient>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Patient
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => (
        <div className="flex items-center gap-3">
            <Avatar>
                <AvatarImage src={`https://placehold.co/40x40.png`} alt={row.getValue("name")} data-ai-hint="person portrait" />
                <AvatarFallback>{(row.getValue("name") as string).substring(0,2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="font-medium">{row.getValue("name")}</div>
        </div>
    ),
  },
  {
    accessorKey: "age",
    header: "Age",
  },
  {
    accessorKey: "sex",
    header: "Sex",
  },
  {
    accessorKey: "diagnosis",
    header: "Diagnosis",
  },
  {
    accessorKey: "treatment",
    header: "Treatment",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as Patient["status"];
      return <Badge variant={statusVariantMap[status]}>{status}</Badge>
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const patient = row.original
      const isDischarged = patient.status === 'Discharged';

      return (
        <div className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(patient.id)}
              >
                Copy patient ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onEdit(patient)}>
                Edit record
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDischarge(patient)}
                disabled={isDischarged}
              >
                Discharge Patient
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="text-destructive"
                onClick={() => onDelete(patient)}
              >
                Delete record
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    },
  },
]
