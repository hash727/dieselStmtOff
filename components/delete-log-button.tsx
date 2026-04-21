'use client'

import { deleteEnginelog, deleteLog } from '@/app/actions/engine';
import React, { useState, useTransition } from 'react'
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Trash2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';

interface Props  {
  id: string
  type: 'ENGINE' | 'DIESEL'
}

const DeleteLogButton = ({ id, type }: Props) => {
    // const [isPending, setIsPending] = useState(false)
    const [isPending, startTransition] = useTransition()

    const handleDelete = async () => {
        // if(!confirm("Aru you sure you want to delete this log?")) return;

        // // setIsPending(true);
        // const result = await deleteEnginelog(id);

        // if(result.success){
        //     toast.success("Log deleted")
        // }else{
        //     toast.error(result.error)
        // }
        // setIsPending(false);
        if(confirm(`Are you sure you want to delete this ${type.toLowerCase()} record?`)){
          startTransition(async () => {
            try {
              await deleteLog(id, type)
            } catch (error) {
              alert("Something went wrong")
            }
          })
        }
    }
  return (
    // <Button
    //     variant={'ghost'}
    //     size={'icon'}
    //     onClick={handleDelete}
    //     disabled={isPending}
    //     className='text-red-500 hover:text-red-700 hover:bg-red-50'
    // >
    //     <Trash2 className='h-4 w-4' />
    // </Button>
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50">
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the engine log entry from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleDelete}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            disabled={isPending}
          >
            {isPending ? "Deleting..." : "Delete Entry"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default DeleteLogButton