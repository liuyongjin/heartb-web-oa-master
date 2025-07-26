"use client";

import { Button, Select, SelectItem, Spinner } from "@nextui-org/react";
import React, { useState, useEffect } from "react";

interface FileImportProps {
  onFileImport: (text: string) => void;
}

export const FileImport: React.FC<FileImportProps> = ({ onFileImport }) => {
  const [selectedFile, setSelectedFile] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [importError, setImportError] = useState<string>("");
  const [files, setFiles] = useState<{ key: string; label: string }[]>([]);

  // Fetch file list from API
  useEffect(() => {
    const fetchFiles = async () => {
      const response = await fetch("/api/files");

      if (response.ok) {
        const data = await response.json();

        setFiles(data.files);
      }
    };

    fetchFiles();
  }, []);

  // Handle file selection and automatic import
  const handleFileSelect = async (key: string) => {
    if (!key) return;

    setSelectedFile(key);
    setIsLoading(true);
    setImportError("");

    try {
      // Use API route to access file
      const response = await fetch(`/api/file?filename=${key}`);

      if (!response.ok) {
        throw new Error(`Failed to load file: ${response.statusText}`);
      }
      const text = await response.text();

      onFileImport(text);
    } catch (error) {
      setImportError("Failed to import file. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle retry import
  const handleRetryImport = () => {
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  };

  return (
    <div className="w-full border-b-small border-divider">
      <div className="flex flex-col gap-2 mt-3 mb-2">
        <div className="flex gap-2">
          <Select
            className="w-[160px]"
            classNames={{
              value: "text-black",
              trigger: "!bg-transparent !shadow-none",
              innerWrapper: "!border-0",
              mainWrapper: "!border-0",
              selectorIcon: "hidden",
            }}
            isDisabled={isLoading}
            placeholder="Import txt"
            selectedKeys={selectedFile ? [selectedFile] : []}
            startContent={isLoading ? <Spinner size="sm" /> : null}
            onChange={(e) => handleFileSelect(e.target.value)}
          >
            {files.map((file) => (
              <SelectItem key={file.key} value={file.key}>
                {file.label}
              </SelectItem>
            ))}
          </Select>
        </div>

        {importError && (
          <div className="flex items-center justify-between text-red-500 text-sm mt-1">
            <span>{importError}</span>
            <Button
              color="primary"
              size="sm"
              variant="flat"
              onPress={handleRetryImport}
            >
              Retry
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
