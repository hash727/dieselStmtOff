import LeasedLinePicker from '@/components/leasedline/leasedline-picker';
import { prisma } from '@/lib/prisma';
import React from 'react'


const DiagnosticPage = async () => {
    const leasedLines = await prisma.leasedLine.findMany({
        select: { 
            id: true, 
            customerName: true,
            bsnlTip: true, 
            lcId: true, 
            wanIp: true, 
            serviceType: true, 
            bandwidth: true 
        },
        orderBy: { customerName: 'asc' }
    });

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <LeasedLinePicker leasedLines={leasedLines} />
        </div>
    );
}

export default DiagnosticPage