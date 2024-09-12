import React, { useState } from 'react';
import { Copy, ChevronDown, ChevronUp } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import toast from 'react-hot-toast';

interface OcrResultTableProps {
  data: Record<string, string>;
}

export function OcrResultTable({ data }: OcrResultTableProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const copyToClipboard = (text: string, message: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success(message, {
        duration: 700,
        position: 'bottom-center',
      });
    });
  };

  const copyRow = (key: string, value: string) => {
    copyToClipboard(`${key}\t${value}`, `Copied: ${key}`);
  };

  const copyAll = () => {
    const allText = Object.entries(data)
      .map(([key, value]) => `${key}\t${value}`)
      .join('\n');
    copyToClipboard(allText, 'Copied all fields');
  };

  const hasResults = Object.keys(data).length > 0;
  const entries = Object.entries(data);
  const displayedEntries = isExpanded ? entries : entries.slice(0, 2);

  return (
    <div className="relative">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Field</TableHead>
            <TableHead>Value</TableHead>
            <TableHead className="w-[50px]">
              <Copy
                className={`h-4 w-4 ${hasResults ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}
                onClick={hasResults ? copyAll : undefined}
                aria-label="Copy All"
              />
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {displayedEntries.map(([key, value]) => (
            <TableRow key={key}>
              <TableCell>{key}</TableCell>
              <TableCell>{value}</TableCell>
              <TableCell>
                <Copy
                  className="h-4 w-4 cursor-pointer"
                  onClick={() => copyRow(key, value)}
                  aria-label={`Copy ${key}`}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {entries.length > 2 && (
        <div className="flex justify-center mt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="mr-2 h-4 w-4" /> Collapse
              </>
            ) : (
              <>
                <ChevronDown className="mr-2 h-4 w-4" /> Expand
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}