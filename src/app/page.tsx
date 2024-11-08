'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CreditCard, Download, FileText, Loader, LogOut, Stethoscope, Upload, User } from 'lucide-react'
import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'

type FileStatus = 'uploading' | 'analyzing' | 'fixable' | 'fixing' | 'fixed';

interface PDFFile {
  id: string
  name: string
  status: FileStatus
  issuesCount?: number
}

export default function HomePage() {
  const [files, setFiles] = useState<PDFFile[]>([])
  const [isLoggedIn, setIsLoggedIn] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const updateFile = useCallback((fileId: string, updates: object) => {
    setFiles(prevFiles =>
      prevFiles.map(file =>
        file.id === fileId ? { ...file, ...updates } : file
      )
    )
  }, []);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFile = acceptedFiles[0] // Only take the first file
    if (newFile) {
      const pdfFile: PDFFile = {
        id: Date.now().toString(),
        name: newFile.name,
        status: 'uploading'
      }
      setFiles(prevFiles => [...prevFiles, pdfFile])

      // Simulate file upload
      setTimeout(() => {
        updateFile(pdfFile.id, { status: 'analyzing' });

        // Simulate analysis
        setTimeout(() => {
          updateFile(pdfFile.id, { status: 'fixable', issuesCount: Math.floor(Math.random() * 10) + 1 });
        }, 5000)
      }, 1500)
    }
  }, [updateFile]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: true
  });

  const handleFix = useCallback((id: string) => {
    console.log(`Fixing file with id: ${id}`);

    updateFile(id, { status: 'fixing' });

    // Simulate fixing process
    setTimeout(() => {
      updateFile(id, { status: 'fixed' });
    }, 3000);
  }, [updateFile]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, you would handle authentication here
    console.log('Login attempt:', email, password)
    setIsLoggedIn(true)
  }

  const handleDownload = useCallback((id: string) => {
    // Implement download logic here
    console.log(`Downloading file with id: ${id}`)
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500">
      <header className="bg-white/90 backdrop-blur-sm shadow-md">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Stethoscope className="h-8 w-8 text-purple-600 mr-2" />
              <h1 className="text-3xl font-bold text-purple-700">FixItPDF</h1>
            </div>
            <nav className="flex items-center space-x-4">
              {isLoggedIn ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <User className="h-5 w-5" />
                      <span className="sr-only">User menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <CreditCard className="mr-2 h-4 w-4" />
                      <span>Billing</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setIsLoggedIn(false)}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button variant="ghost" onClick={() => setIsLoggedIn(true)}>
                  Log in
                </Button>
              )}
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {!isLoggedIn ? (
          <Card className="w-full max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center text-purple-700">Login to FixItPDF</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full bg-purple-500 hover:bg-purple-600 text-white">
                  Log in
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl transition-all duration-300 hover:shadow-2xl">
              <CardHeader>
                <CardTitle className="text-3xl font-bold text-center text-purple-700">Upload Your PDF</CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-all duration-300 ${isDragActive ? 'border-purple-500 bg-purple-100 scale-105' : 'border-gray-300 hover:border-purple-400 hover:bg-purple-50'
                    }`}
                >
                  <input {...getInputProps()} />
                  <Upload className="mx-auto h-12 w-12 text-purple-500 mb-4" />
                  {
                    isDragActive ?
                      <p className="text-xl font-semibold text-purple-700">Drop the PDF files here ...</p> :
                      <p className="text-xl font-semibold text-gray-700">Drag &apos;n&apos; drop PDF files here, or click to select</p>
                  }
                  <p className="mt-2 text-sm text-gray-500">Supported files: PDF</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl transition-all duration-300 hover:shadow-2xl">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-purple-700">Your Files ({files.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {files.length === 0 ? (
                  <p className="text-center text-gray-500">No PDFs uploaded... yet</p>
                ) : (
                  <ul className="space-y-4">
                    {files.map((file) => (
                      <li key={file.id} className="flex items-center justify-between p-4 bg-purple-50 rounded-lg transition-all duration-300 hover:bg-purple-100">
                        <div className="flex items-center space-x-3">
                          <FileText className="h-6 w-6 text-purple-500" />
                          <span className="font-medium text-gray-700">{file.name}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          {file.status === 'uploading' && (
                            <span className="text-gray-500 flex items-center">
                              <Loader className="animate-spin h-4 w-4 mr-2" />
                              Uploading...
                            </span>
                          )}
                          {file.status === 'analyzing' && (
                            <span className="text-blue-500 flex items-center">
                              <Loader className="animate-spin h-4 w-4 mr-2" />
                              Analyzing...
                            </span>
                          )}
                          {file.status === 'fixable' && (
                            <>
                              <span className="text-orange-500">
                                Found {file.issuesCount} {file.issuesCount === 1 ? 'issue' : 'issues'} to fix
                              </span>
                              <Button
                                onClick={() => handleFix(file.id)}
                                variant="outline"
                                className="bg-gray-200 text-gray-800 hover:bg-gray-300 transition-all duration-300"
                              >
                                Fix!
                              </Button>
                            </>
                          )}
                          {file.status === 'fixing' && (
                            <span className="text-blue-500 flex items-center">
                              <Loader className="animate-spin h-4 w-4 mr-2" />
                              Fixing...
                            </span>
                          )}
                          {file.status === 'fixed' && (
                            <>
                              <span className="text-green-500">
                                {file.issuesCount} {file.issuesCount === 1 ? 'issue' : 'issues'} successfully fixed!
                              </span>
                              <Button
                                onClick={() => handleDownload(file.id)}
                                variant="outline"
                                className="bg-gray-200 text-gray-800 hover:bg-gray-300 transition-all duration-300"
                              >
                                <Download className="h-4 w-4 mr-2" />
                                Download
                              </Button>
                            </>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}