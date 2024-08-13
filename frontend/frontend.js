import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';

const cloudProviders = [
  { name: 'Microsoft Azure', logo: '/api/placeholder/32/32' },
  { name: 'Amazon Web Services', logo: '/api/placeholder/32/32' },
  { name: 'Google Cloud Platform', logo: '/api/placeholder/32/32' },
];

const mockResources = [
  { name: 'Virtual Machine', provider: 'Microsoft Azure' },
  { name: 'Storage Account', provider: 'Microsoft Azure' },
  { name: 'EC2 Instance', provider: 'Amazon Web Services' },
  { name: 'S3 Bucket', provider: 'Amazon Web Services' },
  { name: 'Compute Engine', provider: 'Google Cloud Platform' },
  { name: 'Cloud Storage', provider: 'Google Cloud Platform' },
];

const TerraformGenerator = () => {
  const [selectedProvider, setSelectedProvider] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedResource, setSelectedResource] = useState('');
  const [resourceOptions, setResourceOptions] = useState([]);
  const [generatedCode, setGeneratedCode] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (selectedProvider) {
      setResourceOptions(mockResources.filter(r => r.provider === selectedProvider));
    }
  }, [selectedProvider]);

  const filteredResources = resourceOptions.filter(r =>
    r.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleProviderSelect = (provider) => {
    setSelectedProvider(provider);
    setSelectedResource('');
    setGeneratedCode('');
  };

  const handleResourceSelect = (resource) => {
    setSelectedResource(resource);
  };

  const generateCode = () => {
    setIsGenerating(true);
    const code = `
provider "${selectedProvider.toLowerCase().replace(/\s+/g, ' ', '_').trim()}" {
  # Configuration options
}

resource "${selectedResource.toLowerCase().replace(/\s+/g, ' ', '_').trim()}" "example" {
  # Resource configuration
}
    `.trim();

    let i = 0;
    const intervalId = setInterval(() => {
      if (i < code.length) {
        setGeneratedCode(prev => prev + code[i]);
        i++;
      } else {
        clearInterval(intervalId);
        setIsGenerating(false);
      }
    }, 50);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-center">Terraform Generator</h1>
      
      <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
        {cloudProviders.map((provider) => (
          <button
            key={provider.name}
            onClick={() => handleProviderSelect(provider.name)}
            className={`flex items-center justify-center px-4 py-2 rounded-lg transition-colors ${
              selectedProvider === provider.name
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            <img src={provider.logo} alt={`${provider.name} logo`} className="w-8 h-8 mr-2" />
            <span>{provider.name}</span>
          </button>
        ))}
      </div>

      {selectedProvider && (
        <>
          <div className="mb-6">
            <h2 className="text-2xl font-semibold mb-2">providers.tf</h2>
            <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto">
              {`provider "${selectedProvider.toLowerCase().replace(/\s+/g, ' ', '_')}" {
  # Please configure the provider as per your requirements
}`}
            </pre>
          </div>

          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search resources..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg"
            />
          </div>

          <select
            value={selectedResource}
            onChange={(e) => handleResourceSelect(e.target.value)}
            className="w-full p-2 mb-6 border rounded-lg"
          >
            <option value="">Select a resource</option>
            {filteredResources.map((resource) => (
              <option key={resource.name} value={resource.name}>
                {resource.name}
              </option>
            ))}
          </select>

          {selectedResource && (
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-2">Resource Options</h3>
              <div className="space-y-2">
                <div className="flex items-center">
                  <input type="checkbox" id="option1" className="mr-2" />
                  <label htmlFor="option1">Option 1</label>
                </div>
                <div className="flex items-center">
                  <input type="checkbox" id="option2" className="mr-2" />
                  <label htmlFor="option2">Option 2</label>
                  <input type="text" className="ml-2 p-1 border rounded" placeholder="Value" />
                </div>
                <div className="flex items-center">
                  <input type="checkbox" id="option3" className="mr-2" />
                  <label htmlFor="option3">Option 3</label>
                  <input type="number" className="ml-2 p-1 border rounded" placeholder="0" />
                </div>
              </div>
            </div>
          )}

          <button
            onClick={generateCode}
            disabled={isGenerating || !selectedResource}
            className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition-colors disabled:bg-gray-300"
          >
            {isGenerating ? 'Generating...' : 'Generate Terraform Code'}
          </button>

          {generatedCode && (
            <div className="mt-6">
              <h3 className="text-xl font-semibold mb-2">Generated Terraform Code</h3>
              <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto whitespace-pre-wrap">
                {generatedCode}
              </pre>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TerraformGenerator;