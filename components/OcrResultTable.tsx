import React from 'react';
import { Copy } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import toast from 'react-hot-toast';

interface OcrResultTableProps {
  data: Record<string, string>;
}

export function OcrResultTable({ data }: OcrResultTableProps) {
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

  return (
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
        {Object.entries(data).map(([key, value]) => (
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
  );
}