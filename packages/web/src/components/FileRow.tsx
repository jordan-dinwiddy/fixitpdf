import { UserFile } from "fixitpdf-shared";
import { AlertCircle, CheckCircle2, FileText, Loader2, TriangleAlert } from 'lucide-react';
import { DeleteFileButton } from './DeleteFileButton';
import { DownloadFileButton } from "./DownloadFileButton";
import { FixFileButton } from './FixFileButton';

export interface FileRowProps {
  file: UserFile;
  onDelete: (file: UserFile) => void;
  onFix: (file: UserFile) => void;
}

/**
 * Row representing a file in the file list.
 * 
 * @param param0 
 * @returns 
 */
export const FileRow = ({ file, onDelete, onFix }: FileRowProps) => {

  let statusColor: string;

  switch (file.state) {
    case 'uploading':
      statusColor = 'text-gray-500';
      break;
    case 'processing':
      statusColor = 'text-blue-500';
      break;
    case 'processed':
      statusColor = 'text-orange-500';
      break;
    case 'purchased':
      statusColor = 'text-green-500';
      break;
    case 'processing_failed':
      statusColor = 'text-red-500';
      break;
    default:
      statusColor = 'text-gray-500';
  }

  return (
    <li key={file.id} className="flex items-center justify-between p-4 gap-4 rounded-lg transition-all duration-300 border hover:bg-gray-50">
      <FileText className="h-8 w-8 flex-shrink-0 text-purple-500" />

      <div className="flex-grow min-w-0">
        <p className="text-sm font-medium truncate text-gray-800">{file.name}</p>
        <div className={`flex items-center gap-1 mt-1 text-sm font-medium ${statusColor}`}>

          {file.state === 'uploading' && (
            <>
              <Loader2 className="animate-spin h-4 w-4" />
              Uploading...
            </>
          )}

          {file.state === 'processing' && (
            <>
              <Loader2 className="animate-spin h-4 w-4" />
              Analyzing...
            </>
          )}

          {file.state === 'processed' && (
            <>
              <AlertCircle className="w-4 h-4" />
              {file.issueCount} {file.issueCount === 1 ? 'issue' : 'issues'} found
            </>
          )}

          {file.state === 'purchased' && (
            <>
              <CheckCircle2 className="w-4 h-4" />
              {file.issueCount} {file.issueCount === 1 ? 'issue' : 'issues'} fixed!
            </>
          )}

          {file.state === 'processing_failed' && (
            <>
              <TriangleAlert className="w-4 h-4" />
              Unable to fix
            </>
          )}
        </div>
      </div>

      { /* File actions */}
      <div className="flex items-center">
        {file.state === 'processed' && file.issueCount > 0 && (
          <FixFileButton onClick={() => onFix(file)} />
        )}
        {file.state === 'purchased' && (
          <DownloadFileButton userFile={file} />
        )}
        <DeleteFileButton onClick={() => onDelete(file)} />
      </div>
    </li>
  )
}