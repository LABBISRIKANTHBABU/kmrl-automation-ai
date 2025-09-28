import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import { toast } from "sonner";

export default function DepartmentUpload() {
  const departments = useQuery(api.departments.getAllDepartments);
  const recentDocuments = useQuery(api.documents.getRecentDocuments);
  const generateUploadUrl = useMutation(api.documents.generateUploadUrl);
  const uploadDocument = useMutation(api.documents.uploadDocument);

  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [trainId, setTrainId] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [expandedContent, setExpandedContent] = useState<string | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file size (max 50MB for all file types)
      if (file.size > 50 * 1024 * 1024) {
        toast.error("File size must be less than 50MB");
        return;
      }
      
      setSelectedFile(file);
      toast.success(`File "${file.name}" selected successfully`);
    }
  };

  const handleUpload = async () => {
    if (!selectedDepartment || !trainId.trim() || !selectedFile) {
      toast.error("Please select department, enter train ID, and choose a file");
      return;
    }

    // Validate Train ID format (basic validation)
    if (trainId.trim().length < 2) {
      toast.error("Train ID must be at least 2 characters long");
      return;
    }

    setUploading(true);
    try {
      // Step 1: Get upload URL
      const uploadUrl = await generateUploadUrl();

      // Step 2: Upload file to storage
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": selectedFile.type },
        body: selectedFile,
      });

      if (!result.ok) {
        throw new Error("Failed to upload file");
      }

      const { storageId } = await result.json();

      // Step 3: Save document record
      await uploadDocument({
        departmentId: selectedDepartment as any,
        trainId: trainId.trim(),
        fileName: selectedFile.name,
        fileType: selectedFile.type,
        storageId,
      });

      toast.success("Document uploaded successfully! AI processing started...");
      
      // Reset form
      setSelectedDepartment("");
      setTrainId("");
      setSelectedFile(null);
      const fileInput = document.getElementById("file-input") as HTMLInputElement;
      if (fileInput) fileInput.value = "";

    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload document");
    } finally {
      setUploading(false);
    }
  };

  const viewDocumentDetails = (document: any) => {
    setSelectedDocument(document);
  };

  const toggleContentView = (documentId: string) => {
    setExpandedContent(expandedContent === documentId ? null : documentId);
  };

  const getProcessingStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800";
      case "processing": return "bg-blue-100 text-blue-800";
      case "failed": return "bg-red-100 text-red-800";
      default: return "bg-yellow-100 text-yellow-800";
    }
  };

  const getProcessingStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return "✅";
      case "processing": return "🔄";
      case "failed": return "❌";
      default: return "⏳";
    }
  };

  const getFileTypeIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return "📄";
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) return "📊";
    if (fileType.includes('word') || fileType.includes('document')) return "📝";
    if (fileType.includes('image')) return "🖼️";
    if (fileType.includes('video')) return "🎥";
    if (fileType.includes('audio')) return "🎵";
    if (fileType.includes('text')) return "📃";
    if (fileType.includes('zip') || fileType.includes('rar')) return "📦";
    return "📁";
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!departments) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="space-y-4">
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">AI-Powered Document Processing</h2>
          <p className="text-gray-600">
            Upload any type of document for intelligent analysis, content extraction, and automatic train status updates
          </p>
        </div>

        {/* Upload Form */}
        <div className="bg-white border rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload New Document</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Department Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Department *
              </label>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Department</option>
                {departments.map((dept) => (
                  <option key={dept._id} value={dept._id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Train ID Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Train ID *
              </label>
              <input
                type="text"
                value={trainId}
                onChange={(e) => setTrainId(e.target.value)}
                placeholder="Enter Train ID (e.g., T001, TRAIN-123)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                minLength={2}
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter the unique identifier for the train (minimum 2 characters)
              </p>
            </div>
          </div>

          {/* File Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Document File *
            </label>
            <input
              id="file-input"
              type="file"
              onChange={handleFileSelect}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              All file types supported - PDF, Excel, Word, Images, Videos, Audio, Text files, Archives, etc. - Max 50MB
            </p>
          </div>

          {/* Selected File Info */}
          {selectedFile && (
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <div className="flex items-center">
                <span className="text-2xl mr-3">{getFileTypeIcon(selectedFile.type)}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-900">{selectedFile.name}</p>
                  <div className="flex items-center space-x-4 text-xs text-blue-700 mt-1">
                    <span>Size: {formatFileSize(selectedFile.size)}</span>
                    <span>Type: {selectedFile.type || 'Unknown'}</span>
                    <span>Modified: {new Date(selectedFile.lastModified).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Upload Button */}
          <button
            onClick={handleUpload}
            disabled={!selectedDepartment || !trainId.trim() || !selectedFile || uploading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {uploading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Uploading & AI Processing...
              </div>
            ) : (
              "Upload Document for AI Analysis"
            )}
          </button>
        </div>

        {/* AI Processing Features */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">🤖 AI Processing Capabilities</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl mb-2">📊</div>
              <h4 className="font-medium text-blue-900">Content Extraction</h4>
              <p className="text-sm text-blue-700">Intelligent text and data extraction from any file type</p>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">📝</div>
              <h4 className="font-medium text-blue-900">Smart Summarization</h4>
              <p className="text-sm text-blue-700">AI-generated summaries with key insights</p>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">🔄</div>
              <h4 className="font-medium text-blue-900">Auto Status Updates</h4>
              <p className="text-sm text-blue-700">Automatic train status updates based on analysis</p>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">💡</div>
              <h4 className="font-medium text-blue-900">Recommendations</h4>
              <p className="text-sm text-blue-700">Intelligent operational recommendations</p>
            </div>
          </div>
        </div>

        {/* Recent Uploads */}
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Document Processing</h3>
          
          {recentDocuments && recentDocuments.length > 0 ? (
            <div className="space-y-4">
              {recentDocuments.slice(0, 10).map((doc) => (
                <div key={doc._id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{getFileTypeIcon(doc.fileType)}</span>
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">{doc.fileName}</h4>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>Department: {doc.departmentName}</span>
                          <span>Train: {doc.trainId}</span>
                          <span>Uploaded: {new Date(doc.uploadedAt).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getProcessingStatusColor(doc.processingStatus)}`}>
                        <span className="mr-1">{getProcessingStatusIcon(doc.processingStatus)}</span>
                        {doc.processingStatus.charAt(0).toUpperCase() + doc.processingStatus.slice(1)}
                      </span>
                      {doc.processed && (
                        <button
                          onClick={() => viewDocumentDetails(doc)}
                          className="text-blue-600 hover:text-blue-900 font-medium text-sm"
                        >
                          View Analysis
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Quick Summary Preview */}
                  {doc.processed && doc.summary && (
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="text-sm font-medium text-blue-900">📝 AI Summary</h5>
                        <button
                          onClick={() => toggleContentView(doc._id)}
                          className="text-blue-600 hover:text-blue-800 text-xs"
                        >
                          {expandedContent === doc._id ? "Collapse" : "Expand"}
                        </button>
                      </div>
                      <div className={`text-sm text-blue-800 ${expandedContent === doc._id ? '' : 'line-clamp-2'}`}>
                        {expandedContent === doc._id ? doc.summary : doc.summary.substring(0, 150) + "..."}
                      </div>
                    </div>
                  )}

                  {/* Recommendations Preview */}
                  {doc.processed && doc.recommendations && (
                    <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-md">
                      <h5 className="text-sm font-medium text-green-900 mb-1">💡 AI Recommendations</h5>
                      <div className="text-sm text-green-800">
                        {doc.recommendations.length > 100 ? doc.recommendations.substring(0, 100) + "..." : doc.recommendations}
                      </div>
                    </div>
                  )}

                  {/* Extracted Data Preview */}
                  {doc.processed && doc.aiExtractedData && (
                    <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                      <h5 className="text-sm font-medium text-yellow-900 mb-2">🔍 Extracted Data</h5>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {Object.entries(doc.aiExtractedData).slice(0, 4).map(([key, value]) => (
                          <div key={key} className="text-xs">
                            <span className="font-medium text-yellow-700 capitalize">{key}:</span>
                            <span className="text-yellow-800 ml-1">
                              {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : 
                               typeof value === 'number' ? `${(value * 100).toFixed(0)}%` :
                               String(value).length > 15 ? String(value).substring(0, 15) + "..." : String(value)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-400 text-6xl mb-4">📄</div>
              <p className="text-gray-500 mb-4">No documents uploaded yet</p>
              <p className="text-sm text-gray-400">Upload your first document to see AI processing in action</p>
            </div>
          )}
        </div>

        {/* Document Analysis Modal */}
        {selectedDocument && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{getFileTypeIcon(selectedDocument.fileType)}</span>
                    <h3 className="text-xl font-bold text-gray-900">
                      AI Analysis: {selectedDocument.fileName}
                    </h3>
                  </div>
                  <button
                    onClick={() => setSelectedDocument(null)}
                    className="text-gray-500 hover:text-gray-700 text-xl"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="space-y-6">
                  {/* Document Info */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      <div>
                        <span className="text-sm font-medium text-gray-500">Department:</span>
                        <p className="text-sm text-gray-900">{selectedDocument.departmentName}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Train ID:</span>
                        <p className="text-sm text-gray-900">{selectedDocument.trainId}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">File Type:</span>
                        <p className="text-sm text-gray-900">{selectedDocument.fileType}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Uploaded:</span>
                        <p className="text-sm text-gray-900">
                          {new Date(selectedDocument.uploadedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Confidence:</span>
                        <p className="text-sm text-gray-900">
                          {selectedDocument.aiExtractedData?.confidence 
                            ? `${(selectedDocument.aiExtractedData.confidence * 100).toFixed(0)}%`
                            : "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* AI Summary */}
                  {selectedDocument.summary && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
                        <span className="mr-2">📝</span>
                        AI Summary & Key Insights
                      </h4>
                      <div className="text-sm text-blue-800 whitespace-pre-line leading-relaxed">
                        {selectedDocument.summary}
                      </div>
                    </div>
                  )}

                  {/* Recommendations */}
                  {selectedDocument.recommendations && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h4 className="font-semibold text-green-900 mb-3 flex items-center">
                        <span className="mr-2">💡</span>
                        Intelligent Operational Recommendations
                      </h4>
                      <div className="text-sm text-green-800 leading-relaxed">
                        {selectedDocument.recommendations}
                      </div>
                    </div>
                  )}

                  {/* Extracted Data with Confidence Scores */}
                  {selectedDocument.aiExtractedData && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h4 className="font-semibold text-yellow-900 mb-3 flex items-center">
                        <span className="mr-2">🔍</span>
                        Structured Data Extraction
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Object.entries(selectedDocument.aiExtractedData).map(([key, value]) => (
                          <div key={key} className="bg-white rounded-md p-3 border border-yellow-300">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium text-yellow-700 capitalize">{key}:</span>
                              {key === 'confidence' && (
                                <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded-full">
                                  {typeof value === 'number' ? `${(value * 100).toFixed(0)}%` : 'N/A'}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-yellow-800 font-medium">
                              {typeof value === 'boolean' ? (value ? '✅ Yes' : '❌ No') : 
                               key === 'confidence' ? `${(Number(value) * 100).toFixed(0)}% Accuracy` :
                               String(value)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Toggle Content View */}
                  {selectedDocument.fullContent && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg">
                      <button
                        onClick={() => toggleContentView(selectedDocument._id)}
                        className="w-full p-4 text-left font-semibold text-gray-900 hover:bg-gray-100 transition-colors flex items-center justify-between"
                      >
                        <span className="flex items-center">
                          <span className="mr-2">📄</span>
                          Toggle Content View - Full Document Content
                        </span>
                        <span className="text-gray-500">
                          {expandedContent === selectedDocument._id ? "▼" : "▶"}
                        </span>
                      </button>
                      {expandedContent === selectedDocument._id && (
                        <div className="p-4 border-t border-gray-200">
                          <div className="text-sm text-gray-700 whitespace-pre-line max-h-96 overflow-y-auto bg-white p-4 rounded border">
                            {selectedDocument.fullContent}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
