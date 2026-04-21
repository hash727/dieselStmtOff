'use client'

import { addDieselRefill } from '@/app/actions/engine';
import React, { useState } from 'react'
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Button } from './ui/button';
import { Fuel, Loader2, Plus } from 'lucide-react';
import { Label } from './ui/label';
import { Input } from './ui/input';

// type Props = {}

const AddDieselRefill = ({ officeId }: { officeId: string}) => {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>){
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.currentTarget);
        const res = await addDieselRefill({ success: false}, formData)

        if(res.success){
            toast.success(res.success);
            setOpen(false);  //Closes the modal on success
        }else{
            toast.error(res.error);
        }
        setLoading(false);
    }
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex gap-2 border-emerald-600 text-emerald-700 hover:bg-emerald-50">
          <Plus className="h-4 w-4" /> Add Diesel Refill
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Fuel className="h-5 w-5 text-emerald-600" /> Log Diesel Refill
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <input type="hidden" name="officeId" value={officeId} />
          
          <div className="space-y-2">
            <Label htmlFor="date">Refill Date</Label>
            <Input type="date" name="date" id="date" required defaultValue={new Date().toISOString().split('T')[0]} />
          </div>

          <div className='grid grid-cols-2 gap-4'  >
            <div className="space-y-2">
                <Label htmlFor="quantity">Quantity (Litres)</Label>
                <Input type="number" step="0.1" name="quantity" id="quantity" placeholder="e.g. 50.5" required />
            </div>
            <div className="space-y-2">
                <Label htmlFor="time">Refill Time</Label>
                <Input 
                type="time" 
                name="time" 
                id="time" 
                required 
                defaultValue={new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} 
                />
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={loading}>
              {loading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : "Save Refill"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default AddDieselRefill