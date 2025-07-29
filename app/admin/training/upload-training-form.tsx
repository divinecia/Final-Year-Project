"use client";

import React, { useRef, useState } from "react";

interface UploadTrainingFormProps {
    onUpload?: (file: File) => void;
}

const UploadTrainingForm: React.FC<UploadTrainingFormProps> = ({ onUpload }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Example: Only allow PDF or CSV files under 5MB
            if (
                !["application/pdf", "text/csv"].includes(file.type) ||
                file.size > 5 * 1024 * 1024
            ) {
                setError("Please upload a PDF or CSV file under 5MB.");
                setSelectedFile(null);
                return;
            }
            setError(null);
            setSelectedFile(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedFile) {
            setError("No file selected.");
            return;
        }
        setError(null);
        onUpload?.(selectedFile);
        // Reset form
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto p-4 border rounded">
            <label className="block font-medium">
                Upload Training File
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.csv"
                    onChange={handleFileChange}
                    className="block mt-2"
                />
            </label>
            {selectedFile && (
                <div className="text-sm text-gray-700">
                    Selected: {selectedFile.name}
                </div>
            )}
            {error && (
                <div className="text-sm text-red-600">{error}</div>
            )}
            <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                disabled={!selectedFile}
            >
                Upload
            </button>
        </form>
    );
};

export default UploadTrainingForm;
