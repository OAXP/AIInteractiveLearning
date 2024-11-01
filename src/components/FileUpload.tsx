import { useDropzone } from 'react-dropzone';
import { FileUp, File } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
}

export default function FileUpload({ onFileSelect }: FileUploadProps) {
  const { getRootProps, getInputProps, isDragActive, acceptedFiles } = useDropzone({
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    onDrop: (files) => files[0] && onFileSelect(files[0])
  });

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'}`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center space-y-4">
          {acceptedFiles.length > 0 ? (
            <>
              <File className="w-12 h-12 text-blue-500" />
              <p className="text-lg font-medium text-gray-900">
                {acceptedFiles[0].name}
              </p>
              <p className="text-sm text-gray-500">
                Clicker ou glisser pour remplacer le fichier
              </p>
            </>
          ) : (
            <>
              <FileUp className="w-12 h-12 text-gray-400" />
              <p className="text-lg font-medium text-gray-900">
                Déposer votre PDF ici, ou cliquer pour sélectionner un fichier
              </p>
              <p className="text-sm text-gray-500">
                Seuls les fichiers PDF sont supportés
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}