"use client";

import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { runManualNightAuditAction } from "../actions";

interface RunNightAuditButtonProps {
  noShowCount: number;
}

export function RunNightAuditButton({ noShowCount }: RunNightAuditButtonProps) {
  const handleRunAudit = async () => {
    if (!confirm(`Are you sure you want to run the Night Audit for today? This will process ${noShowCount} no-shows and close the business day. This action CANNOT be undone.`)) {
      return;
    }
    
    toast.loading("Running manual Night Audit... Please wait.");
    const result = await runManualNightAuditAction(); // Call the specific manual action
    toast.dismiss();

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(result.success!);
    }
  };

  return (
    <Button 
      variant="destructive" 
      size="lg" 
      className="w-full md:w-auto"
      onClick={handleRunAudit}
    >
      Run Manual Night Audit & Close Todays Business Day
    </Button>
  );
}