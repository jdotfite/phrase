// src/components/common/ExportModal.tsx

import React, { useState } from 'react';
import { saveAs } from 'file-saver';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (options: ExportOptions) => Promise<ExportResult | null>;
  isLoading: boolean;
}

interface ExportOptions {
  exportJson: boolean;
  exportHeader: boolean;
  optimizeForESP32: boolean;
}

interface ExportResult {
  jsonData: any;
  headerContent: string;
}

const ExportModal: React.FC<ExportModalProps> = ({ 
  isOpen, 
  onClose, 
  onExport,
  isLoading
}) => {
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    exportJson: true,
    exportHeader: true,
    optimizeForESP32: true
  });

  const handleOptionChange = (option: keyof ExportOptions) => {
    setExportOptions(prev => ({
      ...prev,
      [option]: !prev[option]
    }));
  };

  const handleExport = async () => {
    const data = await onExport(exportOptions);
    
    if (!data) return;

    // Download files based on options
    if (exportOptions.exportJson) {
      const jsonBlob = new Blob(
        [JSON.stringify(data.jsonData, null, 2)], 
        { type: 'application/json' }
      );
      saveAs(jsonBlob, 'phrases_esp32.json');
    }
    
    if (exportOptions.exportHeader) {
      const headerBlob = new Blob(
        [data.headerContent], 
        { type: 'text/plain' }
      );
      saveAs(headerBlob, 'phrases.h');
    }

    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export Phrases for ESP32</DialogTitle>
          <DialogDescription>
            Choose export options for your ESP32 catch phrase game
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="export-json" 
              checked={exportOptions.exportJson} 
              onCheckedChange={() => handleOptionChange('exportJson')}
            />
            <Label htmlFor="export-json">Export JSON file (for SPIFFS)</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="export-header" 
              checked={exportOptions.exportHeader} 
              onCheckedChange={() => handleOptionChange('exportHeader')}
            />
            <Label htmlFor="export-header">Export Arduino header file</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="optimize" 
              checked={exportOptions.optimizeForESP32} 
              onCheckedChange={() => handleOptionChange('optimizeForESP32')}
            />
            <Label htmlFor="optimize">Optimize for ESP32 memory usage</Label>
          </div>
        </div>
        
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            type="button" 
            onClick={handleExport}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : (
              'Export'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ExportModal;