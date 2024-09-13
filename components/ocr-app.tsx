'use client'

import { useState, useCallback, useRef } from 'react'
import { useDropzone } from 'react-dropzone'
import Image from 'next/image'
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { X, Upload, Loader2 } from "lucide-react"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import axios from 'axios'
import { convertOCRResult } from '@/lib/ocr'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { OcrResultTable } from './OcrResultTable';
import { ImageModal } from './ImageModal';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';

interface FileWithPreview extends File {
  preview: string
}

interface OCRResult {
  fileName: string
  text: {
    type: string;
    [key: string]: string;
  }
}

interface OCRProvider {
  name: string;
  apiTypes: string[];
}

const ocrProviders: OCRProvider[] = [
  {
    name: "BAIDU",
    apiTypes: ["Financial Notes"]
  }
];

export function OcrApp() {
  const [files, setFiles] = useState<FileWithPreview[]>([])
  const [extracting, setExtracting] = useState(false)
  const [currentFile, setCurrentFile] = useState<{ index: number; name: string } | null>(null)
  const [progress, setProgress] = useState<number>(0)
  const [results, setResults] = useState<OCRResult[]>([])
  const [selectedProvider, setSelectedProvider] = useState<string>("BAIDU")
  const [selectedApiType, setSelectedApiType] = useState<string>("Financial Notes")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(prevFiles => [
      ...prevFiles,
      ...acceptedFiles.map(file => Object.assign(file, {
        preview: URL.createObjectURL(file)
      }))
    ])
    toast.success(`${acceptedFiles.length} file(s) uploaded`, { duration: 700 });
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/gif': ['.gif'],
      'image/webp': ['.webp'],
      'image/tiff': ['.tif', '.tiff'],
    },
    noClick: true,
  })

  const handlePaste = useCallback((event: React.ClipboardEvent) => {
    const items = event.clipboardData.items
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile()
        if (file) {
          onDrop([file])
        }
      }
    }
  }, [onDrop])

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      onDrop(Array.from(event.target.files))
    }
  }

  const openFileDialog = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const deleteFile = (fileName: string) => {
    setFiles(prevFiles => prevFiles.filter(file => file.name !== fileName))
    setResults(prevResults => prevResults.filter(result => result.fileName !== fileName))
  }

  const deleteAllFiles = () => {
    setFiles([])
    setResults([])
  }

  const extractText = async () => {
    setExtracting(true)
    setResults([])
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      setCurrentFile({ index: i, name: file.name })
      setProgress(0)
      
      try {
        
        const formData = new FormData()
        formData.append('image', file)
        formData.append('provider', selectedProvider)
        formData.append('apiType', selectedApiType)
        
        const response = await axios.post('/api/ocr', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
        
        const convertedResult = convertOCRResult(response.data, selectedProvider, selectedApiType)
                
        setResults(prev => [...prev, { fileName: file.name, text: convertedResult }])
        setProgress(100)
      } catch (error) {
        console.error('Error processing file:', file.name, error)
        setResults(prev => [...prev, { fileName: file.name, text: { type: 'error', error: 'Error processing file' } }])
      }
    }
    setExtracting(false)
    setCurrentFile(null)
  }

  const openImageModal = (imageSrc: string) => {
    setSelectedImage(imageSrc);
  };

  const closeImageModal = () => {
    setSelectedImage(null);
  };

  return (
    <div className="container mx-auto p-4" onPaste={handlePaste}>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 700,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
      <h1 className="text-2xl font-bold mb-4">OCR App</h1>
      <div className="flex space-x-4 mb-4">
        <Select value={selectedProvider} onValueChange={setSelectedProvider}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select OCR Provider" />
          </SelectTrigger>
          <SelectContent>
            {ocrProviders.map(provider => (
              <SelectItem key={provider.name} value={provider.name}>{provider.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedApiType} onValueChange={setSelectedApiType}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select API Type" />
          </SelectTrigger>
          <SelectContent>
            {ocrProviders.find(p => p.name === selectedProvider)?.apiTypes.map(apiType => (
              <SelectItem key={apiType} value={apiType}>{apiType}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div
        {...getRootProps()}
        className="border-2 border-dashed border-gray-300 rounded-lg p-8 mb-4 text-center"
      >
        <input {...getInputProps()} ref={fileInputRef} onChange={handleFileInputChange} />
        {isDragActive ? (
          <p className="text-lg">Drop the images here ...</p>
        ) : (
          <div>
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-600">Drag and drop images here, or</p>
            <Button 
              type="button" 
              onClick={openFileDialog} 
              variant="outline" 
              className="mt-2"
            >
              Select Files
            </Button>
            <p className="mt-1 text-xs text-gray-500">Supported formats: JPG, JPEG, PNG, GIF, WebP, TIFF</p>
          </div>
        )}
      </div>
      
      {files.length > 0 && (
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-semibold">Uploaded Images ({files.length} files)</h2>
            <Button onClick={deleteAllFiles} variant="destructive">Delete All</Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {files.map((file) => (
              <div key={file.name} className="w-24 h-24 relative group">
                <Image
                  src={file.preview}
                  alt={file.name}
                  layout="fill"
                  objectFit="cover"
                  className="rounded cursor-pointer"
                  onClick={() => openImageModal(file.preview)}
                />
                <button
                  onClick={() => deleteFile(file.name)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      <Button onClick={extractText} disabled={extracting || files.length === 0}>
        {extracting ? 'Extracting...' : 'Extract Text'}
      </Button>
      {extracting && currentFile && (
        <div className="mt-4">
          <h2 className="text-xl font-semibold mb-2">Extraction Progress</h2>
          <div className="flex items-center mb-2">
            <Loader2 className="animate-spin mr-2" />
            <p>{currentFile.index + 1} / {files.length} {currentFile.name} is extracting...</p>
          </div>
          <Progress value={progress} className="w-full" />
        </div>
      )}
      {results.length > 0 && (
        <Table className="mt-4">
          <TableCaption>OCR Results</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">No.</TableHead>
              <TableHead>File Name</TableHead>
              <TableHead>Thumbnail</TableHead>
              <TableHead>Recognized Text</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {results.map((result, index) => (
              <TableRow key={result.fileName}>
                <TableCell className="font-medium">{index + 1}</TableCell>
                <TableCell>{result.fileName}</TableCell>
                <TableCell>
                  <div className="w-16 h-16 relative cursor-pointer" onClick={() => openImageModal(files.find(f => f.name === result.fileName)?.preview || '')}>
                    <Image
                      src={files.find(f => f.name === result.fileName)?.preview || ''}
                      alt={result.fileName}
                      layout="fill"
                      objectFit="cover"
                      className="rounded"
                    />
                  </div>
                </TableCell>
                <TableCell>
                  {result.text.type ? (
                    <OcrResultTable data={result.text as Record<string, string>} />
                  ) : (
                    <pre className="whitespace-pre-wrap text-xs">
                      {JSON.stringify(result.text, null, 2)}
                    </pre>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      {selectedImage && (
        <ImageModal
          src={selectedImage}
          alt="Full size image"
          onClose={closeImageModal}
        />
      )}
    </div>
  )
}