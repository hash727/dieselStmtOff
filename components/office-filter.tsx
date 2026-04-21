import React from 'react'
import { useRouter, useSearchParams } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

type office = {
    id: string
    name: string
}
type offices = office[]

const OfficeFilter = ({ offices }: { offices: offices}) => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentOfficeId = searchParams.get("officeId") || "all";

    const onSelect = (value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if(value === "all"){
            params.delete("officeId");
        }else{
            params.set("officeId", value)
        }
        router.push(`?${params.toString()}`);
    }
  return (
    <Select value={currentOfficeId} onValueChange={onSelect}>
        <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by Office" />
        </SelectTrigger>
        <SelectContent>
            <SelectItem value="all">All Offices</SelectItem>
            {offices.map((office) => (
                <SelectItem key={office.id} value={office.id}>
                    {office.name}
                </SelectItem>
            ))}
        </SelectContent>
    </Select>
  )
}

export default OfficeFilter